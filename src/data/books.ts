// 书籍数据模型（对应鸿蒙 model/BookData.ets）
export interface BookItem {
  title: string
  desc: string
  author: string
  tag: string
  hot: string
  image: string // 封面路径（public/covers 下，WebP 格式）
  color: string
  channel: string // '男频' | '女频'
  coverText: string
}

export const BOOKS: BookItem[] = [
  // ============ 男频 ============
  { title: '剑来', desc: '天地初开，万物有灵。少年陈平安，持剑而行。', author: '烽火戏诸侯', tag: '玄幻', hot: '128.6w', image: '/covers/jianlai.webp', color: '#f7c5a0', channel: '男频', coverText: '' },
  { title: '诡秘之主', desc: '蒸汽与神秘交织的异世界，愚者的旅程。', author: '爱潜水的乌贼', tag: '奇幻', hot: '92.3w', image: '/covers/guimi.webp', color: '#b5d1e0', channel: '男频', coverText: '' },
  { title: '凡人修仙传', desc: '平庸少年踏入修仙路，逆天改命，凡尘成仙。', author: '忘语', tag: '仙侠', hot: '205.1w', image: '/covers/fanren.webp', color: '#d9c9b0', channel: '男频', coverText: '' },
  { title: '雪中悍刀行', desc: '江湖是一张珠帘。大人物小人物，是珠子。', author: '烽火戏诸侯', tag: '武侠', hot: '169.4w', image: '/covers/xuezhon.webp', color: '#c7b8d4', channel: '男频', coverText: '' },
  { title: '三体', desc: '宇宙就是一座黑暗森林，每个文明都是带枪的猎人。', author: '刘慈欣', tag: '科幻', hot: '76.8w', image: '/covers/santi.webp', color: '#aacfcf', channel: '男频', coverText: '' },
  { title: '斗破苍穹', desc: '天才少年萧炎，斗气大陆的传奇故事。', author: '天蚕土豆', tag: '玄幻', hot: '312.5w', image: '/covers/doupo.webp', color: '#f5d6b0', channel: '男频', coverText: '' },
  { title: '全职高手', desc: '荣耀网游巅峰，叶修重返战场。', author: '蝴蝶蓝', tag: '游戏', hot: '156.3w', image: '/covers/quanzhi.webp', color: '#b8d4e3', channel: '男频', coverText: '' },
  { title: '盗墓笔记', desc: '神秘古墓背后的惊天秘密。', author: '南派三叔', tag: '悬疑', hot: '98.7w', image: '/covers/daomu.webp', color: '#d4c5a0', channel: '男频', coverText: '' },
  // ============ 女频 ============
  { title: '甄嬛传', desc: '深宫红墙，步步惊心。一个女人的传奇一生。', author: '流潋紫', tag: '古代言情', hot: '245.6w', image: '/covers/zhenhuan.webp', color: '#f2c6d0', channel: '女频', coverText: '' },
  { title: '知否知否应是绿肥红瘦', desc: '庶女明兰的逆袭人生，盛府风云由此开启。', author: '关心则乱', tag: '古代言情', hot: '189.3w', image: '/covers/zhifou.webp', color: '#e8c9a0', channel: '女频', coverText: '' },
  { title: '步步惊心', desc: '一朝穿越清朝，卷入九子夺嫡的风云变幻。', author: '桐华', tag: '宫斗宅斗', hot: '156.7w', image: '/covers/bubu.webp', color: '#f0e0b8', channel: '女频', coverText: '' },
  { title: '如懿传', desc: '乾隆后宫，帝王夫妻的悲欢离合。', author: '流潋紫', tag: '宫斗宅斗', hot: '132.7w', image: '/covers/ruyi.webp', color: '#d4b8c8', channel: '女频', coverText: '' },
  { title: '何以笙箫默', desc: '如果世界上曾经有那个人出现过，其他人都将是将就。', author: '顾漫', tag: '现代言情', hot: '213.4w', image: '/covers/heyi.webp', color: '#f5c6d8', channel: '女频', coverText: '' },
  { title: '微微一笑很倾城', desc: '网游世界里的双向奔赴，甜蜜到齁人。', author: '顾漫', tag: '现代言情', hot: '178.9w', image: '/covers/weiwei.webp', color: '#f7d6e0', channel: '女频', coverText: '' },
  { title: '三生三世十里桃花', desc: '四海八荒，只为一人，三生三世的情劫。', author: '唐七公子', tag: '仙侠奇缘', hot: '301.2w', image: '/covers/sansheng.webp', color: '#e3c8f0', channel: '女频', coverText: '' },
  { title: '花千骨', desc: '长留上仙白子画与花千骨的旷世虐恋。', author: 'Fresh果果', tag: '仙侠奇缘', hot: '268.5w', image: '/covers/huaqian.webp', color: '#f2b8c8', channel: '女频', coverText: '' },
  { title: '欢乐颂', desc: '五个都市女性的成长、友情与人生故事。', author: '阿耐', tag: '都市情感', hot: '134.6w', image: '/covers/huanre.webp', color: '#f0d0b8', channel: '女频', coverText: '' },
  { title: '我的前半生', desc: '全职太太的自我觉醒与华丽转身。', author: '亦舒', tag: '都市情感', hot: '96.5w', image: '/covers/wode.webp', color: '#d9d2e8', channel: '女频', coverText: '' },
  { title: '最好的我们', desc: '青春里最好的时光，是与你同桌的日子。', author: '八月长安', tag: '青春校园', hot: '158.1w', image: '/covers/zuihao.webp', color: '#bfe0d9', channel: '女频', coverText: '' },
  { title: '致我们终将逝去的青春', desc: '致青春，致那些回不去的旧时光。', author: '辛夷坞', tag: '青春校园', hot: '121.9w', image: '/covers/zhiwomen.webp', color: '#cde3c0', channel: '女频', coverText: '' },
  { title: '他来了，请闭眼', desc: '高智商犯罪心理博弈，推理与爱情交织。', author: '丁墨', tag: '悬疑灵异', hot: '105.2w', image: '/covers/talaile.webp', color: '#b8c8d9', channel: '女频', coverText: '' },
  { title: '如果蜗牛有爱情', desc: '天才心理侧写师与警花的蜗牛式爱情。', author: '丁墨', tag: '悬疑灵异', hot: '76.5w', image: '/covers/ruguowo.webp', color: '#b8d9d9', channel: '女频', coverText: '' },
  { title: '锦绣未央', desc: '重生归来，步步为营，复仇与守护。', author: '秦简', tag: '重生逆袭', hot: '187.6w', image: '/covers/jingxiuwei.webp', color: '#f0b8b8', channel: '女频', coverText: '' },
  { title: '重生之将门毒后', desc: '谢家嫡女重生，手撕渣男，护佑满门。', author: '千山茶客', tag: '重生逆袭', hot: '92.7w', image: '/covers/chonshengzhi.webp', color: '#e8b8d0', channel: '女频', coverText: '' },
  { title: '传闻中的陈芊芊', desc: '穿越女编剧的花式自救，甜宠轻喜剧。', author: '南镇', tag: '轻松甜宠', hot: '88.3w', image: '/covers/chuanwenzhon.webp', color: '#f8d0c0', channel: '女频', coverText: '' },
  { title: '花间提壶方大厨', desc: '美食治愈系甜宠，一桌好菜一段姻缘。', author: '耳雅', tag: '轻松甜宠', hot: '64.8w', image: '/covers/huajianti.webp', color: '#d0e8c0', channel: '女频', coverText: '' }
]

// ==================== 热度模型（与后端一致） ====================
export interface BookHeat {
  heatWan: number
  readWan: number
  favWan: number
  cmtWan: number
  trend: number
  isNew: boolean
}

function hashSeed(title: string): number {
  let s = 0
  for (let i = 0; i < title.length; i++) {
    s = (s * 31 + title.charCodeAt(i)) % 100000
  }
  return s
}

function parseHot(hot: string): number {
  return parseFloat(hot.replace(/[wW万]/g, '')) || 0
}

// 热度 = 阅读量×0.5 + 收藏量×2 + 评论量×5
export function calcBookHeat(title: string, hot: string): BookHeat {
  const hotWan = parseHot(hot)
  const seed = hashSeed(title)
  const favRate = 800 + (seed % 400)
  const cmtRate = 260 + ((seed >> 3) % 240)
  const readWan = hotWan
  const favWan = Math.round((hotWan * favRate) / 1000) / 10
  const cmtWan = Math.round((hotWan * cmtRate) / 1000) / 10
  const heatWan = Math.round((readWan * 0.5 + favWan * 2 + cmtWan * 5) * 10) / 10
  return { heatWan, readWan, favWan, cmtWan, trend: ((seed >> 4) % 5) - 2, isNew: seed % 9 === 0 }
}

export function formatHeatWan(value: number): string {
  return value.toFixed(1) + '万'
}

// 按书名解析书籍（保持传入顺序）
export function getBooksByTitles(titles: string[]): BookItem[] {
  const result: BookItem[] = []
  titles.forEach((t) => {
    const found = BOOKS.find((b) => b.title === t)
    if (found) result.push(found)
  })
  return result
}

// 后端书籍数据 → 前端 BookItem
export function mapServerBook(raw: any): BookItem | null {
  const title = String(raw?.title ?? '')
  if (!title) return null
  const local = BOOKS.find((b) => b.title === title) ?? null
  const fallbackColors = ['#8ec9b8', '#b8a8e0', '#e0a878', '#7fb3d9', '#d99f9f', '#b8d9a0']
  let seed = 0
  for (let i = 0; i < title.length; i++) seed += title.charCodeAt(i)
  return {
    title,
    desc: String(raw?.desc ?? local?.desc ?? ''),
    author: String(raw?.author ?? local?.author ?? ''),
    tag: String(raw?.tag ?? local?.tag ?? ''),
    hot: String(raw?.hot ?? local?.hot ?? ''),
    image: local?.image ?? '/covers/book3.webp',
    color: local?.color ?? fallbackColors[seed % fallbackColors.length],
    channel: String(raw?.channel ?? local?.channel ?? '男频'),
    coverText: local ? local.coverText : title.substring(0, 1)
  }
}
