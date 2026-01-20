<template>
  <div class="relationWraper">
    <back @backFn="backFn"/>
    <div ref="wrapRef" :class="{ relationWrapper: true, isDrag: dragging, [scalStatus]: true}">
      <div
        class="graphContainer"
        id="graphContainer"
        ref="graphRef"
        :style="`--rootLeft: ${graphSize.width / 2}px; --rootTop: ${graphSize.heigth / 2}px;`"
      >
        <a-spin :spinning="spinning">
          <RelationGraph 
          v-if="relationData" 
          relation-type="root" 
          :relation-info="relationData"
          />
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup>
import RelationGraph from './relationGraph.vue'
import { getBloodRelation } from '@/apis/bloodRelation'
import { getIndexTableDetail }  from '@/apis/group'
import { message } from 'ant-design-vue'
import back from '@/components/back'
import { useDragRelation } from '@/hooks/bloodRelation/useDragRelationGraph'
import { useScaleRelation } from '@/hooks/bloodRelation/useScaleRelationGraph'
import useBackHome from '@/hooks/dataCenter/useBackHome'
import { v4 as uuidv4 } from 'uuid'

let useMainStore = mainStore()
let relationData = ref(null)
let spinning = ref(true)
let wrapRef = shallowRef(null)
let graphRef = shallowRef(null)

provide('RELATION_GRAPH_INFO', reactive({
  relationInstance: null,   // 关系图实例
  relationRootNode: null,   // 关系图根节点
  foldIcon: null,           // 折叠图标元素
  foldRefElm: null,         // 折叠参考元素
  isFoldLeftElm: false,     // 折叠左侧元素
  showFoldIcon: false,      // 展示折叠图标
  cancelHideFoldIcon: false // 取消隐藏折叠图标
}))

// 是否可拖拽 控制光标样式
let { dragging } = useDragRelation(wrapRef, graphRef)
let { scalStatus } = useScaleRelation(wrapRef, graphRef)

let backFn = useBackHome()

const indexTableDesc = computed(() => {
    return useMainStore.currentTab.indexTableDesc
})

const graphSize = computed(() => {
  return {
    width: graphRef.value?.clientWidth ?? 0,
    heigth: graphRef.value?.clientHeight ?? 0,
  }
})

watch(
  () => indexTableDesc.value?.id,
  async cur => {
    if(cur){
      relationData.value = null
      spinning.value = true
      // 获取表信息
      let detailRes = await getIndexTableDetail({
        id: cur,
      })
      if (detailRes.code === 1) {
        let tableId = detailRes.data.id
        // 获取血缘关系 构造数据结构
        let relationRes = await getBloodRelation(tableId, 0)
        if (relationRes.code === 1) {
          relationData.value = {
            ...detailRes.data,
            // 节点id取uuid 修复关系节点存在相同id 导致连线绘制错乱问题
            sourceRelations: relationRes.data.sourceRelations.map(item => {
              item.id = uuidv4()
              return item
            }).filter(fit => fit.source),
            targetRelations: relationRes.data.targetRelations.map(item => {
              item.id = uuidv4()
              return item
            }).filter(fit => fit.target),
          }
          spinning.value = false
          // console.log('relationData', relationData)
        } else {
          message.error(relationRes.message)
        }
      } else {
        message.error(detailRes.message)
      }
    }
  },
  {
    immediate: true,
  }
)
</script>
<style lang="less" scoped>
.relationWraper{
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
.relationWrapper {
  position: relative;
  overflow: auto hidden;
  flex-grow: 1;
  &.zoomIn {
    cursor: zoom-in;
  }
  &.zoomOut {
    cursor: zoom-out;
  }
  &.isDrag {
    cursor: move;
  }
  .graphContainer {
    // background-color: #ffa;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
.ant-spin {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ant-spin-nested-loading {
  height: 100%;
  :deep(.ant-spin-container) {
    height: 100%;
  }
}
</style>
