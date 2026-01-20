<script setup>
/***
* figema: https://www.figma.com/file/tWae3xVadg9oEpHEdYTxch/%E9%97%A8%E6%88%B72.0-%E8%AE%BE%E8%AE%A1%E5%9B%BE?type=design&node-id=10703-129344&mode=design&t=xbzlULNmfB6tikeO-0
*/
import myButton from '@/components/buttons/myButton.vue'
import { getTypeIconSvg, getTypeIconClassName } from '@/utils/utils'
import { cloneDeep } from 'lodash'

const { t } = useI18n()

const props = defineProps({
  dataOptions: {
    required: true,
  },
  canSearch: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  // 选中展示的最大数量
  maxNum: {
    type: Number,
    default: 3,
  },
  // 是否展示svg图标 ,单个option中需要含有 imgType 参数
  showSvg: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const originOptions = cloneDeep(props.dataOptions)
const kw = ref('')
const visible = ref(false)

const checkedColums = computed(() => props.dataOptions.filter(it => it.checked))

const checkAll = computed({
  get: () => props.dataOptions.length && props.dataOptions.every(it => it.checked),
  set: val => props.dataOptions.forEach(it => (it.checked = val))
})

watch(() => kw.value,(val)=>{
  let data
  if(val){
    data = props.dataOptions.filter(
      it => it.label?.toLowerCase().includes(val.toLowerCase())
    )
  } else {
    data = originOptions
  }
  emit('update:dataOptions', originOptions)
})

const searchFn = () => {
  const data = props.dataOptions.filter(
    it => it.label?.toLowerCase().includes(kw.value.toLowerCase())
  )
  emit('update:dataOptions', data)
}

const confirmFn = () => {
  visible.value = false
  updateCheckeType()
}

const updateCheckeType = () => {
  let checkType
  if(props.dataOptions.every(it => !it.checked)) {
    checkType =  -1
  } else {
    checkType = props.dataOptions.filter(it => it.checked).map(it => it.value).join(',')
  }
  emit('select', checkType)
}

const changeVisibleFn =() => {
  // 显示弹框 重置kw
  if(visible.value) {
    kw.value = ''
    searchFn()
  }
}

// 切换选中状态
const updateSelect = (item, type) => {
  if(type === 'all') {
     checkAll.value = !checkAll.value
  } else {
     item.checked = !item.checked
  }
}

const removeHandle = (it) => {
  it.checked = false
  updateCheckeType()
}
const emit = defineEmits(['update:dataOptions', 'select'])
</script>
<template>
  <div class="select-wrap">
    <a-dropdown :trigger="['click']" v-model:visible="visible" @visibleChange="changeVisibleFn" :disabled="props.disabled">
      <div :class="{ 'columns-wrap': true, fold: visible }">
        <div class="select-column" v-for="it in checkedColums.slice(0, props.maxNum)">
          <BiIcon v-if="props.showSvg" :name="getTypeIconSvg(it)" :class="getTypeIconClassName(it)" />
          <span :title="it.label">{{ it.label }}</span>
          <BiIcon name="close" @click.stop="removeHandle(it)" />
        </div>
        <div  class="placeholder" v-if="checkedColums.length===0">{{ props.placeholder }}</div>
        <span class="other" v-if="checkedColums.length > props.maxNum">+{{ checkedColums.length - props.maxNum }}</span>
      </div>
      <template #overlay>
        <div class="select-column-overlay-wrap">
          <div class="search-wrap" v-if="props.canSearch">
            <input v-model="kw" type="text" @input="searchFn" />
          </div>
          <div class="check-all" @click="updateSelect(null, 'all')">
            <i :class="{ checked: checkAll }"></i>
            <span>{{ t('common.selectAll') }}</span>
          </div>
          <div class="column-list">
            <div class="column-item" v-for="column in props.dataOptions" @click="updateSelect(column, 'single')">
              <i :class="{ checked: column.checked }"></i>
              <BiIcon v-if="props.showSvg" :name="getTypeIconSvg(column)" :class="getTypeIconClassName(column)" />
              <span class="name" :title="column.label">{{ column.label }}</span>
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
        max-width: 70px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .other {
      font-size: 13px;
    }
    .placeholder{
      color: #C2C2C2;
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
 