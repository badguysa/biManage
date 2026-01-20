<script setup>
import { getTableList, getGroupListApi } from '@/apis/group'
import { getTableSvg } from '@/utils/utils'
// const expandedKeys = ref(['node_0_0', 'node_1'])
// const selectedKeys = ref(['node_0', 'node_1_1_0'])

const PAGE_SIZE = 30
const PAGE_PARAMS = {
  size: PAGE_SIZE,
  current: 0,
  total: +Infinity
}

// 加载数据节点ID
const loadingNodeId = ref('')

const expandedKeys = ref([])
const selectedKeys = ref([])

const treeData = ref([])

onMounted(() => {
  getGroupData()
})

// 分组数据获取
const getGroupData = async () => {
  let res = await getGroupListApi()
  if (res.code !== 1) return

  // 只含二级分组
  res.data.map(group => {
    
    group.subList.map(subGroup => {
      subGroup.children = subGroup.subList
      delete subGroup.subList
      // 分页参数
      subGroup.pageParams = Object.assign({}, PAGE_PARAMS)
      subGroup.loadEnd = false
    })

    group.children = group.subList
    delete group.subList
    // 分页参数
    group.pageParams = Object.assign({}, PAGE_PARAMS)
    group.loadEnd = false
  })
  treeData.value = res.data
}

// 获取分组下列表数据
const getGroupTable = async (node) => {
  let pageParams = node.pageParams

  pageParams.current++

  loadingNodeId.value = node.id
  let res = await getTableList({
    groupId: node.id,
    pageSize: pageParams.size,
    pageNum: node.pageParams.current
  })

  loadingNodeId.value = ''

  if (res.code !== 1) return

  res.data.records.map(table => {
    table.name = table.tableAlias
    table.icon = getTableSvg(table.tableType)
    table.isTable = true
  })

  node.children = node.children.concat(res.data.records)
  // 数据是否加载完毕
  node.loadEnd = pageParams.current * pageParams.size >= Number(res.data.total)
  console.log('tableList', res)
}

const checkFn = node => {
  console.log('check', node)
}

/**
 * 
 * @param node 操作节点
 * @param expanded 是否已展开
 */
const expandFn = (node, expanded)  => {
  let groupTables = node.children.filter(it => it.isTable)

  // 首次展开节点时 获取数据
  !groupTables.length && getGroupTable(node)
}
const loadMoreFn = node => {
  getGroupTable(node)
}
</script>

<template>
  <div class="wrap">
    <h1>测试选表树形组件</h1>
    <BiTree :tree-data="treeData" :loadingId="loadingNodeId" v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys"
      @check="checkFn" @expand="expandFn" @loadMore="loadMoreFn" checkable>
      <template #nodeIcon="{ node }">
        <BiIcon :name="node.icon" :class="node.icon + 'Icon'" />
      </template>
    </BiTree>
  </div>
</template>

<style lang="less" scoped>
.wrap {
  width: 500px;
  height: 700px;
  padding: 30px;
  border: 1px solid #000;
  overflow-y: auto;
}
</style>
