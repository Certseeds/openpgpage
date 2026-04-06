import { createRouter, createWebHashHistory } from 'vue-router'
import App from '@/components/linktokey.vue'
import Wkd from '@/components/wkd.vue'

const routes = [
  { path: '/', component: App },
  { path: '/wkd/', component: Wkd },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router;
