import { reactive } from 'vue'
import { createI18n } from 'vue-i18n'
import zhCN from './lang/zh-cn'
import laoLang from './lang/lo'

const I18N_MESSAGES =  reactive({
    'zh-CN': zhCN,
    'lo': laoLang
})
const language = navigator.language || 'zh-CN'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('biLocale') || language,
    fallbackLocale: 'zh-CN', // 设置备用语言
    messages: I18N_MESSAGES,
})

export default i18n