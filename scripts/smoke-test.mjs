// 冒烟测试：验证前端页面与后端接口是否可访问（npm run smoke）
const WEB = 'http://127.0.0.1:5173'
const API = 'http://127.0.0.1:8080/api'

async function check(url, label) {
  try {
    const res = await fetch(url)
    const text = await res.text()
    console.log(`${label} => HTTP ${res.status} | ${text.length} bytes`)
    return text
  } catch {
    console.log(`${label} => 未运行/不可访问`)
    return ''
  }
}

await check(WEB + '/', '前端 5173')
await check(WEB + '/covers/jianlai.png', '封面静态资源')
await check(API + '/health', '后端 /health')
const books = await check(API + '/books', '后端 /books')
try {
  console.log('书籍数量 =', JSON.parse(books).list.length)
} catch {
  /* ignore */
}
await check(API + '/ranking?scope=total', '后端 /ranking')
await check(API + '/discover', '后端 /discover')
await check(API + '/booklists', '后端 /booklists')
