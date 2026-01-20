<!-- 筛选 -->
<template>
  <div class="filterData">
    <div class="btnGroup">
      <myButton @click="addRelation(1)" class="pbtn" type="primary">{{
        t('selfConfig.addRelationAnd')
      }}</myButton>
      <myButton @click="addRelation(2)" class="pbtn" type="primary">{{
        t('selfConfig.addRelationOr')
      }}</myButton>
      <myButton @click="addRelation(3)" class="tbtn">{{ t('selfConfig.addCondition') }}</myButton>
      <myButton @click="addRelation(4)" class="tbtn">{{ t('selfConfig.addFormula') }}</myButton>
      <a-tooltip color="rgba(24, 30, 51, 0.8);">
        <template #title>
          {{ t('selfConfig.andTip') }} <br />
          {{ t('selfConfig.orTip') }}
        </template>
        <img src="@/assets/icons/info.png" alt="" />
      </a-tooltip>
    </div>
    <div class="setting">
      <Tree
        flag="init"
        :filterData="sortItemList"
        @appendNesting="appendNesting"
        @editRuleFn="editRuleFn"
        @addFormula="addRelation(4)"
        ref="RefTreeComponent"
      />
    </div>
  </div>
  <addFormulaModal
    v-if="filterModalVisible"
    :editRuleInfo="editRuleInfo"
    :sortItemIndex="sortItemIndex"
    @changeParams="changeParamsFn"
  />
</template>

<script setup>
import myButton from '@/components/buttons/myButton.vue'
import Tree from './tree.vue'
import addFormulaModal from './addFormulaModal.vue'
import { useI18n } from 'vue-i18n'
import { replaceFormulaExpression } from '@/utils/config'

const { t } = useI18n()
const editRuleInfo = ref([
  {
    leftExpression: {
      type: 'column', //类型 可选:column-表列;value-值
      content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
      valueType: '' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
    },
    symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
    rightExpression: {
      type: 'value', //类型 可选:column-表列;value-值
      content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
      valueType: 'string' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
    }, //右表达式 结构同左表达式
    logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
    betweenEndSymbol: 'lte',
    betweenStartSymbol: 'gte',
    betweenStartExpression: {
      type: 'value', //类型 可选:column-表列;value-值
      content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
      valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
    }, //between开始条件
    betweenEndExpression: {
      type: 'value', //类型 可选:column-表列;value-值
      content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
      valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
    } //between结束条件
  }
])

const sortItemIndex = ref(-1)

const filterModalVisible = ref(false)

provide('FORMULA_MODAL_STATE', {
  visible: filterModalVisible
})

// 筛选配置项应用于回显
const filterOptions = inject('FILTER_OPTIONS', [])

const RefTreeComponent = ref(null)

const sortItemList = ref([
  {
    leftExpression: {
      type: 'column', //类型 可选:column-表列;value-值
      content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
      valueType: '' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
    },
    symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
    rightExpression: {
      type: 'value', //类型 可选:column-表列;value-值
      content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
      valueType: 'string' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
    }, //右表达式 结构同左表达式
    logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
    betweenEndSymbol: 'lte',
    betweenStartSymbol: 'gte',
    betweenStartExpression: {
      type: 'value', //类型 可选:column-表列;value-值
      content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
      valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
    }, //between开始条件
    betweenEndExpression: {
      type: 'value', //类型 可选:column-表列;value-值
      content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
      valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
    } //between结束条件
  }
])

watch(
  filterOptions,
  () => {
    if (!Array.isArray(filterOptions?.value) || !Array.isArray(filterOptions.value[0]?.contents)) {
      return
    }
    sortItemList.value = filterOptions.value[0].contents
  },
  {
    immediate: true
  }
)

// 确定改变筛选参数回调
const changeParamsFn = (editItemIndex, info) => {
  info.backExpression = info.expression
  info.expression = replaceFormulaExpression(info.expression)
  updateParams(editItemIndex, info)
}

// 编辑公式信息
const editRuleFn = (item, index) => {
  if (item.symbol == 'exp') {
    editRuleInfo.value = [
      {
        expression: item.leftExpression.backContent || item.leftExpression.content,
        params: item.leftExpression.params
      }
    ]
  } else if (item.symbol == 'regexp') {
    editRuleInfo.value = [
      {
        expression: item.leftExpression.expression,
        params: item.leftExpression.params,
        customData: item.customData
      }
    ]
  }
  sortItemIndex.value = index
  filterModalVisible.value = true
}

// TODO: 多选 属于 不属于 条件
// const targetTableId = computed(() => {
//   if (!tableSource?.value[0]) return
//   return tableSource.value[0].contents.tableId
// })

// 注入自助配置选表ID
// provide('TARGET_TABLE_ID', targetTableId)

const addRelation = type => {
  if (type === 1) {
    sortItemList.value.push({
      leftExpression: {
        type: 'column', //类型 可选:column-表列;value-值
        content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
        valueType: '' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      },
      symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
      rightExpression: {
        type: 'value', //类型 可选:column-表列;value-值
        content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
        valueType: 'string' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      }, //右表达式 结构同左表达式
      logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
      betweenEndSymbol: 'lte',
      betweenStartSymbol: 'gte',
      betweenStartExpression: {
        type: 'value', //类型 可选:column-表列;value-值
        content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
        valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      }, //between开始条件
      betweenEndExpression: {
        type: 'value', //类型 可选:column-表列;value-值
        content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
        valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      } //between结束条件
    })
  } else if (type === 2) {
    if (sortItemList.value.length > 0) {
      sortItemList.value[sortItemList.value.length - 1].nesting = [
        {
          leftExpression: {
            type: 'column', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: '' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          },
          symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
          rightExpression: {
            type: 'value', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: 'string' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          }, //右表达式 结构同左表达式
          logic: 'OR', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
          betweenEndSymbol: 'lte',
          betweenStartSymbol: 'gte',
          betweenStartExpression: {
            type: 'value', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          }, //between开始条件
          betweenEndExpression: {
            type: 'value', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          } //between结束条件
        }
      ]
    } else {
      sortItemList.value.push({
        leftExpression: {
          type: 'column', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: '' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        },
        symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
        rightExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'string' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //右表达式 结构同左表达式
        logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        betweenEndSymbol: 'lte',
        betweenStartSymbol: 'gte',
        betweenStartExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between开始条件
        betweenEndExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        } //between结束条件
      })
    }
  } else if (type === 3) {
    sortItemList.value.push({
      leftExpression: {
        type: 'column', //类型 可选:column-表列;value-值
        content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
        valueType: '' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      },
      symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
      rightExpression: {
        type: 'value', //类型 可选:column-表列;value-值
        content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
        valueType: 'string' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      }, //右表达式 结构同左表达式
      logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
      betweenEndSymbol: 'lte',
      betweenStartSymbol: 'gte',
      betweenStartExpression: {
        type: 'value', //类型 可选:column-表列;value-值
        content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
        valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      }, //between开始条件
      betweenEndExpression: {
        type: 'value', //类型 可选:column-表列;value-值
        content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
        valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      } //between结束条件
    })
  } else {
    sortItemIndex.value = -1
    editRuleInfo.value = []
    filterModalVisible.value = true
  }
}
// 更新筛选参数
const updateParams = (editItemIndex = -1, info) => {
  // 新增筛选条件
  if (editItemIndex === -1) {
    let filterItem
    if (info.customData) {
      filterItem = {
        leftExpression: {
          type: 'column', //类型 可选:column-表列;value-值;multiValue-多值表达式;expression-表达式
          content: info?.params[0]?.content, //值 当type为column是 此值为列名;当type是value时 此值为具体值;当type是multiValue时 此值为','分隔的字符串;当type为expression时 此值为公式模板
          valueType: '', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          params: info.params, //当type为expression时有此值 格式见4的params
          expression: info.expression
        },
        symbol: 'regexp', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; regexp 正则匹配
        rightExpression: {
          type: 'value',
          content: info.customData.content,
          valueType: 'string'
        }, //右表达式 结构同左表达式
        logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        betweenEndSymbol: 'lte',
        betweenStartSymbol: 'gte',
        betweenStartExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between开始条件
        betweenEndExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between结束条件
        customData: info.customData, //自定义函数内容
        info: info.value //公式内容
      }
    } else {
      filterItem = {
        leftExpression: {
          type: 'expression', //类型 可选:column-表列;value-值;multiValue-多值表达式;expression-表达式
          content: info.expression, //值 当type为column是 此值为列名;当type是value时 此值为具体值;当type是multiValue时 此值为','分隔的字符串;当type为expression时 此值为公式模板
          valueType: '', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          params: info.params, //当type为expression时有此值 格式见4的params
          backContent: info.backExpression  // 用于自定义高级函数编辑回显
        },
        symbol: 'exp', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
        rightExpression: {}, //右表达式 结构同左表达式
        logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        betweenEndSymbol: 'lte',
        betweenStartSymbol: 'gte',
        betweenStartExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between开始条件
        betweenEndExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between结束条件
        info: info.value //公式内容
      }
    }
    sortItemList.value.push(filterItem)
  }
  // 编辑已有筛选条件
  if (editItemIndex >= 0) {
    sortItemList.value[editItemIndex].leftExpression.content = info.expression
    sortItemList.value[editItemIndex].leftExpression.params = info.params
    sortItemList.value[editItemIndex].info = info.value
  }
}

const validateFilterSymbol = item => {
  if (item.nesting?.length) {
    item.nesting = item.nesting.filter(it => {
      it.symbol && validateFilterSymbol(it)

      if (['between', 'notBetween'].includes(it.symbol)) {
        return it.betweenStartExpression.content && it.betweenEndExpression.content
      }

      return it.symbol
    })
  }
}

const removeKey = item => {
  if (item.nesting?.length) {
    item.nesting.forEach(it => {
      it.symbol && removeKey(it)
      if (it.operationList) {
        delete it.operationList
      }
    })
  }
}

const appendNesting = value => {
  if (value.content && value.content.length > 0) {
    value.content.forEach((val, index) => {
      if (val.isNesting) {
        delete val['isNesting']
        if (val.logic == 'OR') {
          val.logic = 'AND'
        } else if (val.logic == 'AND') {
          val.logic = 'OR'
        }
      }
      sortItemList.value.splice(value.index + index, 0, val)
    })
  }
}

defineExpose({
  getFilterData() {
    // 过滤筛选条件为空的筛选项
    let sortList = sortItemList.value.filter(item => {
      item.symbol && validateFilterSymbol(item)
      if (['between', 'notBetween'].includes(item.symbol)) {
        return item.betweenStartExpression.content && item.betweenEndExpression.content
      }
      return item.symbol
    })
    return sortList
  },
  // 移除无用属性
  removeTrashKey() {
    sortItemList.value.forEach(item => {
      removeKey(item)
      if (item.operationList) {
        delete item.operationList
      }
    })
  },
  // 重置筛选信息
  resetFilterInfo() {
    sortItemList.value = [
      {
        leftExpression: {
          type: 'column', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: '' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        },
        symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
        rightExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'string' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //右表达式 结构同左表达式
        logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        betweenEndSymbol: 'lte',
        betweenStartSymbol: 'gte',
        betweenStartExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between开始条件
        betweenEndExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date' //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        } //between结束条件
      }
    ]
  }
})
</script>

<style lang="less" scoped>
.filterData {
  .btnGroup {
    height: 32px;
    margin-bottom: 16px;
    position: relative;
    display: flex;
    align-items: center;
    .pbtn {
      margin-right: 20px;
    }
    .tbtn {
      margin-right: 20px;
    }
    img {
      width: 24px;
    }
  }
}
</style>
