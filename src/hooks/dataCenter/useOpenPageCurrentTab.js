// 当前tab页打开目标页面
export default function () {
  const useMainStore = mainStore()
  const { indexTableDesc, activeTabKey } = storeToRefs(useMainStore)

  return function (pageId) {
    useMainStore.changeTabsList(null, 'addInfo', activeTabKey.value, {
      type: pageId,
      // 首页选中表信息
      indexTableDesc: {
        ...indexTableDesc.value,
      },
    })
    useMainStore.setPageId(pageId)
  }
}
