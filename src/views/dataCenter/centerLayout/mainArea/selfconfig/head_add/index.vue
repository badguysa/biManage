<template>
    <div class="configHead">
        <div class="back">
            <div class="backbox" @click="goBack"><img src="@/assets/icons/return.png" alt="">{{ t('common.back') }}</div>
        </div>
        <div class="headBox">
            <div class="add">
                <div class="text">{{ t(getPageTitle) }}</div>
                <div class="iptGroup">
                    <div>
                        <span class="textColor text1">{{ t('common.tableName') }}</span>
                        <input v-if="addDataMode === 'add'" v-model="headerInfo.tableName" class="ipt1" type="text" :placeholder="t('common.enterTableName')">
                        <input v-else :value="indexTableDesc.tableAlias" class="ipt1" type="text" disabled />
                    </div>
                    <div>
                        <span class="textColor text2">{{ t('common.desc') }}</span>
                        <input v-if="addDataMode === 'add'" v-model="headerInfo.desc" class="ipt2" type="text" :placeholder="t('common.tableDesc')">
                        <input v-else :value="indexTableDesc.description" class="ipt2" type="text" disabled />
                    </div>
                </div>
                <!-- 操作 -->
                <div class="formItemBody" v-if="selfFlag === 'edit'">
                    <span class="formLabel">操作</span>
                    <a-radio-group  v-model:value="operateType">
                        <a-radio value="selfConfig">{{ t('common.selfProvision') }}</a-radio>
                        <a-radio value="fieldDesensitization">{{ t('indexPage.fieldDesensitization') }}</a-radio>
                    </a-radio-group>
                </div>
                 <!-- 导出数据脱敏 -->
                 <div class="formItemBody" v-if="selfFlag === 'edit' && operateType === 'fieldDesensitization'">
                    <span class="formLabel">{{ t('indexPage.exportDesensitization') }}</span>
                    <a-radio-group v-model:value="headerInfo.exportDst" >
                        <a-radio :value="1">{{ t('indexPage.yes') }}</a-radio>
                        <a-radio :value="0">{{ t('indexPage.no') }}</a-radio>
                    </a-radio-group>
                </div>
                <!-- 更新策略 -->
                <div class="formItemBody">
                    <a-form ref="formRef" :model="updateInfo">
                        <a-form-item name="updatePolicy" :label="t('common.updatePolicy')">
                            <a-radio-group v-model:value="updateInfo.updatePolicy" :disabled="isDisabledRadio" name="checkboxgroup">
                                <a-radio value="NONE">{{ t('common.noUpdate') }}</a-radio>
                                <a-radio value="FULL_UPDATE">{{ t('common.fullUpdate') }}</a-radio>
                                <a-radio v-if="showCascadUpdate" value="CASCADE_UPDATE" :disabled="cascadDisabled">
                                    <span>{{ t('common.cascadingUpdate') }}</span>
                                    <a-tooltip overlayClassName="cascadUpdateToolTip">
                                        <template #title>
                                            <div>
                                                <p>{{ cascadUpdateTipInfo.title }}</p>
                                                <div>{{ cascadUpdateTipInfo.content }}</div>
                                            </div>
                                        </template>
                                        <img class="tips_icon" src="@/assets/icons/tips-small-icon.png" alt="" />
                                    </a-tooltip>
                                </a-radio>
                            </a-radio-group>
                        </a-form-item>
                        <!-- 定时更新 -->
                        <regularUpdateInput ref="regularUpdateRef" :updatePolicy="updateInfo.updatePolicy" :setType="'page_config_' + selfFlag"/>
                    </a-form>
                </div>
               
            </div>
            <div class="leftConfig">
                <div style="text-align: right;">
                    <myButton style="margin-right: 20px;" v-if="selfFlag === 'edit'" @click="importFile('saveAs')">
                        {{ t('common.saveAs') }}
                    </myButton>
                    <myButton @click="importFile" type="primary">
                        {{ selfFlag === 'edit' ? t('common.save') :  t('common.import') }}
                    </myButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import myButton from '@/components/buttons/myButton.vue'
import { configStore } from '@/Stores/configStore'
import { mainStore } from '@/Stores/mainStore'
import { modalStore } from '@/Stores/modalStore';
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { getBloodRelation } from '@/apis/bloodRelation'
import regularUpdateInput from '@/components/regularUpdateInput'
import { debounce } from 'loadsh'
import { cascadUpdateTipInfo } from '@/constants/logManage.js'

const { t } = useI18n()
const useConfigStore = configStore()
const useMainStore = mainStore()
const useModalStore = modalStore()
const { indexTableDesc, activeTabKey, addDataMode, systemConfig, isSelfTable } = storeToRefs(useMainStore)
const { configUniqueData } = storeToRefs(useConfigStore)
const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})
const { headerInfo, selfConfig, updateInfo, selfFlag, operActiveId, operationList, previewColumns } = toRefs(configData.value)
const regularUpdateRef = ref(null)
const operateType = ref('selfConfig')
const hasRelation = ref(false)  // 自助配置表是否有血缘关系
const dyFunctionNames = [ 'NOW', 'SYSDATE', 'UUID', 'CURRENT_DATE', 'CURRENT_TIMESTAMP', 'CURRENT_TIME', 'RAND', 'RANDOM', 'SLEEP' ] //动态函数名称

onMounted(async () => {
    if(selfFlag.value === 'edit') {
        let relationRes = await getBloodRelation(indexTableDesc.value.id, 0)
        if(relationRes.code === 1) {
            hasRelation.value = !!relationRes.data?.sourceRelations.length
        } else {
            message.error(relationRes.message)
        }
        headerInfo.value.exportDst = indexTableDesc.value.exportDst ?? 1
    }
})

const isDisabledRadio = computed(() => {
    if(indexTableDesc.value?.tableStatus?.value === 7){  // 移入过回收站
        return true
    } else {
        return false
    }
})

const getPageTitle = computed(() => {
    if (selfFlag.value === 'edit') {
        return 'selfConfig.editSelfData'
    }
    if(addDataMode.value === 'import') {
        return 'selfConfig.importSelfData'
    } else {
        return 'selfConfig.addSelfData'
    }
})

const cascadDisabled = computed(() => {
    let configData
    let flag = false
    if(selfConfig.value.length > 0){
        configData =  selfConfig.value[selfConfig.value.length - 1].config
        configData.forEach((item)=>{
            if(item.action === 'where'){
                item.contents.forEach((cont)=>{
                    for (let functionName of dyFunctionNames) {  
                        if (cont.info && cont.info.toUpperCase().includes(functionName + '()')) {  
                            return flag = true;  
                        }  
                    }
                })
            }else if(item.action === 'add'){
                item.contents.forEach((cont)=>{
                    for (let functionName of dyFunctionNames) {  
                        if (cont.expression && cont.expression.toUpperCase().includes(functionName + '()')) {  
                            return flag = true;  
                        }  
                    }
                })
            }
        })
    }
    // 为mySQL数据库/ 存在动态函数 / 自助表
    let result = systemConfig.value.dbType === 0 || flag
    // 编辑逻辑不变，禁止级联并且当前为级联更新，级联更新变为不更新
    if(result && updateInfo.value.updatePolicy === 'CASCADE_UPDATE' && selfFlag.value !== 'edit'){
        updateInfo.value.updatePolicy =  'NONE'
    }
    return result
})

watch(() => addDataMode.value, (val) => {
    if (val === 'import') {
        const info = {
            desc: indexTableDesc.value.description,
            tableName: indexTableDesc.value.tableAlias
        }
        useConfigStore.setHeaderInfo(info, activeTabKey.value)
    }
},{
    immediate: true
})

watch(operateType, (nv) => {
    // 字段脱敏
    if(nv === 'fieldDesensitization') {
        useConfigStore.setShowType('desensitization', activeTabKey.value)
    } else {
        let target = operationList.value.find(item => item.uuid === operActiveId.value)
        useConfigStore.setShowType(target.id, activeTabKey.value)
    }
})

const importFile = debounce(async (type) => {
    if (!headerInfo.value.tableName) return message.warn(t('common.pleaseEnterName'))
    if (!Object.keys(selfConfig.value).length) return message.warn(t('selfConfig.selectConfig'))

    // 另存为
    if(type === 'saveAs') {
        useModalStore.changeSaveAsModalVisible()
        return
    }
    // 编辑自助配置
    if(selfFlag.value === 'edit') {
        await useConfigStore.editConfig(activeTabKey.value)
        useMainStore.changeTabsList({}, 'cancel', activeTabKey.value)
        useConfigStore.updateConfigUniqueData(activeTabKey.value, 'delete')
        return
    }
    useConfigStore.importConfigFlie(addDataMode.value, indexTableDesc.value.id, activeTabKey.value)
}, 1000, {
    leading: true,
    trailing: false
})

const goBack = () => {
    useMainStore.setPageId('pageTable')
    useMainStore.selectTabs({
        id: activeTabKey.value
    })
    useMainStore.changeTabsList({}, 'cancel', activeTabKey.value)
    useConfigStore.goBack(activeTabKey.value)
}

// 展示级联更新
const showCascadUpdate = computed(() => 
    // 新增默认展示 含有血缘关系
    selfFlag.value === 'add' || hasRelation.value
)
</script>
<style lang="less" scoped>
.config {
    font-family: 'PingFang SC';
    font-style: normal;
    height: 100%;

    .configHead {
        width: 100%;
        background-color: #fff;
        margin-bottom: 12px;

        .back {
            height: 36px;
            padding: 8px 16px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);
            .backbox {
                width: 60px;
                height: 20px;
                display: flex;
                align-items: center;
                font-weight: 400;
                font-size: 14px;
                color: #3D82F2;
                cursor: pointer;
                span{
                    display: flex;
                    align-items: center;
                }
    
                img {
                    width: 16px;
                    margin-right: 4px;
                }
            }
        }

        .headBox {
            width: 100%;
            display: flex;
            justify-content: space-between;

            .add {
                padding: 12px 16px;

                .text {
                    height: 25px;
                    font-weight: 600;
                    font-size: 18px;
                    color: rgba(0, 0, 0, 0.8);
                    margin-bottom: 16px;
                }

                .sub-title {
                    font-size: 12px;
                    font-weight: 400;
                    opacity: .8;
                }

                .formItemBody {
                    max-height: 130px;
                    margin-top: 5px;

                    .ant-form-item {
                        margin-bottom: 0;
                    }

                    .row {
                        display: flex;
                        align-items: center;
                        margin-top: 5px;

                        .col2 {
                            height: 32px;
                            display: flex;
                            align-items: center;

                            .ml8mr20 {
                                margin-left: 8px;
                                margin-right: 20px;
                            }

                            .wid276 {
                                width: 276px;
                            }

                            .col3 {
                                display: flex;
                                align-items: center;
                                .ant-input-number{
                                    height: 32px;
                                    border: none;
                                }
                                .ant-input-number-focused{
                                    box-shadow: 0px 0px 0px 1px #3D82F2;
                                }
                            }
                        }
                    }

                    .formLabel{
                        margin-right: 20px;
                    }

                    :deep(.ant-form-item-label > label){
                        &::after{
                            content: '';
                        }
                    }

                    .tips_icon{
                        width: 14px;
                        height: 14px;
                        margin-bottom: 3px;
                        margin-left: 4px;
                    }
                }

                .iptGroup {
                    display: flex;
                    align-items: center;
                    height: 32px;
                    margin-top: 5px;

                    .textColor {
                        font-weight: 400;
                        font-size: 14px;
                        color: rgba(0, 0, 0, 0.8);
                    }

                    .text1 {
                        margin-right: 20px;
                    }

                    .text2 {
                        margin: 0px 14px 0px 30px;
                    }

                    .ipt1 {
                        width: 15.7vw;
                    }

                    .ipt2 {
                        width: 26.1vw;
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