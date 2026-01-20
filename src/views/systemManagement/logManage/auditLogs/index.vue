<template>
    <div class="manageWrapper">
        <div class="topContainer">
            <div class="basic-tabs" @click="basicTabsChange">
                <div :class="[activeType === 0 ? 'tab-is-active' : '']" id="tab-a">系统访问</div>
                <div :class="[activeType === 1 ? 'tab-is-active' : '']" id="tab-b">用户操作</div>
            </div>
            <div class="export">
                <div class="tip">日志保存30天</div>
                <myButton class="export-btn" @click="exportFn">
                    {{ t('common.export') }}
                </myButton>
            </div>
        </div>
        <div class="date-select" v-if="activeType === 1">
            <div class="name">{{ t('logManage.operationTime') }}</div>
            <a-range-picker :locale="locale === 'lo' ? Lo : zhCN" valueFormat="YYYY-MM-DD HH:mm" format="YYYY-MM-DD HH:mm" v-model:value="logAuditDateValue" show-time @ok="ok" />
        </div>
        <template v-if="activeType === 0">
            <systemAccess ref="systemAccessRef"></systemAccess>
        </template>
        <template v-if="activeType === 1">
            <userOperation ref="userOperationRef"></userOperation>
        </template>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import myButton from '@/components/buttons/myButton.vue';
import systemAccess from './systemAccess.vue'
import userOperation from './userOperation.vue'
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import Lo from '@/locale/lang/lo-datepicker'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN';
import { systemManageStore } from '@/Stores/systemManageStore';
import { userOperationExport, systemAccessExport } from '@/apis/logManage';

const useSystemManageStore = systemManageStore()
const { logAuditDateValue } = storeToRefs(useSystemManageStore)

const { locale, t } = useI18n()
const activeType = ref(0) // 当前显示的视图

const basicTabsChange = async e => {
    const tabId = e.target.id
    if (tabId === 'tab-a') {
        activeType.value = 0
        useSystemManageStore.initSystemAccessList()
    } else if (tabId === 'tab-b') {
        activeType.value = 1
        useSystemManageStore.initUserOperationList()
    }
}

const exportFn = ()=>{
    let api,name
    if(activeType.value === 0){
        api = systemAccessExport
        name = '审计日志_系统访问'
    } else {
        api = userOperationExport
        name = '审计日志_用户操作'
    }
    api().then((res) => {
        // 这是失败的情况，返回封装的二进制json数据
        if(res.type === 'application/json'){
            let result
            let reader = new FileReader();
            // 设置 FileReader 对象的 onload 回调函数
            reader.onload = function(event) {
                // 读取 Blob 中的数据
                const data = event.target.result;
                // 将数据解析为 JavaScript 对象
                result = JSON.parse(data);
                if (result.code === 0) {
                    message.error(result.message)
                }
            }
            // 读取 Blob 中的数据
            reader.readAsText(res);
        // 返回成功的情况，返回二进制文本数据
        } else if ( res.type === 'text/xml'){
            let data = res;
            if(res.data){
                data = res.data;
            }
            const blob = new Blob([data])
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = name + '.xlsx'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    })
}
const ok = (val) => {
    if(val[0]&&val[1]){
        useSystemManageStore.setLogAuditDateValue(val)
    }
}
</script>

<style lang="less" scoped>
.manageWrapper {
    width: 100%;
    height: calc(100% - 36px);
    background-color: #fff;
    padding: 20px;
    padding-bottom: 40px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    .topContainer {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        .basic-tabs {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 3px;
            width: 198px;
            height: 36px;
            background: #F3F3F3;
            border-radius: 8px;
            & > div {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                padding: 0px 12px;
                isolation: isolate;
                height: 30px;
                border-radius: 6px;
                flex: none;
                order: 1;
                flex-grow: 1;
                cursor: pointer;
                color: rgba(0, 0, 0, 0.4);
                transition: background 0.6s cubic-bezier(0.075, .82, .165, 1);
            }
            .circle {
                min-width: 16px;
                height: 16px;
                text-align: center;
                border-radius: 10px;
                padding: 0 6px;
                background: #F53F3F;
                line-height: 16px;
                font-size: 12px;
                color: #FFF;
                margin-left: 6px;
                white-space: nowrap;
            }
            .tab-is-active {
                background: #FFFFFF;
                box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
                border-radius: 6px;
                color: rgba(0, 0, 0, 0.8);
                font-weight: 600;
            }
        }
        
        .export{
            display: flex;
            justify-content: center;
            align-items: center;
            .tip{
                margin-right: 16px;
                font-size: 14px;
                font-weight: 400;
                color: #666666;
            }
        }
    }
    .date-select{
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding: 0 3px;
        .name{
            margin-right: 40px;
        }
        :deep(.ant-picker){
            background: white;
            border-radius: 5px;
        }
        :deep(.ant-picker-input){
            width: 120px;
        }
        :deep(.ant-picker-range-separator .anticon){
            vertical-align: 0.875em;
        }
    }
}
</style>