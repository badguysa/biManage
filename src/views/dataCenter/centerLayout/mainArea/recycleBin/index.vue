<template>
<div class="recycle_bin">
    <div class="bin_header">
        <MyButton @click="clearData" v-if="!selectedList.length">{{ t('bin.clearBin') }}</MyButton>
        <div v-else>
            <MyButton @click="batchDelete">{{ t('common.delete') }}</MyButton>
            <MyButton @click="batchRevert" style="margin-left: 24px;">{{ t('common.revert') }}</MyButton>
        </div>
        <div class="search">
            <input type="text" v-model="searchValue" :placeholder="t('common.searchTable')">
            <img class="sear" src="@/assets/icons/search.png" alt="">
        </div>
    </div>
    <div class="bin_list">
        <div class="tableWrapper">
            <a-spin :spinning="loading">
                <table class="tableContainer">
                    <tr>
                        <td>
                            <div class="top_check">
                                <img @click="selectAll(1)" class="check_img" v-if="selectedList.length && selectedList.length === tableList.length" src="@/assets/icons/is_select.png" alt="">
                                <img @click="selectAll(2)" class="check_img" v-else-if="selectedList.length === 0" src="@/assets/icons/not_select.png" alt="">
                                <img @click="selectAll(1)" class="check_img" v-else src="@/assets/icons/doing_select.png" alt="">
                                <div class="flex_align_center">{{ t('api.tableName') }}</div>
                            </div>
                        </td>
                        <td>{{ t('indexPage.founder') }}</td>
                        <td>{{ t('bin.deleter') }}</td>
                        <td>{{ t('bin.path') }}</td>
                        <td>{{ t('apiManage.deleteTime') }}</td>
                        <td>{{ t('common.operation') }}</td>
                    </tr>
                    <template v-if="tableList.length">
                        <tr v-for="item in tableList" :key="item.id">
                            <td @click="onSelect(item)">
                                <section class="flex_align_center">
                                    <img v-if="item.isSelect" class="check_img" src="@/assets/icons/is_select.png" alt="">
                                    <img v-else class="check_img" src="@/assets/icons/not_select.png" alt="">
                                    <img class="check_img" :src="item.imgSrc" alt="">
                                    <a-tooltip placement="topLeft">
                                        <template #title>
                                            {{ item.tableAlias }}
                                        </template>
                                        <div>{{ item.tableAlias }}</div>
                                    </a-tooltip>
                                </section>
                            </td>
                            <td>
                                <a-tooltip placement="topLeft">
                                    <template #title>
                                        {{ item.createrName }}
                                    </template>
                                    <div>{{ item.createrName }}</div>
                                </a-tooltip>
                            </td>
                            <td>
                                <a-tooltip placement="topLeft">
                                    <template #title>
                                        {{ item.deleterName }}
                                    </template>
                                    <div>{{ item.deleterName }}</div>
                                </a-tooltip>
                            </td>
                            <td>
                                <a-tooltip placement="topLeft">
                                    <template #title>
                                        {{ item.sourcePath }}
                                    </template>
                                    <div>{{ item.sourcePath }}</div>
                                </a-tooltip>
                            </td>
                            <td>
                                <a-tooltip placement="topLeft">
                                    <template #title>
                                        {{ formatTimeToSecond(item.updateTime) }}
                                    </template>
                                    <div>{{ formatTimeToSecond(item.updateTime) }}</div>
                                </a-tooltip>
                            </td>
                            <td>
                                <div>
                                    <span @click="handleOperation('preview', item)">{{ t('common.check') }}</span>
                                    <span :class="[item.isSelect ? 'ban-text' : '']" @click="handleOperation('revert', item)">{{ t('common.revert') }}</span>
                                    <span :class="[item.isSelect ? 'ban-text' : '']" @click="handleOperation('delete', item)">{{ t('common.delete') }}</span>
                                </div>
                            </td>
                        </tr>
                    </template>
                </table>
            </a-spin>
        </div>
    </div>
    <div class="noData" v-if="!tableList.length">
        <img src="@/assets/images/img_null.png" alt="" />
        <p>{{ t('common.noData') }}</p>
    </div>
    <div class="page" v-if="tableTotal > 15 || loading">
        <a-pagination 
            v-model:current="binPageNumer" 
            :total="tableTotal"
            :pageSize="15"
            show-less-items 
            @change="pageChange"
        />
    </div>
    <preivewModal 
        v-if="recyclePreviewModalVisible"
        :previewData="previewData"
        :previewColumns="previewColumns"
        :tableInfo="tableInfo"
    ></preivewModal>
    <revertModal 
        :isBatchRevert="isBatchOperate" 
        :tableInfo="tableInfo" 
        :selectedList="selectedList"
        v-if="revertModalVisible"
        @refreshData="refreshData"
    ></revertModal>
    <binDeleteTableModal 
        v-if="binDelTableModalVisible"
        :flag="deleteType"
        :isBatchDel="isBatchOperate" 
        :tableInfo="tableInfo"
        :selectedList="selectedList"
        @refreshData="refreshData"
    ></binDeleteTableModal>
</div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import MyButton from '@/components/buttons/myButton'
import { mainStore } from '@/Stores/mainStore'
import { getTableList } from '@/apis/group';
import { modalStore } from '@/Stores/modalStore';
import preivewModal from '@/views/dataCenter/centerLayout/modals/previewModal'
import revertModal from '@/views/dataCenter/centerLayout/modals/revertTableModal'
import binDeleteTableModal from '@/views/dataCenter/centerLayout/modals/binDelTableModal'
import { getimgType, getCodeType, getTableImg, formatTimeToSecond } from '@/utils/utils';
import {
    getIndexPreviewData,
    getIndexPreviewColumns,
} from '@/apis/group'
import { message } from 'ant-design-vue'
const { t } = useI18n()
const useMainStore = mainStore()
const useModalStore = modalStore()
const { recycleData, binPageNumer, accessConfig } = storeToRefs(useMainStore)
const { recyclePreviewModalVisible, revertModalVisible, binDelTableModalVisible } = storeToRefs(useModalStore)
const loading = ref(false)
const indexTableLoading = ref(false)
const previewData = ref([])
const previewColumns = ref([])
const tableInfo = ref({})
const searchValue = ref('')
const tableTotal = ref(0)
const tableList = ref([])
const selectedList = ref([])
const deleteType = ref('') // 删除的类型，区分清空回收站, normal普通删除；clear清空回收站
const isBatchOperate = ref(false) // 是否是批量删除
onMounted(() => {
    initTableList()
})
watch(() => searchValue.value, async (val) => {
    useMainStore.setBinPageNumer('set', 1)
    await nextTick()
    initTableList()
})
const initTableList = () => {
    const params = {
        tableAlias: searchValue.value,
        groupId: recycleData.value.id,
        pageSize: 15,
        pageNum: binPageNumer.value
    }
    loading.value = true
    getTableList(params).then(res => {
        if (res.code == 1) {
            tableTotal.value = Number(res.data.total)
            res.data.records.forEach(item => {
                item.isSelect = false
                item.imgSrc = getTableImg(item.tableType)
            })
            tableList.value = res.data.records
            loading.value = false
        }
    })
}
const refreshData = () => {
    if (deleteType.value === 'clear') {
        useMainStore.setBinPageNumer('set', 1)
    } else {
        if (isBatchOperate.value) {
            // 批量删除把一整页都删完了
            if (selectedList.value.length === tableList.value.length) {
                useMainStore.setBinPageNumer('minus')
            }
        } else {
            if (tableList.value.length === 1) {
                useMainStore.setBinPageNumer('minus')
            }
        }
    }
    initTableList()
    selectedList.value = []
    tableInfo.value = {}
}
const pageChange = () => {
    selectedList.value = []
    initTableList()
}
const handleOperation = (type, record) => {
    if (type !== 'preview' && accessConfig.value.recycleAuth && accessConfig.value.recycleAuth.use == 0) {
        if (record.isSelect) {
            return
        }
        return message.error(t('common.noAuth'))
    }
    tableInfo.value = record
    if (type === 'preview') {
        getIndexTable(record)
    } else if (type === 'revert') {
        if (record.isSelect) {
            return
        }
        isBatchOperate.value = false
        useModalStore.changeRevertModalVisible()
    } else if (type === 'delete') {
        if (record.isSelect) {
            return
        }
        isBatchOperate.value = false
        deleteType.value = 'normal'
        useModalStore.changeBinDelTableModalVisible()
    }
}
const getIndexTable = (record) => {
    const params = {
        tableId: record.id
    }
    indexTableLoading.value = true
    const promiseList = [getIndexPreviewData(params), getIndexPreviewColumns(params)]
    Promise.all(promiseList).then(res => {
        previewColumns.value = []
        previewData.value = []
        if (res[0].code == 1) {
            previewData.value = res[0].data.records
        }
        if (res[1].code == 1) {
            res[1].data.length > 0 && res[1].data.forEach(item => {
                item.dataIndex = item.columnName
                item.isSelect = false
                item.imgType = getimgType(item.columnType)
                item.type = getCodeType(item.columnType)
            })
            previewColumns.value = res[1].data
        }
        indexTableLoading.value = false
        useModalStore.changeRecyclePreviewModalVisible()
    })
}
const onSelect = record => {
    record.isSelect = !record.isSelect
    if (record.isSelect) {
        const ids = selectedList.value.map(item => item.id)
        if (!ids.includes(record.id)) {
            selectedList.value.push(record)
        }
    } else {
        selectedList.value = selectedList.value.filter(item => item.id !== record.id)
    }
}
const selectAll = type => {
    if (type === 1) {
        tableList.value.forEach(item => item.isSelect = false)
        selectedList.value = []
    } else if (type === 2) {
        tableList.value.forEach(item => item.isSelect = true)
        selectedList.value = tableList.value
    }
}
const clearData = () => {
    if (accessConfig.value.recycleAuth && accessConfig.value.recycleAuth.use == 0) {
        return message.error(t('common.noAuth'))
    }
    deleteType.value = 'clear'
    useModalStore.changeBinDelTableModalVisible()
}
const batchDelete = () => {
    if (accessConfig.value.recycleAuth && accessConfig.value.recycleAuth.use == 0) {
        return message.error(t('common.noAuth'))
    }
    if (selectedList.value.length > 1) {
        isBatchOperate.value = true
    } else {
        tableInfo.value = selectedList.value[0]
        isBatchOperate.value = false
    }
    deleteType.value = 'normal'
    useModalStore.changeBinDelTableModalVisible()
}
const batchRevert = () => {
    if (accessConfig.value.recycleAuth && accessConfig.value.recycleAuth.use == 0) {
        return message.error(t('common.noAuth'))
    }
    if (selectedList.value.length > 1) {
        isBatchOperate.value = true
    } else {
        tableInfo.value = selectedList.value[0]
        isBatchOperate.value = false
    }
    useModalStore.changeRevertModalVisible()
}
</script>

<style lang="less" scoped>
.recycle_bin {
    width: 100%;
    height: 100%;
    background: #FFF;
    padding: 20px 30px 0;
    position: relative;
    .bin_header {
        box-sizing: border-box;
        width: 100%;
        display: flex;
        justify-content: space-between;
        height: 32px;
        .search {
            height: 32px;
            position: relative;
            box-sizing: border-box;
            input {
                width: 220px;
                height: 30px;
                padding-right: 33px;
            }

            .sear {
                width: 16px;
                position: absolute;
                top: 50%;
                right: 8.6px;
                cursor: pointer;
                transform: translateY(-50%);
            }

            .clear {
                position: absolute;
                top: 15.5px;
                right: 46.6px;
                width: 16px;
                cursor: pointer;
            }
        }
    }
    .flex_align_center {
        display: flex;
        align-items: center;
    }
    .bin_list {
        width: 100%;
        height: calc(100% - 100px);
        box-sizing: border-box;
        overflow-y: scroll;
        margin-top: 18px;
    }
    .tableWrapper {
        position: relative;
        overflow: scroll;
        .tableContainer {
            width: 100%;
            .top_check {
                display: flex;
                align-items: center;
                width: 100%;
            }
            .check_img {
                width: 16px;
                height: 16px;
                margin-right: 6px;
                cursor: pointer;
            }
            td {
                height: 40px;
                max-height: 56px;
                width: 14%;
                border: 1px solid #e0ebff;
                padding: 10px;
                color: rgba(0, 0, 0, 0.8);
                font-size: 13px;
                & > div {
                    width: 100%;
                    max-height: 56px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    word-break: break-all;
                    line-height: 1.2;
                    & > span {
                        color: #3d82f2;
                        cursor: pointer;
                        margin-right: 16px;
                    }
                }
            }
            section {
                & > div {
                    width: 100%;
                    max-height: 56px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    word-break: break-all;
                    line-height: 1.2;
                }
            }
            tr {
                &:nth-of-type(odd) {
                    background-color: #f7faff;
                }
                &:first-of-type {
                    background-color: #ecf3ff;
                }
            }
            .ban-text {
                opacity: .4;
                cursor: not-allowed;
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
        p {
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.4);
        }
    }
    .page {
        text-align: center;
        margin-top: 10px;
        width: 100%;
        background-color: #FFFFFF;
    }
}
</style>