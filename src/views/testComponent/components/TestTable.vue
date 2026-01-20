<script setup>
const columns = [
  {
    name: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags'
  },
  {
    title: 'Action',
    key: 'action'
  }
]

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer']
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: [
      '标签1111',
      '标签222222',
      '标签333333',
      'aaa',
      'bbb',
      'cccc',
      '标签1111',
      '标签222222',
      '标签333333',
      'aaa',
      'bbb',
      'cccc'
    ]
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['标签1111', '标签222222', '标签333333', 'aaa', 'bbb', 'cccc']
  }
]

// 列宽比例信息
const columnWidthInfo = {
  name: 10,
  age: 10,
  action: 30,
}
</script>

<template>
  <span>table测试</span>
  <BiTable 
    :columns="columns"
    :dataSource="data"
    :columnWidthInfo="columnWidthInfo"
    :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
  >
    <template #headerCell="{ column }">
      <template v-if="column.key === 'name'">
        <span style="color: red"> Name </span>
      </template>
      <template v-else-if="column.key === 'action'">
        <span style="color: green"> action </span>
      </template>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <a>
          {{ record.name }}
        </a>
      </template>
      <!-- <template v-else-if="column.key === 'tags'">
        {{ record.tags.join(',') }}
      </template> -->
      <template v-else-if="column.key === 'action'">
        <span>
          <a>Invite 一 {{ record.name }}</a>
          <a>Delete</a>
        </span>
      </template>
    </template>
  </BiTable>
  <br/>
</template>

<style lang="less" scoped></style>
