<template>
    <div className="templateModal">
        <div class="maskLayer"></div>
        <div class="popDiv wid840">
            <div class="popHead">
                <span class="popClose fr">
                    <img 
                        style="width: 16px" 
                        src="@/assets/icons/close.png"
                        @click="cancel" 
                    />
                    </span>
                <p class="fl colorDeep">{{ modalTitle }}</p>
            </div>

            <div className="modalBody">
                <div class="form-area">
                    <a-form ref="formRef" :model="formState" v-bind="layout">
                        <a-form-item 
                            name="templateName" 
                            :label="t('templateManage.templateName')" 
                            :rules="[{ required: !isCheck, message: t('common.pleaseEnter') }]"
                        >
                            <input class="ipt1" :disabled="isCheck" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="formState.templateName">
                        </a-form-item>
                        <a-form-item 
                            name="templateContent" 
                            :label="t('templateManage.templateContent')" 
                            :rules="[{ required: !isCheck, message: t('common.pleaseEnter') }]"
                        >
                            <textarea class="ipt2" :disabled="isCheck" :placeholder="t('common.pleaseEnter')" v-model.trim="formState.templateContent"></textarea>
                        </a-form-item>
                    </a-form>
                </div>
                <div class="group-manage" v-if="!isCheck">
                    <div class="left">
                        选择分组
                    </div>
                    <div class="options">
                        <a-radio-group v-model:value="formState.groupId">
                            <a-radio :style="radioStyle" value="">根目录</a-radio>
                            <div class="add-group" v-if="showAddInput">
                                <input type="text" v-model.trim="groupName">
                                <img @click.stop="handleAddGroup('ok')" :src="okImg" alt="">
                                <img @click.stop="handleAddGroup('cancel')" :src="cancelImg" alt="">
                            </div>
                            <template v-for="item in tmplGroupList">
                                <a-radio v-if="item.id !== SYSTEM_TEMPLATE_ID" :style="radioStyle" :value="item.id">{{ item.groupName }}</a-radio>
                            </template>
                        </a-radio-group>
                        <div class="increse" @click="showAddInput = true">
                            <img class="plus" src="@/assets/icons/plus.png" />
                            新建分组
                        </div>
                    </div>
                </div>
            </div>

            <div class="popBottom shadowBox" v-if="!isCheck">
                <myButton class="fr mr25" type="primary" @click="onOk">{{ t('common.confirm') }}</myButton>
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import myButton from '@/components/buttons/myButton.vue';
import { createTemplate, editTemplate, createTmplGroup } from '@/apis/templateManage';
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore'
import { apiManageStore } from '@/Stores/apiManageStore';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import okImg from '@/assets/icons/sureEdit.png'
import cancelImg from '@/assets/icons/cancelEdit.png'
import * as _ from 'loadsh'

const { t } = useI18n()
const useModalStore = modalStore()
const useApiManageStore = apiManageStore()
const { tmplGroupId, tmplGroupList } = storeToRefs(useApiManageStore)

const useMainStore = mainStore()
const { accessConfig } = storeToRefs(useMainStore)
const formRef = ref()
const groupName = ref('新建分组')
const showAddInput = ref(false)
const SYSTEM_TEMPLATE_ID = '9000000000000000000'   // 系统模板id


const radioStyle = reactive({
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
})
const layout = {
    labelCol: { span: 3 },
    wrapperCol: {
        span: 17,
        offset: 0.5
    }
}
const props = defineProps({
    operFlag: {
        type: String,
        defalut: 'add'
    },
    editData: {
        type: Object
    },
    tmplPage: {
        type: String,
        defalut: 'index'
    }
})
const formState = reactive({
    templateName: '',
    templateContent: '',
    groupId: ''
})
onMounted(() => {
    editInit()
    // 模板分组内添加 默认选中当前分组
    if(props.tmplPage === 'group') {
        formState.groupId = tmplGroupId.value === SYSTEM_TEMPLATE_ID ? '' : tmplGroupId.value
    }
})

// 弹窗标题
const modalTitle = computed(() => {
    switch(props.operFlag) {
        case 'edit':
            return t('common.edit')
        case 'add':
            return t('selfConfig.add')
        case 'check':
            return t('common.check')
    }
})

// 是否为查看弹窗
const isCheck = computed(() => props.operFlag === 'check')

const editInit = () => {
    if (props.operFlag === 'edit' || props.operFlag === 'check') {
        formState.templateName = props.editData.templateName
        formState.templateContent = props.editData.templateContent
        formState.groupId = props.editData.groupId || ''
    }else if (props.operFlag === 'add') {
        // 新增模版时，content可能从外界传入
        formState.templateName = ''
        formState.templateContent = props.editData.templateContent || ''
        formState.groupId = ''
    }
}
const handleAddGroup = _.debounce(type => {
    if (type === 'ok') {
        createTmplGroup(
            {
                groupName: groupName.value,
                description: ''
            }
        ).then((res) => {
            if(res.code === 1) {
                useApiManageStore.initTemplateList()
            }
            showAddInput.value = false
            groupName.value = '新建分组'
            // 选中默认新建分组
            formState.groupId = res.data.id
        })
    } else if (type === 'cancel') {
        showAddInput.value = false
        groupName.value = '新建分组'
    }
}, 200)
const onOk = () => {
    if (accessConfig.value.tmplMgrAuth) {
        if (accessConfig.value.tmplMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    formRef.value.validateFields().then((res) => {
        if (res) {
            if (props.operFlag === 'edit') { // 编辑
                const data = {
                    fid: props.editData.fid || '',
                    id: props.editData.id || '',
                    version: props.editData.version || 0,
                    templateName: formState.templateName,
                    templateContent: formState.templateContent,
                    groupId: formState.groupId
                }
                editTemplate(data).then(res => {
                    if (res.code == 1) {
                        message.success(res.message)
                        useModalStore.changeTemplateModalVisible()
                        // useApiManageStore.setTempName(props.editData.id, formState.templateName)
                        useApiManageStore.initTemplateList()

                    } else {
                        message.error(res.message)
                    }
                })
            } else { // 新增
                const data = {
                    templateName: formState.templateName,
                    templateContent: formState.templateContent,
                    groupId: formState.groupId
                }
                createTemplate(data).then(res => {
                    if (res.code == 1) {
                        message.success(res.message)
                        useModalStore.changeTemplateModalVisible()
                        useApiManageStore.initTemplateList()
                    } else {
                        message.error(res.message)
                    }
                })
            }
        }
    })
}
const cancel = () => {
    useModalStore.changeTemplateModalVisible()
}
</script>

<style lang="less" scoped>
.popDiv{
    transform: none;
    margin-left: -420px;
    margin-top: -287.5px;
}
.templateModal {
    font-family: 'PingFang SC';
    font-style: normal;
    width: 100%;
    z-index: 11;
    .modalBody {
        width: 844px;
        height: 522px;
        padding: 24px;
        padding-left: 10px;
        overflow: auto;
        .form-area {
            .ipt1 {
                width: 690px;
                height: 32px;
            }
            .ipt2 {
                width: 690px;
                height: 325px;
                border: none;
                padding: 7px 8px 7px 12px;
                background-color: #F3F3F3;
            }
        }
        .group-manage {
            display: flex;
            padding-left: 24px;
            gap: 12px;
            color: rgba(0, 0, 0, 0.85);
            font-size: 14px;
            .left {
                padding-top: 3.5px;
            }
            .options {
                .increse {
                    height: 18px;
                    display: flex;
                    align-items: center;
                    color: #2B67FF;
                    font-size: 13px;
                    font-style: normal;
                    font-weight: 400;
                    margin-top: 5px;
                    cursor: pointer;
                    .plus {
                        width: 14px;
                        height: 14px;
                        margin-right: 4px;
                    }
                }
            }
            .add-group {
                height: 28px;
                display: flex;
                gap: 6px;
                align-items: center;
                margin: 12px 0;
                img {
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>