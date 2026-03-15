import { createRouter, createWebHistory } from 'vue-router'
import Editor from '../views/Editor.vue'
import Preview from '../views/Preview.vue'
import Market from '../views/Market.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/',
    name: 'Preview',
    component: Preview
  },
  {
    path: '/editor',
    name: 'Editor',
    component: Editor
  },
  {
    path: '/market',
    name: 'Market',
    component: Market
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 只有编辑、保存和上传组件需要登录
  if ((to.path === '/editor' || to.path === '/page/save' || to.path === '/component/upload') && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router