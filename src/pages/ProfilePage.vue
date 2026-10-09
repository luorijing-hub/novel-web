<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, isLoggedIn, logout } from '@/store/auth'
import { getShelfStats } from '@/data/shelf'
import { getCheckinExp, getLevel, getLevelProgress, getLevelRemain, getLevelTitle, getTotalExp } from '@/data/checkin'
import { getUnreadMessageCount } from '@/data/messages'
import { useGuard } from '@/composables/useGuard'

const router = useRouter()
const { showTip, tipText, showTipMessage } = useGuard()

const stats = ref({ total: 0, reading: 0, finished: 0 })
const unread = ref(0)

const username = computed(() => currentUser.value?.username ?? '')
const totalExp = computed(() => getTotalExp(username.value, stats.value.finished))
const level = computed(() => getLevel(totalExp.value))
const levelTitle = computed(() => getLevelTitle(level.value))
const levelProgress = computed(() => getLevelProgress(totalExp.value))
const levelRemain = computed(() => getLevelRemain(totalExp.value))

const menuGroups = [
  {
    title: '常用功能',
    items: [
      { icon: '📖', bg: '#fff3ee', name: '我的书架', desc: '管理你的藏书', action: () => router.push('/bookshelf') },
      { icon: '📊', bg: '#eef6ff', name: '阅读统计', desc: '了解你的阅读习惯', action: () => showTipMessage('阅读统计开发中...') },
      { icon: '⭐', bg: '#fff8e8', name: '我的收藏', desc: '收藏的书单', action: () => router.push('/favorites') },
      { icon: '💬', bg: '#eefaf0', name: '书评管理', desc: '管理你发布的书评', action: () => showTipMessage('书评管理开发中...') }
    ]
  },
  {
    title: '通知与服务',
    items: [
      { icon: '🧹', bg: '#f0f2ff', name: '清除缓存', desc: '释放设备存储空间', action: () => showTipMessage('缓存已清除') },
      { icon: 'ℹ️', bg: '#f4f4f5', name: '关于我们', desc: '小说阅读 v1.3.0', action: () => showTipMessage('小说阅读 v1.3.0') }
    ]
  }
]

function refresh() {
  stats.value = getShelfStats(username.value)
  unread.value = getUnreadMessageCount(username.value)
}

function doLogout() {
  logout()
  router.replace('/')
}

onMounted(() => {
  if (!isLoggedIn.value) {
    router.replace('/login')
    return
  }
  refresh()
})
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">我的</span>
      <span class="navbar__action" @click="showTipMessage('设置开发中...')">⚙️</span>
    </div>

    <div v-if="currentUser" class="page-body hide-scrollbar">
      <!-- 用户头卡 -->
      <div class="user-card">
        <div style="display: flex; align-items: center">
          <div class="user-card__avatar">{{ currentUser.avatar || '👤' }}</div>
          <div style="padding-left: 14px; flex: 1; min-width: 0">
            <div style="display: flex; align-items: center">
              <span class="user-card__name ellipsis">{{ currentUser.nickname || currentUser.username }}</span>
              <span class="user-card__level">Lv.{{ level }} {{ levelTitle }}</span>
            </div>
            <div class="user-card__sub">@{{ currentUser.username }}</div>
            <div class="user-card__sub" style="opacity: 0.6">注册于 {{ currentUser.registerTime }}</div>
          </div>
        </div>

        <div style="display: flex; margin: 16px 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.9)">
          <span>已读完 {{ stats.finished }} 本 · 经验 {{ totalExp }}</span>
          <span style="margin-left: auto; opacity: 0.75">
            {{ level >= 10 ? '已达最高等级' : `距 Lv.${level + 1} 还差 ${levelRemain} 经验` }}
          </span>
        </div>
        <div class="user-card__bar"><div class="user-card__bar-fill" :style="{ width: levelProgress + '%' }"></div></div>
      </div>

      <!-- 数据统计 -->
      <div class="stats-card">
        <div class="stats-card__item" @click="router.push('/bookshelf')">
          <div class="stats-card__icon" style="background: #fff3ee">📚</div>
          <div class="stats-card__value">{{ stats.total }}</div>
          <div class="stats-card__label">藏书</div>
        </div>
        <div class="stats-card__item" @click="router.push('/bookshelf')">
          <div class="stats-card__icon" style="background: #eef6ff">📖</div>
          <div class="stats-card__value">{{ stats.reading }}</div>
          <div class="stats-card__label">在读</div>
        </div>
        <div class="stats-card__item" @click="router.push('/bookshelf')">
          <div class="stats-card__icon" style="background: #eefaf0">✅</div>
          <div class="stats-card__value">{{ stats.finished }}</div>
          <div class="stats-card__label">已读完</div>
        </div>
      </div>

      <!-- 菜单 -->
      <div class="menu-card">
        <template v-for="group in menuGroups" :key="group.title">
          <div class="menu-group">{{ group.title }}</div>
          <div v-for="item in group.items" :key="item.name" class="menu-item" @click="item.action()">
            <div class="menu-item__icon" :style="{ background: item.bg }">{{ item.icon }}</div>
            <div style="flex: 1; min-width: 0">
              <div class="menu-item__name">{{ item.name }}</div>
              <div class="menu-item__desc">{{ item.desc }}</div>
            </div>
            <span class="menu-item__arrow">›</span>
          </div>
        </template>

        <div class="menu-item" @click="router.push('/messages')">
          <div class="menu-item__icon" style="background: #fff0f6">🔔</div>
          <div style="flex: 1; min-width: 0">
            <div class="menu-item__name">消息通知</div>
            <div class="menu-item__desc">系统消息与互动提醒</div>
          </div>
          <span v-if="unread > 0" class="menu-item__badge">{{ unread }}</span>
          <span class="menu-item__arrow">›</span>
        </div>
      </div>

      <div style="display: flex; justify-content: center; padding: 8px 0 24px">
        <button class="logout-btn" @click="doLogout">退出登录</button>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.user-card {
  margin: 12px 18px 14px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff9a62 0%, #ff5e2a 100%);
  color: #fff;
}
.user-card__avatar {
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  border: 2px solid rgba(255, 255, 255, 0.5);
}
.user-card__name {
  font-size: 20px;
  font-weight: 700;
  max-width: 140px;
}
.user-card__level {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  padding: 3px 10px;
  margin-left: 8px;
  white-space: nowrap;
}
.user-card__sub {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.85;
}
.user-card__bar {
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.25);
  overflow: hidden;
}
.user-card__bar-fill {
  height: 100%;
  background: #fff;
}
.stats-card {
  display: flex;
  margin: 0 18px 14px;
  padding: 14px 10px;
  background: #fff;
  border-radius: 12px;
}
.stats-card__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.stats-card__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.stats-card__value {
  font-size: 20px;
  font-weight: 700;
  margin-top: 6px;
}
.stats-card__label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.menu-card {
  margin: 0 18px 16px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}
.menu-group {
  font-size: 13px;
  color: #8e8e93;
  padding: 14px 16px 6px;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f6f8;
  cursor: pointer;
}
.menu-item__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
  flex: 0 0 38px;
}
.menu-item__name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.menu-item__desc {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.menu-item__badge {
  background: #ff4d4f;
  color: #fff;
  font-size: 11px;
  border-radius: 10px;
  padding: 2px 8px;
  margin-right: 8px;
}
.menu-item__arrow {
  font-size: 20px;
  color: #ccc;
}
.logout-btn {
  width: 90%;
  height: 44px;
  border-radius: 22px;
  border: 1px solid #ff4d4f;
  background: #fff;
  color: #ff4d4f;
  font-size: 16px;
  cursor: pointer;
}
</style>
