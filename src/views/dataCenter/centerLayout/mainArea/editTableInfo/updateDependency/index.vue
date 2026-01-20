<!-- 更新依据 -->
<script setup>
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { getIconSrc} from '@/utils/utils'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN';
import Lo from '@/locale/lang/lo-datepicker'

const { locale } = useI18n()

const props = defineProps({
  codeList: {
    type: Array,
    required: true,
    default: []
  }
})

const dateFormat = 'YYYY-MM-DD HH:mm:ss'

const OPERATORS_MAP = {
  // 等于 不等于
  text: [
    { label: '等于', value: 'eq' }, 
    { label: '不等于', value: 'ne' }
  ],
  // 等于 不等于 大于 大于等于 小于 小于等于 介于
  number: [
    { label: '等于', value: 'eq' }, 
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' }, 
    { label: '大于等于', value: 'gte' },
    { label: '小于', value: 'lt' }, 
    { label: '小于等于', value: 'lte' },
    { label: '介于', value: 'between' }
  ],
  // 等于 不等于 介于 早于 晚于
  time: [
    { label: '等于', value: 'eq' }, 
    { label: '不等于', value: 'ne' },
    { label: '介于', value: 'between' }, 
    { label: '早于', value: 'lt' }, 
    { label: '晚于', value: 'gt' }
  ]
}

// 数值类型介于操作下拉列表
const BETWEEN_OPTION = {
  left: [ { label: '<', value: 'gt'}, { label: '<=', value: 'gte'} ],
  right: [ { label: '<', value: 'lt'}, { label: '<=', value: 'lte'} ]
}

const filterInfo = ref({
  symbol: undefined,
  fieldType: 'text',  // 更新依据字段 字段类型
  leftExpression: {
    content: '',
    type: 'column',
  },
  rightExpression: {
    content: '',
    type: 'value',  // 表达式类型
    valueType: 'string' // 数据值的类型
  },
  betweenStartExpression: {
    content: '',
    type: 'value',
    valueType: 'string'
  },
  betweenEndExpression: {
    content: '',
    type: 'value',
    valueType: 'string'
  },
  betweenStartSymbol: 'gte',
  betweenEndSymbol: 'lte'
})

onMounted(() => {
  datePickerLocal()
})

const operators = computed(() => {
  return OPERATORS_MAP[filterInfo.value.fieldType]
})

const updateRangeTye = computed(() => {
  let symbol = filterInfo.value.symbol
  let fieldType = filterInfo.value.fieldType
  if(!symbol) {
    return fieldType === 'time' ? 'singleTimeInput' : 'singleTextInput'
  }
  
  // 非时间类型
  if(fieldType !== 'time' ) {
    // 非介于 单个文本输入
    if(symbol !== 'between') return 'singleTextInput'
    return 'doubleTextInput'
  }

  // 非介于 单个时间输入
  if(symbol !== 'between') {
    return 'singleTimeInput'
  }
  return 'doubleTimeInput'
})

const datePickerLocal = async () => {
  if (locale.value === 'lo') {
    const lo = await import('dayjs/locale/lo');
    dayjs.locale(lo)
  } else {
    const zh = await import('dayjs/locale/zh-cn');
    dayjs.locale(zh)
  }
}

// 重置筛选信息
const resetFilterInfo = () => {
  filterInfo.value = {
    symbol: undefined,
    fieldType: 'text', 
    leftExpression: {
      content: '',
      type: 'column',
    },
    rightExpression: {
      content: '',
      type: 'value',
      valueType: 'string'
    },
    betweenStartExpression: {
      content: '',
      type: 'value',
      valueType: 'string'
    },
    betweenEndExpression: {
      content: '',
      type: 'value',
      valueType: 'string'
    },
    betweenStartSymbol: 'gte',
    betweenEndSymbol: 'lte'
  }
}

const selectFieldFn = (value, option) => {
  // 更改字段重置筛选信息
  resetFilterInfo()
  let imgType = option.imgType
  if (imgType === 'textImg') {
    filterInfo.value.fieldType = 'text'
    filterInfo.value.rightExpression.valueType = 'string'
  } else if (imgType === 'numImg') {
    filterInfo.value.fieldType = 'number'
    filterInfo.value.rightExpression.valueType = 'double'
    filterInfo.value.betweenStartExpression.valueType = 'double'
    filterInfo.value.betweenEndExpression.valueType = 'double'
  } else {
    filterInfo.value.fieldType = 'time'
    filterInfo.value.rightExpression.valueType = 'date'
    filterInfo.value.betweenStartExpression.valueType = 'date'
    filterInfo.value.betweenEndExpression.valueType = 'date'
  }
  filterInfo.value.leftExpression.content = value
}

const selectOperationFn = (value) => {
  // let curField = filterInfo.value.leftExpression.content
  // let curFileldType = filterInfo.value.fieldType
  // resetFilterInfo()
  // filterInfo.value.leftExpression.content = curField
  // filterInfo.value.fieldType = curFileldType
  filterInfo.value.symbol = value
}

// 日期类型字段处理 dajs对象转为字符串
const timeFieldHandle = (filterData) => {
  if(filterData.fieldType !== 'time') return

  let rightContent = filterData.rightExpression.content,
      startContent = filterData.betweenStartExpression.content,
      endContent = filterData.betweenEndExpression.content

  if(!rightContent && (!startContent || !endContent)) return
  
  if(filterData.symbol !== 'between') {
    rightContent = rightContent.format(dateFormat)
  } else {
    startContent = startContent.format(dateFormat)
    endContent = endContent.format(dateFormat)
  }

  return [{
    uuid: uuidv4(),
    action: 'where',
    contents: [{
      ...filterData,
      rightExpression: {
        ...filterData.rightExpression,
        content: rightContent
      },
      betweenStartExpression: {
        ...filterData.betweenEndExpression,
        content: startContent
      },
      betweenEndExpression: {
        ...filterData.betweenEndExpression,
        content: endContent
      }
    }]
  }]
}

// 日期类型字段初始化 字符串转为dajs对象
const timeFieldInit = (updateInfo) => {
  if(updateInfo?.fieldType !== 'time') return

  let rightContent = updateInfo.rightExpression.content,
      startContent = updateInfo.betweenStartExpression.content,
      endContent = updateInfo.betweenEndExpression.content

  if(updateInfo.symbol !== 'between') {
    updateInfo.rightExpression.content = rightContent ? dayjs(rightContent, dateFormat) : null
  } else {
    updateInfo.betweenStartExpression.content = startContent ? dayjs(startContent, dateFormat) : null
    updateInfo.betweenEndExpression.content = endContent ? dayjs(endContent, dateFormat) : null
  }

  return updateInfo
}

defineExpose({
  getDependencyInfo(){
    let filterData = filterInfo.value
    let handleRes = timeFieldHandle(filterData)
    return handleRes ? handleRes : [{
      uuid: uuidv4(),
      action: 'where',
      contents: [filterData]
    }]
  },
  setDependencyInfo(updateParams){
    if(!updateParams) return

    let { partUpdateColumn, partUpdateStartValue, partUpdateEndValue,  selfConfigWhere } = updateParams

    // 回显新版更新依据数据
    if(selfConfigWhere && selfConfigWhere[0].contents[0]) {
      let updateInfo = selfConfigWhere[0].contents[0]
      let initRes = timeFieldInit(updateInfo)
      filterInfo.value = initRes ? initRes : updateInfo
      return
    }

    // 回显旧版更新依据数据 (依据"数值字段"设置更新范围)
    if(partUpdateColumn && partUpdateStartValue && partUpdateEndValue) {
      filterInfo.value.fieldType = 'number'
      filterInfo.value.symbol = 'between'
      filterInfo.value.leftExpression.content = partUpdateColumn
      filterInfo.value.betweenStartExpression.content = partUpdateStartValue
      filterInfo.value.betweenEndExpression.content = partUpdateEndValue
      return
    }
  }
})
</script>

<template>
  <div class="updateDependency">
    <span>更新依据</span>
    <!-- 依据字段 -->
    <a-select
      class="targetField"
      v-model:value="filterInfo.leftExpression.content" 
      placeholder="请选择"
      @select="selectFieldFn"
    >
      <a-select-option v-for="item in codeList" :value="item.columnName" :imgType="item.imgType">
        <span role="img">
          <img style="width: 16px" :src="getIconSrc(item)"/>
        </span>
        {{ item.columnAlias || item.columnName }}
      </a-select-option>
    </a-select>

    <div class="filterInputWrap">
      <!-- 筛选条件 -->
      <a-select 
        v-model:value="filterInfo.symbol"
        class="operatorWrap"
        placeholder="请选择"
        @select="selectOperationFn"
      >
        <a-select-option v-for="item in operators" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>

      <!-- 文本、数值 非介于 -->
      <template v-if="updateRangeTye === 'singleTextInput'">
        <BiInput v-model="filterInfo.rightExpression.content"/>
      </template>

      <!-- 数值介于 -->
      <template v-else-if="updateRangeTye === 'doubleTextInput'">
        <BiInput v-model="filterInfo.betweenStartExpression.content"/>
        <div class="numberBetweenWrap">
          <!-- 切换大于等于 -->
          <a-select class="betweenSelect" v-model:value="filterInfo.betweenStartSymbol">
            <a-select-option v-for="item in BETWEEN_OPTION.left" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
          <span>值</span>
          <!-- 切换小于等于 -->
          <a-select class="betweenSelect" v-model:value="filterInfo.betweenEndSymbol">
            <a-select-option v-for="item in BETWEEN_OPTION.right" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </div>
        <BiInput v-model="filterInfo.betweenEndExpression.content"/>
      </template>

      <!-- 时间非介于 -->
      <template v-if="updateRangeTye === 'singleTimeInput'">
        <a-date-picker 
          :locale="locale === 'lo' ? Lo : zhCN"
          show-time
          :format="dateFormat"
          v-model:value="filterInfo.rightExpression.content"
        />
      </template>

      <!-- 时间介于 -->
      <div v-if="updateRangeTye === 'doubleTimeInput'" class="timeBeweenWrap">
        <a-date-picker 
          :locale="locale === 'lo' ? Lo : zhCN"
          show-time
          :format="dateFormat"
          v-model:value="filterInfo.betweenStartExpression.content"
        />
        <span>至</span>
        <a-date-picker
          :locale="locale === 'lo' ? Lo : zhCN"
          show-time
          :format="dateFormat"
          v-model:value="filterInfo.betweenEndExpression.content"
        />
      </div>
    </div>
  </div>
</template>

<style lang='less' scoped>
.updateDependency{
  display: flex;
  align-items: center;
  &>span:first-of-type{
    margin-right: 10px;
  }
  .targetField{
    width: 150px;
  }
  .filterInputWrap {
    display: flex;
    .operatorWrap{
      width: 100px;
      margin: 0 8px;
    }
    .numberBetweenWrap{
      display: flex;
      align-items: center;
      .betweenSelect{
        width: 60px;
        margin: 0 8px;
      }
    }
    .timeBeweenWrap{
      display: flex;
      align-items: center;
      &>span{
        margin: 0 8px;
      }
    }
  }
}
</style>
