const MIN_SCALE_RATIO = 4
const MAX_SCALE_RATIO = 18

// 血缘关系图缩放hook
export function useScaleRelation(wrapRef, scaleRef) {
  const scaleRatio = ref(10)
  const scalStatus = ref('')

  onMounted(() => {
    document.addEventListener('mousedown', onMouseDown)
    wrapRef.value && wrapRef.value.addEventListener('wheel', onWheel)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', onMouseDown)
    wrapRef.value && wrapRef.value.removeEventListener('wheel', onWheel)
  })

  const onMouseDown = () => {
    scalStatus.value = ''
  }

  const onWheel = e => {
    let elm = scaleRef.value

    if (!elm) return

    let ratio = scaleRatio.value
    let offset = e.deltaY < 0 ? 1 : -1

    if (e.deltaY < 0) { // 放大
      offset = 1
      scalStatus.value = 'zoomIn'
    } else {  // 缩小
      offset = -1
      scalStatus.value = 'zoomOut'
    }

    if (
      (offset < 0 && ratio > MIN_SCALE_RATIO) || // 缩小倍率大于最小值
      (offset > 0 && ratio < MAX_SCALE_RATIO) // 放大倍率小于最大值
    ) {
      scaleRatio.value += offset
      elm.style.transform = `scale(${scaleRatio.value / 10})`
    }
  }

  return {
    scalStatus,
  }
}
