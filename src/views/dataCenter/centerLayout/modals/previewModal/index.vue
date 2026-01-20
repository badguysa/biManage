<template>
<MyModal 
    :modalName="tableInfo.tableAlias" 
    :showBottom="false"
    @onCancel="onCancel"
>
    <template #modal-body>
        <div class="previewModalBody">
            <div class="desc">
                <div>
                    <span>{{ t('common.total') }} {{ tableInfo.dataNum }} {{ t('common.size') }}</span>
                    <span class="ml12">{{ getFileSize(tableInfo.tableSize || 0) }}</span>
                </div>
                <div>{{ t('common.previewNum') }}</div>
            </div>
            <div class="table">
                <MyTable :tableColumns="previewColumns" :tableData="previewData">
                </MyTable>
            </div>
        </div>
    </template>
</MyModal>
</template>

<script setup>
import MyModal from '@/components/myModal/index.vue'
import MyTable from '@/components/table'
import { modalStore } from '@/Stores/modalStore'
import { getFileSize } from '@/utils/utils'
import { useI18n } from 'vue-i18n'
const useModalStore = modalStore()
const { t } = useI18n()
defineProps({
    tableInfo: {
        default: ''
    },
    previewData: {
        type: Array,
        default: []
    },
    previewColumns: {
        type: Array,
        default: []
    }
})

const onCancel = () => {
    useModalStore.changeRecyclePreviewModalVisible()
}
</script>

<style lang="less" scoped>
.previewModalBody {
    width: 62.5vw;
    height: 80vh;
    padding: 10px 20px;
    .table {
        overflow: scroll;
        height: calc(100% - 24px);
        width: 100%;
    }
    .desc {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        height: 12px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.40);
        .ml12 {
            margin-left: 12px;
        }
    }
}
</style>