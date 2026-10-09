# 小说阅读 · 网页版（novel-web）

> 🔗 **在线演示**:https://novel-reader-demo.surge.sh （手机 / 电脑均可访问）

Vue3 + Vite + TypeScript 前端 + Node.js + SQLite 后端,前后端分离的完整小说阅读应用。
用 VS Code 打开本目录即可开发。

## 功能一览

- **首页**:搜索(书名/作者/分类/简介)、7 项频道导航、轮播图、5 个快捷入口、热门推荐、底部导航
- **分类 / 排行**:男频女频切换、10 类分类网格、总榜/男频榜/女频榜 + 热度构成
- **书单 / 发现**:限时免费、签到有礼、新书首发三个活动;话题讨论、新书速递、大家都在看
- **我的**:登录注册、书架管理、书单收藏、消息通知、书评、等级与经验(签到 +10、读完一本 +100、300 经验一级)
- **技术要点**:统一热度算法(阅读×0.5 + 收藏×2 + 评论×5)、多账号数据隔离、「后端优先 + 本地兜底」容错

## 快速开始

```bash
# 1. 安装依赖（首次）
npm install
cd server && npm install && cd ..

# 2. 一键启动（后端 8080 + 前端 5173）
npm start
```

浏览器打开 **http://localhost:5173**

> 后端未启动也能用:所有页面会自动回退到前端内置数据。

## 全部命令

| 命令 | 作用 |
| --- | --- |
| `npm start` | 同时启动后端 + 前端(并行,`Ctrl+C` 一起停) |
| `npm run server` | 只启动后端(8080) |
| `npm run dev` | 只启动前端(5173,热更新) |
| `npm run build` | 类型检查 + 打包到 `dist/` |
| `npm run preview` | 预览打包结果(4173) |
| `npm run smoke` | 自测:检查前端与后端接口连通 |

## 目录结构

```
novel-web/
├── index.html                  入口 HTML
├── vite.config.ts              Vite 配置（@ 别名 / 5173 端口 / /api 代理）
├── tsconfig.json               TS 配置
├── package.json                依赖与脚本
├── public/covers/              31 张小说封面（WebP，/covers/xx.webp 引用）
├── src/
│   ├── main.ts  App.vue  styles.css
│   ├── router/index.ts         14 个页面路由
│   ├── api/
│   │   ├── http.ts             fetch 封装（BASE_URL / token / 错误处理）
│   │   └── index.ts            业务接口层
│   ├── composables/useGuard.ts 登录拦截 + 轻提示
│   ├── store/auth.ts           登录态、用户信息、本地账号兜底
│   ├── utils/storage.ts        localStorage 封装（按账号隔离 key）
│   ├── data/                   数据与业务规则
│   │   ├── books.ts            26 本书 + 热度算法 + 后端数据映射
│   │   ├── booklists.ts        6 个书单
│   │   ├── topics.ts           10 个话题 + 讨论帖 + 免费/新书清单
│   │   ├── messages.ts         消息 + 按账号已读
│   │   ├── favorites.ts        书单收藏（按账号）
│   │   ├── checkin.ts          签到与经验/等级
│   │   └── shelf.ts            书架（按账号）
│   └── pages/                  14 个页面组件
├── server/                     后端（独立 package.json，运行时零依赖）
│   ├── mock-server.js          HTTP 路由层（15 个接口）
│   ├── db.js                   存储层（SQLite 建表/读写，内存回退）
│   ├── data.js                 种子数据（书籍/书单/消息/话题/账号）
│   ├── novel.db                运行时生成的数据库文件
│   └── jsconfig.json           Node 环境类型声明
├── scripts/
│   ├── dev.mjs                 一键启动（npm start）
│   └── smoke-test.mjs          冒烟测试（npm run smoke）
└── .vscode/                    VS Code 任务与调试配置
```

## 页面清单（14 个）

| 路由 | 页面 | 主要功能 |
| --- | --- | --- |
| `/` | 首页 | 搜索、频道导航、轮播、快捷入口、热门推荐、底部导航 |
| `/category` | 分类 | 男频/女频、10 类分类网格(含数量)、书籍列表、加入书架 |
| `/ranking` | 排行榜 | 总榜/男频榜/女频榜、热度构成、热度进度条、名次变化 |
| `/booklists` | 书单 | 三个活动 + 书单列表/详情 + 收藏 |
| `/discover` | 发现 | 活动、热门话题(横滑)、新书速递(横滑)、精选书单、大家都在看(横滑) |
| `/new-books` | 新书首发 | 新书列表、点击封面加入书架 |
| `/topics` | 热门话题 | 10 个话题、讨论面板、参与评论 |
| `/hot-books` | 大家都在看 | 热度前 10、名次角标 |
| `/bookshelf` | 我的书架 | 增删、在读/已读完筛选、批量删除 |
| `/login` | 登录注册 | 后端优先,网络不可用回退本地账号 |
| `/profile` | 我的 | 等级/经验、阅读统计、收藏入口、消息角标、退出登录 |
| `/favorites` | 我的收藏 | 收藏的书单、取消收藏 |
| `/messages` | 消息通知 | 消息列表、单条/全部已读 |
| `/comment` | 书评 | 发布书评、点赞 |

## 接口一览（后端 8080）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| POST | `/api/auth/login` | 登录(默认 admin / 123456) |
| POST | `/api/auth/register` | 注册 |
| GET | `/api/books?channel=&category=` | 书籍列表 |
| GET | `/api/ranking?scope=total\|male\|female` | 排行榜 |
| GET | `/api/booklists` / `/api/booklists/:id` | 书单列表 / 详情 |
| GET | `/api/discover` | 发现页聚合数据 |
| POST | `/api/topics/:id/comments` | 话题评论 |
| GET | `/api/messages?username=` | 消息列表 |
| POST | `/api/messages/:id/read` / `read-all` | 单条 / 全部已读 |
| GET | `/api/shelf?username=` | 书架列表 |
| POST | `/api/shelf` | 加入书架 |
| DELETE | `/api/shelf?username=&title=` | 移出书架 |

## 业务规则

- **热度** = 阅读量 × 0.5 + 收藏量 × 2 + 评论量 × 5(前后端同一算法)
- **经验** = 读完书数 × 100 + 签到次数 × 10;每 **300 经验**升 1 级,上限 Lv.10
- **登录拦截**:加入书架、进入书架、收藏、消息、发布书评 → 未登录提示「请先登录」并跳转登录页
- **新账号**:书架为空、收藏为空、消息未读数 0

## 数据存储

| 数据 | 位置 |
| --- | --- |
| 书籍/书单/话题/消息/账号/书架/已读 | 后端 `server/novel.db`(SQLite) |
| 登录态、签到经验、收藏、本地书架副本、书评 | 浏览器 `localStorage`(键按账号隔离) |

重置后端数据:删除 `server/novel.db*` 后重启,会按 `server/data.js` 重新播种。

## 部署

前端为纯静态站点(路由使用 hash 模式,无需重写规则),可直接部署到任意静态托管:

```bash
npm run build          # 产物在 dist/
npx surge dist <你的域名>.surge.sh
```

后端如需上线,可将 `server/` 部署到任意 Node 运行环境,并修改 `src/api/http.ts` 中的 `BASE_URL`。
