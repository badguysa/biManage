import components from '@/ui'

// 全局组件注册
export default {
  install: app => {
    components.forEach(({ name, component }) => {
      app.component(name, component)
    })
  }
}
