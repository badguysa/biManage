<script setup>
import myButton from '@/components/buttons/myButton.vue'
import { getTypeIconSvg, getTypeIconClassName } from '@/utils/utils'

const { t } = useI18n()

const useConfigStore = configStore()
const useMainStore = mainStore()

const { activeTabKey } = storeToRefs(useMainStore)

const { configUniqueData } = storeToRefs(useConfigStore)

const configData = computed(() => {
  return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})
const { allConfigData, operActiveId, selfFlag, selfConfig, tableSource } = toRefs(configData.value)

const kw = ref('')
const visible = ref(false)
const columnList = ref([])
const columnListBack = ref([])

watch(
  () => operActiveId.value,
  val => {
    // 设置去重字段列表  
    if (allConfigData.value.length > 0) {
          let target = null
          target = allConfigData.value.find(it => it.uuid === val)
          if(target) {
            columnList.value = target.codeList
            columnListBack.value = target.codeList
          }
      }
      // 设置字段选中状态
      const uuids = tableSource.value.map(i => i.uuid)
      if (uuids.includes(val)) {
        const config = tableSource.value.find(item => item.uuid === val)
        if (config.action === 'distinct') {
          columnList.value.forEach(it => {
            it.checked = config.contents?.columns.includes(it.columnName)
          })
        }
      }
    
  },
  {
    immediate: true,
  }
)

const checkedColums = computed(() => columnListBack.value.filter(it => it.checked))

const checkAll = computed({
  get: () => columnList.value.length && columnList.value.every(it => it.checked),
  set: val => columnList.value.forEach(it => (it.checked = val))
})

const searchFn = () => {
  columnList.value = columnListBack.value.filter(
    it =>
      it.columnAlias?.toLowerCase().includes(kw.value.toLowerCase()) ||
      it.columnName?.toLowerCase().includes(kw.value.toLowerCase())
  )
}

const confirmFn = () => {
  visible.value = false
}

const updateConfig = () => {
  const distinctConfig = {
    uuid: operActiveId.value,
    action: 'distinct',
    contents: {
      // 去重字段
      columns: columnList.value.filter(col => col.checked).map(column => column.columnName),
      // 预览字段
      aggregate: columnList.value.filter(col => !col.checked).map(it => ({column: it.columnName, method: ''}))
    }
  }

  // 未选择去重字段
  if(!distinctConfig.contents.columns.length) {
    useConfigStore.setTableSource(distinctConfig, 'delete', activeTabKey.value)
    const findIndex = selfConfig.value.findIndex(i => i.uuid === operActiveId.value)
    useConfigStore.getPreviewData(selfConfig.value[findIndex - 1].config, '', '', activeTabKey.value)
    useConfigStore.setSelfConfig(distinctConfig, 'delete', activeTabKey.value)
  } else {
    useConfigStore.setTableSource(distinctConfig, 'change', activeTabKey.value)
    useConfigStore.setSelfConfig(distinctConfig, 'distinct', activeTabKey.value)
  }

}

const changeVisibleFn =() => {
  // 显示弹框 重置kw
  if(visible.value) {
    kw.value = ''
    searchFn()
  } else {
    // updateConfig()
  }
}

// 切换选中状态
const updateSelect = (item, type) => {
  if(type === 'all') {
    checkAll.value = !checkAll.value
  } else {
    item.checked = !item.checked
  }
  updateConfig()
}

const removeHandle = (it) => {
  it.checked = false
  updateConfig()
}

</script>

<template>
  <div class="select-wrap">
    <span>{{ t('selfConfig.selectRepeatField') }}</span>
    <a-dropdown :trigger="['click']" v-model:visible="visible" @visibleChange="changeVisibleFn">
      <div :class="{ 'columns-wrap': true, fold: visible }">
        <div class="select-column" v-for="it in checkedColums.slice(0, 2)">
          <BiIcon :name="getTypeIconSvg(it)" :class="getTypeIconClassName(it)" />
          <span :title="it.columnAlias || it.columnName">{{ it.columnAlias || it.columnName }}</span>
          <BiIcon name="close" @click.stop="removeHandle(it)" />
        </div>
        <span class="other" v-if="checkedColums.length > 2">+{{ checkedColums.length - 2 }}</span>
      </div>
      <template #overlay>
        <div class="select-column-overlay-wrap">
          <div class="search-wrap">
            <input v-model="kw" type="text" @input="searchFn" />
          </div>
          <div class="check-all" @click="updateSelect(null, 'all')">
            <i :class="{ checked: checkAll }"></i>
            <span>{{ t('common.selectAll') }}</span>
          </div>
          <div class="column-list">
            <div class="column-item" v-for="column in columnList" @click="updateSelect(column, 'single')">
              <i :class="{ checked: column.checked }"></i>
              <BiIcon :name="getTypeIconSvg(column)" :class="getTypeIconClassName(column)" />
              <span class="name" :title="column.columnAlias || column.columnName">{{
                column.columnAlias || column.columnName
              }}</span>
            </div>
          </div>
          <div class="bottom-wrap">
            <myButton type="primary" @click="confirmFn">{{ t('common.confirm') }}</myButton>
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
  gap: 12px;
  .columns-wrap {
    width: 300px;
    height: 32px;
    padding: 0px 12px;
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
        max-width: 60px;
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
