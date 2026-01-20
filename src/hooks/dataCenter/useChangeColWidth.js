const MIN_COL_WIDTH = 30

// 拖拽更改表格列宽
export default function (tableRef) {
  const startDrag = ref(false)
  const colIndex = ref(-1)
  const dragStartPos = ref(-1)

  onMounted(() => {
    window.addEventListener('mousedown', mousedownFn)
    window.addEventListener('mousemove', moveHandle)
    window.addEventListener('mouseup', mouseupFn)
  })

  onUnmounted(() => {
    window.removeEventListener('mousedown', mousedownFn)
    window.removeEventListener('mousemove', moveHandle)
    window.removeEventListener('mouseup', mouseupFn)
  })

  // 开始拖拽
  const mousedownFn = e => {
    let isResizer = e.target.classList?.contains('resizer')
    if (!isResizer || e.target.closest('table') !== tableRef.value) return
    // console.log('down')

    // 更改鼠标样式
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'

    // 记录拖拽起始位置
    dragStartPos.value = e.clientX
    colIndex.value = e.target.closest('th').cellIndex
    startDrag.value = true
  }

  // 拖拽中
  const moveHandle = e => {
    if (!startDrag.value) return
    // console.log('move')

    let dragLineElm = document.querySelector('.dragLine')

    // 生成拖拽辅助线
    if (!dragLineElm) {
      dragLineElm = document.createElement('div')
      dragLineElm.classList.add('dragLine')
      document.body.appendChild(dragLineElm)
    }

    let tableWrap = tableRef.value.parentElement
    let tablePosInfo = tableRef.value.querySelector('thead')?.getBoundingClientRect()

    if (getColWidth(e) <= MIN_COL_WIDTH) return

    // 更改辅助线位置
    dragLineElm.style.height = Math.min(tableRef.value.clientHeight, tableWrap.clientHeight) + 'px'
    dragLineElm.style.top = tablePosInfo?.top + 'px'
    dragLineElm.style.left = e.clientX + 'px'
  }

  // 结束拖拽
  const mouseupFn = e => {
    if (!startDrag.value) return
    // console.log('up')

    startDrag.value = false
    let dragLineElm = document.querySelector('.dragLine')
    dragLineElm && dragLineElm.remove()
    document.body.style.cursor = 'unset'
    document.body.style.userSelect = 'unset'

    // 设置列宽
    let targetColElm = tableRef.value.querySelectorAll('col')[colIndex.value]
    let colWidth = getColWidth(e)
    colWidth = colWidth < MIN_COL_WIDTH ? MIN_COL_WIDTH : colWidth
    targetColElm.width = colWidth
  }

  const getColWidth = e => {
    let targetCellElm = tableRef.value.querySelectorAll('th')[colIndex.value]
    let colWidth = targetCellElm.clientWidth + e.clientX - dragStartPos.value
    return colWidth
  }
}
