<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { setToken } from '@/api/http'
import { addLocalUser, findLocalUser, localUserExists, randomAvatar, saveUser, toUserInfo, type UserInfo } from '@/store/auth'

const route = useRoute()
const router = useRouter()

const isLoginMode = ref(true)
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

function toggleMode() {
  isLoginMode.value = !isLoginMode.value
  errorMessage.value = ''
  password.value = ''
  confirmPassword.value = ''
}

function afterLogin(user: UserInfo) {
  saveUser(user)
  router.replace(String(route.query.redirect ?? '/profile'))
}

// 登录：优先后端；服务器拒绝按提示报错；网络不可达回退本地账号
async function login() {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码'
    return
  }
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res: any = await api.login(username.value, password.value)
    setToken(String(res?.token ?? ''))
    afterLogin(toUserInfo(res?.user, username.value))
  } catch (err: any) {
    const msg = String(err?.message ?? '')
    if (msg.includes('服务端错误')) {
      errorMessage.value = '用户名或密码错误'
    } else {
      const local = findLocalUser(username.value, password.value)
      if (local) {
        const { password: _pwd, ...user } = local
        afterLogin(user)
      } else {
        errorMessage.value = '网络不可用，且本地无此账号'
      }
    }
  } finally {
    isLoading.value = false
  }
}

// 注册：优先后端，网络不可达回退本地注册
async function register() {
  if (!username.value || !password.value || !confirmPassword.value) {
    errorMessage.value = '请填写完整信息'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次密码输入不一致'
    return
  }
  if (password.value.length < 6) {
    errorMessage.value = '密码长度不能少于6位'
    return
  }
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res: any = await api.register(username.value, password.value, nickname.value)
    setToken(String(res?.token ?? ''))
    afterLogin(toUserInfo(res?.user, username.value))
  } catch (err: any) {
    const msg = String(err?.message ?? '')
    if (msg.includes('服务端错误')) {
      errorMessage.value = msg.includes('409') ? '用户名已存在' : '注册失败，请重试'
    } else if (localUserExists(username.value)) {
      errorMessage.value = '用户名已存在'
    } else {
      const user: UserInfo = {
        username: username.value,
        nickname: nickname.value || username.value,
        avatar: randomAvatar(),
        email: '',
        phone: '',
        registerTime: new Date().toLocaleString()
      }
      addLocalUser({ ...user, password: password.value })
      afterLogin(user)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page" style="background: #fff">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">{{ isLoginMode ? '登录' : '注册' }}</span>
    </div>

    <div class="page-body" style="padding: 40px 30px">
      <div style="text-align: center; margin-bottom: 40px">
        <div style="font-size: 48px">📚</div>
        <div style="font-size: 24px; font-weight: 700; margin-top: 12px; color: #ff5e2a">小说阅读</div>
        <div style="font-size: 14px; color: #666; margin-top: 8px">{{ isLoginMode ? '欢迎回来' : '创建你的账号' }}</div>
      </div>

      <div class="form-item">
        <span class="form-item__icon">👤</span>
        <input v-model="username" class="form-item__input" placeholder="请输入用户名" />
      </div>

      <div class="form-item">
        <span class="form-item__icon">🔒</span>
        <input v-model="password" class="form-item__input" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" />
        <span class="form-item__icon" style="cursor: pointer" @click="showPassword = !showPassword">{{ showPassword ? '🙈' : '👁' }}</span>
      </div>

      <template v-if="!isLoginMode">
        <div class="form-item">
          <span class="form-item__icon">🔒</span>
          <input v-model="confirmPassword" class="form-item__input" :type="showPassword ? 'text' : 'password'" placeholder="请确认密码" />
        </div>
        <div class="form-item">
          <span class="form-item__icon">✏️</span>
          <input v-model="nickname" class="form-item__input" placeholder="昵称（选填）" />
        </div>
      </template>

      <div v-if="errorMessage" class="error-box">⚠️ {{ errorMessage }}</div>

      <button class="btn-primary btn-block" style="height: 48px; font-size: 16px; margin-top: 24px" :disabled="isLoading" @click="isLoginMode ? login() : register()">
        {{ isLoading ? '请稍候...' : isLoginMode ? '登 录' : '注 册' }}
      </button>

      <div style="text-align: center; margin-top: 16px; font-size: 14px; color: #666">
        {{ isLoginMode ? '还没有账号？' : '已有账号？' }}
        <span style="color: #ff5e2a; cursor: pointer" @click="toggleMode">{{ isLoginMode ? '立即注册' : '去登录' }}</span>
      </div>

      <div style="margin-top: 30px; font-size: 12px; color: #999; text-align: center; line-height: 1.8">
        提示：后端未启动时可使用本地注册账号登录<br />
        默认测试账号：admin / 123456
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-item {
  display: flex;
  align-items: center;
  height: 50px;
  border-bottom: 1px solid #eee;
  gap: 10px;
}
.form-item__icon {
  font-size: 18px;
}
.form-item__input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
}
.error-box {
  margin-top: 14px;
  padding: 10px 14px;
  background: #fff2f0;
  border-radius: 8px;
  color: #ff4d4f;
  font-size: 14px;
}
</style>
