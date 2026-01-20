<script setup>
import noData from '@/components/noData'
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  dataSource: {
    type: Array,
    required: true
  },
  // 列宽信息
  columnWidthInfo: {
    type: Object,
    required: false,
    default() {
      return {}
    }
  },
  // 表格行的类名
  rowClassName: {
    type: [String, Function],
    required: false,
    default: undefined
  }
})

// 列宽比例
const columnWidthRatio = computed(() => {
  let resetColumnWidth = 100,
    columnWidthInfo = props.columnWidthInfo,
    resetColumnNum = props.columns.length - Object.keys(columnWidthInfo).length
  for (let dataIndex in columnWidthInfo) {
    resetColumnWidth -= columnWidthInfo[dataIndex]
  }
  return props.columns.map(col => {
    if (col.dataIndex in columnWidthInfo) {
      return columnWidthInfo[col.dataIndex] + '%'
    }
    return Math.floor(resetColumnWidth / resetColumnNum) + '%'
  })
})

// 表格行的类名
const internalRowClassName = (record, index) => {
  let rowClassName = props.rowClassName
  if(typeof rowClassName === 'function') {
    return rowClassName(record, index)
  } else {
    return rowClassName
  }
}
</script>

<template>
  <div class="bi-table-wrap">
    <table>
      <colgroup>
        <col v-for="(_, index) in columns" :width="columnWidthRatio[index]" />
      </colgroup>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            <div class="cell-wrap" :title="column.title">
              <slot name="headerCell" :column="column">
                {{ column.title }}
              </slot>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in dataSource" :key="row.key" :class="internalRowClassName(row, index)">
          <td v-for="column in columns">
            <div class="cell-wrap">
              <slot name="bodyCell" :column="column" :record="row">
                {{ row[column.dataIndex] }}
              </slot>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <noData v-if="!dataSource.length"/>
  </div>
</template>

<style lang="less" scoped>
.bi-table-wrap {
  table {
    width: 100%;
    thead {
      background-color: #ecf3ff;
      th {
        font-size: 13px;
        color: #3E4959;
        font-weight: 600;
      }
    }
    td,
    th {
      padding: 10px 12px;
      border: 1px solid #e0ebff;
      text-align: left;
    }
    th .cell-wrap {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    td .cell-wrap {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    tr {
      &:nth-child(even) {
        background-color: #f7faff;
      }
    }
  }
  .noData{
    margin-top: 50px;
  }
}
</style>
