<script setup>
import myModal from '@/components/myModal'
import selectGroup from '../../components/selectGroup'

import { reactive, watch } from 'vue'

const useModalStore = modalStore()
const useMainStore = mainStore()
const useConfigStore = configStore()
const { configUniqueData } = storeToRefs(useConfigStore)
const { activeTabKey } = storeToRefs(useMainStore)
const { saveAsModalVisible } = storeToRefs(useModalStore)

const saveAsState = reactive({
  tableName: '',
  tableLocation: activeTabKey.value,
})

const closeModal = () => {
  useModalStore.changeSaveAsModalVisible()
}

// 另存为 确认回调
const confirmFn = () => {
  useConfigStore.importConfigFlie('saveAs', null, activeTabKey.value, saveAsState)
  closeModal()
}

watch(saveAsModalVisible, (nv) => {
  const editData = configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
  saveAsState.tableName = editData.headerInfo.tableName
}, {
  immediate: true
})

</script>

<template>
  <myModal width="440px" modalName="另存为" @onCancel="closeModal" @onConfirm="confirmFn">
    <template #modal-body>
      <div class="modalWrap">
        <div class="modalItem">
          <label>名称</label>
          <input type="text" placeholder="请输入" v-model="saveAsState.tableName" />
        </div>
        <div class="modalItem">
          <label>位置</label>
          <selectGroup 
            class="groupWrap" 
            style="width: 344px;" 
            v-model="saveAsState.tableLocation" 
          />
        </div>
      </div>
    </template>
  </myModal>
</template>

<style lang="less" scoped>
.modalWrap {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .modalItem {
    display: flex;
    align-items: center;
    gap: 20px;
    input,
    :deep(.groupWrap) {
      flex-grow: 1;
    }
  }
}
</style>
