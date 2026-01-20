import { createApp } from 'vue'
import App from './App.vue'
import plugins from './plugins'
import './app.less'
// 抽离pop.css 避免引入多份重复样式
// TODO: 公共弹窗头部样式错乱 需重构
import './pop.css'

const app = createApp(App)

plugins.forEach(plugin => {
  app.use(plugin)
})

app.mount('#app')
