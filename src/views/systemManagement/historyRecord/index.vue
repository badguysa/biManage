<template>
    <div class="recordWrapper">
        <back @backFn="backFn"/>
        <div class="recordContainer">
            <div class="topContainer">
                <p class="title">{{ t('apiManage.historyRecord') }}</p>
            </div>
            <div class="tableWrapper">
                <table class="tableContainer" v-if="apiHistoryList.length">
                    <tr>
                        <td>{{ t('apiManage.apiName') }}</td>
                        <td>{{ t('apiManage.apiDesc') }}</td>
                        <td>{{ t('apiManage.apiAddress') }}</td>
                        <td>{{ t('apiManage.deleteTime') }}</td>
                        <td>{{ t('apiManage.mapperFile') }}</td>
                        <td>{{ t('apiManage.operationPerson') }}</td>
                    </tr>
                    <tr v-for="item in apiHistoryList" :key="item.id">
                        <td>
                            <a-tooltip>
                                <template #title>
                                    {{ item.apiName }}
                                </template>
                                <div>{{ item.apiName }}</div>
                            </a-tooltip>
                        </td>
                        <td>
                            <a-tooltip>
                                <template #title>
                                    {{ item.apiDes }}
                                </template>
                                <div>{{ item.apiDes }}</div>
                            </a-tooltip>
                        </td>
                        <td>
                            <a-tooltip>
                                <template #title>
                                    {{ item.apiUrl }}
                                </template>
                                <div><span>{{ item.apiUrl }}</span></div>
                            </a-tooltip>
                        </td>
                        <td>
                            <a-tooltip>
                                <template #title>
                                    {{ formatTime(item.deletetime) }}
                                </template>
                                <div>{{ formatTime(item.deletetime) }}</div>
                            </a-tooltip>
                        </td>
                        <td>
                            <a-tooltip>
                                <template #title>
                                    {{ item.tableName.join(',') }}
                                </template>
                                <div>{{ item.tableName.join(',') }}</div>
                            </a-tooltip>
                        </td>
                        <td>
                            <a-tooltip>
                                <template #title>
                                    {{ item.operateName }}
                                </template>
                                <div>{{ item.operateName }}</div>
                            </a-tooltip>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="noData" v-if="!apiHistoryList.length">
                <img src="@/assets/images/img_null.png" alt="" />
                <p>{{ t('common.noData') }}</p>
            </div>
            <div class="page" v-if="apiHistoryDataTotal > 12">
                <a-pagination 
                    v-model:current="apiHistoryPageNumber" 
                    :total="apiHistoryDataTotal"
                    :pageSize="12"
                    show-less-items 
                    @change="pageChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia';
import { apiManageStore } from '@/Stores/apiManageStore'
import { formatTime } from '@/utils/utils'
import { useI18n } from 'vue-i18n';
import back from '@/components/back'

const { t } = useI18n()

const useApiManageStore = apiManageStore()
const { activeMenuName, apiHistoryList, apiHistoryDataTotal, apiHistoryPageNumber } = storeToRefs(useApiManageStore)

onMounted(() => {
    useApiManageStore.initApiHistoryList()
})

const backFn = () => {
    useApiManageStore.setApiPageId('apiManagePage')
    useApiManageStore.changeTabPageId('reset', activeMenuName.value)
}

const pageChange = () => {
    useApiManageStore.initApiHistoryList()
}
</script>

<style lang="less" scoped>
.recordWrapper {
    width: 100%;
    height: calc(100% - 36px);
    background-color: #fff;
    padding-bottom: 40px;
    display: flex;
    flex-direction: column;
    position: relative;
    .recordContainer{
        padding: 20px 30px;
        overflow: auto;
    }
    .topContainer {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        .title {
            font-weight: 600;
            font-size: 18px;
            line-height: 25px;
            color: rgba(0, 0, 0, 0.8);
            margin-bottom: 0;
        }
        .add-btn {
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 2px;
            height: 32px;
        }
    }
    .tableWrapper {
        position: relative;
        overflow: scroll;
        .tableContainer {
            width: 100%;
            td {
                height: 40px;
                max-height: 56px;
                width: 16.67%;
                border: 1px solid #e0ebff;
                padding: 10px;
                color: rgba(0, 0, 0, 0.8);
                font-size: 13px;
                & > div {
                    max-width: 100%;
                    max-height: 40px;
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
                        word-break: break-all;
                        line-height: 1.2;
                    }
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
            .apiUrl {
                color: #3d82f2;
                cursor: pointer;
            }
        }
    }

    .noData {
        text-align: center;
        top: 25%;
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
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
    }
}
</style>
