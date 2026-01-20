<script setup>
import {
  handleEditDataList,
  getRuleTextLoop,
  hasVerifyRule
} from '@/hooks/dataStandard/useGetRuleText.js'
import drawerFilter from '@/components/filterColumn/drawerFilter.vue'
import { fieldTypeList } from '@/constants/dataStandard.js'
import { getimgType, getCodeType, getObjectBase64Str } from '@/utils/utils'
import { cloneDeep } from 'lodash'
import createDialog from '@/utils/dialog'
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'
import { storeToRefs } from 'pinia'
import {
  getStandardFieldList,
  addStandardField,
  deleteStandardField,
  updateStandardField
} from '@/apis/dataStandard'
import { message } from 'ant-design-vue'
import basePagination from '@/components/pagination/base.vue'
import tips from '@/components/tips'

const { t } = useI18n()
const loading = ref(false)

const useApiManageStore = apiManageStore()
const useDataStandardStore = dataStandardStore()

const { activeMenuName } = storeToRefs(useApiManageStore)

const tableHeadInfo = [
  t('dataStandard.fieldAlias'),
  t('dataStandard.pyhFieldName'),
  t('dataStandard.fieldType'),
  t('dataStandard.fieldLength'),
  t('dataStandard.allowEmpty'),
  t('dataStandard.remark'),
  t('dataStandard.verifyRule')
]

const fieldList = ref([
  // {
  //   name: '',
  //   fieldName: '',
  //   dataType: 'CHARACTER',
  //   dataLength: 255,
  //   description: '',
  //   required: true
  // }
])

const ruleIndex = ref() // 新增/编辑校验规则的索引
const repeatIndex = ref(-1)

const drawerVisible = ref(false)
const drawerFilterRef = shallowRef()

// 过滤组件字段
const filterColumns = reactive({
  allColumns: []
})

const currentFilterOption = ref([])

const params = reactive({
  kw: '',
  pageNum: 1,
  pageSize: 12,
  total: 0
})

const nameError = ref(false)
const fieldNameError = ref(false)

// 编辑字段索引
const editColumnIndex = ref(-1)

// 字段筛选组件使用
provide('FILTER_COLUMNS', filterColumns)
// 字段筛选组件配置项
provide('FILTER_OPTIONS', currentFilterOption)
// 筛选组件添加公式隐藏选择其他表
provide('HIDE_SELECT_OTHER_TABLE', true)

onMounted(() => {
  getFieldListData()
})

onUnmounted(() => {
  useDataStandardStore.setEditintFieldTemplate(false)
})

// 添加按钮显示在最后一页
const showAddBtn = computed(() => {
  if (params.total === 0) return true
  return params.pageNum === Math.ceil(params.total / params.pageSize)
})

const getFieldListData = async kw => {
  if (kw) {
    params.pageNum = 1
  }
  loading.value = true
  let res = await getStandardFieldList({
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    sw: kw
  })
  loading.value = false
  if (res.code != 1) message.error(res.message)
  if (!res.data?.records) return
  fieldList.value = res.data.records.map(it => ({
    ...it,
    required: !Boolean(it.required)
  }))
  params.total = Number(res.data.total)
}

// 修改列的类型
const updateData = item => {
  updateFilterColumns()
}

const updateFilterColumns = () => {
  let targetRow = fieldList.value[ruleIndex.value]
  if (!targetRow) return
  // 无校验规则 添加时 重置筛选状态
  !hasVerifyRule(targetRow) && drawerFilterRef.value.resetFilterState()
  filterColumns.allColumns = [
    {
      columnName: targetRow.fieldName,
      columnAlias: targetRow.name,
      columnType: targetRow.dataType,
      imgType: getimgType(targetRow.dataType),
      type: getCodeType(targetRow.dataType),
      dataIndex: targetRow.fieldName
    }
  ]
}

const submitFn = () => {
  let filterInfo = drawerFilterRef.value.getFilterData()
  fieldList.value[ruleIndex.value].selfConfigWhere = [
    {
      action: 'where',
      contents: filterInfo
    }
  ]
  drawerVisible.value = false
}

const addItem = () => {
  useDataStandardStore.setEditintFieldTemplate(true)
  editColumnIndex.value = fieldList.value.length
  fieldList.value.push({
    name: '',
    fieldName: '',
    dataType: 'CHARACTER',
    dataLength: '',
    description: '',
    required: true
  })
}

// type：当前列的数据类型  i：新增列的索引
const addOrEditVerify = (type, i) => {
  drawerVisible.value = true
  ruleIndex.value = i
  let configInfo = cloneDeep(fieldList.value[i].selfConfigWhere)
  // 回显筛选组件配置项
  currentFilterOption.value = configInfo || []
}

const editFn = index => {
  if (editColumnIndex.value !== -1) return
  editColumnIndex.value = index
  useDataStandardStore.setEditintFieldTemplate(true)
}

const removeFn = async (item, index) => {
  if (!item.id) {
    resetInputStatus()
    fieldList.value.splice(index, 1)
    return
  }
  const tips = {
    title: '提示',
    content: '确认删除？',
    okText: '确定',
    cancelText: '取消'
  }
  const dialogTips = {
    title: '提示',
    content: '当前模板字段已被引用，删除字段后，是否同步删除全部引用字段？',
    okText: '仅删除模板字段',
    cancelText: '同步删除引用字段',
    cancelDelay: 3
  }

  // 是否被引用
  let hasBeenCited = item.hasBeenCited
  let result = null

  try {
    await createDialog(hasBeenCited ? dialogTips : tips)
    // 不同步删除引用字段
    result = await deleteStandardField({
      standardFieldId: item.id,
      // 是否同步删除其它引用字段：1删除，0不删除
      deleteOthers: 0
    })
  } catch (type) {
    // 引用字段点击关闭按钮 || 删除非引用字段 点击取消
    if (type === 'close' || (type === 'cancel' && !hasBeenCited)) return
    // 引用字段 同步删除其他引用字段
    if (type === 'cancel' && hasBeenCited) {
      result = await deleteStandardField({
        standardFieldId: item.id,
        // 同步删除其它引用字段
        deleteOthers: 1
      })
    }
  }

  if (result.code !== 1) message.error(result.message)
  message.success(result.message)

  resetInputStatus()

  setTimeout(() => {
    getFieldListData()
  }, 200)
}

const updateFieldInfo = (item, updateOthers) => {
  return updateStandardField({
    standardFieldId: item.id,
    // 是否同步更新其它引用字段：1更新，0不更新
    updateOthers: updateOthers ? 1 : 0,
    attrStr: getObjectBase64Str({
      ...item,
      required: item.required ? 0 : 1
    })
  })
}

const saveFn = async item => {
  let isEdit = Boolean(item.id)
  // 是否被引用
  let hasBeenCited = item.hasBeenCited
  let result = null

  if (!item.name.trim()) {
    nameError.value = true
    return message.error('名称不能为空')
  }
  if (!item.fieldName.trim()) {
    fieldNameError.value = true
    return message.error('物理字段名不能为空')
  }

  // 新增保存
  if (!isEdit) {
    result = await addStandardField({
      attrStr: getObjectBase64Str({
        ...item,
        required: item.required ? 0 : 1
      })
    })
  }
  // 编辑没有引用过的字段
  if (isEdit && !hasBeenCited) {
    result = await updateFieldInfo(item, false)
  }

  if (hasBeenCited) {
    try {
      // 编辑引用过的字段
      await createDialog({
        title: '提示',
        content:
          '当前模板字段已被引用，保存字段后，是否将编辑内容同步至全部引用字段？',
        okText: '不同步',
        cancelText: '同步',
        cancelDelay: 3
      })
      result = await updateFieldInfo(item, false)
    } catch (e) {
      if (e === 'close') return
      result = await updateFieldInfo(item, true)
    }
  }

  if (result.code === 1) {
    message.success(result.message)
  } else {
    message.error(result.message)
  }

  resetInputStatus()
  getFieldListData()
}

const editRuleFn = (item, i) => {
  if (editColumnIndex.value !== i) return
  addOrEditVerify(item.dataType, i)
}

const getDataTypeLabel = dataType => {
  let target = fieldTypeList.find(it => it.value === dataType)
  if (!target) return ''
  return t(target.label)
}

const pageChangeFn = () => {
  getFieldListData()
  resetInputStatus()
}

const resetInputStatus = () => {
  editColumnIndex.value = -1
  nameError.value = false
  fieldNameError.value = false
  useDataStandardStore.setEditintFieldTemplate(false)
}

watchEffect(() => {
  updateFilterColumns()
})

defineExpose({
  getFieldListData: getFieldListData
})

// onBeforeRouteLeave(async () => {
//   if (fieldList.every(it => !it.isEdit)) return
//   let preMenuName = activeMenuName.value
//   useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.STANDARD_MANAGE)
//   try {
//     await createDialog({
//       title: '提示',
//       content: '离开当前页面后页面内容不会保留，确认离开？'
//     })
//     useApiManageStore.setActiveMenuName(preMenuName)
//   } catch {
//     return false
//   }
// })
</script>

<template>
  <div class="template-wrap">
    <div class="ruleContainer">
      <a-spin :spinning="loading">
        <table class="ruleTable">
          <thead>
            <tr>
              <th v-for="item in tableHeadInfo">
                <template v-if="item == t('dataStandard.fieldLength')">
                  <div class="tips-wrap">
                    <span>{{ item }} </span>
                    <tips tipsContent="仅作为表结构长度校验，如需校验数据长度，可在校验规则内使用LENGTH函数校验；不填写此内容则不校验长度" />
                  </div>
                </template>
                <template v-else>
                  {{ item }}
                </template>
              </th>
              <th>{{ t('common.operation') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr class="list-item" v-for="(item, i) in fieldList" :key="i">
              <td class="input-td">
                <input
                  v-if="editColumnIndex === i"
                  :class="{ ipt: true, isError: nameError }"
                  type="text"
                  maxlength="50"
                  v-model="item.name"
                  @input="nameError = false"
                  placeholder="请输入"
                />
                <span v-else>{{ item.name }}</span>
              </td>
              <td :class="{ 'input-td': true, isError: i === repeatIndex }">
                <input
                  v-if="editColumnIndex === i"
                  :class="{ ipt: true, isError: fieldNameError }"
                  type="text"
                  maxlength="255"
                  v-model="item.fieldName"
                  @input="fieldNameError = false"
                  placeholder="请输入"
                />
                <span v-else>{{ item.fieldName }}</span>
              </td>
              <td class="select-td">
                <a-select
                  v-if="editColumnIndex === i"
                  style="width: 100%"
                  v-model:value="item.dataType"
                  @select="updateData(item)"
                >
                  <a-select-option
                    v-for="opItem in fieldTypeList"
                    :key="opItem.value"
                    :value="opItem.value"
                    :title="t(opItem.label)"
                  >
                    <div
                      style="display: flex; align-items: center; height: 100%"
                    >
                      <img
                        style="width: 16px; margin-right: 4px"
                        :src="opItem.imgSrc"
                        alt=""
                      />
                      <span>{{ t(opItem.label) }}</span>
                    </div>
                  </a-select-option>
                </a-select>
                <span v-else>{{ getDataTypeLabel(item.dataType) }}</span>
              </td>
              <td class="input-td length-td">
                <input
                  v-if="editColumnIndex === i"
                  class="ipt"
                  type="text"
                  maxlength="255"
                  ref="iptRef3"
                  v-model="item.dataLength"
                  placeholder="请输入"
                />
                <span v-else>{{ item.dataLength }}</span>
              </td>
              <td class="check-td" align="center">
                <a-checkbox
                  v-if="editColumnIndex === i"
                  v-model:checked="item.required"
                ></a-checkbox>
                <span v-else>{{ item.required ? '是' : '否' }}</span>
              </td>
              <td class="input-td">
                <input
                  v-if="editColumnIndex === i"
                  class="ipt"
                  type="text"
                  v-model="item.description"
                  placeholder="请输入"
                />
                <span v-else>{{ item.description }}</span>
              </td>
              <td class="verify-td">
                <!-- 无校验规则 -->
                <span
                  class="add"
                  v-if="!hasVerifyRule(item) && editColumnIndex === i"
                  @click="addOrEditVerify(item.dataType, i)"
                  >{{ t('common.add') }}</span
                >
                <!-- 含有校验规则 -->
                <div v-else class="verifyRuleText">
                  <div class="ruleTextContent" @click="editRuleFn(item, i)">
                    <span v-for="rule in getRuleTextLoop(t, item)">
                      <span class="rule-text">{{ rule.text }}</span>
                      <span
                        class="logic-opereate"
                        v-if="rule.showLogic && !rule.isLast"
                        >{{ rule.logic }}</span
                      >
                      <span class="more-info" v-if="rule.hasMore && rule.isLast"
                        >...</span
                      >
                    </span>
                  </div>
                  <img
                    v-if="editColumnIndex === i"
                    class="edit"
                    @click="addOrEditVerify(item.dataType, i)"
                    src="@/assets/icons/edit1.png"
                    alt=""
                  />
                </div>
              </td>
              <td class="oper-td">
                <span v-if="editColumnIndex === i" @click="saveFn(item)">{{
                  t('common.save')
                }}</span>
                <span v-else @click="editFn(i)">{{ t('common.edit') }}</span>
                <span @click="removeFn(item, i)">{{ t('common.delete') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </a-spin>
    </div>
    <div
      v-if="showAddBtn && editColumnIndex === -1"
      class="addRuleTableItem"
      @click="addItem"
    >
      <img src="@/assets/icons/plus.png" alt="" />
      {{ t('dataStandard.addField') }}
    </div>

    <basePagination
      v-if="params.total > params.pageSize"
      v-model:current="params.pageNum"
      :total="params.total"
      :pageSize="params.pageSize"
      show-less-items
      @change="pageChangeFn"
    />
  </div>

  <!-- 字段筛选抽屉组件 -->
  <drawerFilter
    ref="drawerFilterRef"
    :drawerVisible="drawerVisible"
    @closeDrawer="drawerVisible = false"
    @submitFn="submitFn"
  />
</template>

<style lang="less" scoped>
.template-wrap {
  flex-grow: 1;
  position: relative;
  .ruleContainer {
    .title {
      font-size: 16px;
      color: rgba(0, 0, 0, 0.8);
      font-weight: 600;
    }
    .ruleTable {
      border-collapse: collapse;
      border-spacing: 0;
      width: 100%;
      .tips-wrap {
        display: flex;
        gap: 4px;
        align-items: center;
        & > span {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
      thead tr {
        th {
          text-align: left;
          border: 1px solid #e0ebff;
          background: #ecf3ff;
          height: 36px;
          padding: 0px 10px;
          line-height: 1;
          position: relative;
          font-weight: 500;
          white-space: nowrap;
        }
      }

      .list-item {
        height: 36px;
        td {
          height: 36px;
          padding: 4px 8px;
          border: 1px solid #e0ebff;
        }
        .select-td {
          width: 150px;
          :deep(.ant-select .ant-select-selector) {
            width: 100%;
            border-radius: 4px;
            background-color: #f3f3f3 !important;
          }
        }
        .oper-td {
          white-space: nowrap;
          span {
            color: #3d82f2;
            cursor: pointer;
            margin-right: 16px;
          }
        }
        .input-td {
          width: 200px;
          .ipt {
            width: 100%;
            border-radius: 4px;
            background-color: #f3f3f3;
            &.isError {
              border: 1px solid #ff4d4f;
              box-shadow: none;
            }
          }
          &.length-td {
            width: 80px;
          }
        }
        .check-td {
          width: 80px;
        }
        .verify-td {
          width: 500px;
          .add {
            color: #3d82f2;
            cursor: pointer;
            margin-right: 16px;
          }
          .verifyRuleText {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: rgba(0, 0, 0, 0.8);
            .ruleTextContent {
              width: 460px;
              flex: 1;
              white-space: nowrap; /* 不换行 */
              text-overflow: ellipsis; /* 超出部分显示省略号 */
              overflow: hidden; /* 超出部分隐藏 */
              .rule-text {
                padding: 4px 10px;
                background-color: #f3f3f3;
                border-radius: 4px;
                display: inline-block;
              }
              .logic-opereate {
                margin: 0 6px;
              }
              .more-info {
                margin-left: 4px;
              }
            }
            .edit {
              cursor: pointer;
              width: 16px;
              margin-left: 8px;
            }
          }
        }
      }
    }
  }
  .addRuleTableItem {
    display: flex;
    align-items: center;
    width: 100%;
    height: 38px;
    color: #3d82f2;
    cursor: pointer;
    border: 1px solid #e0ebff;
    justify-content: center;
    border-top: none;
    img {
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
  }
  .pagination-wrap {
    text-align: center;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
