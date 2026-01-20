<template>
    <div class="data-size">
        <div class="today-data">
            <div class="sub-header">
                <img class="data-arrow" src="@/assets/icons/data-arrow.png" />
                <div class="title">{{ t('overview.todayDataSize') }}</div>
            </div>
            <div class="data-layout">
                <div class="data-item">
                    <div class="title">{{ t('overview.totalDataSize') }}</div>
                    <div class="value">{{ todayData.totalDatas || '--' }}<span>{{ t('overview.piece') }}</span></div>
                    <div class="unit">
                        <span>{{ t('overview.compareYesterday') }}</span>
                        <span>{{ todayData.incTotalDatas || 0 }} {{ t('overview.piece') }}</span>
                        <img v-if="todayData.incTotalDatas > 0" src="@/assets/icons/increase.png" />
                        <img v-if="todayData.incTotalDatas < 0" src="@/assets/icons/decrease.png" />
                    </div>
                </div>
                <a-divider style="height: 100%;" type="vertical"></a-divider>
                <div class="data-item">
                    <div class="title">{{ t('overview.totalTableSize') }}</div>
                    <div class="value">{{ todayData.totalTables || '--' }}<span>{{ t('overview.number') }}</span></div>
                    <div class="unit">
                        <span>{{ t('overview.compareYesterday') }} {{ todayData.incTotalTables || 0 }} {{ t('overview.number') }}</span>
                        <img v-if="todayData.incTotalTables > 0" src="@/assets/icons/increase.png" />
                        <img v-if="todayData.incTotalTables < 0" src="@/assets/icons/decrease.png" />
                    </div>
                </div>
                <a-divider style="height: 100%;" type="vertical"></a-divider>
                <div class="data-item">
                    <div class="title">{{ t('overview.fromSystem') }}</div>
                    <div class="value">{{ todayData.originateNumber || '--' }}<span>{{ t('overview.number') }}</span></div>
                    <div class="unit">
                        <span>{{ t('overview.compareYesterday') }} {{ todayData.incOriginateNumber || 0 }} {{ t('overview.number') }}</span>
                        <img v-if="todayData.incOriginateNumber > 0" src="@/assets/icons/increase.png" />
                        <img v-if="todayData.incOriginateNumber < 0" src="@/assets/icons/decrease.png" />
                    </div>
                </div>
            </div>
        </div>
        <div class="table-increase-data">
            <div class="sub-header">
                <img class="data-arrow" src="@/assets/icons/data-arrow.png" />
                <div class="title">{{ t('overview.incrTopFive') }}</div>
            </div>
            
            <a-spin :spinning="overviewLoading.top5DataLoading">
                <div class="top-five">
                    <emptyView v-if="!top5Data.length" />
                    <div class="top-list" v-else>
                        <div class="top-item" v-for="(item, index) in top5Data" :key="index">
                            <img class="sequence" :src="getImage(index)" alt="icon" />
                            <a-tooltip>
                                <template #title>
                                    {{ item.name }}
                                </template>
                                <span class="name text-ellipsis">{{ item.name }}</span>
                            </a-tooltip>
                            <a-progress class="progress" :percent="item.percent" :show-info="false" />
                            <a-tooltip>
                                <template #title>
                                    {{ item.count }}
                                </template>
                                <span class="count text-ellipsis">{{ item.count }}</span>
                            </a-tooltip>
                            <img @click="showTableTrend(item)" class="stat" src="@/assets/icons/stat.png" alt="">
                        </div>
                    </div>
                </div>
            </a-spin>
            
        </div>
    </div>
</template>

<script setup>

import { storeToRefs } from 'pinia';
import homeStore from '@/Stores/homeStore'
import { modalStore } from '@/Stores/modalStore';
import emptyView from '@/components/empty'
import top1 from '@/assets/icons/TOP_1.png'
import top2 from '@/assets/icons/TOP_2.png'
import top3 from '@/assets/icons/TOP_3.png'
import top4 from '@/assets/icons/TOP_4.png'
import top5 from '@/assets/icons/TOP_5.png'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const useHomeStore = homeStore()
const useModalStore = modalStore()
const { top5Data, todayData, overviewLoading } = storeToRefs(useHomeStore)

const getImage = (index) => {
    const imgs = [top1, top2, top3, top4, top5]
    return imgs[index]
}

const showTableTrend = (record) => {
    useHomeStore.changeTempData(record)
    useModalStore.changeTableTrendModalVisible()
}

</script>

<style lang="less" scoped>
.data-size {
    height: 240px;
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 20px;
    overflow: hidden;
    &:hover {
        overflow: auto hidden;
    }
    .text-ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .today-data, .table-increase-data {
        padding: 20px;
        height: 100%;
        border-radius: 4px;
        border: 1px solid #E9E9E9;
        width: 820px;
        .sub-header {
            width: 760px;
            display: flex;
            align-items: center;
            .data-arrow {
                width: 20px;
                height: 20px;
                margin-right: 5px;
            }
            .title { 
                color: rgba(0, 0, 0, 0.80);
                font-size: 16px;
                font-weight: 600;
            }
        }
    }
    .today-data {
        .data-layout {
            height: 156px;
            display: flex;
            padding: 20px 0;
            gap: 20px;
            .data-item {
                width: 240px;
                padding: 0 40px;
                flex: 1;
                .title {
                    color: rgba(0, 0, 0, 0.80);
                    font-size: 14px;
                    font-weight: 600;
                    line-height: 1;
                }
                .value {
                    color: rgba(0, 0, 0, 0.80);
                    font-size: 28px;
                    font-style: 1;
                    font-weight: 700;
                    font-family: D-DIN;
                    margin: 16px 0;
                    line-height: 1;
                    span {
                        font-size: 14px;
                        font-weight: 600;
                        margin-left: 6px;
                    }
                }
                .unit {
                    color: rgba(0, 0, 0, 0.60);
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 1;
                    img {
                        width: 12px;
                        height: 12px;
                        margin-left: 6px;
                    }
                }
            }
        }
    }
    .table-increase-data {
        .top-five {
            height: 170px;
            padding: 10px 0;
            .top-list {
                .top-item {
                    display: flex;
                    align-items: center;
                    height: 32px;
                    padding: 6px 0;
                    color: rgba(0, 0, 0, 0.80);
                    .sequence {
                        width: 12px;
                        height: 12px;
                        margin-right: 16px; 
                    }
                    .name {
                        width: 142px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                    .stat {
                        width: 14px;
                        height: 14px;
                        cursor: pointer;
                    }
                    .progress {
                        width: 70%;
                        margin: 0 16px;
                    }
                    .count {
                        margin-right: 16px;
                        display: inline-block;
                        width: 50px;
                    }
                }
            }
        }
    }
}
.data-size::-webkit-scrollbar-thumb {
    background-color:transparent;
}
 
.data-size:hover::-webkit-scrollbar-thumb {
    background-color: #dadfe5;
}
</style>