import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/home', component: Home },
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login }
  ]
})

//  挂载路由导航收尾
router.beforeEach((to, from, next) => {
  /* to:将要访问的路径
  from: 代表从哪个路径来
  next: 是一个函数，表示放行 next():直接放行  next('/login') 强制跳转
  */
  if (to.path === '/login') {
    next()
  }
  const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) {
    next('/login')
  }
  next()
})
export default router
