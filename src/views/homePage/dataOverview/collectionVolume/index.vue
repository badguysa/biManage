<template>
    <div class="collection-volume">
        <div class="header">
            <img src="@/assets/icons/data-arrow.png" alt="">
            <span>{{ t('overview.collectionRunning') }}</span>
        </div>
        <a-spin :spinning="overviewLoading.top5DataLoading">
            <div class="collection">
                <emptyView v-if="!collectionInfo.length" />
                <template v-else>
                    <div class="list">
                        <div :style="{ width: locale === 'lo' ? '100%' : '780px' }" v-for="(item, index) in collectionInfo" :key="index" class="list-item">
                            <div class="item-title">
                                <div class="icon">
                                    <img :src="titleImg" alt="icon" />
                                </div>
                                <span class="title">{{ item.collectionName  }}</span>
                                <div class="warning-box" :style="{left: locale === 'lo' ? 'calc(100% - 205px)' : 'calc(100% - 165px)' }">
                                    <img class="warning" src="@/assets/icons/collection-warning.png" alt="">
                                    <div class="flex-center">
                                        <span>{{ t('overview.pushErrorNumber') }}</span> 
                                        <a-tooltip>
                                            <template #title>
                                                {{ item.totalExceptionTimes || 0 }}
                                            </template>
                                            <span class="warn-num">{{ item.totalExceptionTimes || 0 }}</span>
                                        </a-tooltip>
                                        <span>{{ t('overview.times') }}</span>
                                    </div>
                                </div>
                            </div>
                            <template v-if="item.topicVoList?.length">
                                <div class="item-node" v-for="topicItem in showTopicVoList(item.topicVoList)" :key="topicItem.topicId">
                                    <span class="topic-name" :style="{width: locale === 'lo' ? '600px' : '240px' }">{{ topicItem.topicName }}</span>
                                    <div class="total" :style="{width: locale === 'lo' ? '210px' : '130px' }">
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
                                            <span class="trend-num" :style="{maxWidth: locale === 'lo' ? '120px' : '60px' }">{{ topicItem.incCount }}</span>
                                        </a-tooltip>
                                        {{ t('overview.piece') }}
                                        </div>
                                    <img v-if="topicItem.incCount > 0" class="trend-img" src="@/assets/icons/increase.png" alt="">
                                    <img v-if="topicItem.incCount < 0" class="trend-img" src="@/assets/icons/decrease.png" alt="">
                                    <div class="warning-box" :style="{left: locale === 'lo' ? 'calc(100% - 205px)' : 'calc(100% - 165px)' }">
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
                                <div class="more">
                                    <div class="check" @click="checkMore(item)">
                                        <span>{{ t('overview.more') }}</span>
                                        <img src="@/assets/icons/check-more.png" alt="" srcset="">
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </template>
            </div>
        </a-spin>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import homeStore from '@/Stores/homeStore'
import { modalStore } from '@/Stores/modalStore';
import emptyView from '@/components/empty'
import titleImg from '@/assets/Iconlibrary/tubiaoku(1).png'
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n()
const useHomeStore = homeStore()
const useModalStore = modalStore()
const { collectionInfo, overviewLoading } = storeToRefs(useHomeStore)
const checkMore = record => {
    useHomeStore.changeTempData(record)
    useModalStore.changeCollectionModalVisible()
}
const showTopicVoList = list => {
    return list.length > 6 ? list.slice(0, 6) : list
}
</script>

<style lang="less" scoped>
.collection-volume {
    border-radius: 4px;
    border: 1px solid #E9E9E9;
    padding: 20px;
    margin-top: 12px;
    .header {
        color: rgba(0, 0, 0, 0.80);
        font-size: 16px;
        font-weight: 600;
        img {
            width: 20px;
            height: 20px; 
            margin-right: 5px;
        }
    }
    .blue-gradient {
        background: linear-gradient(180deg, #F7FAFF 0%, rgba(247, 250, 255, 0.00) 100%);
    }
    .green-gradient {
        background: linear-gradient(180deg, #F5FCFA 0%, rgba(247, 255, 253, 0.00) 100%);
    }
    .collection {
        overflow: hidden;
        &:hover{
            overflow: auto;
        }
    }
    .list {
        min-width: 1585px;
        display: flex;
        gap: 20px;
        margin-top: 20px;
        flex-wrap: wrap;
    }
    .list-item {
        padding: 20px;
        height: 100%;
        border-radius: 4px;
        width: 780px;
        height: 270px;
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
        .more {
            display: flex;
            width: calc(100% - 40px);
            height: 70px;
            align-items: flex-end;
            justify-content: center;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%);
            position: absolute;
            bottom: 5px;
            .check {
                display: flex;
                align-items: center;
                color: #2B67FF;
                cursor: pointer;
            }
            img {
                margin-left: 4px;
                width: 12px;
                height: 12px;
            }
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
    .list-item:nth-child(odd) {
        background: linear-gradient(180deg, #F2F7FF 0%, rgba(247, 250, 255, 0.00) 100%);
        .icon {
            background: linear-gradient(140deg, #356FFF 0%, #61AAFF 100%);
        }
    }
    .list-item:nth-child(even) {
        background: linear-gradient(180deg, #F0FCF9 0%, rgba(242, 255, 252, 0.00) 100%);
        .icon {
            background: linear-gradient(140deg, #00C792 0%, #36D9B8 100%);
        }
    }
    .collection::-webkit-scrollbar-thumb {
        background-color:transparent;
    }
    .collection:hover::-webkit-scrollbar-thumb {
        background-color: #dadfe5;
    }
}
</style>