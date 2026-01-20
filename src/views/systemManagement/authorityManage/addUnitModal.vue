<script setup>
import { addApiAuth, editApiAuth } from '@/apis/apiAuth'
import { message } from 'ant-design-vue'
import { onMounted } from 'vue'
import tips from '@/components/tips'

const formLabels = [
  {
    label: '单位名称',
    key: 'unitName',
    required: true,
    type: 'input'
  },
  {
    label: '单位ID',
    key: 'unitFid',
    required: false,
    type: 'input'
  },
  {
    label: '使用人',
    key: 'accessUser',
    required: true,
    type: 'input'
  },
  {
    label: '手机号',
    key: 'phone',
    required: true,
    type: 'input'
  },
  {
    label: '授权IP',
    key: 'accessIp',
    required: false,
    type: 'textarea',
    tips: '可使用英文逗号作为分隔，填写多个IP'
  }
]

const formData = reactive({
  unitName: '',
  unitFid: '',
  accessUser: '',
  phone: '',
  accessIp: ''
})

const emits = defineEmits(['cancel', 'confirm'])

const props = defineProps(['editInfo'])

onMounted(() => {
  if (isEdit.value) {
    for (let key in formData) {
      formData[key] = props.editInfo[key]
    }
  }
})

// 是否是编辑状态
const isEdit = computed(() => {
  return props.editInfo
})

const confirmFn = async () => {
  let res = await (isEdit.value
    ? editApiAuth({
        ...formData,
        id: props.editInfo.id
      })
    : addApiAuth({
        ...formData
      }))

  if (res.code != 1) {
    return message.error(res.message)
  } else {
    message.success(res.message)
    emits('confirm')
  }
}

// 监听input框值变化 手动实现数据双向绑定
const changeHandle = (e, key) => {
  let val = e.target.value
  formData[key] = val.trim()
}

const cancelFn = () => {
  emits('cancel')
}
</script>

<template>
  <BiModal
    :title="isEdit ? '编辑' : '添加'"
    @cancel="cancelFn"
    @close="cancelFn"
    @ok="confirmFn"
    okText="确定"
    width="480px"
  >
    <div class="form-wrap">
      <div class="form-item" v-for="item in formLabels">
        <span :class="{ label: true, required: item.required }"
          >{{ item.label }}
          <tips
            v-if="item.key === 'accessIp'"
            tipsContent="可使用英文逗号作为分隔 填写多个IP"
          />
        </span>

        <BiInput
          v-if="item.type === 'input'"
          v-model="formData[item.key]"
          placeholder="请输入"
        />
        <a-textarea
          v-else-if="item.type === 'textarea'"
          :value="formData[item.key]"
          @change="changeHandle($event, item.key)"
        ></a-textarea>
      </div>
    </div>
  </BiModal>
</template>

<style lang="less" scoped>
.form-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  .form-item {
    display: flex;
    align-items: center;
    gap: 12px;
    .label {
      width: 60px;
      position: relative;
      display: flex;
      align-items: center;
      gap: 3px;
      flex-shrink: 0;
      &.required {
        &::before {
          content: '*';
          color: #f53f3f;
          position: absolute;
          top: 0;
          left: -6px;
          font-size: 16px;
        }
      }
    }
    .bi-input-wrap,
    textarea {
      flex-grow: 1;
    }
  }
}
</style>
