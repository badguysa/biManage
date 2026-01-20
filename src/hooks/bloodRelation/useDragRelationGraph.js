// 血缘关系图 拖拽hook
export function useDragRelation(wrapRef, dragRef) {
  const dragInfo = reactive({ 
    selected: false,
    startX: 0,
    startY: 0, 
  })

  onMounted(() => {
    let wrapElm = wrapRef.value
    if(!wrapElm) return
    wrapElm.addEventListener('mouseup', onMouseUp)
    wrapElm.addEventListener('mousedown', onMouseDown)
    wrapElm.addEventListener('mousemove', onDrag)
  })

  onUnmounted(() => {
    let wrapElm = wrapRef.value
    if(!wrapElm) return
    wrapElm.removeEventListener('mouseup', onMouseUp)
    wrapElm.removeEventListener('mousedown', onMouseDown)
    wrapElm.removeEventListener('mousemove', onDrag)
  })

  const onMouseDown = e => {
    dragInfo.startX = e.x
    dragInfo.startY = e.y
    dragInfo.selected = true
  }

  const onMouseUp = () => {
    dragInfo.selected = false
  }

  // 选中关系图开启拖拽
  const onDrag = e => {
    let { startX, startY, selected } = dragInfo
    let dragElm = dragRef.value

    if(!selected) return

    // 更新起始位置
    dragInfo.startX = e.x
    dragInfo.startY = e.y

    let preLeft = parseFloat(getComputedStyle(dragElm).left)
    let preTop = parseFloat(getComputedStyle(dragElm).top)
    let x = e.x - startX
    let y = e.y - startY

    dragElm.style.left = preLeft + x + 'px'
    dragElm.style.top = preTop + y + 'px'
  }

  const dragging = computed(() => dragInfo.selected)

  return {
    dragInfo,
    dragging,
  }
}
