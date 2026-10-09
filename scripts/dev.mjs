// 一条命令同时启动后端(8080)与前端(5173)：npm start
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const API_PORT = 8080
const WEB_PORT = 5173
const children = []
let exited = 0

function isPortFree(port) {
  return new Promise((resolve) => {
    const srv = createServer()
    srv.once('error', () => resolve(false))
    srv.once('listening', () => srv.close(() => resolve(true)))
    srv.listen(port, '0.0.0.0')
  })
}

const busy = []
if (!(await isPortFree(API_PORT))) busy.push(API_PORT)
if (!(await isPortFree(WEB_PORT))) busy.push(WEB_PORT)

if (busy.length > 0) {
  console.log('')
  console.log(`⚠️  端口被占用: ${busy.join('、')}`)
  console.log('   可能是上一次的服务还在运行 —— 若浏览器还能打开 http://localhost:5173，直接用它即可。')
  console.log('   需要重启的话，先在 PowerShell 里释放端口：')
  console.log('')
  console.log(`   Get-NetTCPConnection -LocalPort ${busy.join(',')} -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`)
  console.log('')
  process.exit(1)
}

function run(label, args, cwd) {
  const child = spawn(process.execPath, args, { cwd, stdio: 'inherit' })
  child.on('exit', (code) => {
    console.log(`\n[${label}] 已退出（code=${code}）`)
    exited++
    if (exited >= 2) process.exit(0)
  })
  child.on('error', (err) => console.error(`[${label}] 启动失败:`, err))
  children.push(child)
}

process.on('SIGINT', () => {
  console.log('\n正在停止服务...')
  children.forEach((c) => {
    if (!c.killed) c.kill()
  })
  process.exit(0)
})

console.log('后端: http://127.0.0.1:8080/api')
console.log('前端: http://localhost:5173\n')

run('后端', [join(root, 'server', 'mock-server.js')], join(root, 'server'))
run('前端', [join(root, 'node_modules', 'vite', 'bin', 'vite.js')], root)
