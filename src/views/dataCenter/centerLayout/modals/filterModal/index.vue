<template>
  <myModal
    v-if="showFilterModal"
    :modalName="t('selfConfig.filter')"
    @onCancel="onCancel"
    :showBottom="false"
    width="80%"
  >
    <template #modal-body>
      <div class="modalContainer" ref="container">
        <div class="topBox" ref="topBox" :style="{ height: topBoxHeight + 'px' }">
          <div class="topBoxInner">
            <!--标题切换-->
            <div class="basic-tabs" @click="basicTabsChange">
              <div :class="[activeType === 0 ? 'tab-is-active' : '']" id="tab-a">字段筛选</div>
              <div :class="[activeType === 1 ? 'tab-is-active' : '']" id="tab-b">SQL查询</div>
            </div>

            <div class="rightBox">
              <div v-if="activeType === 1" class="click-span" @click="showSqlTips" style="margin-left:20px;"><img src="@/assets/icons/addtable2.png"/>{{ t('common.sqlTips') }}</div>
              <div class="click-span" @click="downloadFn" style="margin-left:20px;"><img src="@/assets/icons/download.png"/>{{ t('common.export') }}</div>
              <template v-if="activeType === 1"><Button style="width:110px;margin-left:20px;" @click="setTemplate"><img src="@/assets/icons/icon_template.png" style="width: 16px;" />{{ t('common.setTemplate') }}</Button></template>
              <template v-if="activeType === 1"><Button style="width:80px;margin-left:20px;" @click="runningFn"><img src="@/assets/icons/icon_run.png" style="width: 16px;" />{{ t('common.running') }}</Button></template>
            </div>
            <div v-show="activeType === 0">
              <filterTree
                :data="filterItemList"
                :optionList="tableColumns"
                flag="init"
                @updataTableData="filterChangeFn"
                @appendNesting="appendNestingFn"
              />
            </div>
            <div v-show="activeType === 1" class="sqlBox">
              <div class="selectTemplate">
                <div class="text">选择模版</div>
                <selectTemplate :value="tmplId" @update:value="selectTempFn" style="width: 348px; min-width: unset;"/>
              </div>
              <div class="text-area" :id="codeEditId"></div>
            </div>
          </div>
        </div>
        <div
          class="resizer" :style="{ top: topBoxHeight + 'px' }"
          @mousedown="startResize"
        ></div>
        <div class="tableContainer" ref="tableBox"  :style="{ height: tableBoxHeight + 'px' }">
          <div class="tableTips">
            <span @click="setRowNum" v-show="activeType === 0">{{ t('indexPage.tableFilterTips1')+ displaySize +t('indexPage.tableFilterTips2') }}</span>
            <span @click="setRowNum" v-show="activeType === 1">{{ t('indexPage.tableFilterTips1')+ sqlDisplaySize +t('indexPage.tableFilterTips2') }}</span>
          </div>
          <div v-show="activeType === 0">
            <a-spin :spinning="loading">
              <div class="tableWrapper"  :style="{ height: (tableBoxHeight-100) + 'px' }" ref="tableRef">
                <myTable
                  v-if="tableColumns.length"
                  :tableColumns="tableColumns"
                  :tableData="tableDataInfo"
                />
                <Empty v-else />
              </div>
            </a-spin>
            <div class="tableBottom">
              <span
              >{{ t('indexPage.beforeDisplay') }} <i>{{ displaySize }}</i>
                {{ t('indexPage.dataSize') }}，{{ t('indexPage.total') }} <i>{{ total }}</i>
                {{ t('indexPage.dataSize') }}</span
              >
              <pagination
                      :current="current"
                      :total="total"
                      :displaySize="displaySize"
                      @pageChange="pageChangeFn"
              />
            </div>
          </div>
          <div v-show="activeType === 1">
            <a-spin :spinning="loadingSql">
              <div class="tableWrapper"  :style="{ height: (tableBoxHeight-100) + 'px' }" ref="tablesqlRef">
                <table class="tableContainer" v-if="sqlDataInfo.length">
                  <tr>
                    <th v-for="(item, i) in sqlDataInfo[0]" :key="i">
                      <div>
                        <span class='text'>{{ i }}</span>
                      </div>
                    </th>
                  </tr>
                  <tr v-for="(item, i) in sqlDataInfo" :key="i">
                    <td v-for="(thItem, index) in item" :key="index">
                      <div class='text' :title="thItem">
                       {{ thItem}}
                      </div>
                    </td>
                  </tr>
                </table>
                <Empty v-else />
              </div>
            </a-spin>
            <div class="tableBottom">
              <span
              >{{ t('indexPage.beforeDisplay') }} <i>{{ sqlDisplaySize }}</i>
                {{ t('indexPage.dataSize') }}，{{ t('indexPage.total') }} <i>{{sqlTotal}}</i>
                {{ t('indexPage.dataSize') }}</span
              >
              <pagination
                      :current="sqlCurrent"
                      :total="sqlTotal"
                      :displaySize="sqlDisplaySize"
                      @pageChange="pageChangeFn"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </myModal>
  <!-- 设置显示行数弹窗 -->
  <rowNumModal
    v-if="showRowNumModal"
    @cancelFn="cancelSetRowNum"
    @confirmFn="confirmSetRowNum"
    :maxValue="activeType === 1 ? sqlTotal : total"
  />
  <templateModal
    :editData="{templateContent:sqlText}"
    :operFlag="'add'"
    :tmplPage="'index'"
    v-if="templateModalVisible" 
  />
</template>

<script setup>
import * as monaco from 'monaco-editor'
import myModal from '@/components/myModal'
import Button from '@/components/buttons/myButton.vue'
import { mainStore } from '@/Stores/mainStore'
import { apiManageStore } from '@/Stores/apiManageStore';
import { modalStore } from '@/Stores/modalStore'
import myTable from '@/components/table'
import Empty from '@/components/empty'
import { getIndexPreviewColumns, getIndexPreviewData, filterTableData } from '@/apis/group'
import { message } from 'ant-design-vue'
import { getimgType, fileExport, simpleEncrypt, getObjectBase64Str } from '@/utils/utils'
import rowNumModal from '@/components/setRowNumModal'
import templateModal from '@/views/systemManagement/components/templateModal'
import pagination from '@/components/pagination'
import filterTree from '@/components/fliter/cusTree.vue'
import { language as sqlLanguage } from 'monaco-editor/esm/vs/basic-languages/sql/sql.js'
import { computed } from 'vue'
import selectTemplate from '@/views/systemManagement/components/selectTemplate'
const { t } = useI18n()

const useModalStore = modalStore()
const useMainStore = mainStore()
const useApiManageStore = apiManageStore()

const { templateModalVisible } = storeToRefs(useModalStore)
const { fileterTableInfo,accessConfig } = storeToRefs(useMainStore)

const tableColumns = ref([])
const tableDataInfo = ref([])
const codeEditId = "codeEditBox-"+Number(new Date())
//sql数据
const sqlDataInfo = ref([])
const current = ref(1)
//sql当前页码
const sqlCurrent = ref(1)
const displaySize = ref(100)
const sqlDisplaySize = ref(100)
const total = ref(10)
//sql总页码
const sqlTotal = ref(0)
//sql编辑器文本内容
const sqlText = ref('');
const filterItemList = ref([
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
])

const tmplId = ref('')

const showFilterModal = ref(true)
const showRowNumModal = ref(false)

const loading = ref(true)
const loadingSql = ref(true)
const activeType = ref(0) // 当前显示的视图
const editor = ref(null) //编辑器
// 拖动相关变量
const isResizing = ref(false);
const container  = ref(null);
const topBox  = ref(null);
const tableBox  = ref(null);
const topBoxHeight = ref('182');
const tableBoxHeight = ref('0');

// 注入筛选表 表ID
provide('TARGET_TABLE_ID', computed(() => {
  if (!fileterTableInfo?.value.id) return
  return fileterTableInfo.value.id
}))

onMounted(async () => {
  //高度设置
  const containerRect = container.value.getBoundingClientRect();
  const containerHeight = containerRect.bottom - containerRect.top;
  tableBoxHeight.value = containerHeight -190;
  // 获取表头信息
  let columnRes = await getIndexPreviewColumns({
    tableId: fileterTableInfo.value.id,
  })

  if (columnRes.code === 1) {
    let arr = columnRes.data
    arr.forEach(item => {
      item.imgType = getimgType(item.columnType)
      item.dataIndex = item.columnName
    })
    tableColumns.value = columnRes.data
  } else {
    message.error(columnRes.message)
  }

  // 获取行数据
  let rowRes = await getIndexPreviewData({
    tableId: fileterTableInfo.value.id,
  })

  if (rowRes.code === 1) {
    tableDataInfo.value = rowRes.data.records
    total.value = rowRes.data.total
  } else {
    message.error(rowRes.message)
  }

  loading.value = false
  loadingSql.value = false
  //初始化编辑器
  initEditor()
})
const selectTempFn = (id, content) => {
  tmplId.value = id
  toRaw(editor.value).setValue(content)
    // 删除模板 重置参数值
  if(!id) {
    tmplId.value = ''
  }
}
const onCancel = () => {
  useModalStore.changeFilterModalVisivle()
}
//下载
const downloadFn = async () => {
  if(activeType.value == 0){
    let res = await fileExport(
      {
        tableId: fileterTableInfo.value.id,
        tableType: fileterTableInfo.value.tableType.value,
        tableAlias: fileterTableInfo.value.tableAlias,
        dataNum: total.value,
      },
      getQueryParams()
    )
    if(res.code === 0) return
    if(total.value > 10000){
      message.success(t('common.taskBuildSuccess'))
    }
  }
  if(activeType.value == 1){
    sqlgetDataFn(true)
  }


}
const sqlDownload = async () => {
  if(!sqlText.value) {
    return;
  }
  let res = await fileExport(
      {
        tableId: fileterTableInfo.value.id,
        tableType: fileterTableInfo.value.tableType.value,
        tableAlias: fileterTableInfo.value.tableAlias,
        dataNum: sqlTotal.value,
        querySql: sqlText.value,
      }
  )
  if(res.code === 0) return
  if(sqlTotal.value > 10000){
    message.success(t('common.taskBuildSuccess'))
  }
}
// 设置显示行数
const setRowNum = () => {
  showRowNumModal.value = true
  showFilterModal.value = false
}

// 取消设置显示行数
const cancelSetRowNum = async () => {
  showRowNumModal.value = false
  showFilterModal.value = true
  await nextTick()
  initEditor()
}
//设置显示行数
const confirmSetRowNum = val => {
  cancelSetRowNum()
  if(activeType.value == 0){
    displaySize.value = val
    filterChangeFn()
  }
  if(activeType.value == 1){
    sqlDisplaySize.value = val;
    sqlgetDataFn()
  }

}
//页码变化
const pageChangeFn = val => {
  if(activeType.value == 0){
    current.value = val
    filterChangeFn()
  }
  if(activeType.value == 1){
    sqlCurrent.value = val
    sqlgetDataFn()
  }

}

// 筛选条件参数
const filterParams = computed(() => {

  let singleCondition = ['notnull','isnull','isblank','notblank']

  let res = filterItemList.value.filter(
    item => {
      if(singleCondition.includes(item.symbol)) {
        return true
      }

      let flag = item.leftExpression.content && item.symbol

      // 介于 单独判断
      if(['between', 'notBetween'].includes(item.symbol)) {
        return flag && item.betweenStartExpression.content && item.betweenEndExpression.content
      } 
      return flag && item.rightExpression.content
       
    }
  )
  return res
})

const getQueryParams = () => {
  let requestPayload = [
    {
      action: 'select',
      contents: {
        tableId: fileterTableInfo.value.id,
        columns: tableColumns.value.map(col => col.columnName),
      },
    },
  ]
  if (filterParams.value.length > 0) {
    requestPayload.push({
      action: 'where',
      contents: filterParams.value,
    })
  }
  return requestPayload
}
//字段筛选更新
const filterChangeFn = () => {
  let requestPayload = getQueryParams()
  // console.log('requestPayload', requestPayload)
  loading.value = true
  filterTableData({
    tableId: fileterTableInfo.value.id,
    pageNum: current.value,
    pageSize: 100,
    selectColumns: '',
    querySql: '',
    displaySize: displaySize.value,
    queryParams: getObjectBase64Str(requestPayload),
  }).then(res => {
    if (res.code === 1) {
      tableDataInfo.value = res.data.records
      total.value = res.data.total
    } else {
      message.error(res.message)
    }
    loading.value = false
  })

}

const appendNestingFn = () => {}
//切换
const basicTabsChange = async e => {
  const tabId = e.target.id
  if (tabId === 'tab-a') {
    activeType.value = 0
  } else if (tabId === 'tab-b') {
    activeType.value = 1
  }

  // if(activeType.value == 0){
  //   filterChangeFn()
  // }
  // if(activeType.value == 1){
  //   sqlgetDataFn()
  // }
}
//sql编辑器
const initEditor = () => {
  // 初始化编辑器，确保dom已经渲染
  editor.value = monaco.editor.create(document.getElementById(codeEditId), {
    value: '', //编辑器初始显示文字
    language: 'sql',
    theme: 'vs', //官方自带三种主题vs, hc-black, or vs-dark
    selectOnLineNumbers: false,//显示行号
    roundedSelection: false,
    readOnly: false, // 只读
    cursorStyle: 'line', //光标样式
    automaticLayout: true, //自动布局
    // glyphMargin: true, //字形边缘
    useTabStops: false,
    fontSize: 15, //字体大小
    autoIndent: true, //自动布局
    quickSuggestionsDelay: 100, //代码提示延时
    overviewRulerBorder: false,
    minimap: {
      enabled: false, // 不要小地图
    }
  });
  // 监听值的变化
  editor.value.onDidChangeModelContent((val) => {
     sqlText.value = toRaw(editor.value).getValue().trim()
  })
  monaco.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems: function () {
      let suggestions = [];
      sqlLanguage.keywords.forEach(item => {
        suggestions.push({
          label: item,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: item
        });
      })
      sqlLanguage.operators.forEach(item => {
        suggestions.push({
          label: item,
          kind: monaco.languages.CompletionItemKind.Operator,
          insertText: item
        });
      })
      sqlLanguage.builtinFunctions.forEach(item => {
        suggestions.push({
          label: item,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: item
        });
      })
      sqlLanguage.builtinVariables.forEach(item => {
        suggestions.push({
          label: item,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: item
        });
      })
      return {
        suggestions: suggestions
      };
    },
  });
}
//sql数据更新
const sqlgetDataFn = (isDown) => {
  if(!sqlText.value) {
    message.error("查询条件不能为空")
    return;
  }
  const key = 'chaoxingSJZTKEY'
  const suffix = 'enc_'
  const encryptedSql = `${suffix}${simpleEncrypt(sqlText.value, key)}`
  //loadingsql.value = true
  filterTableData({
    tableId: fileterTableInfo.value.id,
    pageNum: sqlCurrent.value,
    pageSize: 100,
    displaySize: sqlDisplaySize.value,
    querySql: encryptedSql,
  }).then(res => {
    if (res.code === 1) {
      sqlDataInfo.value = res.data.records
      sqlTotal.value = res.data.total
      //执行下载
      if(isDown){
        sqlDownload()
      }
    } else {
      message.error(res.message)
    }
    //loadingsql.value = false
  })

}
const showSqlTips = ()=>{
  window.open('https://sharewh2.xuexi365.com/share/ebca96a8-3f5a-4a8e-acd1-53e99e8584eb?t=3')
}
const setTemplate = () => {
  if(accessConfig.value.tmplMgrAuth?.use == 0) {
    return message.error(t('common.noAuth'))
  }else{
    useApiManageStore.initTemplateList()
    useModalStore.changeTemplateModalVisible()
  }
}
const runningFn = async () => {
  sqlgetDataFn()
}
const startResize = (e) => {
  isResizing.value = true;
  // 阻止拖拽选中文字
  document.onselectstart = () => {
    return false
  };
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
};
const resize = (e) => {
  if (isResizing.value) {
    const mouseY = e.clientY;
    const containerRect = container.value.getBoundingClientRect();    
    const containerHeight = containerRect.bottom - containerRect.top;
    // 计算拖动条的垂直位置，并设置高度
    const newBox1Height = mouseY - containerRect.top;
    let box1Height = Math.max(0, newBox1Height);
    if(box1Height < 170){
      box1Height =  170
    }else if(containerHeight - box1Height < 190){
      box1Height = containerHeight - 190
    }
    let box2Height = containerHeight - box1Height - 8;
    topBoxHeight.value = box1Height;
    tableBoxHeight.value = box2Height;
  }
};
const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
  // 取消阻止拖拽选中文字
  document.onselectstart = () => {
    return true
  };
};
</script>

<style lang="less" scoped>
.modalContainer {
  :deep(.decorationsOverviewRuler) {
    display: none;
  }
  position: relative;
  height: 70vh;
  min-height: 360px;
  width: 100%;
  overflow: hidden;
  .topBox {
    padding: 16px;
    background-color: #fff;
    position: absolute;
    overflow-y: auto;
    top: 0;
    width: 100%;
    .topBoxInner{
      height: 100%;
      width: calc(100% - 2px);
    }
    .basic-tabs {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      padding: 3px;
      width: 198px;
      height: 36px;
      background: #F3F3F3;
      border-radius: 8px;
      margin-bottom: 10px;
      & > div {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 0px 12px;
        isolation: isolate;
        height: 30px;
        border-radius: 6px;
        flex: none;
        order: 1;
        flex-grow: 1;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.4);
        transition: background 0.6s cubic-bezier(0.075, .82, .165, 1);
      }
      .circle {
        min-width: 16px;
        height: 16px;
        text-align: center;
        border-radius: 10px;
        padding: 0 6px;
        background: #F53F3F;
        line-height: 16px;
        font-size: 12px;
        color: #FFF;
        margin-left: 6px;
        white-space: nowrap;
      }
      .tab-is-active {
        background: #FFFFFF;
        box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        color: rgba(0, 0, 0, 0.8);
        font-weight: 600;
      }
    }
    .text-area{
      min-height:110px;
      overflow: hidden;
    }
    .click-span {
      color:#2B67FF;
      cursor: pointer;
      height: 20px;
      line-height: 20px;
      display: flex;
      align-items: center;
      img {
        width: 14px;
        margin-right: 4px;
      }
    }
    .rightBox {
      position: absolute;
      display: flex;
      align-items: center;
      right: 16px;
      top: 16px;
    }
    .sqlBox {
      display: flex;
      flex-direction: column;
      width:100%;
      height: 100%;
      .selectTemplate {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        .text {
          margin-right: 12px;
        }
      }
      .text-area{
        flex: 1;
      }
    }
  }
  .tableContainer {
    padding: 12px;
    background-color: #fff;
    position: absolute;
    bottom: 0;
    width: 100%;
    .tableTips {
      margin-bottom: 12px;
      text-align: right;
      span {
        color: rgba(0, 0, 0, 0.6);
        font-size: 12px;
        pointer-events: none;
        &::after {
          pointer-events: auto;
          cursor: pointer;
          content: '';
          width: 12px;
          height: 12px;
          display: inline-block;
          background: url(../../../../../assets/icons/edit.png) center/cover no-repeat;
          vertical-align: text-bottom;
          margin-left: 4px;
        }
      }
    }
    .tableWrapper {
      position: relative;
      overflow: auto;
      .tableContainer {
        th {
          width: 130px !important;
          max-height: 30px;
          border: 1px solid rgb(224, 235, 255);
          &>div {
            width: 130px !important;
            line-height: 1.2;
            padding: 2px 12px;
            min-height: 20px;
            display: flex;
            justify-content: left;
            align-items: center;
            .text {
              width: 130px;
              font-size: 12px;
              color: rgba(0, 0, 0, 0.6);
              font-weight: 600;
              line-height: 1;
              transform: scale(.9);
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          }
        }
        td {
          border: 1px solid #e0ebff;
          width: 130px !important;
          max-height: 35px;
          height: 30px;
          & > div {
            padding: 4px 12px;
            width: 130px !important;
            line-height: 1.2;
            max-height: 34px;
            font-size: 12px;
            text-align: left;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            z-index: -2;
            word-break: break-all;
            & > span {
              color: #3d82f2;
              cursor: pointer;
              margin-right: 16px;
            }
          }
        }
        tr {
          &:nth-of-type(odd) {
            background-color: #f7faff;
          }
          &:first-of-type {
            background-color: #ecf3ff;
          }
        }
      }
    }
    .tableBottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 15px;
      & > span {
        color: rgba(0, 0, 0, 0.6);
        font-size: 12px;
        i {
          font-style: normal;
          color: #2b67ff;
        }
      }
    }
  }
  .resizer {
    position: absolute;
    height: 8px;
    cursor: ns-resize;
    width: 100%;
    background-color: #eef0f5;
    top: 182px;
    transform: translateY(-50%);
    z-index: 2;
  }
}
</style>
