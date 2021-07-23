import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
/* 导入全局样式表 */
import './assets/css/global.css'
import './assets/css/font.css'

import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 这样每个vue组件都可以直接通过this发起http请求
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
