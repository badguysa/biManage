<template>
    <template v-if="apiPageId === 'dataStandardManagePage'">
        <div class="bodyBox" >
            <leftTree />
            <rightTable />
        </div>
    </template>
    <template v-else-if="apiPageId === 'addOrEditDataStandard'">
        <addOrEditDataStandard></addOrEditDataStandard>
    </template>
</template>
<script setup>
import leftTree from '@/views/systemManagement/components/dataStandard/leftTree/index.vue'
import rightTable from '@/views/systemManagement/components/dataStandard/rightTable/index.vue'
import addOrEditDataStandard from '@/views/systemManagement/components/dataStandardAddOrEdit/index.vue'
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { apiManageStore } from '@/Stores/apiManageStore'

const useApiManageStore = apiManageStore()
const { apiPageId } = storeToRefs(useApiManageStore)

</script>
<style lang="less" scoped>
.bodyBox {
    display: flex;
    background: #fff;
    height: calc(100vh - 130px);
}
</style>