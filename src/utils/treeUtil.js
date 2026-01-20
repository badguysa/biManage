// 点击节点展开分组
export async function nodeClickHandle(clickParams, loadFn, eStop=true) {
  let {state, dataRef, e} = clickParams
  let nodeId = dataRef.id
  if (state.expandedKeys.includes(nodeId)) {
    state.expandedKeys = state.expandedKeys.filter(it => it !== nodeId)
    return
  } else {
    state.expandedKeys.push(nodeId)
  }
  let treeData = state.treeData
  let rootIndex = treeData.findIndex(item => item.id === nodeId)
  if (rootIndex > -1) {
    // 一级分组
    let targetNode = state.treeData[rootIndex]
    // 判断分组下是否含有表 => 只查询首次
    let includeTable = targetNode.children?.some(it => it.storageType)
    if (targetNode.children?.length && !includeTable) {
      // 含有二级分组 手动查询数据
      await loadFn({ key: targetNode.id }, 1, targetNode.pageNum, targetNode)
    }
  }
  if(eStop){
    e.stopPropagation()
  }
}


// 标准树点击节点展开分组--标准树存在三级分组，且includeTable判断条件不同
export async function nodeClickHandleStandard(clickParams, loadFn, eStop=true) {
  let {state, dataRef, e} = clickParams
  let nodeId = dataRef.id
  if (state.expandedKeys.includes(nodeId)) {
    state.expandedKeys = state.expandedKeys.filter(it => it !== nodeId)
    return
  } else {
    state.expandedKeys.push(nodeId)
  }
  let treeData = state.treeData
  let rootIndex = treeData.findIndex(item => item.id === nodeId)
  if (rootIndex > -1) {
    // 一级分组
    let targetNode = state.treeData[rootIndex]
    // 判断分组下是否含有表 => 只查询首次
    let includeTable = targetNode.children?.some(it => it.storageType)
    if (targetNode.children?.length && !includeTable) {
      // 含有二级分组 手动查询数据
      await loadFn({ key: targetNode.id }, 1, targetNode.pageNum, targetNode)
    }
  //以上内容和之前的nodeClickHandle一样，没有发现问题，暂时没有做特别处理
  }else{
    let {xpath} = dataRef
    let parentXpath = xpath.split('/')
    let targetNode = state.treeData
    for(let i = 1 ; i < parentXpath.length; i++){
      if(i==1){
        let index = targetNode.findIndex(it => it.id === parentXpath[i])
        if(index > -1){
          targetNode = targetNode[index]
        }
      }else if(i>1&&i<targetNode.children){
        let index = targetNode.children.findIndex(it => it.id === parentXpath[i])
        if(index > -1){
          targetNode = targetNode.children[index]
        }
      }
    }
    if(!targetNode.children){
      targetNode = targetNode.find(item => item.id === nodeId)
    }else{
      targetNode = targetNode.children.find(item => item.id === nodeId)
    }
    // 判断分组下是否含有叶子结点 => 只查询首次
    let includeTable = targetNode?.children?.some(it => it.isLeaf)
    if (targetNode?.children && !includeTable) {
      //手动查询数据
      await loadFn({ key: targetNode.id }, 1, targetNode.pageNum, targetNode)
    }    
  }
  if(eStop){
    e.stopPropagation()
  }
}
