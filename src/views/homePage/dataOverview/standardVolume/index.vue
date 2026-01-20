<template>
    <div class="group-volume">
        <div class="header">
            <img src="@/assets/icons/data-arrow.png" alt="">
            <span>{{ t('overview.standardRunning') }}</span>
        </div>
        <div class="group-layout">
            <a-spin :spinning="overviewLoading.topicDataSetLoading">
                <div class="group-list">
                    <emptyView v-if="!standardInfo.length" />
                    <template v-else>
                        <div class="group-item" v-for="(item, index) in standardInfo" :key="index">
                            <div class="data-info">
                                <div class="title">
                                    <div class="imgBox">
                                        <img :src="fileImg" :alt="item.name" />
                                    </div>
                                    <span>{{ item.name }}</span>
                                    <div class="tips">
                                        <tips :tipsContent="getTips('')" />
                                    </div>
                                </div>
                                <div class="numList">
                                    <div class="numItemBack">
                                        <div class="numItem dataSubset">
                                            <div class="numIcon">
                                                <img src="@/assets/icons/numItem1.png" alt="">
                                            </div>
                                            <div class="numName">
                                                <div class="name">数据子集</div>
                                                <div class="tips">
                                                    <tips :tipsContent="getTips('dataSubset')" />
                                                </div>
                                            </div>
                                            <div class="numValue">
                                                <div class="value">{{ item.dataSubset }}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="numItemBack">
                                        <div class="numItem dataCatalog">
                                            <div class="numIcon">
                                                <img src="@/assets/icons/numItem2.png" alt="">
                                            </div>
                                            <div class="numName">
                                                <div class="name">数据类</div>
                                                <div class="tips">
                                                    <tips :tipsContent="getTips('dataCatalog')" />
                                                </div>
                                            </div>
                                            <div class="numValue">
                                                <div class="value">{{ item.dataCatalog }}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="numItemBack">
                                        <div class="numItem dataSubCatalog">
                                            <div class="numIcon">
                                                <img src="@/assets/icons/numItem3.png" alt="">
                                            </div>
                                            <div class="numName">
                                                <div class="name">数据子类</div>
                                                <div class="tips">
                                                    <tips :tipsContent="getTips('dataSubCatalog')" />
                                                </div>
                                            </div>
                                            <div class="numValue">
                                                <div class="value">{{ item.dataSubCatalog }}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="numItemBack">
                                        <div class="numItem dataItem">
                                            <div class="numIcon">
                                                <img src="@/assets/icons/numItem4.png" alt="">
                                            </div>
                                            <div class="numName">
                                                <div class="name">数据项</div>
                                                <div class="tips">
                                                    <tips :tipsContent="getTips('dataItem')" />
                                                </div>
                                            </div>
                                            <div class="numValue">
                                                <div class="value">{{ item.dataItem }}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="numItemBack">
                                        <div class="numItem applications">
                                            <div class="numIcon">
                                                <img src="@/assets/icons/numItem5.png" alt="">
                                            </div>
                                            <div class="numName">
                                                <div class="name">应用数据表</div>
                                                <div class="tips">
                                                    <tips :tipsContent="getTips('applications')" />
                                                </div>
                                            </div>
                                            <div class="numValue">
                                                <div class="value">{{ item.applications }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="update-info">
                                <div class="title">
                                    <div class="imgBox">
                                        <img :src="reFlashImg" alt="最近更新" />
                                    </div>
                                    <span>最近更新</span>
                                </div>
                                <div class="update-List">
                                    <div class="update-item" v-for="(sitem, sindex) in item.standardTables"
                                        :key="sitem.id">
                                        <a-tooltip placement="topLeft" :title="sitem.name">
                                            <div class="item-info">{{ (sindex + 1) + '.' + sitem.name }}</div>
                                        </a-tooltip>
                                        <div class="item-date">{{ '更新时间:' + formatTimeToSecond(sitem.updateTime) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </a-spin>
        </div>
    </div>
</template>

<script setup>
import tips from '@/components/tips'
import { storeToRefs } from 'pinia';
import homeStore from '@/Stores/homeStore'
import emptyView from '@/components/empty'
import fileImg from '@/assets/Iconlibrary/tubiaoku(17).png'
import reFlashImg from '@/assets/Iconlibrary/tubiaoku(25).png'
import { useI18n } from 'vue-i18n';
import { formatTimeToSecond } from '@/utils/utils.js'
const { t } = useI18n()
const useHomeStore = homeStore()
const { standardInfo, overviewLoading } = storeToRefs(useHomeStore)
const getTips = (type = '') => {
    let tips = '一级标准库名称'
    if (type === 'dataSubset') {
        tips = '二级标准库总数'
    } else if (type === 'dataCatalog') {
        tips = '三级标准库总数'
    } else if (type === 'dataSubCatalog') {
        tips = '一级二级三级的全部标准表总数'
    } else if (type === 'dataItem') {
        tips = '一级二级三级的全部标准表内，字段总数'
    } else if (type === 'applications') {
        tips = '一级二级三级的全部标准表，应用数据表总数'
    }
    return tips
}
</script>

<style lang="less" scoped>
.group-volume {
    border-radius: 4px;
    border: 1px solid #E9E9E9;
    padding: 20px;
    margin-top: 12px;

    .text-ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .header {
        color: rgba(0, 0, 0, 0.80);
        font-size: 16px;
        font-weight: 600;
        position: relative;

        img {
            width: 20px;
            height: 20px;
            margin-right: 5px;
        }

        .hide-text {
            color: #2B67FF;
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            position: absolute;
            right: 0;
            top: 0;

            img {
                width: 10px;
                height: 10px;
                margin-left: 4px;
            }
        }

        .hide-text:hover {
            cursor: pointer;
        }
    }

}

.group-layout {
    margin-top: 20px;
}

.group-list {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.group-item {
    background: linear-gradient(180deg, #F2F7FF 0%, rgba(247, 250, 255, 0) 100%);
    height: 210px;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 30px;
    position: relative;
    display: flex;
    justify-content: space-between;

    .title {
        display: flex;
        height: 16px;
        align-items: center;
        font-size: 14px;
        font-style: 1;
        font-weight: 600;
        color: #000000CC;
        margin-bottom: 10px;

        .imgBox {
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
            background: linear-gradient(97.83deg, #356FFF 5.97%, #61AAFF 101.98%);

            img {
                width: 12px;
                height: 12px;
            }
        }

        .tips {
            margin-left: 6px;
        }
    }

    .data-info {
        width: 60%;

        .numList {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            width: 100%;

            .numItemBack {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 9vw;
                height: 140px;
                border-radius: 4px;
                background: linear-gradient(180deg, #D9E6FF 0%, rgba(217, 230, 255, 0.1) 100%);

                .numItem {
                    width: calc(9vw - 2px);
                    height: 138px;
                    border-radius: 4px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;

                    .numIcon {
                        img {
                            width: 40px;
                            height: 40px;
                        }
                    }

                    .numName {
                        display: flex;
                        align-items: center;
                        gap: 4px;

                        .name {
                            font-weight: 600;
                            color: #000000CC;
                            font-size: 14px;
                        }
                    }

                    .numValue {
                        .value {
                            font-weight: 600;
                            font-size: 28px;
                            color: #000000CC;

                            &::after {
                                content: '个';
                                font-size: 12px;
                                font-weight: 400;
                                color: #000000cc;
                            }
                        }

                    }
                }

                .dataSubset {
                    background: linear-gradient(180deg, rgba(235, 242, 255, 0.3) 0%, rgba(235, 242, 255, 0) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF);
                }

                .dataCatalog {
                    background: linear-gradient(180deg, rgba(244, 242, 255, 0.3) 0%, rgba(243, 242, 255, 0) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF);
                }

                .dataSubCatalog {
                    background: linear-gradient(180deg, rgba(255, 247, 235, 0.3) 0%, rgba(255, 247, 235, 0) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF);

                }

                .dataItem {
                    background: linear-gradient(180deg, rgba(255, 240, 252, 0.3) 0%, rgba(255, 247, 254, 0) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF);

                }

                .applications {
                    background: linear-gradient(180deg, rgba(232, 252, 247, 0.3) 0%, rgba(235, 255, 250, 0) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF);
                }
            }
        }
    }

    .update-info {
        width: 30%;

        .update-item {
            display: flex;
            justify-content: space-between;
            height: 20px;
            line-height: 20px;
            margin-bottom: 10px;
            width: 100%;
            .item-info {
                color: #000000CC;
                width: calc(100% - 208px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .item-date {
                color: #00000066;
            }
        }
    }
}
</style>