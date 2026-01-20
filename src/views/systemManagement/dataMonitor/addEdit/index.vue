<script setup>
import mainArea from '@/views/systemManagement/layouts/mainArea.vue'
import myButton from '@/components/buttons/myButton.vue'
import back from '@/components/back'
import multipleSelectInput from '../components/multipleSelectInput.vue'
import recipientInput from '@/components/chooseRecipient/recipientInput.vue'
import chooseTable from '../components/chooseTable.vue'
import chooseDataSource from '../components/chooseDataSource.vue'
import choosePushTask from '../components/choosePushTask.vue'
import { methodOptions, montiorObjectList } from './consntants'
import { addDataMonitor, updateDataMonitor, viewMonitorDetail } from '@/apis/dataMonitor'
import { message } from 'ant-design-vue'
import { getTableSvg } from '@/utils/utils'

const emits = defineEmits(['back'])

const props = defineProps(['operateType', 'operateId'])

const formState = reactive({
  name: '',
  tables: [],
  groups: [],
  dataSources: [],
  push: [],
  notifyModes: [],
  recipients: ''
})
// 编辑id
const editObjId = ref('')
const modalType = ref('')

onMounted(() => {
  echoEditData()
})

// 回显编辑数据
const echoEditData = async () => {
  if (props.operateType !== 'edit') return
  let res = await viewMonitorDetail(props.operateId)

  if (res.code != 1 || !res.data) return message.error(res.message)

  let info = res.data
  editObjId.value = info.id
  formState.name = info.name
  formState.notifyModes = info.notifyModes || []
  formState.recipients = info.recipients?.join(',') || ''
  formState.tables = info.tables || []
  formState.tables.map(it => {
    it.icon = getTableSvg(it.tableType)
    it.isTable = true
  })
  formState.groups = info.groups || []
  formState.dataSources = info.dataSources || []
  formState.push = info.pushCollections || []

  if (info.pushTopics) {
    formState.push = formState.push.concat(info.pushTopics)
  }
}

// 删除
const deleteFn = (type, target) => {
  if (!formState[type]) return
  formState[type] = formState[type].filter(it => it.id !== target.id)
}

const getMultipleSelectData = (dataIndex) => {
  // 合并数据表 数据分组
  if(dataIndex === 'tables') {
    return [...formState.tables, ...formState.groups]
  }
  return formState[dataIndex]
}

const saveFn = async () => {
  const requestParams = {
    name: formState.name,
    notifyModes: formState.notifyModes.join(','),
    dataSourceIds: formState.dataSources.map(it => it.id),
    // 分组id
    groupIds: formState.groups.map(it => it.id),
    // 表id
    tableIds: formState.tables.map(it => it.id),
    pushCollectionIds: formState.push.filter(it => !it.collectionId).map(it => it.id),
    pushTopicIds: formState.push.filter(it => it.collectionId).map(it => it.id),
    recipients: formState.recipients ? formState.recipients.split(',') : []
  }

  let promise = null

  if (props.operateType === 'edit') {
    requestParams.id = editObjId.value
    promise = updateDataMonitor(requestParams)
  } else {
    promise = addDataMonitor(requestParams)
  }

  promise.then(res => {
    if (res.code === 1) {
      message.success(props.operateType == 'edit' ? '修改成功' : '添加成功')
      emits('back', true)
    } else {
      message.error(res.message)
    }
  })

  console.log('requestParams', requestParams)
}
</script>

<template>
  <div class="add-wrap">
    <back @backFn="$emit('back')" />
    <mainArea :pageTitle="`${operateType === 'add' ? '添加' : '编辑'}数据监控`">
      <template #topRight>
        <myButton type="primary" @click="saveFn">保存</myButton>
      </template>
      <div class="monitor-wrap">
        <!-- 监控名称 -->
        <div class="monitor-name">
          <span>监控名称</span>
          <BiInput style="width: 812px" v-model="formState.name" placeholder="请输入" />
        </div>

        <!-- 监控对象 -->
        <div class="monitor-object">
          <span>监控对象</span>
          <div class="object-wrap">
            <multipleSelectInput
              v-for="obj in montiorObjectList"
              :title="obj.title"
              :placeholder="obj.placeholder"
              :selectData="getMultipleSelectData(obj.dataIndex)"
              :dataIndex="obj.dataIndex"
              @add="type => (modalType = type)"
              @delete="deleteFn"
            />
          </div>
        </div>

        <!-- 通知方式 -->
        <div class="notify-method">
          <span>通知方式</span>
          <a-checkbox-group v-model:value="formState.notifyModes" :options="methodOptions" />
        </div>

        <!-- 收件人 -->
        <div class="recipient">
          <span>收件人</span>
          <recipientInput v-model:puidStr="formState.recipients" />
        </div>
      </div>
    </mainArea>
  </div>

  <!-- 添加数据表 -->
  <chooseTable 
    v-if="modalType === 'tables'" 
    v-model:tables="formState.tables"
    v-model:groups="formState.groups"
    @cancel="modalType = ''"
  />

  <!-- 添加数据源 -->
  <chooseDataSource
    v-if="modalType === 'dataSources'"
    v-model:dataSources="formState.dataSources"
    @cancel="modalType = ''"
  />

  <!-- 添加推送任务 -->
  <choosePushTask
    v-if="modalType === 'push'"
    v-model:push="formState.push"
    @cancel="modalType = ''"
  />
</template>

<style lang="less" scoped>
.add-wrap {
  background-color: #fff;
  height: calc(100% - 36px);
  .mainArea {
    overflow-y: auto;
  }
  .monitor-wrap {
    display: flex;
    gap: 16px;
    flex-direction: column;
    .monitor-name,
    .monitor-object,
    .notify-method,
    .recipient {
      display: flex;
      gap: 12px;
      align-items: center;
      & > span {
        flex-shrink: 0;
        flex-basis: 76px;
      }
    }
    .monitor-name {
      :deep(.bi-input-wrap > input) {
        background-color: #fff;
        border: 1px solid #e9e9e9;
      }
    }
    .monitor-object {
      align-items: flex-start;
      .object-wrap {
        width: 812px;
      }
    }
    .recipient {
      align-items: flex-start;
    }
  }
}
</style>
