<script setup>
import { cloneDeep } from 'loadsh'
import { getTableSvg } from '@/utils/utils'
import { getTableList, getGroupListApi } from '@/apis/group'
import tableList from '../tableList'

const emits = defineEmits(['checkNode'])
const props = defineProps(['checkedKeys'])

const PAGE_PARAMS = {
  size: 30,
  current: 0,
  total: +Infinity
}

const searchList = ref([])

const searchParams = reactive({
  kw: '',
  size: 20,
  current: 1
})

// 加载数据节点ID
const loadingNodeId = ref('')
const expandedKeys = ref([])
const selectedKeys = ref(cloneDeep(props.checkedKeys))
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
const getGroupTable = async node => {
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
}

const expandFn = (node) => {
  let groupTables = node.children.filter(it => it.isTable)
  // 数据未加载完 且为首次加载数据
  !node.loadEnd && !groupTables.length && getGroupTable(node)
}

const searchTable = async () => {
  if (!searchParams.kw.trim()) return
  let res = await getTableList({
    tableAlias: searchParams.kw,
    pageSize: searchParams.size,
    pageNum: searchParams.current
  })

  if (res.code !== 1) return

  res.data.records.map(table => {
    table.icon = getTableSvg(table.tableType)
    table.isTable = true
  })

  searchList.value = res.data.records
}

const selectTable = table => {
  let index = selectedKeys.value.indexOf(table.id)
  if (index >= 0) {
    selectedKeys.value.splice(index, 1)
  } else {
    selectedKeys.value.push(table.id)
  }
  emits('checkNode', table)
}
</script>

<template>
  <div class="select-table-wrap">
    <BiInput
      style="width: 100%; height: 32px"
      v-model="searchParams.kw"
      placeholder="搜索"
      @input="searchTable"
    />
    <div class="tree-wrap" v-if="!searchParams.kw">
      <BiTree
        :tree-data="treeData"
        :loadingId="loadingNodeId"
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        @check="n => $emit('checkNode', n)"
        @expand="expandFn"
        @loadMore="n => getGroupTable(n)"
        checkable
      >
        <template #nodeIcon="{ node }">
          <BiIcon :name="node.icon" :class="node.icon + 'Icon'" />
        </template>
      </BiTree>
    </div>
    <!-- 搜索列表 -->
    <tableList
      v-else
      :list="searchList"
      @select="selectTable"
      checkable
      :selectedKeys="selectedKeys"
    />
  </div>
</template>

<style lang="less" scoped>
.select-table-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .tree-wrap {
    width: 100%;
    flex-grow: 1;
    overflow-y: auto;
  }
}
</style>
