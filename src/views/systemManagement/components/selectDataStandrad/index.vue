<script setup>
import { message } from 'ant-design-vue'
import tableList from '@/components/tableList'
import { getStandardLibList, getStandardTableList } from '@/apis/dataStandard'

const PAGE_PARAMS = {
  size: 30,
  current: 0,
  total: +Infinity
}

const emits = defineEmits(['select'])

// 加载数据节点ID
const loadingNodeId = ref('')

const searchList = ref([])
const searchKw = ref('')

const visible = ref(false)
const standardList = ref([])
const expandedKeys = ref([])
const selectedKeys = ref([])

const selectStandard = ref({
  name: ''
})

onMounted(() => {
  getStandardListData()
})

const getStandardListData = async () => {
  let res = await getStandardLibList({ groupType: 0 })
  if (res.code !== 1) return message.error(res.message)
  standardList.value = handleTreeData(res.data)
}

// 树形结构数据处理
const handleTreeData = list => {
  list.forEach(it => {
    if (!it.subList) return
    // 分页参数
    it.pageParams = Object.assign({}, PAGE_PARAMS)
    it.loadEnd = false
    it.children = it.subList.map(sub => {
      // 分页参数
      sub.pageParams = Object.assign({}, PAGE_PARAMS)
      sub.loadEnd = false
      return sub
    })
    delete it.subList
    handleTreeData(it.children)
  })
  return list
}

// 搜索
const searchFn = async () => {
  if (!searchKw.value) return
  let res = await getStandardTableList({
    libId: '',
    pageSize: 30,
    pageNum: 1,
    sw: searchKw.value
  })
  searchList.value = res.data.records
}

// 获取标准分组下的表
const getGroupTable = async node => {
  let pageParams = node.pageParams

  pageParams.current++
  loadingNodeId.value = node.id

  let res = await getStandardTableList({
    libId: node.id,
    pageSize: pageParams.size,
    pageNum: node.pageParams.current
  })

  loadingNodeId.value = ''

  if (res.code !== 1) return message.error(res.message)

  res.data.records.map(table => {
    table.isSub = true
  })

  node.children = node.children.concat(res.data.records)
  // 数据是否加载完毕
  node.loadEnd = pageParams.current * pageParams.size >= Number(res.data.total)
}

const expandFn = node => {
  let subTables = node.children.filter(it => it.isSub)
  !node.loadEnd && !subTables.length && getGroupTable(node)
}

const checkFn = node => {
  selectStandard.value = node
  selectedKeys.value = [node.id]
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
      <span>{{ selectStandard.name }}</span>
      <BiIcon
        name="delete"
        @click.stop="selectStandard = { name: '' }"
        v-if="selectStandard.name"
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
          :treeData="standardList"
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
  width: 300px;
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
    width: 252px;
    display: block;
  }
}
</style>

<style lang="less">
.down-wrap {
  height: 300px;
  width: 300px;
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
