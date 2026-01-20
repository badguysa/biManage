<script setup>
import selectTableTree from '@/components/selectTableTree'
import tableList from '@/components/tableList'

const emits = defineEmits(['cancel', 'update:tables', 'update:groups'])
const props = defineProps(['tables', 'groups'])

const tableInfo = reactive({
  tables: [...props.tables],
  groups: [...props.groups]
})

// 已选中表,分组id
const checkedKeys = computed(() => [
  ...props.tables.map(it => it.id),
  ...props.groups.map(it => it.id)
])

// 已选数据列表
const selectedList = computed(() => [
  ...tableInfo.groups.map(it => {
    it.icon = 'folder'
    return it
  }),
  ...tableInfo.tables.map(it => {
    it.name = it.tableAlias || it.name
    return it
  })
])

// 切换复选框 
const checkFn = n => {
  let source = n.isTable ? tableInfo.tables : tableInfo.groups
  let index = source.findIndex(it => it.id === n.id)
  if (index >= 0) {
    source.splice(index, 1)
  } else {
    source.push(n)
  }
}

const okFn = () => {
  emits('update:groups', tableInfo.groups)
  emits('update:tables', tableInfo.tables)
  emits('cancel')
}
</script>

<template>
  <BiModal
    class="choose-table-wrap"
    width="640px"
    title="选择数据"
    @ok="okFn"
    @cancel="$emit('cancel')"
    @close="$emit('cancel')"
  >
    <div class="main-wrap">
      <selectTableTree @checkNode="checkFn" :checkedKeys="checkedKeys" />
      <div class="table-list">
        <div class="tips">已选<i>{{ tableInfo.groups.length }}</i>个分组，<i>{{ tableInfo.tables.length }}</i>张表</div>
        <tableList :list="selectedList" keyName="name" :showNoData="false"/>
      </div>
    </div>
  </BiModal>
</template>
<style>
.choose-table-wrap .modal-container .content {
  padding: 0;
}
</style>
<style lang="less" scoped>
.main-wrap {
  display: flex;
  height: 480px;
  & > div {
    width: 50%;
    height: 100%;
    padding: 12px;
  }
  .table-list {
    border-left: 1px solid #e9e9e9;
    overflow-y: auto;
    .tips{
      color: #00000066;
      font-size: 16px;
      margin-bottom: 12px;
      padding-left: 12px;
      i{
        font-style: normal;
        color: #2b67ff;
        margin: 0 2px;
      }
    }
  }
}
</style>
