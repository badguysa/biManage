<script setup>
import { setNotifyConf, getNotifyConf } from '@/apis/notice'
import mainArea from '../layouts/mainArea.vue'
import myButton from '@/components/buttons/myButton.vue'
import exitTipModal from '../components/exitTipModal'
import { message } from 'ant-design-vue'
import { debounce } from 'loadsh'

const useMainStore = mainStore()
const useModalStore = modalStore()
const { systemConfig } = storeToRefs(useMainStore)

const { exitTipModalVisible } = storeToRefs(useModalStore)

const eventMap = [
  'RUN_SUCCESS', // 运行成功
  'RUN_FAILED', // 运行失败
  'RUN_TERMINATE', // 运行终止
]

const notifyContentMap = ['unitName', 'eventName', 'finishTime', 'instanceName', 'eventResult']

const formState = reactive({
  enable: 0,
  events: [0, 1, 2],
  senders: [],
  noticeConentType: 0,
  templateContent: ['', '', ''],
  contentType: [
    [0, 1, 2, 3, 4],
    [0, 1, 2, 3, 4],
    [0, 1, 2, 3, 4],
  ],
})

const labelCol = {
  style: {
    width: '76px',
    marginRight: '12px',
    textAlign: 'left',
  },
}

const formDataList = {
  eventList: [
    { label: '运行成功', value: 0 },
    { label: '运行失败', value: 1 },
    { label: '运行终止', value: 2 },
  ],
  methodList: [
    {
      label: '学习通收件箱',
      value: 0,
      tips: '开启后消息推送至 学习通- 收件箱 下，若需正常接收消息请保证登录平台账号与学习通账号一致',
      alias: 'STUDY'
    },
    {
      label: '短信',
      value: 2,
      tips: '开启后消息推送至登录平台账号绑定手机，同一手机号一天内最多接收10条短信通知，超出10条的通知将推送至学习通收件箱',
      alias: 'SMS',
    },
    // {
    //   label: '邮件',
    //   value: 1,
    //   tips: '开启后消息推送至登录平台账号绑定邮箱',
    //   alias: 'EMAIL'
    // },
  ],
  conentTypeList: [
    { title: '基本信息（运行单位名称，例如：超星大学）', value: 0 },
    { title: '触发事件（触发事件类型，例如：DB数据库导入）', value: 1 },
    { title: '触发时间（触发事件时间，例如：2023-10-15 14:22:53）', value: 2 },
    { title: '任务名词（触发任务名称，例如：教育教学学生信息情况表）', value: 3 },
    { title: '触发结果（触发事件结果，例如：运行成功）', value: 4 },
  ],
}

// 初始化表单状态
let initFormState = ref(true)

onMounted(async () => {
  await getNotifyInfo()
})

// 通知事件方式
const supportNotify = computed(() => {
  return systemConfig.value.supportNotify || ['STUDY', 'SMS', 'EMAIL']
})

// 获取通知信息
const getNotifyInfo = async () => {
  let res = await getNotifyConf()
  if (res.code === 1 ) {
    if(!res.data) return
    let { enable, events, senders, template } = res.data

    formState.enable = enable || 0
    formState.events = events?.map(it => it.value)
    formState.senders = senders?.map(it => it.value)

    let tempInfo = []
    for (let key in template) {
      formState.templateContent[key] = template[key]?.template
      tempInfo[key] = template[key]?.metrics?.map(it => notifyContentMap.findIndex(i => i === it.name))
    }
    formState.contentType = tempInfo
  } else {
    message.error(res.message)
  }
}

// 获取通知保存参数
const getNotifySaveParams = () => {
  let notifyInfoParams = {
    enable: formState.enable,
    events: formState.events,
    senders: formState.senders,
  }

  let templateInfo = {}
  formState.contentType.map((item, index) => {
    templateInfo[index] = {
      metrics: item.map(it => ({ name: notifyContentMap[it] })),
      template: formState.templateContent[index],
    }
  })

  notifyInfoParams.template = templateInfo
  return notifyInfoParams
}

const saveFn = debounce(() => {
  let params = getNotifySaveParams()
  setNotifyConf(params).then((res) => {
    if(res.code === 1) {
      message.success(res.message)
    } else {
      message.error(res.message)
    }
  })
  useMainStore.switchNoticeChange(false)
}, 500, {
  leading: true,
  trailing: false
})

watch(formState, ()=>{
  // 非初始化修改 
  if(!initFormState.value) {
    useMainStore.switchNoticeChange(true)
  } else {
    initFormState.value = false
  }
})
</script>

<template>
  <mainArea pageTitle="通知管理">
    <template #topRight>
      <myButton type="primary" @click="saveFn">保存</myButton>
    </template>
    <div class="noticeWrap">
      <a-form :model="formState" :label-col="labelCol">
        <a-form-item label="通知">
          <a-radio-group v-model:value="formState.enable">
            <a-radio :value="1">开启通知</a-radio>
            <a-radio :value="0">关闭通知</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="通知事件">
          <a-checkbox-group v-model:value="formState.events">
            <a-checkbox v-for="it in formDataList.eventList" :value="it.value">{{ it.label }}</a-checkbox>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item label="通知方式">
          <a-checkbox-group v-model:value="formState.senders">
            <template v-for="method in formDataList.methodList">
              <div class="checkItem">
                  <a-checkbox :value="method.value" :disabled="!supportNotify.includes(method.alias)">{{ method.label }}</a-checkbox>
                  <span class="tips">{{ method.tips }}</span>
              </div>
              <!-- 短信模板 -->
              <div class="SMStemplate" v-if="method.alias==='SMS' && formState.senders.includes(method.value)">
                <p class="title">固定模板</p>
                <span class="content">您在 YYYY-MM-DD hh:mm:ss 执行的 xx 个运行任务已执行结束，任务结果：xx 运行成功，xx 运行失败，xx 运行终止。请及时处理。</span>
              </div>
            </template>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item label="通知内容">
          <a-select class="contentSelect" v-model:value="formState.noticeConentType" :options="formDataList.eventList"></a-select>

          <a-checkbox-group class="contentCheckBox" v-model:value="formState.contentType[formState.noticeConentType]">
            <a-checkbox v-for="it in formDataList.conentTypeList" :value="it.value">{{ it.title }}</a-checkbox>
          </a-checkbox-group>

          <a-textarea
            v-model:value="formState.templateContent[[formState.noticeConentType]]"
            placeholder="请输入自定义通知内容"
            show-count
            :maxlength="200"
          />
        </a-form-item>
      </a-form>
      <div class="btnWrap"></div>
    </div>
  </mainArea>
  <!-- 切换提示 -->
  <exitTipModal v-if="exitTipModalVisible"></exitTipModal>
</template>

<style lang="less" scoped>
.noticeWrap {
  max-width: 900px;
  min-width: 400px;

  .ant-form-item {
    margin-bottom: 16px;
  }
  .checkItem {
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;
    label {
      font-size: 13px;
    }
    .tips {
      color: rgba(0, 0, 0, 0.4);
      font-size: 12px;
      margin-left: 21px;
      margin-top: 1px;
    }
  }
  .SMStemplate{
    background-color: #F2F3F5;
    padding: 12px;
    margin-left: 21px;
    color: #00000099;
    margin-top: 10px;
    margin-bottom: 10px;
    .title{
      font-size: 13px;
      margin-bottom: 4px;
      font-weight: 500;
    }
  }
  .contentSelect {
    width: 300px;
    margin-bottom: 10px;
  }
  .contentCheckBox {
    display: flex;
    flex-direction: column;
    .ant-checkbox-wrapper {
      font-size: 13px;
      margin-bottom: 12px;
      & + .ant-checkbox-wrapper {
        margin-left: 0;
      }
      &:last-of-type {
        margin-bottom: 10px;
      }
    }
  }
  :deep(.ant-input-textarea) {
    textArea {
      background-color: #f3f3f3;
      border: none;
      resize: none;
      height: 120px;
      &:hover {
        background-color: #f3f3f3;
      }
    }
    &::after {
      color: #00000066;
      float: unset;
      position: absolute;
      right: 12px;
      bottom: 24px;
    }
  }
  :deep(.ant-radio-checked) {
    .ant-radio-inner {
      border-color: #2b67ff;
    }
  }
  :deep(.ant-checkbox-inner) {
    width: 14px;
    height: 14px;
  }
  :deep(.ant-checkbox-checked) {
    .ant-checkbox-inner {
      background-color: #2b67ff;
      border: none;
    }
  }
  :deep(.ant-form-item-label) {
    & > label {
      height: 22px;
      &::after {
        content: '';
      }
    }
  }
  :deep(.ant-form-item-control-input) {
    min-height: 22px;
  }
}
</style>
