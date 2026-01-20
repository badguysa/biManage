import { getCookie } from '@/utils/utils';

// 语言初始化
export default function () {
  onMounted(() => {
    const { locale } = useI18n()
    const biLang = localStorage.getItem('bi_lang')

    if (!biLang) {
      locale.value = 'zh-CN'
      localStorage.setItem('biLocale', 'zh-CN')
      return
    }

    const langArr = JSON.parse(biLang)
    const currentLang = langArr.find(item => item.fid == getCookie('fid'))

    if (currentLang) {
      locale.value = currentLang.locale
      localStorage.setItem('biLocale', currentLang.locale)
    } else {
      locale.value = 'zh-CN'
      localStorage.setItem('biLocale', 'zh-CN')
    }
  })
}
