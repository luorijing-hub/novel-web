// server/data.js
// 种子数据：首次启动时写入数据库（SQLite）或内存

// 书籍（与 App 端 BookData.ets 保持一致）
const SEED_BOOKS = [
  { title: '剑来', desc: '天地初开，万物有灵。少年陈平安，持剑而行。', author: '烽火戏诸侯', tag: '玄幻', hot: '128.6w', channel: '男频' },
  { title: '诡秘之主', desc: '蒸汽与神秘交织的异世界，愚者的旅程。', author: '爱潜水的乌贼', tag: '奇幻', hot: '92.3w', channel: '男频' },
  { title: '凡人修仙传', desc: '平庸少年踏入修仙路，逆天改命，凡尘成仙。', author: '忘语', tag: '仙侠', hot: '205.1w', channel: '男频' },
  { title: '雪中悍刀行', desc: '江湖是一张珠帘。大人物小人物，是珠子。', author: '烽火戏诸侯', tag: '武侠', hot: '169.4w', channel: '男频' },
  { title: '三体', desc: '宇宙就是一座黑暗森林，每个文明都是带枪的猎人。', author: '刘慈欣', tag: '科幻', hot: '76.8w', channel: '男频' },
  { title: '斗破苍穹', desc: '天才少年萧炎，斗气大陆的传奇故事。', author: '天蚕土豆', tag: '玄幻', hot: '312.5w', channel: '男频' },
  { title: '全职高手', desc: '荣耀网游巅峰，叶修重返战场。', author: '蝴蝶蓝', tag: '游戏', hot: '156.3w', channel: '男频' },
  { title: '盗墓笔记', desc: '神秘古墓背后的惊天秘密。', author: '南派三叔', tag: '悬疑', hot: '98.7w', channel: '男频' },
  { title: '甄嬛传', desc: '深宫红墙，步步惊心。一个女人的传奇一生。', author: '流潋紫', tag: '古代言情', hot: '245.6w', channel: '女频' },
  { title: '知否知否应是绿肥红瘦', desc: '庶女明兰的逆袭人生，盛府风云由此开启。', author: '关心则乱', tag: '古代言情', hot: '189.3w', channel: '女频' },
  { title: '步步惊心', desc: '一朝穿越清朝，卷入九子夺嫡的风云变幻。', author: '桐华', tag: '宫斗宅斗', hot: '156.7w', channel: '女频' },
  { title: '如懿传', desc: '乾隆后宫，帝王夫妻的悲欢离合。', author: '流潋紫', tag: '宫斗宅斗', hot: '132.7w', channel: '女频' },
  { title: '何以笙箫默', desc: '如果世界上曾经有那个人出现过，其他人都将是将就。', author: '顾漫', tag: '现代言情', hot: '213.4w', channel: '女频' },
  { title: '微微一笑很倾城', desc: '网游世界里的双向奔赴，甜蜜到齁人。', author: '顾漫', tag: '现代言情', hot: '178.9w', channel: '女频' },
  { title: '三生三世十里桃花', desc: '四海八荒，只为一人，三生三世的情劫。', author: '唐七公子', tag: '仙侠奇缘', hot: '301.2w', channel: '女频' },
  { title: '花千骨', desc: '长留上仙白子画与花千骨的旷世虐恋。', author: 'Fresh果果', tag: '仙侠奇缘', hot: '268.5w', channel: '女频' },
  { title: '欢乐颂', desc: '五个都市女性的成长、友情与人生故事。', author: '阿耐', tag: '都市情感', hot: '134.6w', channel: '女频' },
  { title: '我的前半生', desc: '全职太太的自我觉醒与华丽转身。', author: '亦舒', tag: '都市情感', hot: '96.5w', channel: '女频' },
  { title: '最好的我们', desc: '青春里最好的时光，是与你同桌的日子。', author: '八月长安', tag: '青春校园', hot: '158.1w', channel: '女频' },
  { title: '致我们终将逝去的青春', desc: '致青春，致那些回不去的旧时光。', author: '辛夷坞', tag: '青春校园', hot: '121.9w', channel: '女频' },
  { title: '他来了，请闭眼', desc: '高智商犯罪心理博弈，推理与爱情交织。', author: '丁墨', tag: '悬疑灵异', hot: '105.2w', channel: '女频' },
  { title: '如果蜗牛有爱情', desc: '天才心理侧写师与警花的蜗牛式爱情。', author: '丁墨', tag: '悬疑灵异', hot: '76.5w', channel: '女频' },
  { title: '锦绣未央', desc: '重生归来，步步为营，复仇与守护。', author: '秦简', tag: '重生逆袭', hot: '187.6w', channel: '女频' },
  { title: '重生之将门毒后', desc: '谢家嫡女重生，手撕渣男，护佑满门。', author: '千山茶客', tag: '重生逆袭', hot: '92.7w', channel: '女频' },
  { title: '传闻中的陈芊芊', desc: '穿越女编剧的花式自救，甜宠轻喜剧。', author: '南镇', tag: '轻松甜宠', hot: '88.3w', channel: '女频' },
  { title: '花间提壶方大厨', desc: '美食治愈系甜宠，一桌好菜一段姻缘。', author: '耳雅', tag: '轻松甜宠', hot: '64.8w', channel: '女频' }
];

// 书单（与 App 端 BOOKLISTS 一致）
const SEED_BOOKLISTS = [
  { id: 1, title: '玄幻修仙·神作合集', desc: '男频女频玄幻仙侠代表作，熬夜追更必备。', creator: '编辑推荐', follows: '3.2w', bookTitles: ['斗破苍穹', '剑来', '凡人修仙传', '雪中悍刀行', '三生三世十里桃花', '花千骨'] },
  { id: 2, title: '甜宠言情·高甜预警', desc: '糖分超标！看完嘴角疯狂上扬的甜宠文。', creator: '书单菌', follows: '2.8w', bookTitles: ['何以笙箫默', '微微一笑很倾城', '传闻中的陈芊芊', '花间提壶方大厨'] },
  { id: 3, title: '悬疑推理·烧脑合集', desc: '迷雾重重，真相只有一个，你敢来挑战吗？', creator: '侦探迷', follows: '1.9w', bookTitles: ['盗墓笔记', '诡秘之主', '他来了，请闭眼', '如果蜗牛有爱情'] },
  { id: 4, title: '宫斗宅斗·步步为营', desc: '深宫红墙里的权谋博弈，看女主如何逆袭。', creator: '历史爱好者', follows: '1.6w', bookTitles: ['甄嬛传', '如懿传', '步步惊心', '锦绣未央'] },
  { id: 5, title: '青春校园·那年夏天', desc: '那些年我们一起追过的青春，心动又遗憾。', creator: '时光机', follows: '0.9w', bookTitles: ['最好的我们', '致我们终将逝去的青春', '微微一笑很倾城'] },
  { id: 6, title: '重生逆袭·爽文精选', desc: '重生归来，逆天改命，一路开挂打脸。', creator: '爽文达人', follows: '0.7w', bookTitles: ['锦绣未央', '重生之将门毒后'] }
];

// 消息（与 App 端 MessageData.ets 一致）
const SEED_MESSAGES = [
  { id: 1, type: '系统', icon: '🎁', title: '签到福利', content: '连续签到 7 天可领 100 书币，快去签到吧！', time: '10分钟前', read: false },
  { id: 2, type: '追更', icon: '📖', title: '《剑来》更新提醒', content: '你收藏的《剑来》更新了 2 章。', time: '1小时前', read: false },
  { id: 3, type: '互动', icon: '💬', title: '收到新评论', content: '凡人道友 评论了你的书评：「说得太对了，同感！」', time: '3小时前', read: false },
  { id: 4, type: '系统', icon: '🔥', title: '限时免费', content: '《三体》《斗破苍穹》限时免费阅读 48 小时，别错过。', time: '昨天', read: true },
  { id: 5, type: '互动', icon: '👍', title: '收到点赞', content: '书中仙 赞了你的评论：「这个解读角度很新颖」。', time: '昨天', read: true },
  { id: 6, type: '追更', icon: '✨', title: '《诡秘之主》更新提醒', content: '你收藏的《诡秘之主》更新了 1 章。', time: '2天前', read: true },
  { id: 7, type: '系统', icon: '📣', title: '平台公告', content: 'App 版本升级至 1.3.0，新增书单与发现频道。', time: '3天前', read: true },
  { id: 8, type: '互动', icon: '⭐', title: '收到收藏', content: '甜宠文爱好者 收藏了你的书单「甜宠言情·高甜预警」。', time: '5天前', read: true }
];

// 话题（发现页）
const SEED_TOPICS = [
  { id: 1, title: '#凡人修仙传·凡尘大结局#', hot: '128.4w 讨论', comments: ['凡尘结局泪目了，陈平安一路走来太不容易。', '从青萍剑到人间剑，这套书追了五年值了。'] },
  { id: 2, title: '#甜宠文推荐清单#', hot: '96.7w 讨论', comments: ['求更多甜甜的现言，书荒好久了！', '何以笙箫默永远的神。'] },
  { id: 3, title: '#三体·黑暗森林法则解读#', hot: '85.2w 讨论', comments: ['黑暗森林法则细思极恐，二向箔太震撼。', '看完三体再抬头看夜空，感觉都不一样了。'] },
  { id: 4, title: '#宫斗原著哪家强#', hot: '63.9w 讨论', comments: ['甄嬛传的权谋细节，每刷一遍都有新发现。', '若曦和四爷的遗憾，原著比剧版更虐。'] },
  { id: 5, title: '#熬夜追书の日常#', hot: '52.1w 讨论', comments: ['凌晨三点还在追更的举手！', '看完这章就睡，结果看到了天亮。'] },
  { id: 6, title: '#玄幻小说巅峰之作#', hot: '48.6w 讨论', comments: ['斗破苍穹 yyds！', '玄幻还得看老牌大神。'] },
  { id: 7, title: '#书荒救星推荐#', hot: '41.3w 讨论', comments: ['最近书荒，求推荐！', '来收藏几个书单吧，都是宝藏。'] },
  { id: 8, title: '#古言女主天花板#', hot: '36.8w 讨论', comments: ['甄嬛永远是白月光。', '知否的明兰太清醒了。'] },
  { id: 9, title: '#科幻迷必读清单#', hot: '29.5w 讨论', comments: ['三体之后无科幻？', '黑暗森林法则神了。'] },
  { id: 10, title: '#网文改编剧你看了吗#', hot: '22.1w 讨论', comments: ['微微一笑的剧版太还原了。', '期待陈芊芊第二季！'] }
];

// 用户（默认账号 admin / 123456）
const SEED_USERS = [
  { username: 'admin', password: '123456', nickname: '书友小号', avatar: '👤', email: 'admin@example.com', phone: '13800000000', registerTime: '2024-01-01' }
];

module.exports = {
  SEED_BOOKS,
  SEED_BOOKLISTS,
  SEED_MESSAGES,
  SEED_TOPICS,
  SEED_USERS
};
