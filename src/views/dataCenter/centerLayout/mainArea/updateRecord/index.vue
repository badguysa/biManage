<template>
    <div class="wrapper">
        <back @backFn="backFn"/>
        <div class="main-wrapper">
            <div class="topContainer">
                <p class="title">{{ t('indexPage.updateRecord') }}</p>
                <!-- <span class="tips">仅保留近90天记录，如有需要请注意导出备份</span>  -->
                <span class="tips">{{ updateRecordTips }}</span> 
            </div>
            <div class="tableWrapper">
                <div v-if="indexTableDesc?.tableType?.value === 3" class="source_total">
                    <span class="value">{{ t('indexPage.sourceDataTotal') }}： {{
                        sourceTotal ?? '-' }}</span>
                    <span @click="refreshTotalData(true)" class="edit"><img :class="[refreshTotalLoading ? 'rotate' : '']"
                            src="@/assets/icons/refresh.png" />
                        {{
                            t('indexPage.refresh') }}</span>
                </div>
                <a-spin :spinning="loading">
                    <table class="tableContainer" v-if="recordList.length">
                        <tr>
                            <th>{{ t('indexPage.updateStartTime') }}</th>
                            <th>{{ t('indexPage.updateEndTime') }}</th>
                            <th>{{ t('indexPage.updateType') }}</th>
                            <th>{{ t('indexPage.newIncrNumber') }}</th>
                            <th>{{ t('indexPage.deleteNumber') }}</th>
                            <th>{{ t('indexPage.structureChanged') }}</th>
                            <th>{{ t('indexPage.updateStatus') }}</th>
                        </tr>
                        <tr v-for="(record, index) in recordList">
                            <td>{{ formatTime(parseInt(record.createTime)) }}</td>
                            <td>{{ formatTime(parseInt(record.updateTime)) }}</td>
                            <td>{{ record.updateType?.description === undefined ? '-' : record.updateType?.description }}</td>
                            <td>{{ record.addNum === null ? '-' : record.addNum }}</td>
                            <td>{{ record.deleteNum === null ? '-' : record.deleteNum }}</td>
                            <td>{{ record.structChanged ? t('indexPage.yes') : t('indexPage.no') }}</td>
                            <td>
                                <div class="status">
                                    <span :style="{ color: [0, 2].includes(record.status) ? '#FF4E4E' : '#46B673' }">
                                        {{ t(getUpdateStatus(record)) }} {{ record.failedReason ? record.failedReason : '' }}
                                    </span>
                                    <span v-if="record.status === 2" class="restart" @click="restartFn">
                                        <img src="@/assets/icons/restart.png" alt="">
                                        <span>重启</span>
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </table>
                    <div class='noData' v-else>
                        <div class='box'>
                            <img src="@/assets/images/img_null.png" alt="" />
                            <div class='text'>{{ t('common.noData') }}</div>
                        </div>
                    </div>
                </a-spin>
                <div class="page" v-if="dataTotal > 12">
                    <a-pagination v-model:current="pageNumber" :total="dataTotal" :pageSize="12" show-less-items
                        @change="pageChange" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { mainStore } from '@/Stores/mainStore'
import { getUpdateRecordData, getSourceDataNum, restartTask } from '@/apis/common'
import { formatTime } from '@/utils/utils'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import back from '@/components/back'
import useBackHome from '@/hooks/dataCenter/useBackHome'

const { t } = useI18n()
const useMainStore = mainStore()
const sourceTotal = ref()
const loading = ref(true)
const pageNumber = ref(1) // 当前页码
const dataTotal = ref(0) // 列表总数
const refreshTotalLoading = ref(false)

const backFn = useBackHome()

// 记录列表
let recordList = ref([])

const indexTableDesc = computed(() => {
    return useMainStore.currentTab.indexTableDesc
})

const updateRecordTabId = computed(() => 
    useMainStore.currentTab.indexTableDesc.id
)

const requestRecordData = () => {
    // 汲取请求参数
    const requestParams = {
        tableId: updateRecordTabId.value,
        pageNum: pageNumber.value,
        pageSize: 12,
    }
    loading.value = true
    getUpdateRecordData(requestParams).then((res) => {
        if (res.code === 1) {
            recordList.value = res.data.records
            dataTotal.value = Number(res.data.total)
        }
        loading.value = false
    })
}


const refreshTotalData = (refresh = false) => {
    refreshTotalLoading.value = refresh
    const requestParams = {
        id: updateRecordTabId.value,
        refresh
    }
    getSourceDataNum(requestParams).then((res) => {
        if (res.code == 1) {
            sourceTotal.value = res?.data
            if (refresh) {
                message.success(res.message)
            }
        } else {
            if (refresh) {
                message.error(res.message)
            }
        }
    }).finally(() => {
        refreshTotalLoading.value = false
    })
}
const pageChange = () => {
    requestRecordData()
}

onMounted(() => {
    requestRecordData()
    if (indexTableDesc.value?.tableType?.value === 3) {
        refreshTotalData()
    }
})

// 监听tab页id变化
watch(
    () => indexTableDesc.value.id,
    () => {
        pageNumber.value = 1
        dataTotal.value = 0
        requestRecordData()
    }
)

const getUpdateStatus = (item) => {
    switch(item.status) {
        case -1:
            return 'indexPage.updating'
        case 0:
            return 'indexPage.failure'
        case 1:
            return 'indexPage.success'
        case 2:
            return 'common.paused'
        default:
            return 'indexPage.failure'
    }
}

const restartFn = () => {
    try{
        let jobId = JSON.parse(indexTableDesc.value.updateParams)?.jobId
        if(!jobId) {
            return message.error('重启任务失败，请重新导入该数据表')
        }

        restartTask({
            realTableId: indexTableDesc.value.id,
            jobId: jobId
        }).then((res) => {
            if(res.code === 1) {
                message.success(res.message)
            } else {
                message.error(res.message)
            }
        })
    } catch(e) {
        console.log('e', e)
    }
}

// 更新记录提示语
const updateRecordTips = computed(() => {
    if(!indexTableDesc.value) return
    // 1.DB实时更新 2.Kafka实时更新 3.api增量接收推送
    const { tableType, updatePolicy } = indexTableDesc.value

    if(!tableType || !updatePolicy) return t('common.updateRecordTips')

    let flag = tableType.value === 3 && updatePolicy.value === 3 ||
            tableType.value === 8 && updatePolicy.value === 3 ||
            tableType.value === 7 && updatePolicy.value === 4

    return flag ? t('common.updateRecordTipsCus') : t('common.updateRecordTips')
})

</script>

<style lang="less" scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    height: 100%;
    
    .main-wrapper{
        flex-grow: 1;
        padding: 20px 30px;
    }
    .title {
        font-weight: 600;
        font-size: 18px;
        line-height: 25px;
        color: rgba(0, 0, 0, 0.8);
        margin-bottom: 12px;
        display: inline-block;
    }
    .tips{
        color: #00000066;
        font-size: 12px;
        margin-left: 10px;
    }

    .tableWrapper {
        position: relative;
        overflow-y: scroll;
        height: calc(100% - 43px);

        .source_total {
            margin-bottom: 12px;
            color: rgba(0, 0, 0, 0.80);
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;

            .value {
                margin-right: 20px;
            }

            .edit {
                font-weight: 400;
                font-size: 14px;
                color: #3d82f2;
                cursor: pointer;

                .rotate {
                    animation: loading-rotate 1s linear infinite;
                }

                @keyframes loading-rotate {
                    100% {
                        transform: rotate(360deg);
                    }
                }

                img {
                    margin-top: -3px;
                    width: 14px;
                }
            }
        }

        .tableContainer {

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
                .status{
                    display: flex;
                    align-items: center;
                    .restart{
                        cursor: pointer;
                        display: inline-flex;
                        gap: 4px;
                        align-items: center;
                        color: #2B67FF;
                        margin-left: 12px;
                        img{
                            width: 12px;
                            height: 12px;
                            position: relative;
                            top: 1px;
                        }
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
</style>import { display } from 'html2canvas/dist/types/css/property-descriptors/display'

