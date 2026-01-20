<template>
  <myModal :modalName="t('indexPage.pageSetting')" @onConfirm="onConfirm" @onCancel="onCancel">
    <template #modal-body>
      <div class="setPageSizeModal">
        <a-form
          ref="formRef"
          class="step-box"
          :model="formState"
          :hideRequiredMark="true"
          validateTrigger="onChange"
        >
          <a-form-item
            :colon="false"
            :label="t('indexPage.showPageSize')"
            name="displaySize"
            :rules="[
              {
                required: true,
                validator: (rule, value) => customValidator(rule, value),
                trigger: 'change',
              },
            ]"
          >
            <a-input-number
              :precision="0"
              class="input-box"
              v-model:value="formState.displaySize"
            />
          </a-form-item>
        </a-form>
      </div>
    </template>
  </myModal>
</template>
<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { isNumber } from '@/utils/utils'
import myModal from '@/components/myModal'

const emits = defineEmits(['cancelFn', 'confirmFn'])
const props = defineProps(['maxValue'])

const { t } = useI18n()
const formRef = ref()
const formState = reactive({
  displaySize: 100,
})

const maxNumber = computed(() => {
  return props.maxValue
})
onMounted(() => {})

const customValidator = (rule, value) => {
  if (!value) {
    return Promise.reject(t('indexPage.cannotEmpty'))
  }
  if (!isNumber(value)) {
    return Promise.reject(t('indexPage.overMaxTip'))
  }
  if (value < 0 || value > maxNumber.value) {
    return Promise.reject(
      `${t('indexPage.pleaseEnter')}${maxNumber.value}${t('indexPage.validateText')}`
    )
  }
  return Promise.resolve()
}

const onConfirm = () => {
  if (formState.displaySize > props.maxValue) return
  emits('confirmFn', formState.displaySize)
}

const onCancel = () => {
  emits('cancelFn')
}
</script>

<style lang="less" scoped>
.setPageSizeModal {
  width: 400px;
  padding: 30px 24px 6px 30px;
  :deep(.ant-input-number) {
    width: 100%;
  }
  :deep(.ant-input-number-focused) {
    background: #f3f3f3;
    box-shadow: inset 0px 0px 0px 2px #3d82f2;
    outline: none;
  }
  :deep(.ant-form-item-label) {
    margin-right: 10px;
  }
  .step-box {
    display: flex;
    align-items: center;
    position: relative;
    .input-box {
      width: 134px;
      position: relative;
      .over {
        border: 1px solid #f53f3f;
      }
    }
    .step-input {
      padding-right: 25px;
    }
    .step-img {
      width: 20px;
      height: 13px;
      display: none;
      cursor: pointer;
    }
    .step-img:hover {
      transform: scale(1.05);
    }
    .add {
      position: absolute;
      top: 2px;
      right: 3px;
    }
    .minus {
      position: absolute;
      bottom: 2px;
      right: 3px;
    }
  }
}
</style>
