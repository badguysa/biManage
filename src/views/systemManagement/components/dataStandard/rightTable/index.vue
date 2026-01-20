<template>
    <div class="manageWrapper">
        <div class="topContainer">
            <p class="title">{{ t('dataStandard.dataStandard') }}</p>
            <div class="bottom-box">
                <div class="search">
                    <input type="text" v-model.trim="standardTableSearchValue" :placeholder="t('common.search')"
                        @input="refreshListDebounce">
                    <img class="sear" src="@/assets/icons/search.png" alt="">
                </div>
                <div class="right-box" v-if="!showTemplateField && leftDataList.length">
                    <div class="btn-box" @click="setCheckCycle">
                        <BiIcon name="check"/>
                        <span>校验周期</span>
                    </div>
                    <myButton class="add-btn" @click="addTable">
                        <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                        {{ t('selfConfig.add') }}
                    </myButton>
                </div>
            </div>
        </div>
        <!-- 模板字段库 -->
        <templateField ref="templateFieldRef" v-if="showTemplateField"/>
        <!-- 标准表 -->
        <tableContainer v-else></tableContainer>
    </div>
</template>
<script setup>
import tableContainer from './table.vue'
import myButton from '@/components/buttons/myButton.vue';
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { apiManageStore } from '@/Stores/apiManageStore';
import { debounce } from 'lodash'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia';
import { updateStandardLibApi } from '@/apis/dataStandard'
import { message } from 'ant-design-vue'
import { getReularUpdateTips } from '@/utils/regularUpdate'
import { mainStore } from '@/Stores/mainStore';
import { v4 as uuidv4 } from 'uuid'
import templateField from '../templateField'

const { t } = useI18n()
const useMainStore = mainStore()
const useModalStore = modalStore()
const useApiManageStore = apiManageStore()
const useDataStandardStore = dataStandardStore()
const { standardTableSearchValue, activeStandardKey, leftDataList } = storeToRefs(useDataStandardStore)
const { regularUpdateModalVisible } = storeToRefs(useModalStore)
const { regularUpdateInfo } = storeToRefs(useMainStore)
const uuid = uuidv4()

const templateFieldRef = ref()

// 显示模板字段库
const showTemplateField = computed(() => {
    return activeStandardKey.value === 'TEMPLATE_FIELD'
})

// 当前标准分组
const currentGroup = computed(() => {
    let group = null
    for(let i = 0; i < leftDataList.value.length; i++) {
        let item = leftDataList.value[i]
        if(item.id === activeStandardKey.value) {
            group = item
            break
        }
        if(!item.subList) continue
        let target
        for(let it of item.subList) {
            if(it.id === activeStandardKey.value) {
                target = it
            }
            if(!it.subList) continue
            for(let t of it.subList) {
                if(t.id === activeStandardKey.value) {
                    target = t
                }
            }
        }
        if(target) {
            group = target
            break
        }
    }
    return group
})
const refreshListDebounce = debounce(() => {
    // 搜索模板字段
    if(showTemplateField.value) {
        templateFieldRef.value.getFieldListData(standardTableSearchValue.value)
        return
    }
    useDataStandardStore.setPageNumber(1)
    useDataStandardStore.getStandardTableListFn()
}, 200)

// 设置校验周期
const setCheckCycle =() => {
    try {
        // 回显当前分组校验周期
        let cronStr = getCronStr()
        // cron表达式为none 代表无计划
        cronStr = cronStr === 'none' ? '' : cronStr
        let tips = getReularUpdateTips(cronStr, 'detail')
        useMainStore.setRegularUpdateInfo({ cronStr, tips },uuid)
        useMainStore.setIsDataStandardCheck(true)
        useModalStore.changeRegularUpdateModalVisible(uuid)
    }catch(e) {
        console.log('parse cron error', e)
    }
}

const getCronStr = () => {
    let updateParams = currentGroup.value?.updateParams
    
    if(!updateParams) {
        return ''
    } else {
        return JSON.parse(updateParams)?.timeExpression || ''
    }
}

// 关闭定时更新弹窗时 保存校验周期设置
watch(regularUpdateModalVisible, async () => {
    // console.log('update....',currentGroup.value.updateParams)
    // 仅在本页面关闭时触发保存
    if(regularUpdateModalVisible.value) {
        return
    }
    // 在其他页面改动的时候不保存
    if(uuid != useMainStore.getRegularUpdateUuid()) {
        return
    }
    let info = useMainStore.getRegularUpdateInfo(uuid)
    // 没有修改的时候不保存
    if(currentGroup.value.updateParams == JSON.stringify({timeExpression: info?.cronStr || ''})) {
        return
    }
    try {
        let res = await updateStandardLibApi({
            id: activeStandardKey.value,
            // 无计划cron表达式传none
            timeExpression: info?.cronStr || 'none',
            groupType: 0
        })
        if(res.code !== 1) {
            message.error(res.message)
        } else {
            // message.success(res.message)
            if(!currentGroup.value) return
            // 手动更新cron表达式
            currentGroup.value.updateParams = JSON.stringify({timeExpression: info?.cronStr || ''})
            // useDataStandardStore.getLeftDataListFn()
        }
    } catch(e) {
        console.log('update cronstr error', e)
    }
    }
)

const addTable = () => {
    useDataStandardStore.setAddOrEditDataStandardStatus(0)
    useApiManageStore.setApiPageId('addOrEditDataStandard')
}
</script>

<style lang="less" scoped>
.manageWrapper {
    width: 100%;
    height: 100%;
    background-color: #fff;
    padding: 20px;
    padding-bottom: 40px;
    overflow: auto;
    display: flex;
    flex: 1;
    flex-direction: column;
    position: relative;
    .topContainer {
        margin-bottom: 16px;
        .title {
            font-weight: 600;
            font-size: 18px;
            line-height: 25px;
            color: rgba(0, 0, 0, 0.8);
            margin-bottom: 0;
        }

        .bottom-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;

            .right-box {
                height: 100%;
                display: flex;
                align-items: center;
                gap: 30px;
                .btn-box{
                    display: flex;
                    align-items: center;
                    color: #2B67FF;
                    gap: 4px;
                    cursor: pointer;
                    svg{
                        width: 14px;
                        height: 14px;
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

            .search {
                width: 210px;
                height: 46px;
                padding: 8px 12px;
                padding-left: 0;
                position: relative;
                
                input {
                    width: 176px;
                    height: 30px;
                    padding-right: 33px;
                    background-color: #fff;
                    border: 1px solid #E9E9E9;
                }

                .sear {
                    width: 16px;
                    position: absolute;
                    top: 15.2px;
                    right: 40.6px;
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
        }
    }
}
</style>
