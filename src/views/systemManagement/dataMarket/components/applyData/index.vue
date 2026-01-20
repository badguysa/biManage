<script setup>
import back from '@/components/back'
import { message } from 'ant-design-vue'
import { applyForDataResource } from '@/apis/dataMarket'
import { cloneDeep } from 'loadsh'
import selectUnitSource from '@/components/selectUnitSource'

const props = defineProps({
  dataInfo: {
    required: true,
    type: Object
  }
})
const emits = defineEmits(['back'])
const useMainStore = mainStore()
const { userInfo } = storeToRefs(useMainStore)

// 选择单位信息
const selectUnitInfo = ref(null)

const tableColumns = [
  {
    title: '',
    dataIndex: 'checkboxCol',
    key: 'checkboxCol'
  },
  {
    title: '物理字段名',
    dataIndex: 'columnName',
    key: 'columnName'
  },
  {
    title: '字段名',
    dataIndex: 'columnAlias',
    key: 'columnAlias'
  },
  {
    title: '字段描述',
    dataIndex: 'columnDesc',
    key: 'columnDesc'
  },
  {
    title: '字段类型',
    dataIndex: 'columnType',
    key: 'columnType'
  },
  {
    title: '字段长度',
    dataIndex: 'columnLength',
    key: 'columnLength'
  },
  {
    title: '小数精度',
    dataIndex: 'columnPrecision',
    key: 'columnPrecision'
  },
  {
    title: '是否主键',
    dataIndex: 'isPrimaryKey',
    key: 'isPrimaryKey'
  }
]

const selectTableColumns = [
  {
    title: '物理字段名',
    dataIndex: 'columnName',
    key: 'columnName'
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate'
  }
]

const addAuthInfo = reactive({
  fidName: '使用单位',
  userName: '使用人',
  phone: '联系电话',
  userIp: '授权IP'
})

const authState = reactive({
  fidName: '',
  userName: '',
  phone: '',
  userIp: ''
})

const authStateShowInfo = reactive({
  fidName: true,
  userName: true,
  phone: true,
  userIp: true
})

const applyState = reactive({
  name: '',
  phoneNumber: '',
  reason: '',
  auth: [],
  fields: cloneDeep(props.dataInfo.columns)
})

const modalVisible = ref(false)

// 已选字段
const checkedData = computed(() => {
  return applyState.fields.filter(f => f.checked)
})

const checkAllFn = () => {
  let flag = checkAll.value
  applyState.fields.map(f => (f.checked = !flag))
}

const checkAll = computed(() => {
  return applyState.fields.every(it => it.checked)
})

const authList = computed(() => {
  let list = []
  if(props.dataInfo?.visible?.includes('1')) {
    list.push({ label: '下载', value: 1 })
  }
  if(props.dataInfo?.visible?.includes('2')) {
    list.push({ label: 'API接口', value: 2 })
  }
  return list
})

const hasApiAuth = computed(() => {
  return authList.value.some(it => it.value == 2)
})

// 选择单位回调
const selectFn = (item) => {
  selectUnitInfo.value = item
  // 使用人 使用单位 手机号必填
  authState.userName = item.accessUser
  authState.phone = item.phone
  authStateShowInfo.userName = false
  authStateShowInfo.phone = false
  authStateShowInfo.userIp = false
}

const clearHandle = () => {
    for(let key in authStateShowInfo) {
      authStateShowInfo[key] = true
    }
    authState.userName = ''
    authState.phone = ''
    selectUnitInfo.value =false 
}

const removeFn = row => {
  let target = applyState.fields.find(f => f.columnName === row.columnName)
  target.checked = false
}

const okFn = () => {
  modalVisible.value = false
}

const cancelFn = () => {
  // selectUnitInfo.value = null
  // modalVisible.value = false
  // addAuthInfo.userName = '使用人'
  // addAuthInfo.phone = '联系电话'
  // addAuthInfo.userIp = '授权IP'
  // authState.userName = ''
  // authState.phone = ''
}

const submitFn = () => {
  if (!applyState.auth.length || !applyState.reason) {
    return message.warning('请检查信息是否填写完整')
  }

  // 选择API后 授权信息增加必填校验
  if (applyState.auth.includes(2) && authStateShowInfo.userName) {
    let flag = true
    for(let key in authState) {
      if(key === 'userIp')  continue
      flag = !!authState[key]
    }
    if(!flag) {
      message.warning('请填写API接口授权信息')
      return
    }
  }

  // 选择了单位后 手动清除单位信息
  if(selectUnitInfo.value && !authState.fidName) {
    return message.warning('请填写API接口授权信息')
  }

  let requestParams = {
    apiAuthInfoId: selectUnitInfo.value ? selectUnitInfo.value.id : undefined,
    applicant: userInfo.value.puid,
    applicantName: userInfo.value.name,
    applicantPhone: userInfo.value.phone,
    columnNames: checkedData.value.map(it => it.columnName),
    dmColumnIds: checkedData.value.map(it => it.id),
    dmResourceId: props.dataInfo.id,
    dmResourceName: props.dataInfo.name,
    reason: applyState.reason,
    visible: applyState.auth.join(',')
  }

  // API接口授权
  if(applyState.auth.includes(2)) {
    requestParams.apiAuthInfo = authState
  }

  applyForDataResource(requestParams).then(res => {
    if(res.code == 1) {
      window.open(res.message, '_blank')
      emits('back')
    } else {
      message.error(res.message)
    }
  })
}
</script>

<template>
  <div class="apply-wrap">
    <back @backFn="$emit('back')" />
    <div class="apply-contaienr">
      <div class="apply-area">
        <div class="title">{{ dataInfo.name }}</div>
        <div class="tips">申请信息</div>
        <div class="form-wrap">
          <div class="input-item">
            <span>申请人</span>
            <BiInput disabled v-model="userInfo.name" />
          </div>
          <div class="input-item">
            <span>手机号</span>
            <BiInput disabled v-model="userInfo.phone" />
          </div>
        </div>
        <div class="form-wrap reason-wrap">
          <span>申请原因</span>
          <textarea
            v-model="applyState.reason"
            placeholder="请输入"
            maxlength="200"
          ></textarea>
        </div>
        <div class="form-wrap auth-wrap">
          <span>申请权限</span>
          <BiCheckbox v-model="applyState.auth" :options="authList" />
          <span class="auth-info" v-if="hasApiAuth" @click="modalVisible = true">授权信息</span>
        </div>
      </div>
      <div class="range-area">
        <div class="title">申请数据范围</div>
        <!-- 字段数据表 -->
        <div class="range-wrap">
          <div class="left-wrap">
            <span class="table-title">可选数据项</span>
            <BiTable
              :columns="tableColumns"
              :dataSource="applyState.fields"
              :columnWidthInfo="{ checkboxCol: 3 }"
            >
              <template #headerCell="{ column }">
                <template v-if="column.key === 'checkboxCol'">
                  <BiIcon
                    class="table-checkbox"
                    :name="checkAll ? 'checkbox_all' : 'checkbox_nothing'"
                    @click="checkAllFn"
                  />
                </template>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'checkboxCol'">
                  <BiIcon
                    class="table-checkbox"
                    :name="record.checked ? 'checkbox_all' : 'checkbox_nothing'"
                    @click="record.checked = !record.checked"
                  />
                </template>
              </template>
            </BiTable>
          </div>

          <!-- 已选数据表 -->
          <div class="right-wrap">
            <span class="table-title"
              >已选数据项（{{ checkedData.length }}）</span
            >
            <BiTable
              :columns="selectTableColumns"
              :dataSource="checkedData"
              :columnWidthInfo="{ operate: 20 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'operate'">
                  <span class="table-operate-btn" @click="removeFn(record)"
                    >删除</span
                  >
                </template>
              </template>
            </BiTable>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-wrap">
      <BiButton type="primary" @click="submitFn">提交申请</BiButton>
    </div>
  </div>

  <!-- 添加授权信息弹窗 -->
  <BiModal
    title="添加API授权信息"
    width="480px"
    v-model:visible="modalVisible"
    @ok="okFn"
    @cancel="cancelFn"
  >
    <div class="model-input-wrap">
      <template v-for="(v, k) in addAuthInfo">
         <div class="modal-input"  v-if="authStateShowInfo[k]">
            <span class="input-label">{{ v }}</span>
            <!-- 选择单位 -->
            <selectUnitSource
              v-if="k === 'fidName'"
              style="width: 368px;"
              v-model="authState.fidName"
              @select="selectFn"
              @clearFn="clearHandle"
            />
            <BiInput
              v-else
              v-model="authState[k]"
              placeholder="请输入"
              style="flex-grow: 1"
            />
        </div>
      </template>
    </div>
  </BiModal>
</template>

<style lang="less" scoped>
.apply-wrap {
  background-color: #fff;
  height: calc(100% - 36px);
  display: flex;
  flex-direction: column;
  .apply-contaienr {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 30px;
    height: calc(100% - 100px);
    .apply-area {
      display: flex;
      flex-direction: column;
      gap: 16px;
      color: #000000cc;
      .title,
      .tips {
        font-weight: 600;
        font-size: 18px;
      }
      .tips {
        font-size: 15px;
      }
      .form-wrap {
        display: flex;
        width: 640px;
        .input-item {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-basis: 50%;
          &:first-of-type {
            margin-right: 30px;
          }
          .bi-input-wrap {
            flex-grow: 1;
          }
        }
        span {
          flex-basis: 52px;
          font-size: 13px;
          flex-shrink: 0;
        }
      }
      .reason-wrap {
        gap: 12px;
        textarea {
          flex-grow: 1;
          height: 80px;
          padding-top: 7px;
          min-height: 35px;
          max-height: 200px;
        }
      }
      .auth-wrap {
        align-items: center;
        gap: 12px;
        .check-wrap {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          svg {
            width: 14px;
            height: 14px;
            flex-shrink: 0;
          }
        }
        .auth-info {
          color: #2b67ff;
          cursor: pointer;
        }
      }
    }
    .range-area {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 10px;
      height: calc(100% - 344px);
      min-height: 200px;
      .title {
        font-weight: 600;
        font-size: 18px;
        line-height: 21px;
      }
      .range-wrap {
        border: 1px solid #e9e9e9;
        flex-grow: 1;
        display: flex;
        height: calc(100% - 32px);
        overflow: auto;
        & > div {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
          .table-title {
            font-size: 15px;
            font-weight: 600;
          }
          .bi-table-wrap {
            height: calc(100% - 36px);
            overflow: auto;
            :deep(thead) {
              position: sticky;
              top: -2px;
              z-index: 1;
              th{
                color:rgba(0,0,0,.85);
              }
            }
            :deep(.noData) {
              img {
                width: 150px;
              }
              height: auto;
            }
          }
        }
        .left-wrap {
          width: 80%;
          border-right: 1px solid #e9e9e9;
        }
        .right-wrap {
          flex-grow: 1;
        }
        .table-checkbox {
          cursor: pointer;
          width: 16px;
          height: 16px;
          position: relative;
          top: 4px;
        }
        .table-operate-btn {
          color: #2b67ff;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
        }
      }
    }
  }
  .btn-wrap {
    height: 64px;
    border-top: 1px solid #e9e9e9;
    background-color: #fff;
    padding: 16px 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

<style lang="less">
.model-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  .modal-input {
    display: flex;
    align-items: center;
    gap: 12px;
    .input-label {
      font-size: 13px;
      flex-basis: 52px;
      flex-shrink: 0;
      position: relative;
      &::before {
        content: '*';
        color: #f53f3f;
        font-size: 14px;
        position: absolute;
        top: -4px;
        left: -8px;
        font-size: 18px;
      }
    }
    &:last-of-type > .input-label::before {
      content: '';
    }
  }
}
</style>
