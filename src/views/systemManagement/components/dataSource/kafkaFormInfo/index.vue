<script setup>
import { addKafkaSource, editKafkaSource, testKafkaConn } from '@/apis/dataSourceManage'
import Button from '@/components/buttons/myButton'
import { message } from 'ant-design-vue'

const { t } = useI18n()
const formRef = ref()

const emits = defineEmits(['cancel', 'changeAuthenType'])

const sourceInfo = inject('dataSourceInfo')

const modalMode = inject('modalMode')

const state = reactive({
  kafkaSourceName: '',
  authenType: 0,
  server: '',
  mechanism: '',
  jassConfig: '',
})

const optionList = [
  { value: 'PLAIN', disabled: true },
  { value: 'GSSAPI', disabled: true },
  { value: 'SCRAM-SHA-256' },
  { value: 'SCRAM-SHA-512', disabled: true },
  { value: 'OAUTHBEARER', disabled: true },
  { value: 'AWS_MSK_IAM', disabled: true },
]

const configEncTest = '***********************'

onMounted(() => {
  echoInfo()
})

// 是否为编辑状态
const isEdit = computed(() => {
  return modalMode.value === 'editKafka'
})

// 回显信息
const echoInfo = () => {
  // 编辑状态 回显数据
  if (!isEdit.value) return

  let editInfo = sourceInfo.value

  state.kafkaSourceName = editInfo.sourceName
  state.authenType = Number(editInfo.securityProtocol !== 'NONE')
  state.server = editInfo.servers

  if(state.authenType) {
    state.mechanism = 'SCRAM-SHA-256'
    state.jassConfig = configEncTest
  }
}

const changeFn = val => {
  emits('changeAuthenType', state.authenType)
}

// 测试连接
const testConn = async () => {
  let res = await testKafkaConn(dataSrouceParams.value)

  if (res.code === 1) {
    message.success('测试连接成功')
  } else {
    message.error('测试连接失败')
  }
}

const onOK = () => {
  formRef.value
    .validateFields()
    .then(async () => {
      let requestParams = {
        sourceName: state.kafkaSourceName.trim(),
        sourceType: 6,
        dataSource: dataSrouceParams.value,
      }

      let requestRes = null

      if (isEdit.value) {
        // 编辑
        requestParams.id = sourceInfo.value.kafkaId
        requestParams.dataSource.id = sourceInfo.value.id
        requestParams.dataSource.sourceName = state.kafkaSourceName.trim()
        requestRes = await editKafkaSource(requestParams)
      } else {
        // 新增
        requestRes = await addKafkaSource(requestParams)
      }

      if (requestRes.code === 1) {
        message.success(requestRes.message)
        emits('cancel', true)
      } else {
        message.error(requestRes.message)
      }
    })
    .catch(e => {
      console.log('e', e)
    })
}

// 数据源参数
const dataSrouceParams = computed(() => {
  // 无鉴权
  if (state.authenType === 0) {
    return {
      servers: state.server.trim(),
      securityProtocol: 'NONE',
    }
  } else {
    // SASL_PLAINTEXT鉴权
    let params = {
      servers: state.server.trim(),
      securityProtocol: state.authenType > 0 ? 'SASL_PLAINTEXT' : 'NONE',
      configuration: JSON.stringify({
        'sasl.mechanism': state.mechanism,
        'sasl.jaas.config': state.jassConfig,
      })
    }

    // 回显编辑 & SASL_PLAINTEXT鉴权 config前拼接enc:区分是否密文传输
    if(isEdit.value && state.authenType && state.jassConfig === configEncTest) {
      params.configuration = JSON.stringify({
        'sasl.mechanism': state.mechanism,
        'sasl.jaas.config': 'enc:' + JSON.parse(sourceInfo.value.configuration)['sasl.jaas.config']
      })
    }

    return params
  }
})
</script>

<template>
  <div class="kafkaWrap">
    <a-form
      ref="formRef"
      :model="state"
      :hideRequiredMark="true"
      :style="{ '--label-w': state.authenType > 0 ? '102px' : '76px' }"
    >
      <a-form-item
        name="kafkaSourceName"
        :label="t('dataSource.sourceName')"
        :rules="[{ required: true, message: t('dataSource.sourceNameTips') }]"
      >
        <a-input v-model:value="state.kafkaSourceName" :placeholder="t('dataSource.sourceNameTips')" />
      </a-form-item>
      <a-form-item label="鉴权方式">
        <a-radio-group v-model:value="state.authenType" @change="changeFn">
          <a-radio :value="0" name="authenType">无鉴权</a-radio>
          <a-radio :value="1" name="authenType">SASL_PLAINTEXT</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item name="server" label="服务器" :rules="[{ required: true, message: t('dataSource.serverNameTips') }]">
        <a-input v-model:value="state.server" placeholder="请输入ip:port, 多个请用英文逗号分隔" />
      </a-form-item>
      <template v-if="state.authenType > 0">
        <a-form-item
          name="mechanism"
          label="Sasl Mechanism"
          :rules="[{ required: true, message: t('dataSource.SaslMechanismTips') }]"
        >
          <a-select v-model:value="state.mechanism" :options="optionList"></a-select>
        </a-form-item>
        <a-form-item
          name="jassConfig"
          label="Sasl Jaas Config"
          :rules="[{ required: true, message: t('dataSource.SaslConfigTips') }]"
        >
          <a-textarea
            v-model:value="state.jassConfig"
            :rows="4"
            placeholder="<loginModuleClass> <controlFlag> (<optionName>=<optionValue>)*;"
          />
        </a-form-item>
      </template>
    </a-form>
    <div class="btnWrap">
      <Button @click="$emit('cancel')">取消</Button>
      <Button @click="testConn">测试连接</Button>
      <Button type="primary" @click="onOK">确定</Button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.kafkaWrap{
  padding-right: 24px;
}
:deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
  border-radius: 4px;
}

.ant-form-item {
  gap: 12px;
  margin-bottom: 16px;
}
:deep(.ant-form-item-label) {
  text-align: left;
  flex-basis: var(--label-w);
}

:deep(.ant-form-item-label > label) {
  white-space: pre-line;
  line-height: 1.1;
  &::after {
    display: none;
  }
}

.ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input,
.ant-form-item-has-error :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper,
.ant-form-item-has-error
  :not(.ant-input-number-affix-wrapper-disabled):not(.ant-input-number-affix-wrapper-borderless).ant-input-number-affix-wrapper,
.ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input:hover,
.ant-form-item-has-error
  :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper:hover,
.ant-form-item-has-error
  :not(.ant-input-number-affix-wrapper-disabled):not(.ant-input-number-affix-wrapper-borderless).ant-input-number-affix-wrapper:hover {
  border: 1px solid #ff4d4f !important;
}

.btnWrap {
  text-align: right;
  padding-top: 24px;
  padding-right: 24px;
  button {
    margin-left: 24px;
    &:first-of-type {
      margin-left: 0;
    }
  }
}
</style>
