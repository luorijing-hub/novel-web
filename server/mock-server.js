// server/mock-server.js
// 后端入口：HTTP 路由层，数据读写全部走 server/db.js 存储层（SQLite 持久化 / 内存回退）
// 启动：node server/mock-server.js   （监听 0.0.0.0:8080）
// 首次使用 SQLite 需安装依赖：cd server && npm install
const http = require('http');
const store = require('./db');

function sendJson(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch (e) { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, {});
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const params = Object.fromEntries(url.searchParams);

  try {
    // ===== 健康检查 =====
    if (req.method === 'GET' && path === '/api/health') {
      sendJson(res, 200, { status: 'ok', time: new Date().toISOString() });
      return;
    }

    // ===== 认证 =====
    if (req.method === 'POST' && path === '/api/auth/login') {
      const body = await readBody(req);
      const user = store.login(body.username || '', body.password || '');
      if (!user) {
        sendJson(res, 401, { error: '用户名或密码错误' });
        return;
      }
      sendJson(res, 200, { token: 'mock-token-' + user.username, user: user });
      return;
    }

    if (req.method === 'POST' && path === '/api/auth/register') {
      const body = await readBody(req);
      if (!body.username || !body.password) {
        sendJson(res, 400, { error: '用户名和密码不能为空' });
        return;
      }
      const user = store.register(body);
      if (!user) {
        sendJson(res, 409, { error: '用户名已存在' });
        return;
      }
      sendJson(res, 200, { token: 'mock-token-' + user.username, user: user });
      return;
    }

    // ===== 书籍 =====
    if (req.method === 'GET' && path === '/api/books') {
      sendJson(res, 200, { list: store.getBooks(params) });
      return;
    }

    // ===== 排行（热度由存储层计算） =====
    if (req.method === 'GET' && path === '/api/ranking') {
      const scope = params.scope || 'total';
      sendJson(res, 200, { scope: scope, list: store.getRanking(scope) });
      return;
    }

    // ===== 书单 =====
    if (req.method === 'GET' && path === '/api/booklists') {
      sendJson(res, 200, { list: store.getBooklists() });
      return;
    }
    const booklistMatch = path.match(/^\/api\/booklists\/(\d+)$/);
    if (req.method === 'GET' && booklistMatch) {
      const detail = store.getBooklistDetail(Number(booklistMatch[1]));
      if (!detail) {
        sendJson(res, 404, { error: '书单不存在' });
        return;
      }
      sendJson(res, 200, detail);
      return;
    }

    // ===== 发现页 =====
    if (req.method === 'GET' && path === '/api/discover') {
      sendJson(res, 200, store.getDiscover());
      return;
    }

    // ===== 话题评论 =====
    const topicMatch = path.match(/^\/api\/topics\/(\d+)\/comments$/);
    if (req.method === 'POST' && topicMatch) {
      const body = await readBody(req);
      if (!body.content) {
        sendJson(res, 400, { error: '评论内容不能为空' });
        return;
      }
      store.addComment(Number(topicMatch[1]), body.content);
      sendJson(res, 200, { ok: true });
      return;
    }

    // ===== 消息（已读状态按用户隔离） =====
    if (req.method === 'GET' && path === '/api/messages') {
      sendJson(res, 200, { list: store.getMessages(params.username || '') });
      return;
    }
    if (req.method === 'POST' && path === '/api/messages/read-all') {
      const body = await readBody(req);
      store.markAllMessagesRead(body.username || '');
      sendJson(res, 200, { ok: true });
      return;
    }
    const msgMatch = path.match(/^\/api\/messages\/(\d+)\/read$/);
    if (req.method === 'POST' && msgMatch) {
      const body = await readBody(req);
      store.markMessageRead(body.username || '', Number(msgMatch[1]));
      sendJson(res, 200, { ok: true });
      return;
    }

    // ===== 书架（按用户隔离） =====
    if (req.method === 'GET' && path === '/api/shelf') {
      sendJson(res, 200, { list: store.getShelf(params.username || '') });
      return;
    }
    if (req.method === 'POST' && path === '/api/shelf') {
      const body = await readBody(req);
      if (body.title) {
        store.addShelf(body.username || '', body.title);
      }
      sendJson(res, 200, { ok: true, list: store.getShelf(body.username || '') });
      return;
    }
    if (req.method === 'DELETE' && path === '/api/shelf') {
      // 删除书架书籍（DELETE 参数走 query：?username=xxx&title=xxx）
      if (params.title) {
        store.removeShelf(params.username || '', params.title);
      }
      sendJson(res, 200, { ok: true, list: store.getShelf(params.username || '') });
      return;
    }

    sendJson(res, 404, { error: '接口不存在: ' + req.method + ' ' + path });
  } catch (err) {
    sendJson(res, 500, { error: String(err) });
  }
});

server.listen(8080, '0.0.0.0', () => {
  console.log('后端已启动: http://0.0.0.0:8080/api');
  console.log('示例: http://127.0.0.1:8080/api/books');
  console.log('      http://127.0.0.1:8080/api/ranking?scope=male');
  console.log('      http://127.0.0.1:8080/api/health');
});
