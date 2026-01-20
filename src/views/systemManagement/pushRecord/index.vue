<template>
    <div class="pushRecordWrapper">
        <back @backFn="backFn"/>
        <div class="topContainer">
                <p class="title">{{ t('pushManage.pushRecord') }}
                    <span @click="refreshTotalData" class="edit">
                        <img :class="[pushRecordLoading ? 'rotate' : '']" src="@/assets/icons/refresh.png" />
                        {{t('indexPage.refresh') }}
                    </span>
                    <!-- <span class="tips">仅保留近90天记录，如有需要请注意导出备份</span>  -->
                    <span class="tips">{{ updateRecordTips }}</span> 
                </p>
                
        </div>
        <div class="tableWrapper">
                <a-spin :spinning="pushRecordLoading">
                    <table class="tableContainer" v-if="pushRecordList.length">
                        <tr>
                            <td>{{ t('pushManage.pushStartTime') }}</td>
                            <td>{{ t('pushManage.pushEndTime') }}</td>
                            <td>{{ t('pushManage.dataSize') }}</td>
                            <td>{{ t('pushManage.pushStatus') }}</td>
                            <td v-if="showPushResult">{{ t('pushManage.pushResult') }}</td>
                        </tr>
                        <tr v-for="item in pushRecordList" :key="item.id">
                            <td>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.startTime ? formatTimeToSecond(item.startTime) : '-' }}
                                    </template>
                                    <div>{{ item.startTime ? formatTimeToSecond(item.startTime) : '-' }}</div>
                                </a-tooltip>
                            </td>
                            <td>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.endTime ? formatTimeToSecond(item.endTime) : '-' }}
                                    </template>
                                    <div>{{ item.endTime ? formatTimeToSecond(item.endTime) : '-' }}</div>
                                </a-tooltip>
                            </td>
                            <td>
                                <a-tooltip>
                                    <template #title>
                                        {{ (item.status.value == 18 || item.pushFailedNum > 0) ? `推送成功${item.dataNum - item.pushFailedNum}  推送失败${item.pushFailedNum}` : item.dataNum || '0' }}
                                    </template>
                                    <div>{{ (item.status.value == 18 || item.pushFailedNum > 0) ? `推送成功${item.dataNum - item.pushFailedNum}  推送失败${item.pushFailedNum}` : item.dataNum || '0' }}</div>
                                </a-tooltip>
                            </td>
                            <td>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.pushFailedNum > 0 ? '推送异常' : item.status.description }}
                                    </template>
                                    <div :style="{color: (item.status.value == 0 && !item.pushFailedNum) ? '#00B42A' : '#F53F3F'}">{{ item.pushFailedNum > 0 ? '推送异常' : item.status.description}}</div>
                                </a-tooltip>
                            </td>
                            <td v-if="showPushResult">
                                <span 
                                    :class="{check: true, disabled: item.status.value === 9 || item.status.value === 12}"
                                    @click="checkFn(item)">
                                        {{ t('common.check') }}
                                </span>
                            </td>
                        </tr>
                    </table>
                </a-spin>
        </div>
        <div class="noData" v-if="!pushRecordList.length">
            <img src="@/assets/images/img_null.png" alt="" />
            <p>{{ t('common.noData') }}</p>
        </div>
        <div class="page" v-if="pushRecordTotal > 12">
            <a-pagination 
                v-model:current="pushRecordPageNumber" 
                :total="pushRecordTotal" 
                :pageSize="12" 
                show-less-items
                @change="pageChange"
            />  
        </div>
        <pushRecordErrorModal v-if="showErrorRecordModal" @onCancel="closeModal" :errorInfo="errorInfo" :pushRecordMethod="pushRecordMethod" />
    </div>
</template>

<script setup>
import { apiManageStore } from '@/Stores/apiManageStore'
import { formatTimeToSecond } from '@/utils/utils'
import { message } from 'ant-design-vue';
import pushRecordErrorModal from '@/views/systemManagement/components/pushRecordErrorModal'
import back from '@/components/back'

const { t } = useI18n()
const useApiManageStore = apiManageStore()
const useSystemManageStore = systemManageStore()
const { activeMenuName, pushRecordList, pushRecordTotal, pushRecordPageNumber, 
    pushRecordMethod,pushRecordLoading, pushDataMode, pushTopicSearchValue } = storeToRefs(useApiManageStore)
const { pushRecordId, pushCollectionInfo } = storeToRefs(useSystemManageStore)
const showErrorRecordModal = ref(false)
const errorInfo = ref('')

const pageChange = () => {
    useApiManageStore.initPushRecordList({
        topicId: pushRecordId.value
    })
}

const backFn = () => {
    useApiManageStore.setApiPageId('pushTopicDetailPage')
    useApiManageStore.changeTabPageId('edit', activeMenuName.value, 'pushTopicDetailPage')
    useApiManageStore.initPushTopicList({
        collectionId: pushCollectionInfo.value.id,
        name: pushTopicSearchValue.value
    })
    useApiManageStore.resetPushRecordPageNumber()
    // useApiConfigStore.goBack()
}

const closeModal = () => {
    showErrorRecordModal.value = false
}
const refreshTotalData = ()=>{
    useApiManageStore.initPushRecordList({
        topicId: pushRecordId.value
    },true)
}
const checkFn = (item) => {
    if(!item.status) return
    switch(item.status?.value) {
        case 9: // 队列等待中
        case 12: // 验证中
            message.open({ content: '数据结果校验中，请稍后查看' })
            break
        case 3: // 推送失败
        default:
            // 状态为成功 并且无推送失败字段
            if(item.status.value === 0 && !item.pushFailedNum) {
                return message.success('数据无异常')
            }
            if(item.pushLog !== '[]') {
                showErrorRecordModal.value = true
                if(pushRecordMethod.value === 6 && item.pushLog){
                    try {
                        // 尝试解析 item.pushLog
                        const parsedData = JSON.parse(item.pushLog);
                        errorInfo.value = JSON.stringify(parsedData[0])
                    } catch (error) {
                        errorInfo.value = item.pushLog
                    }
                } else {
                    errorInfo.value = item.pushLog
                }
            } else {
                message.open({ content: item.status?.description})
            }
            break
    }
}

// 推送方式为智慧大脑/表单/数据库时 展示推送结果
const showPushResult = computed(() => {
    return pushRecordMethod.value === 4 || pushRecordMethod.value === 5 || pushRecordMethod.value === 6
})

// 更新记录提示语
const updateRecordTips = computed(() => {
    // 增量推送
    return pushDataMode.value === 2 ? t('common.updateRecordTipsCus') : t('common.updateRecordTips')
})

</script>

<style lang="less" scoped>
.pushRecordWrapper {
    width: 100%;
    height: calc(100% - 36px);
    background-color: #fff;
    padding-bottom: 40px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    position: relative;

    .topContainer {
        display: flex;
        justify-content: space-between;
        margin: 16px 20px;
        .edit {
                font-weight: 400;
                font-size: 14px;
                color: #3d82f2;
                cursor: pointer;
                margin-left:10px;
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
        .title {
            font-weight: 600;
            font-size: 18px;
            line-height: 25px;
            color: rgba(0, 0, 0, 0.8);
            margin-bottom: 0;
            .tips{
                color: #00000066;
                font-size: 12px;
                margin-left: 10px;
            }
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

    :deep(.ant-switch) {
        min-width: 28px;
        height: 16px;
        width: 28px;

        .ant-switch-handle {
            width: 12px;
            height: 12px;
        }
    }

    :deep(.ant-switch-checked) {
        .ant-switch-handle {
            left: calc(100% - 12px - 2px);
        }
    }

    .tableWrapper {
        position: relative;
        overflow: auto;
        padding: 0 20px;
        .tableContainer {
            width: 100%;
            td {
                height: 40px;
                max-height: 56px;
                width: 20%;
                border: 1px solid #e0ebff;
                padding: 10px;
                color: rgba(0, 0, 0, 0.8);
                font-size: 13px;

                &>div {
                    max-width: 100%;
                    max-height: 56px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;

                    &>span {
                        color: #3d82f2;
                        cursor: pointer;
                        margin-right: 16px;
                    }
                }
                .check{
                    color: #2B67FF;
                    cursor: pointer;
                    &.disabled{
                        color: #9CC2FF;
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
}</style>
