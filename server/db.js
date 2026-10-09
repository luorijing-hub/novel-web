// server/db.js
// 数据存储层：优先使用 SQLite（better-sqlite3，novel.db 文件持久化），
// 未安装依赖时自动回退内存数据（功能一致，重启丢失）。
// 安装依赖：cd server && npm install
const path = require('path');
const {
  SEED_BOOKS,
  SEED_BOOKLISTS,
  SEED_MESSAGES,
  SEED_TOPICS,
  SEED_USERS
} = require('./data');

// ==================== 热度模型（与 App 端一致） ====================
function hashSeed(title) {
  let s = 0;
  for (let i = 0; i < title.length; i++) {
    s = (s * 31 + title.charCodeAt(i)) % 100000;
  }
  return s;
}

function calcBookHeat(title, hot) {
  const hotWan = parseFloat(String(hot).replace(/[wW万]/g, '')) || 0;
  const seed = hashSeed(title);
  const favRate = 800 + (seed % 400);
  const cmtRate = 260 + ((seed >> 3) % 240);
  const readWan = hotWan;
  const favWan = Math.round(hotWan * favRate / 1000) / 10;
  const cmtWan = Math.round(hotWan * cmtRate / 1000) / 10;
  const heatWan = Math.round((readWan * 0.5 + favWan * 2 + cmtWan * 5) * 10) / 10;
  return { heatWan, readWan, favWan, cmtWan, trend: ((seed >> 4) % 5) - 2, isNew: seed % 9 === 0 };
}

// ==================== SQLite 初始化 ====================
// 使用 Node.js 内置 node:sqlite（Node >= 22.5，推荐 23.4+），零依赖
let db = null;

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(path.join(__dirname, 'novel.db'));
  db.exec('PRAGMA journal_mode = WAL');
  initTables();
  seedIfEmpty();
  console.log('[db] SQLite 已启用（node:sqlite），数据库文件: ' + path.join(__dirname, 'novel.db'));
} catch (err) {
  db = null;
  console.warn('[db] node:sqlite 不可用（需 Node >= 22.5），使用内存数据（重启丢失）: ' + err.message);
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      title TEXT PRIMARY KEY, "desc" TEXT, author TEXT, tag TEXT, hot TEXT, channel TEXT
    );
    CREATE TABLE IF NOT EXISTS booklists (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, "desc" TEXT, creator TEXT, follows TEXT
    );
    CREATE TABLE IF NOT EXISTS booklist_books (
      booklist_id INTEGER, title TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, icon TEXT, title TEXT, content TEXT, time TEXT, read INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, hot TEXT
    );
    CREATE TABLE IF NOT EXISTS topic_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, topic_id INTEGER, content TEXT
    );
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY, password TEXT, nickname TEXT, avatar TEXT, email TEXT, phone TEXT, register_time TEXT
    );
    CREATE TABLE IF NOT EXISTS shelf (
      username TEXT, title TEXT, added_time TEXT, PRIMARY KEY (username, title)
    );
    CREATE TABLE IF NOT EXISTS message_reads (
      username TEXT NOT NULL,
      message_id INTEGER NOT NULL,
      PRIMARY KEY (username, message_id)
    );
  `);
  // 老库迁移：shelf 表补充 username 列（若已存在则忽略）
  try {
    db.exec('ALTER TABLE shelf ADD COLUMN username TEXT DEFAULT \'\'');
  } catch (e) {
    // 列已存在，忽略
  }
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM books').get().c;
  if (count > 0) {
    return;
  }
  const insBook = db.prepare('INSERT INTO books (title, "desc", author, tag, hot, channel) VALUES (?, ?, ?, ?, ?, ?)');
  for (const b of SEED_BOOKS) {
    insBook.run(b.title, b.desc, b.author, b.tag, b.hot, b.channel);
  }
  const insList = db.prepare('INSERT INTO booklists (id, title, "desc", creator, follows) VALUES (?, ?, ?, ?, ?)');
  const insListBook = db.prepare('INSERT INTO booklist_books (booklist_id, title) VALUES (?, ?)');
  for (const l of SEED_BOOKLISTS) {
    insList.run(l.id, l.title, l.desc, l.creator, l.follows);
    for (const t of l.bookTitles) {
      insListBook.run(l.id, t);
    }
  }
  const insMsg = db.prepare('INSERT INTO messages (id, type, icon, title, content, time, read) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const m of SEED_MESSAGES) {
    insMsg.run(m.id, m.type, m.icon, m.title, m.content, m.time, m.read ? 1 : 0);
  }
  const insTopic = db.prepare('INSERT INTO topics (id, title, hot) VALUES (?, ?, ?)');
  const insComment = db.prepare('INSERT INTO topic_comments (topic_id, content) VALUES (?, ?)');
  for (const t of SEED_TOPICS) {
    insTopic.run(t.id, t.title, t.hot);
    for (const c of t.comments) {
      insComment.run(t.id, c);
    }
  }
  const insUser = db.prepare('INSERT INTO users (username, password, nickname, avatar, email, phone, register_time) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const u of SEED_USERS) {
    insUser.run(u.username, u.password, u.nickname, u.avatar, u.email, u.phone, u.registerTime);
  }
  console.log('[db] 种子数据写入完成');
}

// ==================== 内存回退数据 ====================
const mem = {
  books: SEED_BOOKS.map(b => Object.assign({}, b)),
  booklists: JSON.parse(JSON.stringify(SEED_BOOKLISTS)),
  messages: JSON.parse(JSON.stringify(SEED_MESSAGES)),
  topics: JSON.parse(JSON.stringify(SEED_TOPICS)),
  users: JSON.parse(JSON.stringify(SEED_USERS)),
  shelfByUser: {},       // { username: [titles] }
  messageReads: {}       // { username: { messageId: true } }
};

// ==================== 存储接口 ====================

// 书籍列表（channel/category 可省略）
function getBooks(params) {
  const channel = (params && params.channel) || '';
  const category = (params && params.category) || '';
  if (db) {
    let sql = 'SELECT title, "desc", author, tag, hot, channel FROM books';
    const where = [];
    const args = [];
    if (channel) { where.push('channel = ?'); args.push(channel); }
    if (category) { where.push('tag = ?'); args.push(category); }
    if (where.length > 0) {
      sql += ' WHERE ' + where.join(' AND ');
    }
    return db.prepare(sql).all(...args);
  }
  let list = mem.books.slice();
  if (channel) list = list.filter(b => b.channel === channel);
  if (category) list = list.filter(b => b.tag === category);
  return list;
}

// 排行（scope: total | male | female）
function getRanking(scope) {
  const channel = scope === 'male' ? '男频' : (scope === 'female' ? '女频' : '');
  const books = getBooks(channel ? { channel: channel } : {});
  return books.map(b => Object.assign({}, b, calcBookHeat(b.title, b.hot)))
    .sort((a, b) => b.heatWan - a.heatWan);
}

// 书单列表
function getBooklists() {
  if (db) {
    const lists = db.prepare('SELECT id, title, "desc", creator, follows FROM booklists ORDER BY id').all();
    const ins = db.prepare('SELECT title FROM booklist_books WHERE booklist_id = ?');
    return lists.map(l => {
      l.bookTitles = ins.all(l.id).map(r => r.title);
      return l;
    });
  }
  return mem.booklists.map(l => Object.assign({}, l, { bookTitles: l.bookTitles.slice() }));
}

// 书单详情
function getBooklistDetail(id) {
  const list = getBooklists().find(l => l.id === Number(id));
  if (!list) {
    return null;
  }
  list.books = getBooks({}).filter(b => list.bookTitles.includes(b.title));
  return list;
}

// 话题（含评论）
function getTopics() {
  if (db) {
    const topics = db.prepare('SELECT id, title, hot FROM topics ORDER BY id').all();
    const ins = db.prepare('SELECT content FROM topic_comments WHERE topic_id = ?');
    return topics.map(t => {
      t.comments = ins.all(t.id).map(r => r.content);
      return t;
    });
  }
  return mem.topics.map(t => Object.assign({}, t, { comments: t.comments.slice() }));
}

// 发布话题评论
function addComment(topicId, content) {
  if (db) {
    const info = db.prepare('INSERT INTO topic_comments (topic_id, content) VALUES (?, ?)').run(topicId, content);
    return info.lastInsertRowid > 0;
  }
  const topic = mem.topics.find(t => t.id === Number(topicId));
  if (topic) {
    topic.comments.unshift(content);
    return true;
  }
  return false;
}

// 消息列表（read 按用户计算：用户已读表优先，其次取全局默认已读）
function getMessages(username) {
  const user = username || '';
  if (db) {
    const rows = db.prepare('SELECT id, type, icon, title, content, time, read FROM messages ORDER BY id').all();
    const readRows = db.prepare('SELECT message_id FROM message_reads WHERE username = ?').all(user);
    const readIds = {};
    for (const r of readRows) {
      readIds[r.message_id] = true;
    }
    return rows.map(m => Object.assign({}, m, {
      read: readIds[m.id] ? true : (m.read === 1)
    }));
  }
  const state = mem.messageReads[user] || {};
  return mem.messages.map(m => Object.assign({}, m, {
    read: state[m.id] ? true : m.read
  }));
}

function markMessageRead(username, id) {
  const user = username || '';
  const msgId = Number(id);
  if (db) {
    db.prepare('INSERT OR IGNORE INTO message_reads (username, message_id) VALUES (?, ?)').run(user, msgId);
    return;
  }
  if (!mem.messageReads[user]) {
    mem.messageReads[user] = {};
  }
  mem.messageReads[user][msgId] = true;
}

function markAllMessagesRead(username) {
  const user = username || '';
  if (db) {
    const rows = db.prepare('SELECT id FROM messages').all();
    const ins = db.prepare('INSERT OR IGNORE INTO message_reads (username, message_id) VALUES (?, ?)');
    for (const r of rows) {
      ins.run(user, r.id);
    }
    return;
  }
  if (!mem.messageReads[user]) {
    mem.messageReads[user] = {};
  }
  for (const m of mem.messages) {
    mem.messageReads[user][m.id] = true;
  }
}

// 登录（成功返回不含密码的用户信息，失败返回 null）
function login(username, password) {
  let user = null;
  if (db) {
    const row = db.prepare('SELECT username, password, nickname, avatar, email, phone, register_time AS registerTime FROM users WHERE username = ? AND password = ?')
      .get(username, password);
    if (row) {
      user = row;
    }
  } else {
    user = mem.users.find(u => u.username === username && u.password === password) || null;
    if (user) {
      user = Object.assign({}, user);
      delete user.password;
    }
  }
  return user;
}

// 注册（成功返回用户信息，用户名已存在返回 null）
function register(info) {
  if (db) {
    const exists = db.prepare('SELECT username FROM users WHERE username = ?').get(info.username);
    if (exists) {
      return null;
    }
    db.prepare('INSERT INTO users (username, password, nickname, avatar, email, phone, register_time) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(info.username, info.password, info.nickname || info.username, info.avatar || '👤', info.email || '', info.phone || '', info.registerTime || new Date().toISOString().slice(0, 10));
    return {
      username: info.username,
      nickname: info.nickname || info.username,
      avatar: info.avatar || '👤',
      email: info.email || '',
      phone: info.phone || '',
      registerTime: info.registerTime || new Date().toISOString().slice(0, 10)
    };
  }
  if (mem.users.find(u => u.username === info.username)) {
    return null;
  }
  const user = {
    username: info.username,
    password: info.password,
    nickname: info.nickname || info.username,
    avatar: info.avatar || '👤',
    email: info.email || '',
    phone: info.phone || '',
    registerTime: info.registerTime || new Date().toISOString().slice(0, 10)
  };
  mem.users.push(user);
  const safe = Object.assign({}, user);
  delete safe.password;
  return safe;
}

// 书架（按用户）
function getShelf(username) {
  const user = username || '';
  if (db) {
    return db.prepare('SELECT title FROM shelf WHERE username = ? ORDER BY added_time DESC').all(user).map(r => r.title);
  }
  return (mem.shelfByUser[user] || []).slice();
}

function addShelf(username, title) {
  const user = username || '';
  if (db) {
    db.prepare('INSERT OR IGNORE INTO shelf (username, title, added_time) VALUES (?, ?, ?)')
      .run(user, title, new Date().toISOString());
    return;
  }
  if (!mem.shelfByUser[user]) {
    mem.shelfByUser[user] = [];
  }
  if (!mem.shelfByUser[user].includes(title)) {
    mem.shelfByUser[user].push(title);
  }
}

// 删除书架书籍（按账号）
function removeShelf(username, title) {
  const user = username || '';
  if (db) {
    db.prepare('DELETE FROM shelf WHERE username = ? AND title = ?').run(user, title);
    return;
  }
  const list = mem.shelfByUser[user] || [];
  const idx = list.indexOf(title);
  if (idx >= 0) {
    list.splice(idx, 1);
  }
}

// 发现页聚合数据
function getDiscover() {
  return {
    activities: [
      { title: '限时免费', desc: '全场 50 本书免费读', emoji: '📖' },
      { title: '签到有礼', desc: '连续签到领书币', emoji: '🎁' },
      { title: '新书首发', desc: '独家首发抢先看', emoji: '🔥' }
    ],
    topics: getTopics().map(t => ({ id: t.id, title: t.title, hot: t.hot })),
    newBooks: getBooks({}).filter(b =>
      ['传闻中的陈芊芊', '花间提壶方大厨', '重生之将门毒后', '如果蜗牛有爱情', '他来了，请闭眼', '最好的我们'].includes(b.title)),
    booklists: getBooklists(),
    hotBooks: getRanking('total').slice(0, 10)
  };
}

module.exports = {
  getBooks,
  getRanking,
  getBooklists,
  getBooklistDetail,
  getTopics,
  addComment,
  getMessages,
  markMessageRead,
  markAllMessagesRead,
  login,
  register,
  getShelf,
  addShelf,
  removeShelf,
  getDiscover
};
