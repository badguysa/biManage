<template>
    <div class="tableWrapper">
        <table class="tableContainer">
            <tr>
                <td class="width20">{{ t('dataStandard.dataTableName') }}</td>
                <td class="width20">{{ t('dataStandard.description') }}</td>
                <td class="width10">{{ t('dataStandard.applyDataTable') }}</td>
                <td class="width10">{{ t('dataStandard.createrName') }}</td>
                <td class="width20">{{ t('dataStandard.createTime') }}</td>
                <td class="width20">{{ t('dataStandard.operation') }}</td>
            </tr>
            <template v-if="standardTableList.length">
                <tr v-for="item in standardTableList" :key="item.id">
                    <td class="width20">
                        <div :title="item.name">{{ item.name }}</div>
                    </td>
                    <td class="width20">
                        <div :title="item.description">{{ item.description }}</div>
                    </td>
                    <td class="dataTable width10">
                        <span @click="checkDataTable(item)" :title="item.applicationCount">{{ item.applicationCount || 0 }}</span>
                    </td>
                    <td class="width10">
                        <div :title="item.creator">{{ item.creator }}</div>
                    </td>
                    <td class="width20">
                        <div :title="item.createTime">{{ item.createTime ? formatTime(Number(item.createTime)) : 0 }}</div>
                    </td>
                    <td class="opeartion width20">
                        <div>
                            <span @click="editHandle(item)">{{ t('common.edit') }}</span>
                            <span @click="removeHandle(item)">{{ t('common.delete') }}</span>
                            <span v-if="activeStandardType == 0" @click="downloadHandle(item)">{{ t('common.download') }}</span>
                        </div>
                    </td>
                </tr>
            </template>
        </table>
    </div>
    <div class="noData" v-if="!standardTableList.length">
        <img src="@/assets/images/img_null.png" alt="" />
        <div class="text">{{ t('common.noData') }}</div>
    </div>
    <div class="page" v-if="standardTableTotal > 12">
        <a-pagination 
            v-model:current="standardTablePageNumber" 
            :total="standardTableTotal"
            :pageSize="12"
            show-less-items 
            @change="pageChange"
        />
    </div>
    <!-- 删除弹窗 -->
    <deleteModal ref="deleteModalRef" @confirmRemoveHandle="confirmRemoveHandle" />
    <!-- 应用数据表弹窗 -->
    <dataTableModal v-if="showDataModal" @modalCancel="showDataModal = false" :sourceId="sourceId" :sourceType="1"/>
</template>
<script setup>
import { mainStore } from '@/Stores/mainStore'
import { standardTableDetail, standardTableDelete, standardTableDownload } from '@/apis/dataStandard'
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { apiManageStore } from '@/Stores/apiManageStore';
import { debounce, cloneDeep } from 'lodash'
import deleteModal from '@/views/systemManagement/components/deleteModal.vue';
import dataTableModal from '@/views/systemManagement/components/dataSource/modal/dataTableModal.vue'
import { formatTime } from '@/utils/utils'
import { message } from 'ant-design-vue';

const { t } = useI18n()
const useDataStandardStore = dataStandardStore()
const useMainStore = mainStore()

const { accessConfig } = storeToRefs(useMainStore)
const { standardTableList, standardTableTotal, standardTablePageNumber, activeStandardType } = storeToRefs(useDataStandardStore)
const useApiManageStore = apiManageStore()

const showDataModal = ref(false) //应用数据表
const sourceId = ref('') //应用数据表来源ID
let deleteModalRef = ref() // 删除弹窗
const deleteData = ref() // 删除的数据


const editHandle = async(item) => {
    const res = await standardTableDetail(item.id)
    if(res.code === 1){
        const data = res.data
        useApiManageStore.setApiPageId('addOrEditDataStandard')
        useDataStandardStore.setAddOrEditDataStandardStatus(1)
        useDataStandardStore.setEditDataStandardObj(data)
    }
}

const removeHandle = async (item) => {
    deleteData.value = item
    deleteModalRef.value.modalVisible = true
    
}
// 确认删除回调
const confirmRemoveHandle = async() => {
    const { id } = deleteData.value
    const res = await standardTableDelete(id)
    if (res.code == 1) {
        if (standardTableList.value.length === 1) {
            const pageNumber = standardTablePageNumber.value - 1 || 1
            useDataStandardStore.setPageNumber(pageNumber)
        }
        useDataStandardStore.getStandardTableListFn()
        message.success(res.message)
    } else {
        message.error(res.message)
    }
}


const downloadHandle = debounce(
    async(item) =>{
        const { id, name } = item
        const res = await standardTableDownload(id)
        // 这是失败的情况，返回封装的二进制json数据
        if(res.type === 'application/json'){
            let result
            let reader = new FileReader();
            // 设置 FileReader 对象的 onload 回调函数
            reader.onload = function(event) {
                // 读取 Blob 中的数据
                const data = event.target.result;
                // 将数据解析为 JavaScript 对象
                result = JSON.parse(data);
                if (result.code === 0) {
                    message.error(result.message)
                }
            }
            // 读取 Blob 中的数据
            reader.readAsText(res);
        // 返回成功的情况，返回二进制文本数据
        } else if ( res.type === 'application/vnd.ms-excel'){
            let data = res;
            if(res.data){
                data = res.data;
            }
            const blob = new Blob([data])
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = name + '.xlsx'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }
,400)

const pageChange = () => {
    useDataStandardStore.getStandardTableListFn()
}

// 查看数据表
const checkDataTable = (item) => {
  sourceId.value = item.id
  showDataModal.value = true
}

</script>
<style lang="less" scoped>
.tableWrapper {
    position: relative;
    overflow: scroll;
    .tableContainer {
        width: 100%;
        td {
            height: 40px;
            max-height: 56px;
            border: 1px solid #e0ebff;
            padding: 10px;
            color: rgba(0, 0, 0, 0.8);
            font-size: 13px;
            & > div {
                max-width: 100%;
                max-height: 56px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                & > span {
                    color: #3d82f2;
                    cursor: pointer;
                    margin-right: 16px;
                }
            }
            &.dataTable,
            &.operate > span {
                cursor: pointer;
                color: #2b67ff;
            }
        }
        .width20{
            width: 20%;
        }
        .width10{
            width: 10%;
        }
        tr {
            &:nth-of-type(odd) {
                background-color: #f7faff;
            }
            &:first-of-type {
                background-color: #ecf3ff;
            }
        }
        .apiUrl {
            color: #3d82f2;
            cursor: pointer;
        }
    }
}
.noData {
    text-align: center;
    top: 50%;
    left: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    img {
        width: 180px;
        height: 130px;
    }
    .text {
        color: rgba(0, 0, 0, 0.40);
        font-family: PingFang SC;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
    }
}
.page {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
}
</style>