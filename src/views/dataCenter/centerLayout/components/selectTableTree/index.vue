<script setup>
import { message } from 'ant-design-vue'
import tableList from '@/components/tableList'
import { getTableSvg } from '@/utils/utils'
import { getTableList, getGroupListApi } from '@/apis/group'

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
const props = defineProps(['selectedKeys'])
const {selectedKeys} = toRefs(props)
const emits = defineEmits(['select'])

// 加载数据节点ID
const loadingNodeId = ref('')

const searchKw = ref('')

const visible = ref(false)
const treeData = ref([])
const expandedKeys = ref([])

const selectTable = ref({
  name: ''
})

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

// 搜索
const searchFn = async () => {
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


const expandFn = node => {
    let groupTables = node.children.filter(it => it.isTable)
  // 数据未加载完 且为首次加载数据
  !node.loadEnd && !groupTables.length && getGroupTable(node)
}

const checkFn = node => {
  selectTable.value = node
  visible.value = false
  emits('select', node)
}

</script>

<template>
  <a-dropdown
    trigger="click"
    v-model:visible="visible"
    destroyPopupOnHide
  >
    <div :class="{'input-wrap': true, 'active': visible}">
      <span>{{ selectTable.name }}</span>
      <BiIcon
        name="delete"
        @click.stop="selectTable = { name: '' }"
        v-if="selectTable.name"
      />
      <BiIcon v-else-if="visible" color="#3E4959" name="upArrow" />
      <BiIcon v-else color="#3E4959" name="downArrow" />
    </div>
    <template #overlay>
      <div class="down-wrap">
        <BiInput
          v-model="searchKw"
          @input="searchFn"
          placeholder="搜索"
          canSearch
        />
        <tableList
          v-if="searchKw"
          :list="searchList"
          :selectedKeys="selectedKeys"
          keyName="name"
          @select="checkFn"
        />
        <BiTree
          v-else
          :treeData="treeData"
          :loadingId="loadingNodeId"
          v-model:expandedKeys="expandedKeys"
          v-model:selectedKeys="selectedKeys"
          @check="checkFn"
          @expand="expandFn"
          @loadMore="n => getGroupTable(n)"
          :showSplitLine="true"
        />
      </div>
    </template>
  </a-dropdown>
</template>

<style lang="less" scoped>
.input-wrap {
  width: 344px;
  height: 32px;
  border-radius: 4px;
  background-color: #f2f3f5;
  cursor: pointer;
  position: relative;
  padding: 5px 12px;
  box-sizing: border-box;
  &.active{
    box-shadow: inset 0px 0px 0px 2px #3D82F2;
  }
  svg {
    width: 14px;
    height: 14px;
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
  }
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 300px;
    display: block;
  }
}
</style>

<style lang="less">
.down-wrap {
  min-height: 300px;
  width: 344px;
  background-color: #fff;
  padding: 12px 10px;
  border: 1px solid #e9e9e9;
  box-shadow: 0px 6px 24px rgba(31, 35, 41, 0.1);
  border-radius: 4px;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  .bi-input-wrap {
    width: 100%;
    height: 30px;
    margin-bottom: 10px;
    flex-shrink: 0;
  }
  .bi-tree-wrap {
    flex-grow: 1;
    overflow: auto;
  }
}
</style>
