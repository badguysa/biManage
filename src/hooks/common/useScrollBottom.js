import { throttle } from 'loadsh'
import { onMounted, onUnmounted } from 'vue'

/**
 * selector: 滚动元素选择器
 * fn: 触底回调
 */
export default (selector, fn) => {
  let scrollElm = null
  onMounted(() => {
    scrollElm = document.querySelector(selector)
    if (!scrollElm) return
    scrollElm.addEventListener('scroll', scrollHandle)
  })

  onUnmounted(() => {
    if (!scrollElm) return
    scrollElm.removeEventListener('scroll', scrollHandle)
  })

  const scrollHandle = throttle(() => {
    let { clientHeight, scrollHeight, scrollTop } = scrollElm
    // 滚动触底
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      fn(() => {
        scrollElm.removeEventListener('scroll', scrollHandle)
      })
    }
  }, 600)
}
