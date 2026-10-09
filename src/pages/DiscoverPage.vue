<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BOOKS, calcBookHeat, formatHeatWan, getBooksByTitles, mapServerBook, type BookItem } from '@/data/books'
import { BOOKLISTS, mapServerBooklist, type Booklist } from '@/data/booklists'
import { FREE_BOOK_TITLES, NEW_BOOK_TITLES, POSTS_MAP, TOPICS, type TopicItem, type TopicPost } from '@/data/topics'
import { api } from '@/api'
import { currentUsername } from '@/store/auth'
import { isBooklistFavorite, toggleBooklistFavorite } from '@/data/favorites'
import { CHECKIN_EXP_PER_DAY, doCheckin, getCheckinDay, getCheckinExp, isSignedToday } from '@/data/checkin'
import { useGuard } from '@/composables/useGuard'

const router = useRouter()
const { guard, showTip, tipText, showTipMessage } = useGuard()

const activities = [
  { title: '限时免费', desc: '全场精选免费读', emoji: '📖', color: '#ff8a65' },
  { title: '签到有礼', desc: '签到领经验值', emoji: '🎁', color: '#ff6b9d' },
  { title: '新书首发', desc: '独家首发抢先看', emoji: '🔥', color: '#5b8def' }
]

const topics = ref<TopicItem[]>(TOPICS)
const newBooks = ref<BookItem[]>([])
const hotBooks = ref<BookItem[]>([])
const booklists = ref<Booklist[]>(BOOKLISTS)
const useServerData = ref(false)

const showFree = ref(false)
const showCheckin = ref(false)
const showNew = ref(false)
const freeBooks = ref<BookItem[]>([])
const signedToday = ref(false)
const checkinExp = ref(0)
const checkinDay = computed(() => getCheckinDay())
const checkinRewards = [10, 10, 10, 10, 10, 10, 10]

const showTopic = ref(false)
const selectedTopic = ref<TopicItem | null>(null)
const topicPosts = ref<TopicPost[]>([])
const commentText = ref('')

function initLocal() {
  freeBooks.value = getBooksByTitles(FREE_BOOK_TITLES)
  newBooks.value = getBooksByTitles(NEW_BOOK_TITLES)
  hotBooks.value = [...BOOKS].sort((a, b) => calcBookHeat(b.title, b.hot).heatWan - calcBookHeat(a.title, a.hot).heatWan).slice(0, 10)
  booklists.value = BOOKLISTS
}

async function loadFromServer() {
  try {
    const res: any = await api.getDiscover()
    const mappedNew: BookItem[] = (res?.newBooks ?? []).map((r: unknown) => mapServerBook(r)).filter((b: BookItem | null): b is BookItem => !!b)
    const mappedHot: BookItem[] = (res?.hotBooks ?? []).map((r: unknown) => mapServerBook(r)).filter((b: BookItem | null): b is BookItem => !!b)
    const mappedLists: Booklist[] = (res?.booklists ?? []).map((r: unknown) => mapServerBooklist(r)).filter((l: Booklist | null): l is Booklist => !!l)
    if (mappedNew.length) newBooks.value = mappedNew
    if (mappedHot.length) hotBooks.value = mappedHot
    if (mappedLists.length) booklists.value = mappedLists
    useServerData.value = !!(mappedNew.length || mappedHot.length)
  } catch (err) {
    console.info('发现页接口请求失败，使用本地数据', err)
  }
}

function loadCheckin() {
  const user = currentUsername.value
  signedToday.value = isSignedToday(user)
  checkinExp.value = getCheckinExp(user)
}

function onCheckin() {
  const res = doCheckin(currentUsername.value)
  showTipMessage(res.message)
  loadCheckin()
}

function openTopic(topic: TopicItem) {
  selectedTopic.value = topic
  topicPosts.value = [...(POSTS_MAP[String(topic.id)] ?? [])]
  commentText.value = ''
  showTopic.value = true
}

function closeTopic() {
  showTopic.value = false
  selectedTopic.value = null
  topicPosts.value = []
  commentText.value = ''
}

function submitComment() {
  const content = commentText.value.trim()
  if (!content) {
    showTipMessage('请输入内容')
    return
  }
  topicPosts.value.unshift({ user: '我', content, likes: '0', avatar: '🙋' })
  commentText.value = ''
  const id = selectedTopic.value?.id
  if (id) api.submitComment(id, content).catch((err) => console.info('评论同步后端失败', err))
}

function toggleFavorite(list: Booklist) {
  guard(() => {
    const now = toggleBooklistFavorite(currentUsername.value, list)
    showTipMessage(now ? '已收藏书单' : '已取消收藏')
    booklists.value = [...booklists.value]
  })
}

function addToShelf(book: BookItem) {
  router.push({ path: '/bookshelf', query: { add: book.title } })
}

function openBooklistDetail(list: Booklist) {
  router.push({ path: '/booklists', query: { id: list.id } })
}

onMounted(() => {
  initLocal()
  loadCheckin()
  loadFromServer()
})
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">发现</span>
      <span class="navbar__action" @click="guard(() => router.push('/bookshelf'))">📖</span>
      <span class="navbar__action" style="margin-left: 18px" @click="router.push('/')">🏠</span>
    </div>

    <div class="page-body hide-scrollbar">
      <!-- 活动 -->
      <div class="section">
        <div class="hscroll hide-scrollbar" style="gap: 12px; padding: 14px">
          <div
            v-for="act in activities"
            :key="act.title"
            class="act-card"
            :style="{ background: act.color }"
            @click="act.title === '限时免费' ? (showFree = true) : act.title === '签到有礼' ? (showCheckin = true) : (showNew = true)"
          >
            <span style="font-size: 22px">{{ act.emoji }}</span>
            <span style="font-size: 15px; font-weight: 700; margin-top: 6px">{{ act.title }}</span>
            <span style="font-size: 11px; opacity: 0.9; margin-top: 2px">
              {{ act.title === '签到有礼' ? (signedToday ? '今日已签到' : `签到 +${CHECKIN_EXP_PER_DAY} 经验`) : act.desc }}
            </span>
          </div>
        </div>
      </div>

      <!-- 热门话题 -->
      <div class="section">
        <div class="section-head">
          <span class="section-head__title">💬 热门话题</span>
          <span class="section-head__more" @click="router.push('/topics')">更多 ›</span>
        </div>
        <div class="hscroll hide-scrollbar" style="gap: 10px; padding: 0 18px 14px">
          <div v-for="(topic, index) in topics" :key="topic.id" class="topic-chip" @click="openTopic(topic)">
            <div style="display: flex; align-items: center">
              <span class="topic-chip__no" :style="{ background: index < 3 ? topic.color : '#c0c4cc' }">{{ index + 1 }}</span>
              <span style="font-size: 10px; color: #8e8e93; margin-left: 6px">🔥 {{ topic.hot }}</span>
            </div>
            <div class="topic-chip__title ellipsis-2">{{ topic.title }}</div>
          </div>
        </div>
      </div>

      <!-- 新书速递 -->
      <div class="section">
        <div class="section-head">
          <span class="section-head__title">🆕 新书速递</span>
          <span class="section-head__more" @click="router.push('/new-books')">更多 ›</span>
        </div>
        <div class="hscroll hide-scrollbar" style="gap: 12px; padding: 0 18px 14px">
          <div v-for="book in newBooks" :key="book.title" class="cover-card" @click="guard(() => addToShelf(book))">
            <img :src="book.image" :alt="book.title" :style="{ background: book.color }" />
            <span class="cover-card__title ellipsis">{{ book.title }}</span>
            <span class="cover-card__sub ellipsis">{{ book.author }}</span>
          </div>
        </div>
      </div>

      <!-- 精选书单 -->
      <div class="section">
        <div class="section-head">
          <span class="section-head__title">📚 精选书单</span>
          <span class="section-head__more" @click="router.push('/booklists')">更多 ›</span>
        </div>
        <div style="padding: 0 14px 14px">
          <div v-for="list in booklists" :key="list.id" class="bl-row">
            <div style="display: flex; align-items: center" @click="openBooklistDetail(list)">
              <span class="ellipsis" style="font-size: 15px; font-weight: 700; flex: 1">{{ list.title }}</span>
              <span style="font-size: 20px; cursor: pointer" @click.stop="toggleFavorite(list)">
                {{ isBooklistFavorite(currentUsername, list.id) ? '⭐' : '☆' }}
              </span>
            </div>
            <div class="ellipsis" style="font-size: 12px; color: #6b6b70; margin-top: 4px">{{ list.desc }}</div>
            <div class="hscroll hide-scrollbar" style="gap: 8px; margin-top: 8px">
              <img
                v-for="book in getBooksByTitles(list.bookTitles).slice(0, 4)"
                :key="book.title"
                :src="book.image"
                :alt="book.title"
                :style="{ background: book.color }"
                style="width: 48px; height: 64px; border-radius: 8px; object-fit: cover"
                @click="guard(() => addToShelf(book))"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 大家都在看 -->
      <div class="section">
        <div class="section-head">
          <span class="section-head__title">🔥 大家都在看</span>
          <span class="section-head__more" @click="router.push('/hot-books')">更多 ›</span>
        </div>
        <div class="hscroll hide-scrollbar" style="gap: 12px; padding: 0 18px 16px">
          <div v-for="(book, index) in hotBooks" :key="book.title" class="cover-card" @click="guard(() => addToShelf(book))">
            <div style="position: relative">
              <img :src="book.image" :alt="book.title" :style="{ background: book.color }" />
              <span
                class="hot-badge"
                :style="{ background: index < 3 ? (index === 0 ? '#ff5e2a' : index === 1 ? '#f59e0b' : '#c0a062') : 'rgba(0,0,0,0.45)' }"
              >
                {{ index + 1 }}
              </span>
            </div>
            <span class="cover-card__title ellipsis">{{ book.title }}</span>
            <span style="font-size: 10px; color: #ff5e2a">🔥 {{ formatHeatWan(calcBookHeat(book.title, book.hot).heatWan) }}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; font-size: 11px; color: #bbb; padding: 10px 0 24px">
        {{ useServerData ? '数据来源：后端接口' : '数据来源：本地数据' }}
      </div>
    </div>

    <!-- 限时免费 -->
    <div v-if="showFree" class="sheet-mask" @click.self="showFree = false">
      <div class="sheet" style="height: 60%">
        <div style="padding: 16px; display: flex; align-items: center">
          <span style="font-size: 17px; font-weight: 700">📖 限时免费</span>
          <span style="margin-left: auto; font-size: 18px; color: #999; cursor: pointer" @click="showFree = false">✕</span>
        </div>
        <div style="padding: 0 16px 10px; font-size: 12px; color: #8e8e93">全场精选好书限时免费读，点击封面加入书架</div>
        <div style="flex: 1; overflow-y: auto; padding: 0 14px 16px">
          <div v-for="book in freeBooks" :key="book.title" class="sheet-book">
            <img :src="book.image" :alt="book.title" :style="{ background: book.color }" @click="guard(() => addToShelf(book))" />
            <div style="flex: 1; min-width: 0; padding-left: 12px">
              <div style="font-size: 15px; font-weight: 700">{{ book.title }}</div>
              <div class="ellipsis" style="font-size: 12px; color: #6b6b70; margin-top: 4px">{{ book.desc }}</div>
              <div style="margin-top: 6px"><span class="chip" style="background: #fff3ee; color: #ff5e2a">免费</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 签到有礼 -->
    <div v-if="showCheckin" class="sheet-mask" @click.self="showCheckin = false">
      <div class="sheet" style="height: 46%">
        <div style="padding: 16px 18px 12px; display: flex; align-items: center">
          <span style="font-size: 17px; font-weight: 700">🎁 签到有礼</span>
          <span style="margin-left: auto; font-size: 18px; color: #999; cursor: pointer" @click="showCheckin = false">✕</span>
        </div>
        <div style="display: flex; padding: 8px 18px 16px">
          <div v-for="(reward, index) in checkinRewards" :key="index" style="flex: 1; display: flex; flex-direction: column; align-items: center">
            <div
              class="checkin-dot"
              :style="{
                background: signedToday && index === checkinDay - 1 ? '#ff5e2a' : index === checkinDay - 1 ? '#fff3ee' : '#f4f6fa',
                color: signedToday && index === checkinDay - 1 ? '#fff' : index === checkinDay - 1 ? '#ff5e2a' : '#8e8e93'
              }"
            >
              {{ index + 1 }}
            </div>
            <span style="font-size: 10px; color: #8e8e93; margin-top: 4px">+{{ reward }}</span>
          </div>
        </div>
        <div style="text-align: center; font-size: 13px; color: #666">
          {{ signedToday ? '✅ 今日已签到' : `今日签到可领 ${CHECKIN_EXP_PER_DAY} 经验` }}
        </div>
        <div style="display: flex; justify-content: center">
          <button
            class="btn-primary"
            style="width: 86%; height: 44px; font-size: 16px; margin-top: 24px"
            :style="{ background: signedToday ? '#ccc' : '#ff5e2a' }"
            @click="onCheckin"
          >
            {{ signedToday ? '已签到' : '立即签到' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 新书首发 -->
    <div v-if="showNew" class="sheet-mask" @click.self="showNew = false">
      <div class="sheet" style="height: 60%">
        <div style="padding: 16px; display: flex; align-items: center">
          <span style="font-size: 17px; font-weight: 700">🔥 新书首发</span>
          <span style="margin-left: auto; font-size: 18px; color: #999; cursor: pointer" @click="showNew = false">✕</span>
        </div>
        <div style="padding: 0 16px 10px; font-size: 12px; color: #8e8e93">全网独家首发，抢先阅读，点击封面加入书架</div>
        <div style="flex: 1; overflow-y: auto; padding: 0 14px 16px">
          <div v-for="book in newBooks" :key="book.title" class="sheet-book">
            <img :src="book.image" :alt="book.title" :style="{ background: book.color }" @click="guard(() => addToShelf(book))" />
            <div style="flex: 1; min-width: 0; padding-left: 12px">
              <div style="font-size: 15px; font-weight: 700">{{ book.title }}</div>
              <div class="ellipsis" style="font-size: 12px; color: #6b6b70; margin-top: 4px">{{ book.desc }}</div>
              <div style="margin-top: 6px"><span class="chip" style="background: #fff3ee; color: #ff5e2a">首发</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 话题讨论 -->
    <div v-if="showTopic && selectedTopic" class="sheet-mask" @click.self="closeTopic">
      <div class="sheet" style="height: 60%">
        <div style="padding: 16px 16px 6px; display: flex; align-items: center">
          <span class="ellipsis" style="font-size: 16px; font-weight: 700; flex: 1">{{ selectedTopic.title }}</span>
          <span style="font-size: 18px; color: #999; cursor: pointer" @click="closeTopic">✕</span>
        </div>
        <div style="padding: 0 16px 10px; font-size: 12px; color: #ff5e2a">🔥 {{ selectedTopic.hot }}</div>
        <div style="flex: 1; overflow-y: auto">
          <div v-for="(post, i) in topicPosts" :key="i" class="post">
            <span style="font-size: 22px">{{ post.avatar }}</span>
            <div style="flex: 1; min-width: 0; padding-left: 10px">
              <div style="display: flex; align-items: center">
                <span style="font-size: 13px; font-weight: 700">{{ post.user }}</span>
                <span style="margin-left: auto; font-size: 11px; color: #8e8e93">👍 {{ post.likes }}</span>
              </div>
              <div style="font-size: 14px; color: #4a4a4a; margin-top: 5px">{{ post.content }}</div>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; padding: 10px 16px 18px">
          <input v-model="commentText" class="topic-input" placeholder="说说你的看法…" @keyup.enter="submitComment" />
          <button class="btn-primary" style="height: 38px; margin-left: 10px" @click="submitComment">发送</button>
        </div>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.section {
  background: #fff;
  border-bottom: 8px solid #f2f4f8;
}
.section-head {
  display: flex;
  align-items: center;
  padding: 16px 18px 10px;
}
.section-head__title {
  font-size: 17px;
  font-weight: 700;
}
.section-head__more {
  margin-left: auto;
  font-size: 13px;
  color: #8e8e93;
  cursor: pointer;
}
.act-card {
  flex: 0 0 200px;
  height: 88px;
  border-radius: 14px;
  padding: 12px 16px;
  color: #fff;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.topic-chip {
  flex: 0 0 150px;
  height: 84px;
  background: #f7f8fb;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
}
.topic-chip__no {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.topic-chip__title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-top: 8px;
  line-height: 1.4;
}
.cover-card {
  flex: 0 0 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.cover-card img {
  width: 84px;
  height: 112px;
  border-radius: 10px;
  object-fit: cover;
}
.cover-card__title {
  font-size: 12px;
  color: #3d3d3d;
  margin-top: 6px;
  width: 84px;
  text-align: center;
}
.cover-card__sub {
  font-size: 10px;
  color: #8e8e93;
  width: 84px;
  text-align: center;
}
.hot-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 22px;
  height: 22px;
  border-radius: 11px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bl-row {
  padding: 12px 14px;
  background: #f7f8fb;
  border-radius: 12px;
  margin-bottom: 10px;
}
.sheet-book {
  display: flex;
  padding: 10px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
}
.sheet-book img {
  width: 56px;
  height: 74px;
  border-radius: 8px;
  object-fit: cover;
  flex: 0 0 56px;
  cursor: pointer;
}
.checkin-dot {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
}
.post {
  display: flex;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f2f5;
}
.topic-input {
  flex: 1;
  height: 38px;
  border: none;
  outline: none;
  background: #f4f6fa;
  border-radius: 20px;
  padding: 0 16px;
  font-size: 14px;
}
</style>
