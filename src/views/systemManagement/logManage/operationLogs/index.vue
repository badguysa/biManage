<template>
    <mainArea :pageTitle="t('logManage.logSearch')">
        <div class="row">
            <div class="left_container">
                <span>{{ t('logManage.logKind') }}</span>
                <a-tooltip overlayClassName="cascadUpdateToolTip" placement="topLeft">
                    <template #title>
                        <div>
                            <div>{{ logKindTipInfo.content }}</div>
                        </div>
                    </template>
                    <img class="tips_icon" src="@/assets/icons/tips-small-icon.png" alt="" />
                </a-tooltip>
            </div>
            <div class="right_container">
                <a-select
                    v-model:value="chooseLogKind.value"
                    class="selectOptions"
                    :options="kindOptions"
                    @select="(value,options) => handleKindChange(options)"
                    placeholder = '请选择'
                >
                    <template #suffixIcon><BiIcon name="dropDown" color="#ACB4BF" class="svgIcon"></BiIcon></template>
                </a-select>
            </div>
        </div>
        <div class="row">
            <div class="left_container">{{ t('logManage.logTime') }}</div>
            <div class="right_container">
                <a-select
                    v-model:value="chooseLogTime"
                    class="selectOptions"
                    placeholder = '请选择'
                >
                    <template #suffixIcon><BiIcon name="dropDown" color="#ACB4BF" class="svgIcon"/></template>
                    <a-select-option v-for="item in timeOptions" :value="item.value" :label="item.label">
                        {{ chooseLogKind.label ? `${chooseLogKind.label}——${item.label}` : `${item.label}` }}
                    </a-select-option>
                </a-select>
            </div>
        </div>
        <div class="export">
            <myButton @click="exportFile" type="primary" class="btn">{{ t('common.export')}} </myButton>
        </div>
    </mainArea>
</template>
<script setup>
import mainArea from '../../layouts/mainArea.vue'
import { logKindTipInfo } from '@/constants/logManage.js'
import { operationLogsExport } from '@/apis/logManage'
import myButton from '@/components/buttons/myButton.vue'
import { message } from 'ant-design-vue';

const { t } = useI18n()
const chooseLogKind = ref({
    value: undefined,
    label: undefined
})
const chooseLogTime = ref(undefined)
const kindOptions = ref([
    {
        value: 1,
        label: 'Server日志',
    },
    {
        value: 2,
        label: 'PowerJob日志',
    },
    // {
    //   value: 3,
    //   label: 'Nginx日志',
    // },
    // {
    //   value: 4,
    //   label: 'StarRocks审计日志',
    // },
])
const timeOptions = ref([
    {
      value: 7,
      label: '7天',
    },
    {
      value: 15,
      label: '15天',
    },
    // {
    //   value: 30,
    //   label: '30天',
    // },
])

const handleKindChange = (option) => {
    chooseLogKind.value = option
};

const exportFile = ()=>{
    const params = {
        type: chooseLogKind.value.value,
        dateRange: chooseLogTime.value ? chooseLogTime.value : 0,
    }
    let name = chooseLogKind.value.label
    operationLogsExport(params).then((res) => {
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
        // 返回成功的情况，返回二进制文本数据 或者 octet-stream类型数据
        } else if ( res.type === 'text/xml' || res.type === 'application/octet-stream' || res.type === 'application/zip'){
            let data = res;
            if(res.data){
                data = res.data;
            }
            const blob = new Blob([data])
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = res.type === 'application/zip' ? `${name}.zip` : `${name}.xlsx`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    })
}
</script>
<style lang="less" scoped>
.row{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-top: 16px;
    .left_container{
        display: flex;
        align-items: center;
        width: 84px;
        .tips_icon{
            width: 14px;
            height: 14px;
            margin-left: 5px;
        }
    }
    .right_container{
        margin-left: 20px;
        .selectOptions{
            width: 240px;
            height: 34px;
            color: #131B26;
            font-size: 14px;
            border-radius: 4px;
            border: 1px solid #D4D6D9;
            .svgIcon{
                width: 12px;
                height: 12px;
            }
        }
        :deep(.ant-select-selector){
            background-color: white !important;
        }
    }
}
.export{
    margin-top: 30px;
    .btn{
        width: 104px;
    }
}
</style>