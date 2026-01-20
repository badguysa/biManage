<template>
    <myModal :modal-name="tempData.collectionName" width="840px" :showBottom="false" @onCancel="onCancel">
        <template #modal-body>
            <div class="collectionModal">
                <div class="btnWrap">
                    <myButton @click="exportFn">导出</myButton>
                </div>
                <div class="list-item">
                    <div class="item-title">
                        <div class="icon">
                            <img :src="titleImg" alt="icon" />
                        </div>
                        <span class="title">{{ tempData.collectionName }}</span>
                        <div class="warning-box" :style="{ left: locale === 'lo' ? 'calc(100% - 185px)' : 'calc(100% - 165px)' }">
                            <img class="warning" src="@/assets/icons/collection-warning.png" alt="">
                            <div class="flex-center">
                                <span>{{ t('overview.pushErrorNumber') }}</span> 
                                <a-tooltip>
                                    <template #title>
                                        {{ tempData.totalExceptionTimes || 0 }}
                                    </template>
                                    <span class="warn-num">{{ tempData.totalExceptionTimes || 0 }}</span>
                                </a-tooltip>
                                <span>{{ t('overview.times') }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="item-node" v-for="topicItem in tempData.topicVoList" :key="topicItem.topicId">
                        <span class="topic-name">{{ topicItem.topicName }}</span>
                        <div class="total">
                            <span>{{ t('overview.totalSize') }}</span>
                            <a-tooltip>
                                <template #title>
                                    {{ topicItem.totalCount }}
                                </template>
                                <span class="count">
                                    {{ topicItem.totalCount }}
                                </span>
                            </a-tooltip>
                            <span>{{ t('overview.piece') }}</span>
                        </div>
                        <div class="light-color">
                            {{ t('overview.compareYesterday') }}
                            <a-tooltip>
                                <template #title>
                                    {{ topicItem.incCount }}
                                </template>
                                <span class="trend-num">{{ topicItem.incCount }}</span>
                            </a-tooltip>
                            {{ t('overview.piece') }}
                        </div>
                        <img v-if="topicItem.incCount > 0" class="trend-img" src="@/assets/icons/increase.png" alt="">
                        <img v-if="topicItem.incCount < 0" class="trend-img" src="@/assets/icons/decrease.png" alt="">
                        <div :style="{ left: locale === 'lo' ? 'calc(100% - 185px)' : 'calc(100% - 165px)' }" class="warning-box">
                            <img class="warning" src="@/assets/icons/collection-warning.png" alt="">
                            <div class="flex-center">
                                <span>{{ t('overview.pushErrorNumber') }}</span> 
                                <a-tooltip>
                                    <template #title>
                                        {{ topicItem.exceptionTimes || 0 }}
                                    </template>
                                    <span class="warn-num">{{ topicItem.exceptionTimes || 0 }}</span>
                                </a-tooltip>
                                <span>{{ t('overview.times') }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </myModal>
</template>
<script setup>
import { storeToRefs } from 'pinia';
import { modalStore } from '@/Stores/modalStore'
import homeStore from '@/Stores/homeStore'
import myModal from '@/components/myModal';
import { useI18n } from 'vue-i18n';
import titleImg from '@/assets/Iconlibrary/tubiaoku(1).png'
import myButton from '@/components/buttons/myButton.vue';
import { exportCollection } from '@/apis/board'

const { t, locale } = useI18n()
const useHomeStore = homeStore()
const useModalStore = modalStore()
const { tempData, lastBoardTask } = storeToRefs(useHomeStore)
const onCancel = () => {
    useModalStore.changeCollectionModalVisible()
}

const exportFn = async () => {
    try {
        let { collectionId, collectionName } = tempData.value
        let exportRes = await exportCollection({
            collectionId: collectionId,
            dateValue: lastBoardTask.value.time.split(' ')[0]?.replaceAll('-', '')
        })
        const blob = new Blob([exportRes])
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = collectionName + '.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

    } catch(e) {
        console.log('export error', e)
    }
}
</script>

<style lang="less" scoped>
.collectionModal {
    width: 840px;
    max-height: 550px;
    overflow: auto;
    .btnWrap{
        position: absolute;
        right: 50px;
        top: 14px;
    }
    .blue-gradient {
        background: linear-gradient(180deg, #F7FAFF 0%, rgba(247, 250, 255, 0.00) 100%);
    }

    .green-gradient {
        background: linear-gradient(180deg, #F5FCFA 0%, rgba(247, 255, 253, 0.00) 100%);
    }

    .collection {
        overflow: auto;
    }

    .list-item {
        padding: 20px;
        height: 100%;
        border-radius: 4px;
        width: 100%;
        position: relative;

        .item-title {
            display: flex;
            align-items: center;
            height: 20px;
            position: relative;
            margin-bottom: 16px;

            .title {
                max-width: 73%;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }

        .warning-box {
            display: flex;
            align-items: center;
            position: absolute;
            left: calc(100% - 165px);
            color: #FF7D00;
            .warn-num {
                max-width: 30px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display: inline-block;
                margin: 0 4px;
            }
        }

        .warning {
            width: 14px;
            height: 14px;
            margin: 0 6px;
        }
        .flex-center {
            display: flex;
            align-items: center;
        }

        .item-title {
            .icon {
                background: linear-gradient(140deg, #00C792 0%, #36D9B8 100%);
            }
        }

        .icon {
            display: flex;
            width: 16px;
            height: 16px;
            justify-content: center;
            align-items: center;
            border-radius: 3px;
            margin-right: 12px;
            font-size: 10px;
            font-style: 1;
            font-weight: 600;
            color: #FFF;

            img {
                width: 12px;
                height: 12px;
            }
        }

        .trend-img {
            width: 12px;
            height: 12px;
            margin-right: 65px;
            margin-left: 6px;
        }

        .item-node {
            height: 32px;
            display: flex;
            align-items: center;
            color: rgba(0, 0, 0, 0.80);
            font-style: normal;
            position: relative;

            .total {
                display: flex;
                align-items: center;
                width: 130px;
            }

            .topic-name {
                width: 240px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-right: 16px;
            }

            .count {
                font-family: D-DIN;
                font-size: 16px;
                font-weight: 700;
                margin: 0 10px;
                display: inline-block;
                white-space: nowrap;
                max-width: 65px;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .light-color {
                height: 32px;
                display: flex;
                align-items: center;
                color: rgba(0, 0, 0, 0.40);
                font-size: 14px;
                font-weight: 400;
                margin-left: 30px;

                .trend-num {
                    max-width: 60px;
                    display: inline-block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 0 6px;
                }
            }
        }
    }
    .item-node:nth-child(odd) {
        background: #F7FAFF; 
    }
}
</style>