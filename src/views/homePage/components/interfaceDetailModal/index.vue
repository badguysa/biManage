<template>
    <myModal :modal-name="modalName" width="840px" :showBottom="false" @onCancel="onCancel">
        <template #modal-body>
            <div class="tableTrendModal">
                <div class="tableWrapper">
                    <a-spin :spinning="loading">
                        <table class="tableContainer" v-if="interfaceDetailList.length">
                            <tr>
                                <th>{{ t('apiManage.apiName') }}</th>
                                <th>{{ t('apiManage.mapperTable') }}</th>
                                <th>{{ t('overview.interfaceCalledNumCount') }} </th>
                                <th>{{ t('overview.successCount') }} </th>
                                <th>{{ t('overview.failedCount') }}</th>
                            </tr>
                            <tr v-for="(item, index) in interfaceDetailList">
                                <td>
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.apiName }}
                                        </template>
                                        <span class="name text-ellipsis">{{ item.apiName }}</span>
                                    </a-tooltip>
                                </td>
                                <td>
                                    <a-tooltip>
                                        <template #title>
                                            {{ formatRTableName(item.rtables) }}
                                        </template>
                                        <span class="name text-ellipsis"> {{ formatRTableName(item.rtables) }}</span>
                                    </a-tooltip>
                                </td>
                                <td>{{ item.totalReqCount || 0 }}</td>
                                <td>{{ item.successCount || 0 }}</td>
                                <td>{{ item.failCount || 0 }}</td>
                            </tr>




                        </table>
                        <div class='noData' v-else>
                            <div class='box'>
                                <img src="@/assets/images/img_null.png" alt="" />
                                <div class='text'>{{ t('common.noData') }}</div>
                            </div>
                        </div>
                    </a-spin>
                </div>
            </div>
        </template>
    </myModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { modalStore } from '@/Stores/modalStore'
import homeStore from '@/Stores/homeStore'
import myModal from '@/components/myModal';
import { getApiDetail } from '@/apis/board';
const { t } = useI18n()
const loading = ref(false)
const useModalStore = modalStore()
const useHomeStore = homeStore()
const { interfaceDetailData, apiDateValue } = storeToRefs(useHomeStore)
const modalName = t('overview.interfaceCalledDetail')
const interfaceDetailList = ref([])
onMounted(() => {
    getApiDetail({ dateValue: apiDateValue.value, groupId: interfaceDetailData.value.groupId }).then(res => {
        if (res.code == 1) {
            interfaceDetailList.value = res.data
        }
    })
})
const onCancel = () => {
    useModalStore.changeInterfaceDetailModalVisible()
}
const formatRTableName = (rtables)=>{
    if(!rtables?.length) return '-'
    return rtables.map(i=>i.name).join('、')
}
</script>

<style lang="less" scoped>
.tableTrendModal {
    width: 840px;
    height: 480px;
    padding: 20px;

    .tableWrapper {
        position: relative;
        overflow-y: auto;
        height: 100%;

        .tableContainer {
            width: 100%;

            .text-ellipsis {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .name {
                display: inline-block;
                max-width: 220px;
                vertical-align: middle;
            }

            th,
            td {
                border: 1px solid #e0ebff;
                padding: 10px 16px;
                width: 268px;
                white-space: nowrap;
            }

            th {
                color: rgba(0, 0, 0, 0.6);
                font-size: 14px;
                text-align: left;
            }

            td {
                color: rgba(0, 0, 0, 0.8);
                font-size: 13px;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
            }

            tr {
                &:nth-of-type(odd) {
                    background-color: #f7faff;
                }

                &:first-of-type {
                    background-color: #ecf3ff;
                }
            }
        }

        .page {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
        }

        .noData {
            height: 55vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;

            .box {
                text-align: center;
            }

            img {
                width: 180px;
                height: 130px;

            }

            .text {
                font-family: 'PingFang SC';
                font-style: normal;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                color: rgba(0, 0, 0, 0.4);
            }
        }
    }
}
</style>