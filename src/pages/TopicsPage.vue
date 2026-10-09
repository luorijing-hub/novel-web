<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { POSTS_MAP, TOPICS, type TopicItem, type TopicPost } from '@/data/topics'
import { useGuard } from '@/composables/useGuard'

const router = useRouter()
const { showTip, tipText, showTipMessage } = useGuard()

const topics = TOPICS
const showDialog = ref(false)
const selectedTopic = ref<TopicItem | null>(null)
const topicPosts = ref<TopicPost[]>([])
const commentText = ref('')

function openTopic(topic: TopicItem) {
  selectedTopic.value = topic
  topicPosts.value = [...(POSTS_MAP[String(topic.id)] ?? [])]
  commentText.value = ''
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
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
  const topicId = selectedTopic.value?.id
  if (topicId) api.submitComment(topicId, content).catch((err) => console.info('评论同步后端失败', err))
}
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">热门话题</span>
    </div>

    <div class="page-body hide-scrollbar" style="padding: 12px 14px 16px">
      <div style="font-size: 14px; color: #666; padding: 0 4px 10px">共 {{ topics.length }} 个热门话题 · 点击参与讨论</div>

      <div v-for="(topic, index) in topics" :key="topic.id" class="topic-card" @click="openTopic(topic)">
        <div class="topic-card__no" :style="{ background: index < 3 ? topic.color : '#c0c4cc' }">{{ index + 1 }}</div>
        <div style="flex: 1; min-width: 0">
          <div class="topic-card__title ellipsis">{{ topic.title }}</div>
          <div class="topic-card__hot">🔥 {{ topic.hot }}</div>
        </div>
        <span style="font-size: 20px; color: #ccc">›</span>
      </div>
    </div>

    <div v-if="showDialog && selectedTopic" class="sheet-mask" @click.self="closeDialog">
      <div class="sheet" style="height: 62%">
        <div style="padding: 16px 16px 6px; display: flex; align-items: center">
          <span class="ellipsis" style="font-size: 16px; font-weight: 700; flex: 1">{{ selectedTopic.title }}</span>
          <span style="font-size: 18px; color: #999; cursor: pointer" @click="closeDialog">✕</span>
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
.topic-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
}
.topic-card__no {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 12px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.topic-card__title {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}
.topic-card__hot {
  font-size: 12px;
  color: #8e8e93;
  margin-top: 4px;
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
