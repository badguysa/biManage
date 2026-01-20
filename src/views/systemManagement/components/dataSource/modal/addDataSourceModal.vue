<script setup>
import { ref, onMounted, computed } from 'vue';
import Modal from '@/components/myModal'
import { useI18n } from 'vue-i18n';
import DBForm from '../dbFormInfo'
import APIForm from '../apiFormInfo'
import KafkaFrom from '../kafkaFormInfo'

const { t } = useI18n()

const emits = defineEmits(['cancel', 'updateList','goBack'])

const props = defineProps({
  modalMode: {
    type: String,
    default: 'add',
  }
})

const sourceType = ref('DB')
const showModal = ref(true)
const authenType = ref(-1)

onMounted(() => {
  if(props.modalMode === 'editDB') {
    sourceType.value = 'DB'
  } else if(props.modalMode === 'editAPI') {
    sourceType.value = 'API'
  } else if(props.modalMode === 'editKafka') {
    sourceType.value = 'Kafka'
  }
})

const modalName = computed(() => {
  if(props.modalMode === 'add') 
    return '添加'
  if(props.modalMode === 'editAPI') 
    return 'API数据源'
  if(props.modalMode === 'editDB') 
    return 'DB数据源'
  if(props.modalMode === 'editKafka') 
    return 'KAFKA数据源'
})

const sourceTypeList = [
  {
    id: 'db',
    value: 'DB',
    label: 'DB数据库'
  },
  {
    id: 'api',
    value: 'API',
    label: 'API'
  },
  {
    id: 'kafka',
    value: 'Kafka',
    label: 'Kafka'
  }
]

const changeSourceType = (item) => {
  sourceType.value = item.value
  if(item.value === 'API') {
    emits('goBack')
    emits('cancel')
  }
}

const onCancel = (update) => {
  emits('cancel')
  update && emits('updateList')
}

const toggleShowModal = (val) => {
  showModal.value = val
}

// 动态设置数据源类型标签宽度
const changeTypeFn= (authType) => {
  authenType.value = authType
}

</script>

<template>
  <Modal
    :modalName="modalName" 
    @onCancel="onCancel" 
    :showBottom="false" 
    width="480px" 
    :showModal="showModal"
  >
    <template #modal-body>
      <div class="modalBody">
        <div class="formItem" v-if="modalMode==='add'">
          <span :class="{kafkaType: sourceType === 'Kafka' && authenType > 0}">数据源类型</span>
          <div class="checkBoxWrap">
            <template v-for="item in sourceTypeList">
              <input type="radio" :id="item.id" 
                :value="item.value" 
                name="sourceType" 
                :checked="sourceType===item.value"
                @change="changeSourceType(item)"
              />
              <label :for="item.id">{{ item.label }}</label>
            </template>
          </div>
        </div>
        <DBForm v-show="sourceType === 'DB'" @cancel="onCancel"/>
        <!-- <APIForm v-show="sourceType === 'API'" @toggleShowModal="toggleShowModal" @cancel="onCancel"/> -->
        <KafkaFrom v-show="sourceType === 'Kafka'" @cancel="onCancel" @changeAuthenType="changeTypeFn"/>
      </div>
    </template>
  </Modal>
</template>

<style lang="less" scoped>
.modalBody {
  padding: 24px 0 24px 24px;
  .formItem {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    span {
      display: inline-block;
      width: 76px;
      margin-right: 12px;
      &.kafkaType{
        width: 102px;
      }
    }
    .checkBoxWrap{
      display: flex;
      align-items: center;
      input {
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid #00000024;
        margin-right: 6px;
        cursor: pointer;
        &:checked{
          border-color: #2B67FF;
          position: relative;
          &::before{
            content: '';
            display: inline-block;
            background-color: #3a8bff;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        }
      }
      label{
        cursor: pointer;
        margin-right: 12px;
        &:last-of-type{
          margin-right: 0;
        }
      }
    }
    &>input{
      flex-grow: 1;
    }
  }
}
.modal-bottom {
  padding: 16px 24px 16px 0;
  text-align: right;
  button {
    margin-left: 24px;
    &:first-of-type {
      margin-left: 0;
    }
  }
}
</style>
