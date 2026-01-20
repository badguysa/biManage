<script setup>
// const expandedKeys = ref(['node_0_0', 'node_1'])
// const selectedKeys = ref(['node_0', 'node_1_1_0'])

const expandedKeys = ref([])
const selectedKeys = ref([])

const treeData = [
  {
    id: 'node_0',
    name: 'Root Node 0',

    children: [
      {
        id: 'node_0_0',
        name: 'Child Node 0-0',
        children: [
          {
            id: 'node_0_0_0',
            name: 'Grandchild Node 0-0-0'
          },
          {
            id: 'node_0_0_1',
            name: 'Grandchild Node 0-0-1'
          }
        ]
      },
      {
        id: 'node_0_1',
        name: 'Child Node 0-1'
      }
    ]
  },
  {
    id: 'node_1',
    name: 'Root Node 1',
    children: [
      {
        id: 'node_1_0',
        name: 'Child Node 1-0'
      },
      {
        id: 'node_1_1',
        name: 'Child Node 1-1',
        children: [
          {
            id: 'node_1_1_0',
            name: 'Grandchild Node 1-1-0'
          }
        ]
      }
    ]
  },
  {
    id: 'node_2',
    name: 'Root Node 2',
    children: []
  }
]

const checkFn = node => {
  console.log('check', node)
}

const expandFn = node => {
  console.log('select', node)
}
const loadMoreFn = node => {
  console.log('nodeId', node)
}
</script>

<template>
  <div class="wrap">
    <h1>测试树形组件</h1>
    <BiTree
      :tree-data="treeData"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      @check="checkFn"
      @expand="expandFn"
      @loadMore="loadMoreFn"
      checkable
    >
      <template #nodeIcon>
        <BiIcon name="excel" class="excelIcon" />
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
}
</style>
