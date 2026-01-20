<template>
  <div class="girdBox" v-if="data.length > 0">
    <div class="gird-right">
      <div class="gird-tree">
        <div class="condition-item" :key="index" v-for="(fliterItem, index) in data">
          <div v-if="fliterItem.symbol == 'exp'">
            <span class="rule-container">{{ fliterItem.info }}</span>
            <img
              src="@/assets/icons/delete.png"
              class="del"
              @click="removeFliter(index)"
              alt="delete"
            />
          </div>
          <div class="filterWrap" v-if="fliterItem.symbol == '' || fliterItem.symbol != 'exp'">
            <!-- 筛选字段 -->
            <a-select
              v-model:value="fliterItem.leftExpression.content"
              class="condition-sele mid-wid"
              @select="conditionChange(fliterItem, 'leftCondition')"
              show-search
              :filter-option="filterOption"
            >
              <a-select-option
                v-for="item in optionList"
                :label="item.columnAlias || item.columnName"
                :value="item.columnName"
                :disabled="item.disabled"
                @click="onSelectChange(item, fliterItem)"
              >
                <span role="img">
                  <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                </span>
                {{ item.columnAlias || item.columnName }}
              </a-select-option>
            </a-select>

            <!-- 筛选条件 -->
            <a-select
              v-model:value="fliterItem.symbol"
              class="condition-sele small-wid"
              @select="conditionChange(fliterItem, 'changeSymbol')"
            >
              <a-select-option
                :title="t(item.text)"
                v-for="item in fliterItem.operationList"
                :value="item.symbol"
                :style="{ borderBottom: item.border ? '1px solid #F2F3F5' : '' }"
              >
                {{ t(item.text) }}
              </a-select-option>
            </a-select>

            <!-- 条件输入框 -->
            <mutipleSelect 
              v-if="['in', 'notIn'].includes(fliterItem.symbol)"
              :columnName="fliterItem.leftExpression.content"
              :multiValue="fliterItem.rightExpression.content"
              @selectField="(columns)=>selectFn(columns, fliterItem)"
            />
            
            <template v-else>

            <a-input
              v-if="
                !(
                  fliterItem.symbol === 'notnull' ||
                  fliterItem.symbol === 'isnull' ||
                  fliterItem.symbol === 'isblank' ||
                  fliterItem.symbol === 'notblank'
                ) &&
                fliterItem.codeType !== 'date' &&
                !['between', 'notBetween'].includes(fliterItem.symbol)
              "
              v-model:value.trim="fliterItem.rightExpression.content"
              :key="index"
              class="condition-input"
              placeholder=""
              @change="conditionChange(fliterItem)"
            />

            <template
              v-if="
                !(
                  fliterItem.symbol === 'notnull' ||
                  fliterItem.symbol === 'isnull' ||
                  fliterItem.symbol === 'isblank' ||
                  fliterItem.symbol === 'notblank'
                ) &&
                fliterItem.codeType !== 'date' &&
                ['between', 'notBetween'].includes(fliterItem.symbol)
              "
            >
              <input
                class="condition-sele"
                style="width: 105px"
                type="text"
                v-model.trim="fliterItem.betweenStartExpression.content"
                @change="conditionChange(fliterItem)"
              />
              <a-select
                class="condition-sele"
                style="width: 60px"
                v-model:value="fliterItem.betweenStartSymbol"
                @select="conditionChange(fliterItem)"
              >
                <a-select-option value="gt">{{ `<` }}</a-select-option>
                <a-select-option value="gte">{{ `<=` }}</a-select-option>
              </a-select>
              <span class="condition-sele">{{ t('selfConfig.value') }}</span>
              <a-select
                class="condition-sele"
                style="width: 60px"
                v-model:value="fliterItem.betweenEndSymbol"
                @select="conditionChange(fliterItem)"
              >
                <a-select-option value="lt">{{ `<` }}</a-select-option>
                <a-select-option value="lte">{{ `<=` }}</a-select-option>
              </a-select>
              <input
                style="width: 105px"
                type="text"
                v-model.trim="fliterItem.betweenEndExpression.content"
                @change="conditionChange(fliterItem)"
              />
            </template>

            <template
              v-if="
                !(
                  fliterItem.symbol === 'notnull' ||
                  fliterItem.symbol === 'isnull' ||
                  fliterItem.symbol === 'isblank' ||
                  fliterItem.symbol === 'notblank'
                ) && fliterItem.codeType === 'date'
              "
            >
              <!-- 日期介于 -->
              <template v-if="['between', 'notBetween'].includes(fliterItem.symbol)">
                <a-date-picker
                  show-time
                  placeholder=""
                  :locale="locale === 'lo' ? Lo : zhCN"
                  format="YYYY-MM-DD HH:mm:ss"
                  @change="(a, b) => dateChange(fliterItem, a, b, 1)"
                  class="mid-wid condition-sele"
                />
                <span class="condition-sele">{{ t('selfConfig.to') }}</span>
                <a-date-picker
                  show-time
                  placeholder=""
                  :locale="locale === 'lo' ? Lo : zhCN"
                  @change="(a, b) => dateChange(fliterItem, a, b, 2)"
                  class="mid-wid condition-sele"
                />
              </template>

              <!-- 日期最早/晚的N个 -->
              <a-input
                v-else-if="['topN', 'topNAsc'].includes(fliterItem.symbol)"
                v-model:value.trim="fliterItem.rightExpression.content" 
                :key="index" 
                class="condition-input" 
                placeholder="N=" 
                @change="conditionChange(fliterItem)"
              />

              <!-- 单个日期输入框 -->
              <a-date-picker
                v-else
                show-time
                :locale="locale === 'lo' ? Lo : zhCN"
                placeholder=""
                format="YYYY-MM-DD HH:mm:ss"
                @change="(a, b) => dateChange(fliterItem, a, b, 3)"
                class="mid-wid condition-sele"
              />
            </template>

            </template>
            <template v-if="flag == 'init'">
              <img
                v-if="data.length > 1"
                src="@/assets/icons/delete.png"
                class="del"
                @click="removeFliter(index)"
                alt="删除图标"
              />
            </template>
            <template v-if="flag != 'init'">
              <img
                src="@/assets/icons/delete.png"
                class="del"
                @click="removeFliter(index)"
                alt="删除图标"
              />
            </template>
          </div>
        </div>
        <div class="addRelationbtn" @click="addRelationFn">
          <img src="@/assets/icons/add_relation.png" alt="" />
          {{ t('selfConfig.add') }}
        </div>
      </div>
      <!-- <div :key="index" v-for="(fliterItem, index) in data">
        <Menu
          v-if="fliterItem.nesting"
          :data="fliterItem.nesting"
          @updataTableData="filedChangeHandle"
          @appendNesting="appendNesting"
        />
      </div> -->
    </div>
  </div>
</template>
<script setup>
import { defineExpose, onMounted, watch } from 'vue'
import { modalStore } from '@/Stores/modalStore'
// import Menu from '@/components/fliter/tree.vue'
import dayjs from 'dayjs'
import text_img from '@/assets/icons/text.png'
import num_img from '@/assets/icons/number.png'
import time_img from '@/assets/icons/time.png'
import { textOperationList, numberOperationList, timeOperationList } from '@/utils/config'
import { useI18n } from 'vue-i18n'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN'
import Lo from '@/locale/lang/lo-datepicker'
import mutipleSelect from '@/components/multipleSelect'

const { t, locale } = useI18n()
onMounted(() => {
  datePickerLocal()
})
const datePickerLocal = async () => {
  if (locale.value === 'lo') {
    const lo = await import('dayjs/locale/lo')
    dayjs.locale(lo)
  } else {
    const zh = await import('dayjs/locale/zh-cn')
    dayjs.locale(zh)
  }
}
watch(locale, () => {
  datePickerLocal()
})

const useModalStore = modalStore()
const props = defineProps({
  data: {
    type: Array,
  },
  flag: {
    default: '',
  },
  optionList: {
    type: Array,
  },
})

const emit = defineEmits(['updataTableData', 'appendNesting'])

const addRelationFn = () => {
  addRelation(1)
}

const selectFn = (columnNames, fliterItem) => {
  fliterItem.rightExpression = {
    type: 'multiValue',
    content: columnNames,
  }
  conditionChange(fliterItem)
}

//添加条件
const addRelation = type => {
  if (type === 1) {
    if (
      props.data[props.data.length - 1] &&
      props.data[props.data.length - 1].logic &&
      ((props.data[props.data.length - 1].logic == 'OR' &&
        props.data[props.data.length - 1].isNesting) ||
        (props.data[props.data.length - 1].logic == 'AND' &&
          !props.data[props.data.length - 1].isNesting))
    ) {
      props.data.push({
        leftExpression: {
          type: 'column', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: '', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        },
        symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
        rightExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'string', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //右表达式 结构同左表达式
        logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        betweenEndSymbol: 'lte',
        betweenStartSymbol: 'gte',
        betweenStartExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between开始条件
        betweenEndExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between结束条件
      })
      // delete props.data[props.data.length-1]['isNesting'];
    } else if (
      props.data[props.data.length - 1] &&
      props.data[props.data.length - 1].logic &&
      ((props.data[props.data.length - 1].logic == 'OR' &&
        !props.data[props.data.length - 1].isNesting) ||
        (props.data[props.data.length - 1].logic == 'AND' &&
          props.data[props.data.length - 1].isNesting))
    ) {
      props.data[props.data.length - 1].nesting = [
        {
          leftExpression: {
            type: 'column', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: '', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          },
          symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
          rightExpression: {
            type: 'value', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: 'string', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          }, //右表达式 结构同左表达式
          logic: 'OR', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
          isNesting: true, //有嵌套，需要特殊判断logic改变，记得去掉
          betweenEndSymbol: 'lte',
          betweenStartSymbol: 'gte',
          betweenStartExpression: {
            type: 'value', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          }, //between开始条件
          betweenEndExpression: {
            type: 'value', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          }, //between结束条件
        },
      ]
    } else {
      // props.data.push({
      //     "leftExpression":{
      //         "type":"column",//类型 可选:column-表列;value-值
      //         "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
      //         "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      //     },
      //     "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
      //     "rightExpression":{
      //         "type":"value",//类型 可选:column-表列;value-值
      //         "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
      //         "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      //     },//右表达式 结构同左表达式
      //     "logic":"AND",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
      // })
    }
  } else if (type === 2) {
    if (
      props.data[props.data.length - 1] &&
      props.data[props.data.length - 1].logic &&
      ((props.data[props.data.length - 1].logic == 'AND' &&
        props.data[props.data.length - 1].isNesting) ||
        (props.data[props.data.length - 1].logic == 'OR' &&
          !props.data[props.data.length - 1].isNesting))
    ) {
      props.data.push({
        leftExpression: {
          type: 'column', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: '', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        },
        symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
        rightExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'string', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //右表达式 结构同左表达式
        logic: 'OR', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        betweenEndSymbol: 'lte',
        betweenStartSymbol: 'gte',
        betweenStartExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between开始条件
        betweenEndExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between结束条件
      })
      // delete props.data[props.data.length-1]['isNesting'];
    } else if (
      props.data[props.data.length - 1] &&
      props.data[props.data.length - 1].logic &&
      ((props.data[props.data.length - 1].logic == 'AND' &&
        !props.data[props.data.length - 1].isNesting) ||
        (props.data[props.data.length - 1].logic == 'OR' &&
          props.data[props.data.length - 1].isNesting))
    ) {
      props.data[props.data.length - 1].nesting = [
        {
          leftExpression: {
            type: 'column', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: '', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          },
          symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
          rightExpression: {
            type: 'value', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: 'string', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          }, //右表达式 结构同左表达式
          logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
          isNesting: true, //有嵌套，需要特殊判断logic改变，记得去掉
          betweenEndSymbol: 'lte',
          betweenStartSymbol: 'gte',
          betweenStartExpression: {
            type: 'value', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          }, //between开始条件
          betweenEndExpression: {
            type: 'value', //类型 可选:column-表列;value-值
            content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
            valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
          }, //between结束条件
        },
      ]
    } else {
      // props.data[props.data.length-1].nesting = [{
      //     "leftExpression":{
      //         "type":"column",//类型 可选:column-表列;value-值
      //         "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
      //         "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      //     },
      //     "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
      //     "rightExpression":{
      //         "type":"value",//类型 可选:column-表列;value-值
      //         "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
      //         "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
      //     },//右表达式 结构同左表达式
      //     "logic":"OR",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
      // }];
    }
  } else if (type === 3) {
    if (
      props.data[props.data.length - 1] &&
      props.data[props.data.length - 1].logic &&
      !props.data[props.data.length - 1].isNesting
    ) {
      props.data.push({
        leftExpression: {
          type: 'column', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: '', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        },
        symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
        rightExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'string', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //右表达式 结构同左表达式
        logic: props.data[props.data.length - 1].logic, //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        betweenEndSymbol: 'lte',
        betweenStartSymbol: 'gte',
        betweenStartExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between开始条件
        betweenEndExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between结束条件
      })
    } else if (
      props.data[props.data.length - 1] &&
      props.data[props.data.length - 1].logic &&
      props.data[props.data.length - 1].logic == 'AND' &&
      props.data[props.data.length - 1].isNesting
    ) {
      // delete props.data[props.data.length-1]['isNesting'];
      props.data.push({
        leftExpression: {
          type: 'column', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: '', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        },
        symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
        rightExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'string', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //右表达式 结构同左表达式
        logic: 'OR', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        betweenEndSymbol: 'lte',
        betweenStartSymbol: 'gte',
        betweenStartExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between开始条件
        betweenEndExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between结束条件
      })
    } else if (
      props.data[props.data.length - 1] &&
      props.data[props.data.length - 1].logic &&
      props.data[props.data.length - 1].logic == 'OR' &&
      props.data[props.data.length - 1].isNesting
    ) {
      // delete props.data[props.data.length-1]['isNesting'];
      props.data.push({
        leftExpression: {
          type: 'column', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: '', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        },
        symbol: '', //符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
        rightExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'string', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //右表达式 结构同左表达式
        logic: 'AND', //与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        betweenEndSymbol: 'lte',
        betweenStartSymbol: 'gte',
        betweenStartExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between开始条件
        betweenEndExpression: {
          type: 'value', //类型 可选:column-表列;value-值
          content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
          valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        }, //between结束条件
      })
    }
  } else if (type === 4) {
    showAddFliterModal()
  }
}
//改变且或关系
const changeLogic = value => {
  if (
    props.data[props.data.length - 1].logic != value &&
    !props.data[props.data.length - 1].isNesting
  ) {
    props.data[props.data.length - 1].logic = value
  } else if (
    props.data[props.data.length - 1].logic == 'AND' &&
    props.data[props.data.length - 1].isNesting
  ) {
    props.data[props.data.length - 1].logic = 'OR'
  } else if (
    props.data[props.data.length - 1].logic == 'OR' &&
    props.data[props.data.length - 1].isNesting
  ) {
    props.data[props.data.length - 1].logic = 'AND'
  }
  emit('updataTableData')
}
//删除条件
const removeFliter = index => {
  if (props.data[index].nesting && props.data[index].nesting.length > 0) {
    if (props.data.length > 1) {
      let dataNodeNest = JSON.parse(JSON.stringify(props.data[index].nesting))
      let dataIndex = index + 1
      if (index == props.data.length - 1) {
        dataIndex = index - 1
      }
      dataNodeNest.forEach((val, dataindex) => {
        if (!props.data[dataIndex].nesting) {
          props.data[dataIndex].nesting = []
        }
        props.data[dataIndex].nesting.unshift(val)
      })
      props.data.splice(index, 1)
      emit('updataTableData')
    } else {
      let dataNodeNest = JSON.parse(JSON.stringify(props.data[index].nesting))
      let param = {
        index: index,
        content: dataNodeNest,
      }
      props.data.splice(index, 1)
      emit('updataTableData')
      emit('appendNesting', param)
    }
  } else {
    props.data.splice(index, 1)
    emit('updataTableData')
  }
}

// 导入数据配置鼠标事件 end
const filedChangeHandle = value => {
  // 同一个字段不能被排序两次
  emit('updataTableData')
}
const dateChange = (data, a, b, t) => {
  if (t === 1) {
    data.betweenStartExpression.content = b
  } else if (t === 2) {
    data.betweenEndExpression.content = b
  } else if (t === 3) {
    data.rightExpression.content = b
  }
  conditionChange(data)
}
const conditionChange = (value, type) => {
  if (
    value.symbol == 'notnull' ||
    value.symbol == 'isnull' ||
    value.symbol === 'isblank' ||
    value.symbol === 'notblank'
  ) {
    // 为空||不为空
    value.rightExpression.content = ''
    emit('updataTableData')
    return
  } else if (['between', 'notBetween'].includes(value.symbol)) {
    // 介于，且左右条件都有
    value.rightExpression.content = ''
    if (value.betweenStartExpression.content && value.betweenEndExpression.content) {
      if (value.codeType === 'number') {
        value.betweenStartExpression.valueType = 'double'
        value.betweenEndExpression.valueType = 'double'
        value.betweenStartExpression.content = Number(value.betweenStartExpression.content)
        value.betweenEndExpression.content = Number(value.betweenEndExpression.content)
      } else {
        value.betweenStartExpression.valueType = 'date'
        value.betweenEndExpression.valueType = 'date'
      }
      emit('updataTableData')
    }
    return
  }

  // 日期/数值字段 valueType完善
  if(value.codeType === 'date') {
    value.rightExpression.valueType = 'date'
  } else if(value.codeType === 'number') {
    value.rightExpression.valueType = 'double'
  } else {
    value.rightExpression.valueType = 'string'
  }

  // 重置左右介于时间
  if (['between', 'notBetween'].includes(value.symbol)) {
    value.betweenStartExpression = {
      type: 'value', //类型 可选:column-表列;value-值
      content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
      valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
    }
    value.betweenEndExpression = {
      type: 'value', //类型 可选:column-表列;value-值
      content: '', //值 当type为column是 此值为列名 当type是value时 此值为具体值
      valueType: 'date', //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
    }
  }

  if(['topN', 'topNAsc'].includes(value.symbol)) {
    value.rightExpression.valueType = 'long'
  }

  // 更改字段类型 重置筛选符号
  if(type === 'leftCondition') {
    value.symbol = ''
  } else if(type === 'changeSymbol' && !['in', 'notIn'].includes(value.symbol)) {
    // 改变符号 多值切换到单值
    value.rightExpression.content = ''
    value.rightExpression.type = 'value'
  }
  
  let rightContent = value.rightExpression.content
  // 属于 不属于 content为数组
  if(Array.isArray(rightContent)) {
    rightContent.length && emit('updataTableData');
    return
  }

  // 筛选字符有值
  if (value.symbol.trim()) {
    emit('updataTableData')
    // value.rightExpression.content = tempContent
  }
}
/**
 * 根据选择字段来匹配对应条件
 * @param {*} v 选中的字段
 * @param {*} f 整个数据集
 */
const onSelectChange = (v, f) => {
  if (v.imgType === 'textImg') {
    if(v.encrypted){
        f.operationList = textOperationList.slice(0, 4).concat(textOperationList.slice(10))
    } else {
        f.operationList = textOperationList
    }
    f.codeType = 'text'
  } else if (v.imgType === 'numImg') {
    f.operationList = numberOperationList
    f.codeType = 'number'
  } else if (v.imgType === 'timeImg') {
    f.operationList = timeOperationList
    f.codeType = 'date'
  }
  f.symbol = ''
}
// 获取字段图标类型
const getIconSrc = item => {
  let { imgType } = item
  if (imgType === 'textImg') {
    return text_img
  } else if (imgType === 'numImg') {
    return num_img
  } else {
    return time_img
  }
}

//删除带有子级的元素，只删除当前的，需要父级添加子级
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
      props.data.splice(value.index + index, 0, val)
    })
  }
}
//是否显示公式弹框
const showAddFliterModal = () => {
  useModalStore.changeAddFliterModalVisible()
}

const filterOption = (input, option) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

defineExpose({
  showAddFliterModal,
})
</script>

<style lang="less" scoped>
.btnGroup {
  height: 32px;
  margin-bottom: 16px;
  .pbtn {
    width: 103px;
    margin-right: 20px;
  }
  .tbtn {
    margin-right: 20px;
  }
  img {
    width: 24px;
  }
}
.setting {
  min-height: 32px;
  width: 100%;
  .girdBox {
    position: relative;
    z-index: 2;
    display: table;
    width: 100%;
    height: 100%;
    white-space: nowrap;
    .gird-symbol {
      position: relative;
      display: table-cell;
      vertical-align: middle;
      width: 34px;
      height: 100%;
      padding-right: 16px;
      .symbol {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .verline {
        position: absolute;
        height: calc(100% + 12px);
      }
      .qie_line {
        border: 1px solid #ffa63f;
      }
      .huo_line {
        border: 1px solid #46b673;
      }
      .condition {
        z-index: 2;
        width: 34px;
        height: 22px;
        border-radius: 4px;
        font-weight: 500;
        font-size: 14px;
        font-feature-settings: 'tnum' on, 'lnum' on;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 4px;
        img {
          width: 8px;
          margin-left: 4px;
        }
      }
      .qie_text {
        background: #f8ebea;
        color: #ffa63f;
      }
      .huo_text {
        color: #46b673;
        background: #eaf8ea;
      }
      .change_box {
        position: absolute;
        width: 38px;
        height: 88px;
        top: 50%;
        left: -5%;
        padding-top: 15px;
      }
      .change {
        background: #ffffff;
        border: 1px solid #e9e9e9;
        box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        li {
          width: 38px;
          height: 40px;
          padding: 10px 12px;
          cursor: pointer;
          &:hover {
            color: #3d82f2;
          }
        }
      }
    }
    .gird-right {
      position: relative;
      display: table-cell;
      vertical-align: middle;
      height: 100%;
      padding-bottom: 50px;
    }
  }
}
.table-container {
  margin-top: 12px;
  padding: 12px;
  box-sizing: border-box;
  background-color: #ffffff;
  .tips {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.4);
  }
}
.tables {
  height: 100%;
  width: 100%;
  background-color: #fff;
}
.addRelationbtn {
  display: flex;
  align-items: center;
  width: 48px;
  height: 32px;
  color: #3d82f2;
  cursor: pointer;
  img {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
}
.addRelationBox {
  position: relative;
  margin-bottom: 10px;
  .selectMenu {
    position: absolute;
    width: 103px;
    background: #ffffff;
    border: 1px solid #e9e9e9;
    box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    left: 0;
    top: 32px;
    padding-top: 4px;
    li {
      height: 40px;
      padding: 10px 0 0 12px;
      cursor: pointer;
      line-height: 20px;
    }
    li:hover {
      background: rgba(61, 130, 242, 0.1);
    }
  }
}
.condition-item {
  margin-bottom: 10px;
  .filterWrap {
    display: flex;
    align-items: center;
  }
  .condition-sele {
    margin-right: 8px;
  }
  .condition-input {
    width: 240px;
  }
  .mid-wid {
    width: 200px;
  }
  .small-wid {
    min-width: 100px;
  }
  .del {
    width: 16px;
    height: 16px;
    cursor: pointer;
    margin-left: 12px;
  }
  .rule-container {
    display: inline-block;
    background: #f3f3f3;
    border-radius: 4px;
    padding: 0 12px;
    line-height: 32px;
    font-size: 14px;
    min-width: 400px;
  }
}
</style>
