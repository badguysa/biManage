<template>
    <div class="detailWrapper">
        <back class="back" @backFn="backFn"/>
         <v-md-preview :text="apiMarkDownCode"></v-md-preview>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { apiManageStore } from '@/Stores/apiManageStore'
import back from '@/components/back'

const useApiManageStore = apiManageStore()
const { activeMenuName, apiMarkDownCode } = storeToRefs(useApiManageStore)

const backFn = () => {
    useApiManageStore.setApiPageId('apiManagePage')
    useApiManageStore.changeTabPageId('reset', activeMenuName.value)
}

</script>

<style lang="less" scoped>
.detailWrapper {
    width: 100%;
    height: calc(100% - 36px);
    background-color: #fff;
    overflow: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    img {
        width: 100%;
    }
    .back{
        position: sticky;
        top: 0;
        background-color: white;
        z-index: 999;
    }
    :deep(.github-markdown-body){
        padding: 20px 30px;
    }
}
</style>
