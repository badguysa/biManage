<template>
  <!-- 来源节点 -->
  <div class="sourceWrapper" v-if="relationType != 'target'">
    <div class="nodeWrapper">
      <div 
        v-for="s in relationInfo.sourceRelations"
        class="nodeItem"
        ref="sourceNodeRef"
        :id="s.id"
        :data-node-num="s.sourceDataNum"
      >
        <RelationNode :node-info="s" node-type="source"></RelationNode>
      </div>
    </div>
    <div class="numWrapper">
      <template v-for="s in relationInfo.sourceRelations">
        <div
          v-if="!s.expand && s.sourceDataNum > 0"
          ref="sourceNumRef"
          class="numItem sourceNumItem"
          @click="showMore(s, 'source')"
          :id="`${s.id}_NODE_NUM`"
        >
          <span class="num">{{ s.sourceDataNum }}</span>
        </div>
        <RelationGraph
          v-if="s.sourceDataNum > 0 && s.expand && s.loaded"
          :relation-info="s"
          relation-type="source"
          :aim-ref="referenceRef"
        />
      </template>
    </div>
  </div>

  <!-- 当前节点 -->
  <div
    v-if="relationType === 'root'"
    class="nodeItem rootNode"
    ref="rootNodeRef"
    :id="relationInfo.id"
    :style="`--ow: ${0 - rootNodeWidth / 2}px;`"
  >
    <RelationNode :node-info="relationInfo" node-type="root"></RelationNode>
  </div>

  <!-- 目标节点 -->
  <div class="targetWrapper" v-if="relationType != 'source'">
    <div class="nodeWrapper">
      <div 
        v-for="t in relationInfo.targetRelations"
        class="nodeItem"
        ref="targetNodeRef"
        :id="t.id"
        :data-node-num="t.targetDataNum"
      >
        <RelationNode :node-info="t" node-type="target"></RelationNode>
      </div>
    </div>
    <div class="numWrapper">
      <template v-for="t in relationInfo.targetRelations">
        <div
          v-if="!t.expand && t.targetDataNum > 0"
          ref="targetNumRef"
          class="numItem targetNumItem"
          @click.stop="showMore(t, 'target')"
          :id="`${t.id}_NODE_NUM`"
        >
          <span class="num">{{ t.targetDataNum }}</span>
        </div>
        <RelationGraph
          v-if="t.targetDataNum > 0 && t.expand && t.loaded"
          :relation-info="t"
          relation-type="target"
          :aim-ref="referenceRef"
        />
      </template>
    </div>
  </div>

  <!-- 折叠图标 -->
  <!-- <BiIcon
    v-if="relationType === 'root'"
    v-show="relationGraphInfo.showFoldIcon"
    ref="foldIconRef"
    class="fold_icon" 
    name="foldIcon"
    @click="clickFoldHandle"
    @mouseenter="enterFlodHandle"
    @mouseleave="leaveFoldHandle"
  /> -->
</template>

<script setup>
import { jsPlumb } from 'jsplumb'
import RelationNode from './relationNode.vue'
import RelationGraph from './relationGraph.vue'
import { getBloodRelation } from '@/apis/bloodRelation'
import { v4 as uuidv4 } from 'uuid'
import { nextTick } from 'vue'

const props = defineProps({
  // 节点信息
  relationInfo: {
    type: Object,
    required: true,
  },
  // 节点类型 root/source/target
  relationType: {
    type: String,
    default: 'root',
  },
  // 参考节点 递归调用
  aimRef: {
    type: Object,
  },
})

const referenceRef = shallowRef(null)
const rootNodeRef = shallowRef(null)
const sourceNodeRef = shallowRef(null)
const targetNodeRef = shallowRef(null)
const targetNumRef = shallowRef(null)
const sourceNumRef = shallowRef(null)
const foldIconRef = shallowRef(null)

const relationGraphInfo = inject('RELATION_GRAPH_INFO')

// 定义默认配置
const defaultConfig = {
  anchor: ['Left', 'Right'],
  connector: ['Flowchart'],
  endpoint: 'Blank',
  paintStyle: { stroke: '#999', strokeWidth: 1 }
}

const relationInfo = computed(() => {
  return props.relationInfo
})

onMounted(async () => {
  await nextTick()
  rootRelationInit()
  updateNodePos()
  renderRelationLine()
  nodePosCorrect()

  graphInstance.value.cleanupListeners()
  graphInstance.value.bind('mouseover', overConnectionHandle)
  graphInstance.value.bind('mouseout', outConnectionHandle)
})

onUnmounted(() => {
  // graphInstance.value.destroy()
  // graphInstance.value.reset()
})

// 关系图实例
const graphInstance = computed({
  get: () => relationGraphInfo.relationInstance,
  set: (instance) => {
    relationGraphInfo.relationInstance = instance
  }
})

// 根节点
const rootNode = computed({
  get: () => relationGraphInfo.relationRootNode,
  set: (elm) => {
    relationGraphInfo.relationRootNode = elm
  }
})

const rootNodeWidth = computed(() => {
  return rootNodeRef.value?.clientWidth
})

const rootNodeTargetRelations = computed(() => {
  return graphInstance.value.getConnections({
    source: rootNode.value.id,
  })
})

const rootNodeSourceRelations = computed(() => {
  return graphInstance.value.getConnections({
    target: rootNode.value.id,
  })
})

const rootRelationInit = () => {
  if (props.relationType !== 'root')  return
  graphInstance.value = jsPlumb.getInstance()
  rootNode.value = rootNodeRef.value
  relationGraphInfo.foldIcon = foldIconRef.value?.$el

  window.plumbIns = graphInstance.value
}

const overConnectionHandle = (conn) => {
  let { source, target, canvas } = conn
  let { left, top } = getComputedStyle(source)
  let foldIcon = relationGraphInfo.foldIcon

  // 根节点/数值节点 不显示折叠图标 
  let hideFoldIcon = [source, target].some(it => 
    it.classList.contains('rootNode') ||
    it.classList.contains('numItem')
  )
 
  if(hideFoldIcon) return

  // 折叠图标上下偏移量
  let xOffset = source.clientWidth + canvas.clientWidth / 2 - 9,
      yOffset = source.clientHeight / 2 - 7

  // 移入左侧目标节点
  if(+source.dataset.nodeNum < +target.dataset.nodeNum) {
    top = getComputedStyle(target).top
    relationGraphInfo.foldRefElm = target
    relationGraphInfo.isFoldLeftElm = true
  } else {
    relationGraphInfo.foldRefElm = source
    relationGraphInfo.isFoldLeftElm = false
  }
  
  foldIcon.style.left = parseFloat(left) + xOffset + 'px'
  foldIcon.style.top = parseFloat(top) + yOffset + 'px'

  if(!relationGraphInfo.showFoldIcon) {
    relationGraphInfo.showFoldIcon = true
  }
}

const outConnectionHandle = () => {
  setTimeout(() => {
    if(relationGraphInfo.cancelShowFoldIcon) return
    relationGraphInfo.showFoldIcon = false
  }, 1500)
}

const enterFlodHandle = () => {
  relationGraphInfo.cancelShowFoldIcon = true
}

const leaveFoldHandle = () => {
  relationGraphInfo.showFoldIcon = false
  relationGraphInfo.cancelShowFoldIcon = false
}

const clickFoldHandle = async () => {
  let plumbIns = graphInstance.value
  let aimElmId = relationGraphInfo.foldRefElm.id
  let isFoldLeft = relationGraphInfo.isFoldLeftElm
  
  relationGraphInfo.showFoldIcon = false
  _removeNode(relationGraphInfo.foldRefElm)

  await _showNumNode(aimElmId)

  let allConnections = plumbIns.getConnections();
  // 保存连接信息到一个数组中
  let savedConnections = [];
  allConnections.forEach(function(conn) {
      savedConnections.push({
          sourceId: conn.sourceId,
          targetId: conn.targetId,
      });
  });
  if(isFoldLeft){
    savedConnections.unshift({
      sourceId: aimElmId + '_NODE_NUM',
      targetId: aimElmId
    })
  } else {
    savedConnections.push({
      sourceId: aimElmId,
      targetId: aimElmId + '_NODE_NUM'
    })
  }
  // 删除所有连接
  plumbIns.deleteEveryConnection();
  console.log(savedConnections,"savedConnections");
  // 重新创建连接
  jsPlumb.ready(async() => {
    setAllNumPos()
    await nextTick()
    savedConnections.forEach((connection)=> {
      plumbIns.connect({
          source: connection.sourceId,
          target: connection.targetId,
      }, defaultConfig);
    })
  })
  
  // 移除节点
  function _removeNode(node) {
    let connections = []

    if(isFoldLeft) {
      connections = plumbIns.getConnections({
        target: node.id
      })
    } else {
      connections = plumbIns.getConnections({
        source: node.id
      })
    }
    if(connections.length > 0){
      connections.forEach(it => {
        if(isFoldLeft)  {
          _removeNode(it.source)
        } else {
          _removeNode(it.target)
        }
      })
    } else {
      plumbIns.remove(node)
      plumbIns.deleteConnectionsForElement(node);
    }
  }
  
  // 显示数值节点
  function _showNumNode(aimElmId) {
    let relation = _searchRelation(relationInfo.value, aimElmId)

    if(relation) {
      relation.expand = false
      relation.loaded = false
    }

    function _searchRelation(relationInfo, aimElmId) {
      let tempRelations = relationInfo.targetRelations
      if(isFoldLeft) {
        tempRelations = relationInfo.sourceRelations
      }
      for(let i = 0; i < tempRelations?.length; i++) {
        let tempR = tempRelations[i]
        if(tempR.id === aimElmId) {
          return tempR
        }
        let targetNumNode = _searchRelation(tempR, aimElmId)
        if(targetNumNode) {
          return targetNumNode
        }
      }
    }
  }
}
// 所有数字节点的位置重新计算
function setAllNumPos(){
  const numNodes = [...document.getElementsByClassName('numItem')];
  numNodes.forEach(node => {
    let elmId = node.id.slice(0,-9);
    _setNumPos(elmId, node.classList.contains('sourceNumItem'));
  });

  function _setNumPos(elmId, isFoldLeft) {
    const currentNode = document.getElementById(elmId);
    if (!currentNode) return;
    const numElm = document.getElementById(`${elmId}_NODE_NUM`);
    if (!numElm) return;
    const { offsetLeft: elmLeft, offsetTop: elmTop, clientWidth: elmWidth } = currentNode;
    const leftPosition = isFoldLeft 
      ? elmLeft - (numElm.clientWidth + 60) 
      : elmLeft + (elmWidth + 60);
    
    Object.assign(numElm.style, {
      left: `${leftPosition}px`,
      top: `${elmTop}px`
    });
  }
}


const renderRelationLine = () => {
  let infoV = relationInfo.value
  let plumbIns = graphInstance.value
  let relationType = props.relationType

  let connections = []

  // 删除当前节点连线
  if (relationType === 'target') {
    connections = plumbIns.getConnections({
      source: infoV.id,
    })
  } else if (relationType === 'source') {
    connections = plumbIns.getConnections({
      target: infoV.id,
    })
  }
  connections.forEach(it => plumbIns.deleteConnection(it))

  plumbIns.ready(function () {
    // 渲染source
    relationType !== 'target' &&
      infoV.sourceRelations &&
      infoV.sourceRelations.forEach(it => {
        plumbIns.connect(
          {
            source: it.id,
            target: infoV.id,
          },
          defaultConfig
        )
        if (it.sourceDataNum > 0 && !it.expand) {
          plumbIns.connect(
            {
              source: `${it.id}_NODE_NUM`,
              target: it.id,
            },
            defaultConfig
          )
        }
      })

    // 渲染target
    relationType !== 'source' &&
      infoV.targetRelations &&
      infoV.targetRelations.forEach(it => {
        plumbIns.connect(
          {
            source: infoV.id,
            target: it.id,
          },
          defaultConfig
        )
        if (it.targetDataNum > 0 && !it.expand) {
          plumbIns.connect(
            {
              source: it.id,
              target: `${it.id}_NODE_NUM`,
            },
            defaultConfig
          )
        }
      })
  })
}

// 设置节点位置
const updateNodePos = () => {
  let relationType = props.relationType
  if (relationType === 'target') {
    updateNodePosByAim(props.aimRef)
  }
  if (relationType === 'source') {
    updateNodePosByAim(props.aimRef)
  }
  if (relationType === 'root') {
    updateNodePosByAim(rootNodeRef.value)
  }
}

const updateNodePosByAim = referenceElm => {
  if (!referenceElm) return
  let elmWidth = referenceElm.clientWidth
  let elmTop = referenceElm.offsetTop
  let elmLeft = referenceElm.offsetLeft

  props.relationType !== 'target' &&
    sourceNodeRef.value &&
    sourceNodeRef.value.forEach((it, i, arr) => {
      let cw = it.clientWidth
      let midNum = Math.floor(arr.length / 2)
      let topDistance = null

      // 偶数个
      if (arr.length % 2 === 0) {
        topDistance = elmTop + (i - midNum) * 60 + 30 + 'px'
      } else {
        // 奇数个
        topDistance = elmTop + (i - midNum) * 60 + 'px'
      }

      it.style.top = topDistance
      it.style.left = elmLeft - (cw + 60) + 'px'

      if (sourceNumRef.value) {
        // 设置数值节点位置
        let numElm = sourceNumRef.value.find(i => i.id.includes(it.id))
        if (numElm) {
          numElm.style.left = elmLeft - (cw + 60) - 60 - numElm.clientWidth + 'px'
          numElm.style.top = topDistance
        }
      }
    })

  props.relationType !== 'source' &&
    targetNodeRef.value &&
    targetNodeRef.value.forEach((it, i, arr) => {
      let midNum = Math.floor(arr.length / 2)
      let topDistance = null

      // 偶数个
      if (arr.length % 2 === 0) {
        topDistance = elmTop + (i - midNum) * 60 + 30 + 'px'
      } else {
        // 奇数个
        topDistance = elmTop + (i - midNum) * 60 + 'px'
      }

      it.style.top = topDistance
      it.style.left = elmLeft + (elmWidth + 60) + 'px'

      if (targetNumRef.value) {
        // 设置数值节点位置
        let numElm = targetNumRef.value.find(i => i.id.includes(it.id))
        if (numElm) {
          numElm.style.left = elmLeft + (elmWidth + 60) + it.clientWidth + 60 + 'px'
          numElm.style.top = topDistance
        }
      }
    })
}

// 更改上方节点结构 递归更改下方节点位置
const updateChildNodePos = (elm, value, type) => {
  let connections = []
  if (type === 'target') {
    connections = graphInstance.value.getConnections({
      source: elm,
    })
  } else if (type === 'source') {
    connections = graphInstance.value.getConnections({
      target: elm,
    })
  }

  // 无关联节点
  if (connections.length === 0) return

  connections.forEach(item => {
    if (type === 'target') {
      item.target.style.top = parseFloat(item.target.style.top) + value + 'px'
      updateChildNodePos(item.target, value, type)
    } else if (type === 'source') {
      item.source.style.top = parseFloat(item.source.style.top) + value + 'px'
      updateChildNodePos(item.source, value, type)
    }
  })
}

const showMore = async (it, type) => {
  it.expand = true
  let relationRes = null,
    tableId = ''
  // 重置所有数字节点连线
  setAllNumPos()
  if (type === 'target') {
    referenceRef.value = targetNodeRef.value.find(i => i.id === it.id)
    tableId = it.target?.id
    plumbIns.deleteConnectionsForElement(it.target);
  } else if (type === 'source') {
    referenceRef.value = sourceNodeRef.value.find(i => i.id === it.id)
    tableId = it.source?.id
    plumbIns.deleteConnectionsForElement(it.source);
  }

  relationRes = await getBloodRelation(tableId, 0)

  if (relationRes.code === 1) {
    it.sourceRelations = relationRes.data.sourceRelations.map(item => {
      item.id = item.id ? item.id : uuidv4()
      return item
    }).filter(fit => fit.source)
    it.targetRelations = relationRes.data.targetRelations.map(item => {
      item.id = item.id ? item.id : uuidv4()
      return item
    }).filter(fit => fit.target)
    // 子节点数据加载完毕
    it.loaded = true
  }
}

// 获取子节点 source target 元素
const getTargetSourceElm = type => {
  let plumbIns = graphInstance.value
  let sourceElm = null
  let targetElm = null
  let connections = []

  if (type === 'target') {
    targetElm = targetNodeRef.value[0]
    connections = plumbIns.getConnections({
      target: targetElm.id,
    })
    sourceElm = connections[0].source
  } else if (type === 'source') {
    sourceElm = sourceNodeRef.value[0]
    connections = plumbIns.getConnections({
      source: sourceElm.id,
    })
    targetElm = connections[0].target
  }

  return {
    sourceElm,
    targetElm,
  }
}

// 元素y轴方向距离
const getDisantceY = (elm1, elm2) => {
  let top1 = parseFloat(elm1.style.top)
  let top2 = parseFloat(elm2.style.top)
  return Math.abs(top1 - top2)
}

// 是否改变top值
const whetherChangePos = (elm, type) => {
  let plumbIns = graphInstance.value
  let connections = []
  let tempNode = null
  let nodeArr = []

  if (type === 'target') {
    tempNode = rootNodeTargetRelations.value[0]?.target
    if(tempNode) {
      nodeArr.push(tempNode)
    } else {
      return
    }
    do {
      connections = plumbIns.getConnections({
        source: tempNode,
      })
      if (connections[0]) {
        nodeArr.push(connections[0].target)
        tempNode = connections[0].target
      } else {
        break
      }
    } while (1)
  } else if (type === 'source') {
    tempNode = rootNodeSourceRelations.value[0]?.source
    if(tempNode) {
      nodeArr.push(tempNode)
    } else {
      return
    }
    do {
      connections = plumbIns.getConnections({
        target: tempNode,
      })
      if (connections[0]) {
        nodeArr.push(connections[0].source)
        tempNode = connections[0].source
      } else {
        break
      }
    } while (1)
  }

  return Array.from(nodeArr).includes(elm)
}

// 更新节点位置
const updateElmTop = (elm, value, type) => {
  if (!elm) return

  let children = elm.parentElement.children
  let targetIndex = Array.from(children).indexOf(elm)

  for (let i = targetIndex; i <= children.length - 1; i++) {
    let offsetValue = value
    let preTop = parseFloat(getComputedStyle(children[i]).top)

    // TODO: 第一行展开间距待完善
    if (i === 0 && whetherChangePos(elm, type)) {
      continue
    }
    if (i === targetIndex) {
      children[i].style.top = preTop + offsetValue + 'px'
    } else if (i > targetIndex) {
      offsetValue *= 2
      children[i].style.top = preTop + offsetValue + 'px'
      updateChildNodePos(children[i], offsetValue, type)
    }
  }
}
// 修正节点位置
const nodePosCorrect = async () => {
  let type = props.relationType
  if (type === 'root') return

  let { sourceElm, targetElm } = getTargetSourceElm(type)
  let plumbIns = graphInstance.value
  let offsetY = getDisantceY(sourceElm, targetElm)
  let connections = []

  if (type === 'target') {
    do {
      updateElmTop(sourceElm, offsetY, type)
      connections = plumbIns.getConnections({
        target: sourceElm.id,
      })
      sourceElm = connections[0]?.source
      if(!sourceElm) break
    } while (sourceElm !== rootNode.value)
  } else if (type === 'source') {
    do {
      updateElmTop(targetElm, offsetY, type)
      connections = plumbIns.getConnections({
        source: targetElm.id,
      })
      targetElm = connections[0]?.target
      if(!targetElm) break
    } while (targetElm !== rootNode.value)
  }
  updateNodePos()
  // 重绘节点连线
  plumbIns.repaintEverything()
}
</script>

<style lang="less">
.nodeItem {
  height: 36px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  position: absolute;
}
.numItem {
  border: 1px solid #e9e9e9;
  background: #fafafa;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  text-align: center;
  line-height: 36px;
  cursor: pointer;
  position: absolute;
  &.hide {
    opacity: 0;
    pointer-events: none;
  }
}
.rootNode {
  position: absolute;
  top: var(--rootTop);
  left: var(--rootLeft);
  margin-top: -18px;
  margin-left: var(--ow);
  color: #fff;
  border: none;
}
.fold_icon{
  position: absolute;
  z-index: 1;
  width: 14px;
  height: 14px;
  cursor: pointer;
}
</style>
