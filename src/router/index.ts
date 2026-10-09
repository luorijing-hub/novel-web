import { createRouter, createWebHashHistory } from 'vue-router'

// 页面路由（对应鸿蒙工程 main_pages.json 的 15 个页面）
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
    { path: '/category', name: 'category', component: () => import('@/pages/CategoryPage.vue') },
    { path: '/ranking', name: 'ranking', component: () => import('@/pages/RankingPage.vue') },
    { path: '/booklists', name: 'booklists', component: () => import('@/pages/BooklistPage.vue') },
    { path: '/discover', name: 'discover', component: () => import('@/pages/DiscoverPage.vue') },
    { path: '/new-books', name: 'newBooks', component: () => import('@/pages/NewBooksPage.vue') },
    { path: '/topics', name: 'topics', component: () => import('@/pages/TopicsPage.vue') },
    { path: '/hot-books', name: 'hotBooks', component: () => import('@/pages/HotBooksPage.vue') },
    { path: '/bookshelf', name: 'bookshelf', component: () => import('@/pages/BookshelfPage.vue') },
    { path: '/login', name: 'login', component: () => import('@/pages/LoginPage.vue') },
    { path: '/profile', name: 'profile', component: () => import('@/pages/ProfilePage.vue') },
    { path: '/favorites', name: 'favorites', component: () => import('@/pages/FavoritesPage.vue') },
    { path: '/messages', name: 'messages', component: () => import('@/pages/MessagePage.vue') },
    { path: '/comment', name: 'comment', component: () => import('@/pages/CommentPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

export default router
