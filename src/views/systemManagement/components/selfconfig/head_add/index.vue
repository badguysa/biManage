<template>
    <div class="configHead">
        <back @backFn="goBack"/>
        <div class="headBox">
            <div class="add">
                <div class="text">{{ selfFlag === 'edit' ? t('apiManage.editApi') : t('apiManage.addApi') }}</div>
                <!-- <div class="iptGroup">
                    <div>
                        <span class="textColor text1">表名</span>
                        <input class="ipt1" type="text" />
                    </div>
                    <div>
                        <span class="textColor text2">描述</span>
                        <input class="ipt2" type="text" />
                    </div>
                </div> -->

                <a-form>
                    <div class="iptGroup">
                        <div>
                            <a-form-item :label="t('apiManage.apiName')">
                                <input :placeholder="t('common.pleaseEnter')" v-model="headerInfo.apiName" class="ipt1" type="text" />
                            </a-form-item>
                        </div>
                        <div>

                            <a-form-item :label="t('apiManage.apiDesc')">
                                <input :placeholder="t('common.pleaseEnter')" v-model="headerInfo.apiDesc" class="ipt2" type="text" />
                            </a-form-item>
                        </div>
                    </div>
                    <div class="iptGroup">
                        <div>
                            <a-form-item :label="t('apiManage.apiType')">
                                <a-radio-group class="ipt1" v-model:value="headerInfo.apiType">
                                    <a-radio :value="0">{{ t('apiManage.normalApi') }}</a-radio>
                                    <a-radio :value="1">{{ t('apiManage.bigScreenApi') }}</a-radio>
                                </a-radio-group>
                            </a-form-item>
                        </div>
                        <div>
                            <a-form-item :label="t('apiManage.selectTemplate')">
                                <selectTemplate v-model:value="headerInfo.resTemplateId" style="width: 25vw"/>
                            </a-form-item>
                        </div>
                    </div>
                </a-form>
            </div>
            <div class="leftConfig">
                <div style="text-align: right;">
                    <myButton @click="importFile" :disabled="isClick" type="primary">{{ t('common.confirm') }}</myButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import myButton from '@/components/buttons/myButton.vue'
import { apiConfigStore } from '@/Stores/apiConfigStore'
import { apiManageStore } from '@/Stores/apiManageStore';
import selectTemplate from '@/views/systemManagement/components/selectTemplate'
import { mainStore } from '@/Stores/mainStore';
import { storeToRefs } from 'pinia'
import { createApi, editApi } from '@/apis/apiManage'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import back from '@/components/back'

const { t } = useI18n()
const useApiConfigStore = apiConfigStore()
const useApiManageStore = apiManageStore()
const useMainStore = mainStore()
const { headerInfo, selfConfig, leftMergeTable, selectedCodeList, selfFlag, selfEditData, filterConfig } = storeToRefs(useApiConfigStore)
const { activeMenuName } = storeToRefs(useApiManageStore)
const { dynamicNum } = storeToRefs(useMainStore)

const isClick = computed(() => {
    if (selectedCodeList.value.length > 0) {
        return false
    } else {
        return true
    }
})

const importFile = () => {
    if (!headerInfo.value.apiName) return message.warn(t('otherConfig.blankTableTip'))
    const length = selfConfig.value[selfConfig.value.length - 1].config.length
    selfConfig.value[selfConfig.value.length - 1].config[length - 1].lastNumber = dynamicNum.value


    let queryConfigInfo = selfConfig.value[selfConfig.value.length - 1].config.filter(it => !it.default)

    let paramsData = {
        apiDesc: headerInfo.value.apiDesc,
        apiName: headerInfo.value.apiName,
        apiType: headerInfo.value.apiType,
        resTemplateId: headerInfo.value.resTemplateId || '',
        columnIds: selectedCodeList.value.map(i => i.id).join(','),
        fid: leftMergeTable.value.fid,
        tableId: leftMergeTable.value.id,
        queryConfig: JSON.stringify(queryConfigInfo)
    }


    let validateRes = editSubmitValidate()

    if(!validateRes) return message.warn('请填写动态参数示例值')

    if (selfFlag.value === 'edit') {

        paramsData.id = selfEditData.value.id
        paramsData.version = selfEditData.value.version
        editApi(paramsData).then(res => {
            if (res.code == 1) {
                message.success(res.message)
                useApiManageStore.initApiList('edit')
                goBack()
            } else {
                message.error(res.message)
            }
        })
        return
    }
    createApi(paramsData).then(res => {
        if (res.code == 1) {
            message.success(res.message)
            useApiManageStore.initApiList('update')
            useApiManageStore.setApiDataTotal('add')
            goBack()
        } else {
            message.error(res.message)
        }
    })
}

// 编辑提交校验 开启动态参数的筛选条件 示例值是否填写
const editSubmitValidate = () => {
    let dynamicRes = true

    for(let i = 0; i < filterConfig.value.length; i++) {
        let it = filterConfig.value[i]
        if(!it.checked) continue
        let res = false

        if(it.symbol === 'between') {
            res = !it.betweenStartExpression.apiParams.example && !it.betweenEndExpression.apiParams.example
        } else {
            res = !it.rightExpression.apiParams.example
        }

        if(res) {
            dynamicRes = false
            break
        }
    }
    return dynamicRes
}

const goBack = () => {
    useApiManageStore.setApiPageId('apiManagePage')
    useApiManageStore.changeTabPageId('reset', activeMenuName.value)
    useApiConfigStore.goBack()
}

</script>

<style lang="less" scoped>
.config {
    font-family: 'PingFang SC';
    font-style: normal;
    height: 100%;

    .configHead {
        width: 100%;
        height: 177px;
        background-color: #fff;
        margin-bottom: 12px;
        flex-shrink: 0;

        .ant-form-item {
            margin-bottom: 10px;
        }

        .headBox {
            width: 100%;
            display: flex;
            justify-content: space-between;

            .add {
                height: 105px;
                padding: 16px;

                .text {
                    height: 25px;
                    font-weight: 600;
                    font-size: 18px;
                    color: rgba(0, 0, 0, 0.8);
                    margin-bottom: 16px;
                }

                .iptGroup {
                    display: flex;
                    gap: 15px;
                    .textColor {
                        font-weight: 400;
                        font-size: 14px;
                        color: rgba(0, 0, 0, 0.8);
                    }

                    .text1 {
                        margin-right: 26px;
                    }

                    .text2 {
                        margin: 0px 14px 0px 30px;
                    }

                    .ipt1 {
                        width: 25vw;
                    }

                    .ipt2 {
                        width: 25vw;
                    }
                }
            }

            .leftConfig {
                margin-top: 16px;
                margin-right: 16px;

                .update {
                    height: 40px;
                    display: flex;
                    align-items: center;
                    margin-left: 10px;

                    .text3 {
                        margin-left: 4px;
                    }

                    .text4 {
                        color: #3D82F2;
                        margin-left: 4px;
                    }

                    .updata-text {
                        height: 40px;
                        display: flex;
                        align-items: center;
                        margin-left: 10px;
                    }
                }

            }
        }
    }
}
</style>