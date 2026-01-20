<template>
    <div class="table-tree">
        <div class="header">
            <div class="addtablebtn" 
                @click="addTableBtn"
            >
                <img src="@/assets/icons/add2.png" alt="">
                {{ t('dataStandard.addStandardLib') }}
            </div>
        </div>
        <dataTree />
    </div>
    <addStandardLibModal v-if="addStandardLibModalVisible"></addStandardLibModal>
</template>

<script setup>
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { dataStandardStore } from '@/Stores/dataStandardStore';
import addStandardLibModal from '@/views/systemManagement/components/dataStandard/leftTree/addStandardLibModal.vue'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n'
import dataTree from './dataTree.vue'

const { t } = useI18n()
const useModalStore = modalStore()
const useDataStandardStore = dataStandardStore()

const { addStandardLibModalVisible } = storeToRefs(useModalStore)
const { leftDataList } = storeToRefs(useDataStandardStore)

const addTableBtn = () => {
    useDataStandardStore.changeGroupModalStatus('default')
    useModalStore.changeAddStandardLibModalVisible()
}

</script>

<style lang="less" scoped>
.table-tree {
    border-right: 1px solid rgba(0, 0, 0, 0.07);
    height: 100%;
    width: 200px;
    .fade-enter-from,
    .fade-enter-to {
        opacity: 0;
    }

    .fade-enter-to,
    .fade-enter-from {
        opacity: 1;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity .2s ease;
    }

    .header {
        width: 200px;
        height: 64px;
        border-bottom: 1px solid #E9E9E9;
        padding: 16px 12px;
        position: relative;

        .addtablebtn {
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 176px;
            height: 32px;
            background: #3D82F2;
            border-radius: 4px;

            img {
                width: 16px;
                margin-right: 8px;
            }

            cursor: pointer;
        }

        .addtablebtn:hover {
            opacity: 0.8;
        }

        .selectMenu {
            position: absolute;
            left: 45px;
            top: 52px;
            z-index: 3;
            width: 125px;
            background: #FFFFFF;
            border: 1px solid #E9E9E9;
            box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
            border-radius: 4px;
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            padding-top: 3px;

            img {
                width: 16px;
                margin-right: 8px;
            }

            li {
                display: flex;
                align-items: center;
                height: 40px;
                padding: 12px 8px 12px 12px;
                cursor: pointer;
                line-height: 1.1;
            }

            li:hover {
                background: rgba(61, 130, 242, 0.1);
            }
        }
    }

    .search {
        width: 200px;
        height: 46px;
        padding: 8px 12px;
        position: relative;

        input {
            width: 176px;
            height: 30px;
            padding-right: 33px;
        }

        .sear {
            width: 16px;
            position: absolute;
            top: 15.2px;
            right: 22.6px;
            cursor: pointer;
        }

        .clear {
            position: absolute;
            top: 15.5px;
            right: 46.6px;
            width: 16px;
            cursor: pointer;
        }
    }

    .active {
        font-weight: 500;
        font-size: 14px;
        color: #3D82F2;
        background: rgba(61, 130, 242, 0.1);
    }

    .table-total {
        width: 200px;
        height: 20px;
        padding: 2px 14px;
        color: rgba(0, 0, 0, 0.4);
        font-size: 12px;
    }

    .warpList {
        height: calc(100% - 130px); 
        position: relative; 
        overflow-y: scroll; 
        overflow-x: hidden;
        scrollbar-width: none;
    }

    .listUl {
        width: 200px;
        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.8);
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;

        .loading-text {
            color: rgba(0, 0, 0, 0.4);
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .lefticon {
            width: 16px;
            margin-right: 4px;
        }

        .listLi {
            display: flex;
            align-items: center;
            cursor: pointer;
            min-height: 40px;
            padding: 10px;
            position: relative;
            line-height: 1.4;
            font-size: 13px;

            .operUl {
                position: absolute;
                width: 68px;
                height: 88px;
                background: #FFFFFF;
                border: 1px solid #E9E9E9;
                box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
                border-radius: 4px;
                z-index: 3;
                top: 36px;
                right: 11px;
                color: rgba(0, 0, 0, 0.8) !important;

                li {
                    height: 44px;
                    text-align: center;
                    line-height: 44px;
                }

                li:hover {
                    background: rgba(141, 177, 235, 0.1);
                }
            }

            .edit {
                input {
                    width: 112px;
                }

                img {
                    width: 24px;
                    margin-left: 4px;
                }
            }

            .text-box {
                display: inline-block;
                display: flex;
                align-items: center;
            }

            .text-long {
                line-height: 1.4;
                width: 130px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .svgIcon{
                margin-right: 4px;
                // 异常表显示红色
                &.errorStatus + .text-long{
                    color: #f53f3f;
                    font-weight: 600;
                }
            }
        }

        .listLi:hover {
            background: rgba(61, 130, 242, 0.1);
        }

        .hotimg {
            width: 14px;
            position: absolute;
            right: 16px;
            top: 13px;
        }
    }

    .warpList::-webkit-scrollbar {
        width: 0;
    }
}
.table-tree:hover {
    .warpList::-webkit-scrollbar {
        width: 5px !important;
    }
}
</style>