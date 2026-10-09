// 书单数据（对应鸿蒙 model/BookData.ets 的 BOOKLISTS）
export interface Booklist {
  id: number
  title: string
  desc: string
  creator: string
  follows: string
  bookTitles: string[]
}

export const BOOKLISTS: Booklist[] = [
  { id: 1, title: '玄幻修仙·神作合集', desc: '男频女频玄幻仙侠代表作，熬夜追更必备。', creator: '编辑推荐', follows: '3.2w', bookTitles: ['斗破苍穹', '剑来', '凡人修仙传', '雪中悍刀行', '三生三世十里桃花', '花千骨'] },
  { id: 2, title: '甜宠言情·高甜预警', desc: '糖分超标！看完嘴角疯狂上扬的甜宠文。', creator: '书单菌', follows: '2.8w', bookTitles: ['何以笙箫默', '微微一笑很倾城', '传闻中的陈芊芊', '花间提壶方大厨'] },
  { id: 3, title: '悬疑推理·烧脑合集', desc: '迷雾重重，真相只有一个，你敢来挑战吗？', creator: '侦探迷', follows: '1.9w', bookTitles: ['盗墓笔记', '诡秘之主', '他来了，请闭眼', '如果蜗牛有爱情'] },
  { id: 4, title: '宫斗宅斗·步步为营', desc: '深宫红墙里的权谋博弈，看女主如何逆袭。', creator: '历史爱好者', follows: '1.6w', bookTitles: ['甄嬛传', '如懿传', '步步惊心', '锦绣未央'] },
  { id: 5, title: '青春校园·那年夏天', desc: '那些年我们一起追过的青春，心动又遗憾。', creator: '时光机', follows: '0.9w', bookTitles: ['最好的我们', '致我们终将逝去的青春', '微微一笑很倾城'] },
  { id: 6, title: '重生逆袭·爽文精选', desc: '重生归来，逆天改命，一路开挂打脸。', creator: '爽文达人', follows: '0.7w', bookTitles: ['锦绣未央', '重生之将门毒后'] }
]

// 后端书单数据 → 前端 Booklist
export function mapServerBooklist(raw: any): Booklist | null {
  const id = Number(raw?.id)
  const title = String(raw?.title ?? '')
  if (!id || !title) return null
  return {
    id,
    title,
    desc: String(raw?.desc ?? ''),
    creator: String(raw?.creator ?? ''),
    follows: String(raw?.follows ?? ''),
    bookTitles: Array.isArray(raw?.bookTitles) ? raw.bookTitles.map((t: unknown) => String(t)) : []
  }
}
