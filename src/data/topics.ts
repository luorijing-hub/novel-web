// 话题数据（发现页与话题页共用）
export interface TopicItem {
  id: number
  title: string
  hot: string
  color: string
}

export interface TopicPost {
  user: string
  content: string
  likes: string
  avatar: string
}

export const TOPICS: TopicItem[] = [
  { id: 1, title: '#凡人修仙传·凡尘大结局#', hot: '128.4w 讨论', color: '#ff5e2a' },
  { id: 2, title: '#甜宠文推荐清单#', hot: '96.7w 讨论', color: '#ff4d94' },
  { id: 3, title: '#三体·黑暗森林法则解读#', hot: '85.2w 讨论', color: '#3aa0ff' },
  { id: 4, title: '#宫斗原著哪家强#', hot: '63.9w 讨论', color: '#8b5cf6' },
  { id: 5, title: '#熬夜追书の日常#', hot: '52.1w 讨论', color: '#f59e0b' },
  { id: 6, title: '#玄幻小说巅峰之作#', hot: '48.6w 讨论', color: '#8ec9b8' },
  { id: 7, title: '#书荒救星推荐#', hot: '41.3w 讨论', color: '#e0a878' },
  { id: 8, title: '#古言女主天花板#', hot: '36.8w 讨论', color: '#b8a8e0' },
  { id: 9, title: '#科幻迷必读清单#', hot: '29.5w 讨论', color: '#7fb3d9' },
  { id: 10, title: '#网文改编剧你看了吗#', hot: '22.1w 讨论', color: '#d99f9f' }
]

export const POSTS_MAP: Record<string, TopicPost[]> = {
  '1': [
    { user: '凡人道友', content: '凡尘结局泪目了，陈平安一路走来太不容易。', likes: '2.3k', avatar: '🌄' },
    { user: '熬夜看书人', content: '从青萍剑到人间剑，这套书追了五年值了。', likes: '1.8k', avatar: '⚔️' },
    { user: '书中仙', content: '结局伏笔全收，烽火果然没让我失望。', likes: '1.2k', avatar: '📖' }
  ],
  '2': [
    { user: '糖分超标', content: '求更多甜甜的现言，书荒好久了！', likes: '3.1k', avatar: '🍬' },
    { user: '小甜饼', content: '何以笙箫默永远的神，番外再来十本！', likes: '2.6k', avatar: '💕' },
    { user: '言情书虫', content: '陈芊芊这种反套路甜宠多来点。', likes: '1.5k', avatar: '🍭' }
  ],
  '3': [
    { user: '仰望星空', content: '黑暗森林法则细思极恐，二向箔太震撼。', likes: '4.2k', avatar: '🌌' },
    { user: '物理学渣', content: '看完三体再抬头看夜空，感觉都不一样了。', likes: '2.9k', avatar: '🔭' },
    { user: '面壁者', content: '给岁月以文明，给时光以生命。', likes: '2.1k', avatar: '🪐' }
  ],
  '4': [
    { user: '深宫迷', content: '甄嬛传的权谋细节，每刷一遍都有新发现。', likes: '1.9k', avatar: '👑' },
    { user: '步步惊心粉', content: '若曦和四爷的遗憾，原著比剧版更虐。', likes: '1.4k', avatar: '🛶' },
    { user: '宅斗研究组', content: '如懿传的帝后离心，看得又气又唏嘘。', likes: '0.9k', avatar: '🏮' }
  ],
  '5': [
    { user: '修仙赶路人', content: '凌晨三点还在追更的举手！', likes: '3.6k', avatar: '🌙' },
    { user: '不想睡觉', content: '看完这章就睡，结果看到了天亮。', likes: '2.7k', avatar: '😴' },
    { user: '追更狂魔', content: '我的黑眼圈就是最好的书评。', likes: '1.8k', avatar: '🐼' }
  ],
  '6': [
    { user: '书海漫游', content: '斗破苍穹 yyds！', likes: '1.6k', avatar: '⚔️' },
    { user: '玄幻迷', content: '玄幻还得看老牌大神。', likes: '1.1k', avatar: '🔥' }
  ],
  '7': [
    { user: '书荒患者', content: '最近书荒，求推荐！', likes: '2.2k', avatar: '📚' },
    { user: '热心书友', content: '来收藏几个书单吧，都是宝藏。', likes: '1.4k', avatar: '🎁' }
  ],
  '8': [
    { user: '古言控', content: '甄嬛永远是白月光。', likes: '1.9k', avatar: '👑' },
    { user: '明兰粉', content: '知否的明兰太清醒了。', likes: '1.3k', avatar: '🏮' }
  ],
  '9': [
    { user: '科幻迷', content: '三体之后无科幻？', likes: '1.8k', avatar: '🌌' },
    { user: '面壁人', content: '黑暗森林法则神了。', likes: '1.2k', avatar: '🪐' }
  ],
  '10': [
    { user: '追剧人', content: '微微一笑的剧版太还原了。', likes: '1.5k', avatar: '💕' },
    { user: '剧粉', content: '期待陈芊芊第二季！', likes: '0.9k', avatar: '🍭' }
  ]
}

// 限时免费 / 新书首发 书单
export const FREE_BOOK_TITLES = ['三体', '凡人修仙传', '盗墓笔记', '最好的我们', '微微一笑很倾城', '欢乐颂']
export const NEW_BOOK_TITLES = [
  '传闻中的陈芊芊',
  '花间提壶方大厨',
  '重生之将门毒后',
  '如果蜗牛有爱情',
  '他来了，请闭眼',
  '最好的我们'
]
