<script setup>
import { getPreviewColumns } from '@/apis/common'
import { debounce, cloneDeep } from 'lodash'
import { message } from 'ant-design-vue'

const { t } = useI18n()

const props = defineProps(['columnName', 'multiValue'])

const emits = defineEmits(['selectField'])

const queryParms = reactive({
  search: '',
  pageNum: 1,
  pageSize: 100,
})
const firstGetData = ref(true)
const visible = ref(false)
const columnList = ref([])
const backColumnList = ref([])

// 获取目标表 表ID
const tableId = inject('TARGET_TABLE_ID')

const checkAll = computed({
  get: () => columnList.value.length && columnList.value.every(it => it.checked),
  set: val => columnList.value.forEach(it => (it.checked = val)),
})

const checkedColumns = computed(() => backColumnList.value.filter(it => it.checked))

// 获取字段数据
const getColumnsData = async () => {
  let res = await getPreviewColumns({
    tableId: tableId.value,
    columnName: props.columnName,
    ...queryParms,
  })
  if (res.code === 1) {
    columnList.value = cloneDeep(res.data.records)
    // 首次请求数据 备份数据赋值
    if (firstGetData.value) {
      backColumnList.value = cloneDeep(res.data.records)
    }
    updateColumnList()
    updateCheckedColumns()
  }
}

const getColumnsDataDebounce = debounce(getColumnsData, 200, {
  leading: true,
})

// 更新下拉列表
const updateColumnList = () => {
  if (checkedColumns.value.length) {
    checkedColumns.value.forEach(item => {
      let target = columnList.value.find(it => it[props.columnName] === item[props.columnName])
      if (target) {
        target.checked = item.checked
      }
    })
  }
}

// 更新选中字段
const updateCheckedColumns = () => {
  columnList.value.forEach(it => {
    let targetColumn = backColumnList.value.find(col => col[props.columnName] === it[props.columnName])
    if (targetColumn) {
      targetColumn.checked = it.checked
    }
  })
}

const changeVisibleFn = () => {
  // 显示弹框 重置kw
  if (visible.value) {
    queryParms.search = ''
    getColumnsDataDebounce()
  } else {
    triggerSelfConfigQuery()
  }
}

const removeHandle = removeItem => {
  removeItem.checked = false
  let target1 = columnList.value.find(it => it[props.columnName] === removeItem[props.columnName])
  let target2 = backColumnList.value.find(it => it[props.columnName] === removeItem[props.columnName])
  if (target1) {
    target1.checked = false
  }
  if (target2) {
    target2.checked = false
  }
  triggerSelfConfigQuery()
}

// 切换选中状态
const updateSelect = (item, type) => {
  if (type === 'all') {
    if (!checkAll.value && columnList.value.length >= 20) {
      return message.warning('最多选择20项')
    }
    checkAll.value = !checkAll.value
  } else {
    item.checked = !item.checked
  }
  updateCheckedColumns()
}

const confirmFn = () => {
  visible.value = false
  triggerSelfConfigQuery()
}

// 触发自助配置接口查询
const triggerSelfConfigQuery = () => {
  emits(
    'selectField',
    checkedColumns.value.map(it => it[props.columnName])
  )
}

// 监听表id 字段名称 变化
watch(
  [tableId, () => props.columnName],
  async () => {
    // console.log('watch...')
    if (!tableId.value || !props.columnName) return

    await getColumnsData()

    // 首次请求数据 回显选中字段
    if (firstGetData.value && Array.isArray(props.multiValue)) {
      columnList.value.forEach(it => {
        it.checked = props.multiValue.includes(it[props.columnName])
      })
    }
    firstGetData.value = false

    updateColumnList()

    updateCheckedColumns()
  },
  {
    immediate: true,
  }
)
</script>

<template>
  <div class="select-wrap">
    <a-dropdown :trigger="['click']" v-model:visible="visible" @visibleChange="changeVisibleFn">
      <div :class="{ 'columns-wrap': true, fold: visible }">
        <!-- 已选字段 -->
        <div class="select-column" v-for="column in checkedColumns.slice(0, 2)">
          <span :title="column[columnName]">{{ column[columnName] }}</span>
          <BiIcon name="close" @click.stop="removeHandle(column)" />
        </div>
        <span class="other" v-if="checkedColumns.length > 2">+{{ checkedColumns.length - 2 }}</span>
      </div>
      <template #overlay>
        <div class="select-column-overlay-wrap">
          <!-- 搜索框 -->
          <div class="search-wrap">
            <input v-model="queryParms.search" type="text" @input="getColumnsDataDebounce" />
          </div>
          <div class="check-all" @click="updateSelect(null, 'all')">
            <i :class="{ checked: checkAll }"></i>
            <span>{{ t('common.selectAll') }}</span>
          </div>

          <!-- 下拉列表 -->
          <div class="column-list">
            <div
              :class="{ 'column-item': true, disable: !column.checked && checkedColumns.length >= 20 }"
              v-for="column in columnList"
              @click="updateSelect(column, 'single')"
            >
              <i :class="{ checked: column.checked }"></i>
              <span class="name" :title="column[columnName]">{{ column[columnName] }}</span>
            </div>
          </div>

          <div class="bottom-wrap">
            <BiButton type="primary" @click="confirmFn">{{ t('common.confirm') }}</BiButton>
          </div>
        </div>
      </template>
    </a-dropdown>
  </div>
</template>

<style lang="less" scoped>
.select-wrap {
  display: flex;
  align-items: center;
  margin-right: 8px;
  gap: 12px;
  .columns-wrap {
    min-width: 200px;
    height: 32px;
    padding: 0px 35px 0 12px;
    background-color: #f3f3f3;
    border-radius: 4px;
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    color: rgba(0, 0, 0, 0.8);
    &::after {
      content: '';
      display: inline-block;
      width: 16px;
      height: 16px;
      background: url(@/assets/icons/page-down.png) center/cover;
      position: absolute;
      top: 8px;
      right: 12px;
    }
    &.fold {
      box-shadow: 0px 0px 0px 2px #2b67ff inset;
      &::after {
        background-image: url(@/assets/icons/page-up.png);
      }
    }
    .select-column {
      max-width: 110px;
      display: inline-flex;
      height: 24px;
      padding: 0px 2px 0px 6px;
      align-items: center;
      gap: 4px;
      border-radius: 3px;
      border: 1px solid rgba(0, 0, 0, 0.14);
      background: #fff;
      cursor: default;
      svg {
        flex-shrink: 0;
        &:first-of-type {
          width: 13px;
          height: 13px;
        }
        &:last-of-type {
          width: 14px;
          height: 14px;
          cursor: pointer;
        }
      }
      & > span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .other {
      font-size: 13px;
    }
  }
}
</style>
<style lang="less">
.select-column-overlay-wrap {
  width: 300px;
  padding: 4px 0px;
  border-radius: 4px;
  border: 1px solid #e9e9e9;
  background-color: #fff;
  box-shadow: 0px 6px 24px 0px rgba(31, 35, 41, 0.1);
  .search-wrap {
    padding: 6px 12px;
    input {
      width: 100%;
      padding-right: 34px;
    }
  }
  .column-list {
    max-height: 275px;
    overflow: hidden auto;
  }
  .column-item {
    .name {
      max-width: 234px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
    }
    svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
    &:hover {
      background-color: #f2f3f5;
    }
    &.disable {
      opacity: 0.5;
      pointer-events: none;
    }
  }
  .check-all,
  .column-item {
    display: flex;
    padding: 10px 12px;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  .check-all > i,
  .column-item > i {
    width: 16px;
    height: 16px;
    background: url(@/assets/icons/not_select.png) center/cover;
    flex-shrink: 0;
    &.checked {
      background-image: url(@/assets/icons/is_select.png);
    }
  }

  .bottom-wrap {
    padding: 8px 12px;
    border-top: 1px solid #f2f2f2;
    background-color: #fff;
    text-align: right;
    .primaryBtn {
      width: 52px;
      padding: 0;
      line-height: 28px;
    }
  }
}
</style>
