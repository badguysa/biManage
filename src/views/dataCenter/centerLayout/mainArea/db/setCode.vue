<script setup>
import draggable from 'vuedraggable'
import { useI18n } from 'vue-i18n'
import useChangeColWidth from '@/hooks/dataCenter/useChangeColWidth'

const { t } = useI18n()

const emits = defineEmits(['filterFn'])

// 是否修改过字段
const hasModified = ref(false)

const inputRef = ref()

const tableRef = ref()

const colWidths = ref(['116', '90', '12'])

const searchKw = ref('')

// 是否更改过字段信息
const hasSelectCode = ref(false)

let columnsInfo = inject('COLUMNS_INFO')

// 拖拽列宽逻辑处理
useChangeColWidth(tableRef)

const selectColumns = computed(() => {
  return columnsInfo?.selectColumns || []
})

const allColumns = computed(() => {
  return columnsInfo?.allColumns || []
})

const selectedNum = computed(() => {
  return selectColumns.value.length
})

const isSelectAll = computed(() => selectColumns.value.length === allColumns.value.length)

const noSelect = computed(() => selectedNum.value === 0)

const getIconName = elm => {
  switch (elm.columnType) {
    case 'text':
      return 'text'
    case 'int':
    case 'bigint':
    case 'decimal':
    case 'decimal(30, 3)':
      return 'number'
    case 'date':
    case 'time':
    case 'datetime':
      return 'time'
    default:
      return 'text'
  }
}

const kwInputFn = () => {
  let kwValue = searchKw.value.trim()
  columnsInfo.allColumns = allColumns.value.map(it => {
    it.hide = !(it.columnName?.includes(kwValue) || it.columnAlias?.includes(kwValue))
    return it
  })
}

const rename = async record => {
  record.isRename = !record.isRename
  await nextTick()
  inputRef && inputRef.value.focus()
}

const selectCodeFn = element => {
  let index = fieldSelectedIndex(element)
  // 已选中切换为未选中 从已选字段列表删除
  if (index > -1) {
    columnsInfo.selectColumns.splice(index, 1)
  }
  // 未选中切换为已选中 从字段列表种匹配插入
  else {
    let insertIndex = allColumns.value.findIndex(elm => elm.columnName === element.columnName)
    insertIndex > -1 && columnsInfo.selectColumns.splice(insertIndex, 0, element)
  }
  hasSelectCode.value = true
}

const selectAllFn = () => {
  if (isSelectAll.value) {
    columnsInfo.selectColumns = []
  } else {
    columnsInfo.selectColumns = columnsInfo.allColumns.slice()
  }
  hasSelectCode.value = true
}

const inputNameFn = (e, element) => {
  let selectIndex = fieldSelectedIndex(element)
  let allIndex = allColumns.value.findIndex(elm => elm.columnName === element.columnName)
  columnsInfo.selectColumns[selectIndex].columnAlias = e.target.value
  columnsInfo.allColumns[allIndex].columnAlias = e.target.value
  hasSelectCode.value = true
}

const onIptBlur = record => {
  if (!hasModified.value) {
    record.isRename = false
    return
  }
  hasModified.value = false

  record.isRename = false
}

// 排序结束根据所有字段的顺序更新已选择字段的顺序
const dragEnd = () => {
  let columnNameArr = allColumns.value.map(it => it.columnName)
  let arr = []
  // 更新选中字段顺序
  columnNameArr.forEach(col => {
    let target = selectColumns.value.find(it => it.columnName === col)
    if (target) {
      arr.push(target)
    }
  })
  columnsInfo.selectColumns = arr
  hasSelectCode.value = true
}

const fieldSelectedIndex = field => {
  return selectColumns.value.findIndex(it => it.columnName === field.columnName)
}

// 字段选中样式
const getColumnClass = element => [
  'select-icon',
  fieldSelectedIndex(element) > -1 ? 'is-select' : 'no-select'
]

defineExpose({
  getChangeFlag() {
    return hasSelectCode.value
  },
  setChangeFlag(flag) {
    hasSelectCode.value = flag
  },
  resetSerchKw() {
    searchKw.value = ''
  }
})
</script>
<template>
  <div class="set-wrap">
    <div class="text-wrap">
      <span>{{ t('selfConfig.selectCode') }}</span>
      <span class="filter-icon" @click="$emit('filterFn')"
        ><BiIcon name="filter" color="#2B67FF" />{{ t('selfConfig.filter') }}</span
      >
    </div>
    <div class="input-wrap">
      <BiInput v-model="searchKw" @input="kwInputFn" canSearch placeholder="搜索" />
    </div>
    <div class="field-table">
      <table ref="tableRef">
        <colgroup>
          <col :width="colWidths[0]" style="min-width: 50px" />
          <col :width="colWidths[1]" />
          <col :width="colWidths[2]" />
        </colgroup>
        <thead>
          <tr>
            <th>
              <div class="head-wrap">
                <i
                  :class="{
                    'select-icon': true,
                    'select-all': isSelectAll,
                    'no-select': noSelect
                  }"
                  @click="selectAllFn"
                ></i>
                {{ t('common.codeName') }}
              </div>
              <div class="resizerWrap">
                <span class="resizer"></span>
              </div>
            </th>
            <th>
              {{ t('api.codeType') }}
              <div class="resizerWrap">
                <span class="resizer"></span>
              </div>
            </th>
            <th></th>
          </tr>
        </thead>
        <draggable
          :list="allColumns"
          tag="tbody"
          handle=".handle"
          item-key="id"
          drag-class="chosenClass"
          @end="dragEnd"
        >
          <template #item="{ element }">
            <tr :class="{ 'list-group-item': true }" v-if="!element.hide">
              <td>
                <div class="column-name-wrap">
                  <i :class="getColumnClass(element)" @click="selectCodeFn(element)"></i>
                  <input
                    ref="inputRef"
                    @blur="onIptBlur(element)"
                    @input="inputNameFn($event, element)"
                    class="ipt"
                    v-if="element.isRename"
                    type="text"
                    :value="element.columnAlias"
                  />
                  <span
                    class="column-name"
                    :title="element.columnAlias || element.columnName"
                    @click="rename(element)"
                    v-else
                    >{{ element.columnAlias || element.columnName }}</span
                  >
                  <BiIcon class="rename-icon" @click="rename(element)" name="editField" />
                </div>
              </td>
              <td class="type-wrap">
                <div class="content-wrap">
                  <BiIcon :name="getIconName(element)" :class="getIconName(element) + 'Icon'" />
                  <span :title="t(element.type)">{{ t(element.type) }}</span>
                </div>
              </td>
              <td class="handle"><img src="@/assets/icons/eightDot.png" /></td>
            </tr>
          </template>
        </draggable>
      </table>
    </div>
  </div>
</template>
<style lang="less" scoped>
span[role='img'] {
  svg {
    width: 16px;
    height: 16px;
    position: relative;
    top: 3px;
  }
}
.set-wrap {
  background: #fff;
  .chosenClass {
    border-bottom: 3px solid #3d82f2;
  }
  .text-wrap {
    width: 100%;
    height: 32px;
    font-weight: 400;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.8);
    padding: 12px 12px 0 12px;
    display: flex;
    align-self: center;
    justify-content: space-between;
    .filter-icon {
      color: #2b67ff;
      display: flex;
      cursor: pointer;
      gap: 4px;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  .input-wrap {
    margin-top: 8px;
    padding: 0 12px;
    .bi-input-wrap {
      width: 100%;
    }
  }

  .select-icon {
    display: inline-block;
    margin-right: 6px;
    cursor: pointer;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    background-size: 100%;
    background-image: url('@/assets/icons/doing_select.png');
    &.is-select,
    &.select-all {
      background-image: url('@/assets/icons/is_select.png');
    }
    &.no-select {
      background-image: url('@/assets/icons/not_select.png');
    }
  }

  .field-table {
    width: 100%;
    height: calc(100% - 76px);
    background-color: #fff;
    padding: 10px 8px 16px 12px;
    overflow-y: scroll;
    overflow-x: hidden;
    -ms-overflow-style: none;
    overflow: -moz-scrollbars-none;
    table {
      border-collapse: collapse;
      border-spacing: 0;
      width: fit-content;
      table-layout: fixed;
    }

    thead tr {
      td {
        border: 1px solid #e0ebff;
        background: #ecf3ff;
        height: 36px;
        line-height: 1;
      }
      th {
        text-align: left;
        border: 1px solid #e0ebff;
        background: #ecf3ff;
        height: 36px;
        padding: 0px 10px;
        line-height: 1;
        position: relative;
        .head-wrap {
          display: flex;
          align-items: center;
        }
        .resizerWrap {
          position: absolute;
          width: 4px;
          height: 100%;
          right: 0;
          top: 0px;
          .resizer {
            display: none;
            width: 100%;
            height: 100%;
            background-color: #2b67ff;
          }
          &:hover {
            .resizer {
              display: inline-block;
              cursor: ew-resize;
            }
          }
        }
      }
      :nth-child(3) {
        border: none;
        background: #fff;
      }
    }

    .list-group-item {
      height: 36px;
      td {
        height: 36px;
        padding: 0px 8px 0 10px;
        border: 1px solid #e0ebff;

        .ant-select:not(.ant-select-customize-input) .ant-select-selector {
          background-color: #fff !important;
        }
      }

      .column-name-wrap {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 18px 0 0;
        position: relative;
        &:hover {
          .rename-icon {
            display: block;
          }
        }

        span {
          display: inline-block;
          padding: 0;
          font-size: 12px;
          height: 28px;
          line-height: 28px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          cursor: pointer;
          width: 100%;
        }
        .ipt {
          height: 28px;
          width: 75px;
          background-color: #f3f3f3;
          &:focus {
            + .rename-icon {
              display: none;
            }
          }
        }
        .column-name {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          cursor: pointer;
          width: 90%;
        }
        .rename-icon {
          width: 12px;
          height: 12px;
          cursor: pointer;
          display: none;
          margin-left: 8px;
          margin-top: 3px;
          position: absolute;
          right: 8px;
        }
      }
      .cloName {
        margin-left: 4px;
      }

      .type-wrap {
        padding: 0;
        .content-wrap {
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          height: 36px;
          span {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          svg {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
          }
        }
      }

      .handle {
        border: none;
        img {
          width: 8px;
          height: 20px;
        }
        cursor: pointer;
      }
    }
  }
  .field-table::-webkit-scrollbar {
    width: 0 !important;
  }
}
:deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
  background-color: #fff !important;
  border: none;
}
</style>
