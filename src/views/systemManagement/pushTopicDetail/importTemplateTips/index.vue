<script setup>
import myModal from '@/components/myModal'
import { getCollectionList } from '@/apis/topicModel'
import { getTopicCount, batchSaveTopic } from '@/apis/push'
import { message } from 'ant-design-vue'

const props = defineProps(['hasTheme'])
const emits = defineEmits(['hideModal'])

const useSystemManageStore = systemManageStore()
const { pushCollectionInfo } = storeToRefs(useSystemManageStore)

const showTips = ref(false)
const templateInfo = ref([])
const importType = ref('')

onMounted(async () => {
  await getCollectionInfo()
  await getTopicCountInfo()
})

const getCollectionInfo = async () => {
  let collectionRes = await getCollectionList()
  if (collectionRes.code === 1) {
    templateInfo.value = collectionRes.data
  } else {
    message.error(collectionRes.message)
  }
}

const getTopicCountInfo = () => {
  templateInfo.value.forEach(async temp => {
    let countRes = await getTopicCount({ collectionId: temp.value })
    if (countRes.code === 1) {
      temp.tableNumber = countRes.data
      if (temp.description === '中职主题') {
        importType.value = temp.value
      }
    } else {
      message.error(collectionRes.message)
    }
  })
}

const cancelFn = () => {
  emits('hideModal')
}

const confirmFn = async () => {
  // 当前推送集合含有推送主题 提示是否覆盖
  if (props.hasTheme && !showTips.value) {
    showTips.value = true
    return
  }

  let saveRes = await batchSaveTopic({
    isCover: Number(showTips.value),
    sourceCollectionId: importType.value,
    targetCollectionId: pushCollectionInfo.value.id,
  })

  if (saveRes.code === 1) {
    message.success(saveRes.message)
  } else {
    message.error(saveRes.message)
  }
  emits('hideModal')
}
</script>

<template>
  <myModal :showModal="true" modalName="导入模版" @onCancel="cancelFn" @onConfirm="confirmFn" width="480px">
    <template #modal-body>
      <div class="modalContainer">
        <span v-if="showTips">当前集合内已有主题，是否覆盖导入？</span>
        <a-radio-group v-else v-model:value="importType">
          <a-radio v-for="item in templateInfo" :value="item.value">{{ item.fullName }}（{{ item.tableNumber }}）</a-radio>
        </a-radio-group>
      </div>
    </template>
  </myModal>
</template>

<style lang="less" scoped>
.modalContainer {
  height: 110px;
  padding: 24px;
  .ant-radio-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
    :deep(span.ant-radio + *) {
      padding: 0 6px;
    }
    :deep(.ant-radio-inner) {
      top: 1px;
    }
  }
}
</style>
import { forEach } from 'core-js/core/array'
