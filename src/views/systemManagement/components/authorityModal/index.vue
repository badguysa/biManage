<template>
    <div className="authorityModal">
        <div class="maskLayer"></div>
        <div class="popDiv wid480">
            <div class="popuHead">
                <span class="popClose fr">
                    <img style="width: 16px" src="@/assets/icons/close.png" @click="cancel"/>
                </span>
                <p class="fl colorDeep">{{ isEdit ? t('common.edit') : t('selfConfig.add') }}</p>
            </div>
            <div className="modalBody">
                <div class="row">
                    <div class="col-left">{{ t('authManage.name') }}</div>
                    <div class="col-right">
                        <input type="text" v-model.trim="state.name" :placeholder="t('common.pleaseEnter')" class="input">
                    </div>
                </div>
                <div class="row">
                    <div class="col-left">{{ t('authManage.phone') }}</div>
                    <div class="col-right">
                        <input type="text" v-model.trim="state.phone" :placeholder="t('common.pleaseEnter')" class="input">
                    </div>
                </div>
                <div v-if="systemConfig.mirror && systemConfig.openUnifCertif" class="row">
                    <div class="col-left">{{ t('authManage.schoolNum') }}</div>
                    <div class="col-right">
                        <input type="text" v-model.trim="state.xgh" :disabled="props.isEdit" :placeholder="t('common.pleaseEnter')" class="input">
                    </div>
                </div>
                <!-- <div class="row">
                    <div class="col-left">{{ t('authManage.email') }}</div>
                    <div class="col-right">
                        <input type="text" v-model.trim="state.email" :placeholder="t('common.pleaseEnter')" class="input">
                    </div>
                </div> -->
                <div class="row">
                    <div class="col-left">{{ t('authManage.role') }}</div>
                    <div class="col-right">
                        <customSelect
                            ref="select"
                            :width="364" 
                            :multiple="true" 
                            :placeholder="t('common.pleaseSelect')" 
                            :load-data="initRoleList" 
                            :selectList="processedRoleList"
                            :isAll="isAll"
                            :total="roleTotal"
                            v-model.value="selectedRole"
                            @scroll="onScroll"
                            @search="onSearch"
                            @selectAll="selectAll"
                        ></customSelect>
                    </div>
                </div>
                <div class="row" style="align-items: flex-start;">
                    <div style="margin-top: 10px;" class="col-left">{{ t('common.password') }}</div>
                    <div class="col-right">
                        <input type="text" maxlength="16" minlength="8" v-model.trim="state.password" :placeholder="t('common.pleaseEnter')" class="input">
                        <!-- <div class="tip-text">{{ t('authManage.resetPasswordTip') }}sjzt@</div> -->
                        <div class="tip-text">{{ t('authManage.tip4') }}</div>
                    </div>
                </div>
            </div>

            <div class="popuBottom shadowBox">
                <myButton class="fr mr25" type="primary" @click="onOk">{{ t('common.confirm') }}</myButton>
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import myButton from '@/components/buttons/myButton.vue'
import { storeToRefs } from 'pinia';
import { addSystemUser, getRoleList, editSystemUser, getUserInfo } from '@/apis/authorityManage';
import { mainStore } from '@/Stores/mainStore';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import customSelect from '@/components/customSelect'
import { cloneDeep } from 'lodash'

const { t } = useI18n()
const useMainStore = mainStore()
const useApiManageStore = apiManageStore()
const { systemConfig } = storeToRefs(useMainStore)
const select = ref()
const selectedRole = ref([]) // 被选中的角色
const roleList = ref([]) // 角色列表
const pageNum = ref(1) // 角色列表分页
const roleTotal = ref(0) // 角色列表总数
const searchValue = ref('') // 下拉框搜索文字
const isAll = ref(false)
const props = defineProps({
    editData: {
        default: {}
    },
    isEdit: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(['closeModal'])
const state = reactive({
    name: '',
    phone: '',
    xgh: '',
    email: '',
    role: 1,
    // password: 'sjzt@'
    password: ''
})
onMounted(() => {
    initRoleList('', 'init')
    initEdit()
})

const initEdit = () => {
    if (props.isEdit) { // 编辑状态才回显数据
        selectedRole.value = cloneDeep(props.editData.roles) || []
        if (selectedRole.value.length) {
            selectedRole.value.forEach(item => {
                item.label = item.name
                item.value = item.id
            })
        }
        state.name = props.editData.name
        getUserInfo(props.editData.id).then(res => {
            if (res.code === 1) {
                state.phone = res.data.phone
                state.password = res.data.password
                state.xgh = res.data.xgh
            }
        })
    }
}

const initRoleList = (type, flag) => {
    const params = {
        pageNum: pageNum.value,
        pageSize: 12,
        search: searchValue.value
    }
    getRoleList(params).then(res => {
        if (res.code == 1) {
            res.data.records.forEach(item => {
                item.value = item.id
                item.label = item.name
            })
            roleTotal.value = Number(res.data.total)
            if (flag === 'init') {
            }
            if (type === 'scroll') {
                if (isAll.value) {
                    res.data.records.forEach(item => {
                        item.isSelect = true
                    })
                }
                roleList.value = [...roleList.value, ...res.data.records]
                if (isAll.value) {
                    selectedRole.value = [...selectedRole.value, ...res.data.records]
                }
            } else {
                roleList.value = res.data.records || []
            }
        } else {
            message.error(res.message)
        }
    })
}

const onSearch = (value) => {
    searchValue.value = value
    pageNum.value = 1
    initRoleList()
}

const onScroll = () => {
    if (roleList.value.length == roleTotal.value) {
        return
    }
    pageNum.value++
    initRoleList('scroll')
}

const selectAll = (type) => {
    if (type === 1) {
        isAll.value = false
        roleList.value.forEach(item => item.isSelect = false)
    } else {
        isAll.value = true
        roleList.value.forEach(item => item.isSelect = true)
    }
}

const cancel = () => {
    emits('closeModal')
}

const processedRoleList = computed(() => {
    // 含有游客角色
    let hasDataMarketRole = selectedRole.value.some(r => r.name === "数据集市游客")

    // 游客角色只能与超管共存
    if(hasDataMarketRole) {
        selectedRole.value = selectedRole.value.filter(it => ['超级管理员', '数据集市游客'].includes(it.name))
    }

    return roleList.value.map(it => {
        // 不含游客角色 可选择任意角色
        if(!hasDataMarketRole) {
            it.disabled = false
        } 
        // 含有游客角色时 只能选择超管角色
        else {
            it.disabled = !['超级管理员', '数据集市游客'].includes(it.name)
        }
        return it
    })
})


const onOk = () => {
    // 统一认证
    if(systemConfig.value.mirror && systemConfig.value.openUnifCertif){
        if (!state.name || !state.phone || !state.xgh || !selectedRole.value.length) return message.warn(t('otherConfig.blankTableTip'))
    }else{
        if (!state.name || !state.phone || !selectedRole.value.length) return message.warn(t('otherConfig.blankTableTip'))
    }
    // const reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    // if (!reg.test(state.phone)) return message.warn('请输入正确格式的手机号码')
    const successHandle = (msg) => {
        message.success(msg)
        useApiManageStore.initAuthorityList()
        emits('closeModal')
    }
    if (props.isEdit) {
        const jsonData = {
            all: 0,
            name: state.name,
            phone: state.phone,
            email: state.email,
            password: state.password === '******' ? '******' : state.password,
            // excludeRoleIds: select.value.noSelectList.map(item => item.id),
            roleIds: selectedRole.value.map(item => item.id),
            search: searchValue.value,
            userId: props.editData.id
        }
        if(systemConfig.value.mirror && systemConfig.value.openUnifCertif){
            jsonData.xgh = state.xgh
        }
        editSystemUser(jsonData).then(res => {
            if (res.code == 1) {
                successHandle(res.message)
            } else {
                message.error(res.message)
            }
        })
    } else {
        const jsonData = {
            all: 0,
            name: state.name,
            phone: state.phone,
            email: state.email,
            password: state.password,
            // excludeRoleIds: select.value.noSelectList.map(item => item.id),
            roleIds: selectedRole.value.map(item => item.id),
            search: searchValue.value
        }
        if(systemConfig.value.mirror && systemConfig.value.openUnifCertif){
            jsonData.xgh = state.xgh
        }
        addSystemUser(jsonData).then(res => {
            if (res.code === 1) {
                successHandle(res.message)
            } else {
                message.error(res.message)
            }
        })
    }
}
</script>

<style lang="less" scoped>
.authorityModal {
    .modalBody {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 24px;
        gap: 16px;
        width: 480px;
        font-size: 14px;
        flex: none;
        order: 1;
        align-self: stretch;
        flex-grow: 0;
        color: rgba(0, 0, 0, 0.8);
        .row {
            display: flex;
            align-items: center;
            .col-left {
                margin-right: 4px;
                width: 68px;
                line-height: 1;
            }
            .col-right {
                .input {
                    width: 364px;
                }
                .tip-text {
                    color: rgba(0, 0, 0, 0.40);
                    font-size: 12px;
                    margin-top: 3px;
                }
            }
        }

    }
}
</style>
