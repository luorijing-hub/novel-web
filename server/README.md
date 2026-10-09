# 后端联调说明

本项目采用前后端分离架构。`server/mock-server.js` 是后端入口，**数据层使用 SQLite
持久化**（Node.js 内置 `node:sqlite`，**零依赖，无需 npm install**），数据保存在
`server/novel.db`，服务重启不丢失。Node 版本低于 22.5 时自动回退内存数据（功能一致，重启丢失）。

## 一、启动后端

要求 Node.js >= 22.5（推荐 23.4+；本项目环境为 Node v24）。

```bash
node server/mock-server.js    # 在项目根目录执行
# 或
cd server && node mock-server.js
```

启动后监听 `0.0.0.0:8080`，控制台会打印示例地址：

```
[db] SQLite 已启用（node:sqlite），数据库文件: .../server/novel.db
后端已启动: http://0.0.0.0:8080/api
示例: http://127.0.0.1:8080/api/books
      http://127.0.0.1:8080/api/ranking?scope=male
```

浏览器或 curl 验证：`curl http://127.0.0.1:8080/api/health`

## 二、数据库结构（server/novel.db）

| 表 | 说明 |
|---|---|
| `books` | 书籍（标题/简介/作者/分类/热度字符串/频道） |
| `booklists` + `booklist_books` | 书单与书单包含的书籍（多对多） |
| `messages` | 消息通知（含已读状态，已读后重启仍保持） |
| `topics` + `topic_comments` | 话题与评论（参与话题评论会持久化） |
| `users` | 用户（注册的账号持久化） |
| `shelf` | 书架（加入的书籍持久化） |

代码结构：`mock-server.js` 只做路由，`db.js` 是存储层（SQLite + 内存回退），
`data.js` 是首次启动写入的种子数据。换 MySQL 只需改 `db.js` 的查询实现。

## 二、App 端连接配置

App 端后端地址在 `entry/src/main/ets/common/HttpConfig.ets` 中配置：

| 运行环境 | BASE_URL |
|---|---|
| DevEco 模拟器 | `http://10.0.2.2:8080/api`（默认，10.0.2.2 即宿主机） |
| 真机（同一局域网） | `http://<电脑局域网IP>:8080/api`，如 `http://192.168.1.100:8080/api` |
| 生产 | `https://api.example.com/api`（必须 HTTPS） |

## 三、App 端已具备的网络能力

| 文件 | 作用 |
|---|---|
| `entry/src/main/ets/common/HttpConfig.ets` | 后端地址 / 超时配置 |
| `entry/src/main/ets/common/HttpUtil.ets` | 统一请求封装（URL 拼接、JSON、Token 注入、错误抛出） |
| `entry/src/main/ets/services/ApiService.ets` | 业务接口定义（登录/书籍/排行/书单/发现/消息/书架） |
| `entry/src/main/module.json5` | 已声明 `ohos.permission.INTERNET` 与明文 HTTP 网络配置 |

## 四、页面接入示范

以排行页为例（`pages/RankingPage.ets`）：**优先请求后端，失败自动回退本地数据**，
后端未启动时页面功能不受影响。

```ts
private async fetchRanking() {
  try {
    const resp = await apiGetRanking(scope);       // 请求后端
    // ...映射为页面数据
    this.useServerData = true;
  } catch (err) {
    this.buildLocalRanking();                      // 回退本地计算
  }
}
```

其余页面接入方式相同：`await ApiService.xxx()` → 映射为本地类型 → 失败走本地兜底。

## 五、已提供的接口清单

```
GET    /api/health                     健康检查
POST   /api/auth/login                 登录（默认账号 admin / 123456）
POST   /api/auth/register              注册
GET    /api/books?channel=&category=   书籍列表（按频道/分类筛选）
GET    /api/ranking?scope=total|male|female   排行（后端计算热度）
GET    /api/booklists                  书单列表
GET    /api/booklists/:id              书单详情
GET    /api/discover                   发现页聚合数据
POST   /api/topics/:id/comments        话题发布评论
GET    /api/messages                   消息列表
POST   /api/messages/:id/read          单条已读
POST   /api/messages/read-all          全部已读
GET    /api/shelf                      书架
POST   /api/shelf                      加入书架
```

## 六、替换正式后端

1. 后端已是「路由 + 存储层」结构：把 `db.js` 中的 SQLite 查询换成 MySQL/PostgreSQL 即可
2. 部署后把 `HttpConfig.ets` 的 `BASE_URL` 改为正式域名（HTTPS）
3. 登录改为真实 Token 签发与校验，`HttpUtil` 已预留 `setToken/getToken`
