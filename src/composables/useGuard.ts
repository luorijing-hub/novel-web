// 登录拦截 + 轻提示（对应鸿蒙各页面的 guard / showTipMessage）
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { isLoggedIn } from '@/store/auth'

export function useGuard() {
  const router = useRouter()
  const showTip = ref(false)
  const tipText = ref('')
  let timer: number | undefined

  function showTipMessage(text: string): void {
    tipText.value = text
    showTip.value = true
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      showTip.value = false
    }, 2000)
  }

  // 需要登录的操作：未登录提示并跳转登录页
  function guard(action: () => void): void {
    if (!isLoggedIn.value) {
      showTipMessage('请先登录')
      window.setTimeout(() => {
        router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
      }, 800)
      return
    }
    action()
  }

  return { guard, showTip, tipText, showTipMessage }
}
