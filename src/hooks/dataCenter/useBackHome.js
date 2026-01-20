// 返回到首页
export default function () {
  const useMainStore = mainStore()
  const { activeTabKey } = storeToRefs(useMainStore)
  
  return function () {
    // 重置tab信息
    useMainStore.changeTabsList(null, 'reset', activeTabKey.value)
    // 获取当前分组表信息
    useMainStore.selectTabs(useMainStore.currentTab)
    // 显示首页
    useMainStore.setPageId('pageTable')
  }
}
