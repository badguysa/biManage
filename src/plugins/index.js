// antd
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

// pinia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// highlightjs
import hljs from 'highlight.js'
import hljsVuePlugin from '@highlightjs/vue-plugin'

// markdown
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/style/preview.css'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import 'highlight.js/styles/github.css'
import 'highlight.js/lib/common'

// i18n
import i18n from '@/locale'

import component from './component'

import router from '../router'


// 加载svg资源
const requireContext = require.context('../assets/svg', false, /\.svg$/)
requireContext.keys().forEach(requireContext)


const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

VMdPreview.use(githubTheme, {
  Hljs: hljs
})

export default [
  Antd,
  pinia,
  component,
  hljsVuePlugin,
  i18n,
  router,
  VMdPreview,
]


