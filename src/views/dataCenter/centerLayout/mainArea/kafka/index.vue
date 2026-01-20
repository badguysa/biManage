<script setup>
import myButton from '@/components/buttons/myButton.vue'
import { FIELD_TYPE_LIST, FIELD_TYPE_MAP, FIELD_ICON_MAP, ICON_VALUE_MAP } from '@/constants/kafka'
import myTable from '@/components/table'
import { importKafka } from '@/apis/kafka'
import { message } from 'ant-design-vue'

const { t } = useI18n()
const useMainStore = mainStore()
const useKafkaStore = kafkaStore()

const { activeTabKey } = storeToRefs(useMainStore)
const { kafkaData, kafkaSourceParams } = storeToRefs(useKafkaStore)

const kafkaState = reactive({
  tableName: '',
  desc: '',
})

const fieldList = ref([])

// 底部表格预览数据
const tablePreviewData = reactive({
  columns: [],
  data: []
})

// 添加参数标识
const addFlag = ref(false)

const kafkaJSON = ref('')

// 重复字段名索引
const repeatIndex = ref(-1)

onMounted(() => {
  initData()
})

const initData = () => {
  let firstObj = kafkaData.value[0]
  if (!firstObj) return

  // json格式化
  kafkaJSON.value = JSON.stringify(firstObj, null, 2)

  for (let key in firstObj) {
    let value = firstObj[key]

    // 不为数值类型或字符类型 序列化为字符
    if (!['number', 'string'].includes(typeof value)) {
      value = JSON.stringify(value)
      firstObj[key] = value
    }

    let valueType = typeof value
    // 数值类型判断是否为小数
    if(valueType === 'number') {
      valueType = Number(value) === Math.round(value) ? 'integerNumber' : 'decimalNumber'
    }

    // 字段解析
    fieldList.value.push({
      name: key,
      field: key,
      type: FIELD_TYPE_MAP[valueType],
      isPrimaryKey: 0
    })

    // 底部预览表头设置
    tablePreviewData.columns.push({
      dataIndex: key,
      columnAlias: key,
      imgType: FIELD_ICON_MAP[valueType],
    })
  }

  // 底部预览表数据设置
  tablePreviewData.data = [firstObj]
}

const backFn = () => {
  useMainStore.setPageId('pageTable')
}

const importFn = async () => {
  if (!kafkaState.tableName) {
    return message.warn(t('common.pleaseEnterName'))
  }

  if(repeatIndex.value !== -1) {
    return message.error('字段名重复')
  }

  let importParams = {
    name: kafkaState.tableName, // 表名
    description: kafkaState.desc, // 描述
    groupId: activeTabKey.value, // 分组ID
    ...kafkaSourceParams.value,
  }

  let dataList = {
    path: '$.[*]',
    fields: fieldList.value.map(it => ({
      originalName: it.name,
      curName: it.field,
      classType: it.type,
      isPrimaryKey: it.isPrimaryKey
    })),
  }

  importParams.dataList = dataList
  importParams.multiDataList = [dataList]

  let res = await importKafka(importParams)

  if (res.code === 1) {
    message.success(res.message)
    useMainStore.setIndexTableActiveId('', activeTabKey.value, 'del')
    useMainStore.setPageId('pageTable')
    useMainStore.selectTabs(
      {
        id: activeTabKey.value,
      },
      'import'
    )
  } else {
    message.error(res.message)
  }
}

const deleteFn = index => {
  // 删除添加参数
  if (index === fieldList.value.length - 1 && addFlag.value) {
    addFlag.value = false
  }
  fieldList.value.splice(index, 1)
  updateTableData('delete', index)
}

// 添加参数
const addParam = () => {
  if (addFlag.value) return
  addFlag.value = true
  fieldList.value.push({
    name: '',
    field: '',
    type: '',
    isPrimaryKey: 0
  })
}

// 更新添加标识
const updateAddFlag = () => {
  if (!addFlag.value) return

  let addItem = fieldList.value[fieldList.value.length - 1]

  if (addItem.name && addItem.field && addItem.type !== '') {
    addFlag.value = false
    updateTableData('add', addItem)
  }
}

// 更新表格预览数据
const updateTableData = (type, target, index) => {
  if (type === 'add') {
    tablePreviewData.columns.push({
      columnAlias: target.field,
      dataIndex: target.field,
      imgType: ICON_VALUE_MAP[target.type],
    })
  } else if (type === 'delete') {
    tablePreviewData.columns.splice(target, 1)
  } else if (type === 'edit') {
    if (!tablePreviewData.columns[index]) return

    let targetField = target.field
    let preField = tablePreviewData.columns[index].dataIndex
    let preValue = tablePreviewData.data[0][preField]

    // 删除原有字段 preField
    delete tablePreviewData.data[0][preField]
    // 新增编辑后字段 targetField
    tablePreviewData.data[0][targetField] = preValue

    tablePreviewData.columns[index].dataIndex = targetField
    tablePreviewData.columns[index].columnAlias = targetField
    tablePreviewData.columns[index].imgType = ICON_VALUE_MAP[target.type]
  }
}

const fieldInputHandle = (item, index) => {
  // 校验字段名是否重复
  let repeat = fieldList.value.some((it, i) => 
    i !== index && 
    it.field === item.field
  )

  if (repeat) {
    repeatIndex.value = index
    return message.error('字段名重复')
  }

  repeatIndex.value = -1
  updateTableData('edit', item, index)
}

const changeTypeHandle = (item, index) => {
  // 主键不能作为小数
  if(item.isPrimaryKey && item.type === 1) {
    message.warning('主键不能为小数，请重新选择')
    item.isPrimaryKey = 0
  }
  updateAddFlag()
  updateTableData('edit', item, index)
}

const changePrimaryKey = (item, e) => {
  // 取消勾选
  if(!e.target.checked) {
    item.isPrimaryKey = 0
    return
  }

  // 主键不能作为小数
  if(item.type === 1) {
    message.warning('主键不能为小数，请重新选择')
    e.target.checked = false
    return
  }

  // 勾选 保证主键唯一
  fieldList.value.forEach(it => {
    it.isPrimaryKey = it === item ? 1 : 0
  })
}

</script>

<template>
  <div class="mainWrap">
    <div class="headWrap">
      <div class="backBox" @click="backFn">
        <img src="@/assets/icons/return.png" alt="backIcon" />
        <span>{{ t('common.back') }}</span>
      </div>
      <div class="titleBox">
        <div class="title">Kafka导入</div>
        <div class="inputWrap">
          <div class="inputItem">
            <label>表名</label>
            <input type="text" v-model="kafkaState.tableName" />
          </div>
          <div class="inputItem">
            <label>描述</label>
            <input type="text" v-model="kafkaState.desc" />
          </div>
        </div>
        <myButton type="primary" @click="importFn">{{ t('common.import') }}</myButton>
      </div>
    </div>
    <div class="centerWrap">
      <div class="leftWrap">
        <div class="leftTitle">Kafka原始数据集</div>
        <div class="contentWrap">
          <textarea v-model="kafkaJSON"></textarea>
        </div>
      </div>
      <div class="rightWrap">
        <div class="topTable">
          <div class="topTableWrap">
            <table>
              <colgroup>
                <col width="22%" />
                <col width="22%" />
                <col width="22%" />
                <col width="12%" />
                <col width="22%" />
              </colgroup>
              <thead>
                <tr>
                  <td>Kafka字段</td>
                  <td>字段名</td>
                  <td>字段类型</td>
                  <td>是否主键</td>
                  <td>操作</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in fieldList">
                  <td>
                    <input
                      v-if="addFlag && index === fieldList.length - 1"
                      type="text"
                      v-model="item.name"
                      @blur="updateAddFlag"
                    />
                    <span :title="item.name" v-else>{{ item.name }}</span>
                  </td>
                  <td>
                    <input
                      :class="{ fieldRepeat: repeatIndex === index }"
                      type="text"
                      v-model="item.field"
                      @blur="updateAddFlag"
                      @input="fieldInputHandle(item, index)"
                    />
                  </td>
                  <td>
                    <a-select v-model:value="item.type" @change="changeTypeHandle(item, index)">
                      <a-select-option
                        v-for="opItem in FIELD_TYPE_LIST"
                        :key="opItem.value"
                        :value="opItem.value"
                        :title="t(opItem.label)"
                      >
                        <img style="width: 16px" :src="opItem.imgSrc" alt="" />
                        <span>{{ t(opItem.label) }}</span>
                      </a-select-option>
                    </a-select>
                  </td>
                  <td class="primaryCol">
                    <input type="checkbox" :checked="item.isPrimaryKey" @input="changePrimaryKey(item, $event)">
                  </td>
                  <td class="delete">
                    <span @click="deleteFn(index)">删除</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <myButton @click="addParam">
            <BiIcon name="plus" />
            <span>{{ t('api.addParams') }}</span>
          </myButton>
        </div>
        <div class="bottomTable">
          <div class="bottomTitle" :title="kafkaState.tableName">{{ kafkaState.tableName }}</div>
          <div class="bottomTableWrap">
            <myTable :tableColumns="tablePreviewData.columns" :tableData="tablePreviewData.data" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.mainWrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .headWrap {
    background-color: #fff;
    .backBox {
      height: 36px;
      padding: 8px 16px;
      color: #2b67ff;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      img {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }
    .titleBox {
      border-top: 1px solid #f0f0f0;
      padding: 12px 16px;
      position: relative;
      .title {
        font-size: 18px;
        font-weight: 600;
        line-height: 25px;
      }
      .inputWrap {
        display: flex;
        margin-top: 10px;
        overflow: hidden;
        .inputItem {
          font-size: 13px;
          label {
            margin-right: 20px;
          }
          input {
            width: 300px;
          }
          &:first-of-type {
            margin-right: 30px;
          }
          &:last-of-type {
            input {
              width: 500px;
            }
          }
        }
      }
      button {
        position: absolute;
        top: 12px;
        right: 16px;
      }
    }
  }
  .centerWrap {
    flex-grow: 1;
    display: flex;
    gap: 12px;
    height: calc(100vh - 264px);
    .leftWrap {
      border-radius: 4px;
      width: 600px;
      background-color: #fff;
      padding: 12px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      overflow: auto;
      .leftTitle {
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
        background: #fafafc;
      }
      .contentWrap {
        padding: 16px;
        flex-grow: 1;
        // white-space: pre-wrap;
        textarea {
          width: 100%;
          height: 100%;
          background-color: #fff;
          &:hover {
            background-color: unset;
          }
          &:focus {
            box-shadow: none;
          }
        }
      }
    }
    .rightWrap {
      border-radius: 4px;
      background-color: #fff;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      & > div {
        padding: 12px;
      }
      .topTable {
        font-size: 13px;
        flex-grow: 1;
        .topTableWrap {
          max-height: calc(100vh - 450px);
          overflow: auto;
          table {
            width: 100%;
            table-layout: fixed;
            thead {
              background-color: #ecf3ff;
              color: #00000099;
              font-weight: 600;
              position: sticky;
              top: -1px;
              z-index: 1;
            }
            tbody {
              tr:nth-of-type(even) {
                background-color: #f7faff;
              }
              td {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                &:nth-of-type(2),
                &:nth-of-type(3) {
                  padding: 4px 8px;
                }
                &.primaryCol{
                  input {
                    width: 16px;
                    height: 16px;
                    appearance: none;
                    background: url(@/assets/icons/not_select.png) center / cover;
                    cursor: pointer;
                    &:checked {
                      background-image: url(@/assets/icons/is_select.png);
                    }
                  }
                }
              }
            }
            td {
              border: 1px solid #e0ebff;
              padding: 10px 12px;
              input,
              .ant-select {
                width: 100%;
              }
              .fieldRepeat {
                border: 1px solid #ff4d4f;
                box-shadow: none;
              }
              :deep(.ant-select-selection-item) {
                display: flex;
                align-items: center;
                gap: 4px;
              }
            }
            .delete {
              span {
                color: #2b67ff;
                font-size: 14px;
                cursor: pointer;
                line-height: 20px;
              }
            }
          }
        }
        button {
          margin-top: 16px;
          height: 28px;
          font-size: 13px;
          padding: 0 8px;
          display: flex;
          align-items: center;
          svg {
            height: 14px;
            margin-right: 2px;
          }
        }
      }
      .bottomTable {
        border-top: 1px solid #e9e9e9;
        height: 116px;
        .bottomTitle {
          height: 20px;
          max-width: 400px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 12px;
        }
        .bottomTableWrap {
          width: calc(100vw - 860px);
          overflow: auto;
        }
      }
    }
  }
}
</style>
