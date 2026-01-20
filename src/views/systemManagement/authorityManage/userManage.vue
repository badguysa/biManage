<template>
    <a-spin :spinning="authLoading">
    <div class="tableWrapper">
        <div class="search">
            <input type="text" v-model.trim="authSearchValue" :placeholder="t('common.search')">
            <img class="sear" src="@/assets/icons/search.png" alt="">
        </div>
        <div class="tableBox">
            <table class="tableContainer">
                <tr>
                    <td>{{ t('authManage.name') }}</td>
                    <td>{{ t('authManage.phone') }}</td>
                    <!-- openUnifCertif: 是否开启统一认证 -->
                    <td v-if="systemConfig.mirror && systemConfig.openUnifCertif">{{ t('authManage.schoolNum') }}</td>
                    <!-- <td>{{ t('authManage.email') }}</td> -->
                    <td>{{ t('authManage.role') }}</td>
                    <td>
                        <a-dropdown class="statu_dropdown">
                            <a class="status_text" @click.prevent>
                                {{ t('excel.status') }}
                                <img src="@/assets/icons/blue_arrow.png" alt="">
                            </a>
                            <template #overlay>
                                <a-menu class="statu_dropdown">
                                    <a-menu-item v-for="item in authStatuses" :key="item.value" @click="filterData(item)">
                                        <img v-if="item.isSelect && filterNumber > 1" src="@/assets/icons/is_select.png" alt="">
                                        <img v-else-if="item.isSelect && filterNumber === 1" src="@/assets/icons/disabled_select.png" alt="">
                                        <img v-else src="@/assets/icons/not_select.png" alt="">
                                        <span>{{ t(item.label) }}</span>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                    </td>
                    <td>{{ t('common.operation') }}</td>
                </tr>
                <template v-if="authorityList.length">
                    <tr v-for="item in authorityList" :key="item.id" :style="({color: item.status ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.8)'})">
                        <td><div :title="item.name || '-'">{{ item.name }}</div></td>
                        <td><div :title="item.phone || '-'">{{ item.phone }}</div></td>
                        <td v-if="systemConfig.mirror && systemConfig.openUnifCertif"><div :title="item.xgh || '-'">{{ item.xgh }}</div></td>
                        <!-- <td><div :title="item.email || '-'">{{ item.email }}</div></td> -->
                        <td>
                            <a-tooltip placement="topLeft">
                                <template #title>
                                    {{ getRoles(item) }}
                                </template>
                                <div>{{ getRoles(item) }}</div>
                            </a-tooltip>
                        </td>
                        <td>
                            <div>
                                {{ item.status ? t('authManage.disabled') : t('authManage.enabled') }}
                            </div>
                        </td>
                        <td>
                            <div class="operateWrap">
                                <span :class="[!item.showEdit ? 'ban' : '']" @click="editHandle(item)">{{ t('common.edit') }}</span>
                                <span :class="[!item.showEnable ? 'ban' : '']" @click="authHandle(item)">{{ item.status ? t('authManage.enable') : t('authManage.disable') }}</span>
                                <span :class="[!item.showRemove ? 'ban' : '']" @click="removeHandle(item)">{{ t('common.delete') }}</span>
                                <!-- <span :class="[!item.showReset ? 'ban' : '']" @click="resetPwd(item)">{{ t('authManage.resetPwd') }}</span> -->
                            </div>
                        </td>
                    </tr>
                </template>
            </table>
        </div>
    </div>
    </a-spin>
    <div class="noData" v-if="!authorityList.length && !authLoading">
        <img src="@/assets/images/img_null.png" alt="" />
        <p>{{ (accessConfig.perMgrAuth && accessConfig.perMgrAuth.read == 0) ? t('common.noAuth') : t('common.noData') }}</p>
    </div>
    <div class="page" v-if="authDataTotal > 12">
        <a-pagination 
            v-model:current="authPageNumber" 
            :total="authDataTotal"
            :pageSize="12"
            show-less-items 
            @change="pageChange"
        />
    </div>
    <authorityModal 
        v-if="authorityModalVisible"
        :editData="editData"
        :isEdit="isEdit"
        @closeModal="showModal"
    />
    <deleteModal ref="deleteModalRef" @confirmRemoveHandle="confirmRemoveHandle"></deleteModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { deleteSystemUser, setUserAuth, resetPassword } from '@/apis/authorityManage';
import { apiManageStore } from '@/Stores/apiManageStore';
import { mainStore } from '@/Stores/mainStore';
import authorityModal from '../components/authorityModal/index.vue';
import deleteModal from '../components/deleteModal.vue'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const useApiManageStore = apiManageStore()
const useMainStore = mainStore()
const { authorityList, authPageNumber, authDataTotal, authStatuses, authSearchValue, authLoading } = storeToRefs(useApiManageStore)
const { systemConfig, accessConfig } = storeToRefs(useMainStore)
const deleteId = ref('') // 要删除的id
const deleteModalRef = ref()
const authorityModalVisible = ref(false)
const editData = ref({}) // 编辑时所需回显数据
const isEdit = ref(false) // 是否是编辑
const filterNumber = computed(() => {
    return authStatuses.value.filter(i => i.isSelect).length
})
watch(() => authSearchValue.value, () => {
    if (accessConfig.value.perMgrAuth) {
        if (accessConfig.value.perMgrAuth.read == 0) {
            return
        }
    }
    useApiManageStore.initAuthorityList()
})
const getRoles = record => {
    if (record.roles && record.roles.length) {
        return record.roles.map(item => item.name).join('、')
    }
}
const removeHandle = record => {
    if (accessConfig.value.perMgrAuth) {
        if (accessConfig.value.perMgrAuth.use == 0) {
            return
        }
    }
    if (!record.showRemove) {
        return
    }
    deleteId.value = record.id
    deleteModalRef.value.modalVisible = true
}
const pageChange = () => {
    useApiManageStore.initAuthorityList()
}
const editHandle = record => {
    if (accessConfig.value.perMgrAuth) {
        if (accessConfig.value.perMgrAuth.use == 0) {
            return
        }
    }
    if (!record.showEdit) {
        return
    }
    editData.value = record
    showModal(true)
}

// 处理用户启动、禁止权限
const authHandle = record => {
    if (accessConfig.value.perMgrAuth) {
        if (accessConfig.value.perMgrAuth.use == 0) {
            return
        }
    }
    if (!record.showEnable) {
        return
    }
    setUserAuth({
        userEnableList: [{
            "enable": record.status == 1 ? 0 : 1,
            "id": record.id
        }] 
    }).then(res => {
        if (res.code == 1) {
            message.success(res.message)
            useApiManageStore.initAuthorityList()
        } else {
            message.error(res.message)
        }
    })
}
const confirmRemoveHandle = () => {
    deleteSystemUser(
        [deleteId.value]
    ).then(res => {
        if(res.code === 1) {
            message.success(res.message)
            if (authorityList.value.length === 1) {
                useApiManageStore.setAuthPageNumber(authPageNumber.value - 1 || 1)
            }
            useApiManageStore.initAuthorityList()
            deleteId.value = ''
        } else {
            message.error(res.message)
        }
    })
}

// 重置密码
const resetPwd = (record) => {
    if (accessConfig.value.perMgrAuth) {
        if (accessConfig.value.perMgrAuth.use == 0) {
            return
        }
    }
    if (!record.showReset) {
        return
    }
    resetPassword([record.id]).then(res => {
        if (res.code == 1) {
            message.success(res.message)
            useApiManageStore.initAuthorityList()
        } else {
            message.error(res.message)
        }
    })
}
const filterData = (record) => {
    record.isSelect = !record.isSelect
    if (!record.isSelect) {
        if (!authStatuses.value.filter(item => item.isSelect).length) {
            record.isSelect = true
            return
        }
    }
    useApiManageStore.initAuthorityList()   
}
const showModal = (flag) => {
    isEdit.value = flag
    authorityModalVisible.value = !authorityModalVisible.value
}
defineExpose({
    showModal
})
</script>

<style lang="less" scoped>
    .ant-spin-nested-loading{
        height: calc(100% - 72px);
        /deep/ .ant-spin-container{
            height: 100%;
        }
    }
    
    .tableWrapper {
        position: relative;
        overflow: auto;
        height: 100%;
        
        .search {
            width: 210px;
            height: 30px;
            position: relative;
            margin-bottom: 16px;
            input {
                width: 208px;
                height: 30px;
                padding-right: 33px;
            }
            .sear {
                width: 16px;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 13px;
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
        .tableBox{
            height: calc(100% - 46px);
            overflow-y: auto;
            .tableContainer {
                width: 100%;
                .status_text {
                    display: inline-block;
                    width: 80%;
                    color: #3d82f2;
                    img {
                        width: 10px;
                    }
                }
                tr:first-of-type>td{
                    font-weight: 600;
                }
                td {
                    height: 40px;
                    max-height: 56px;
                    width: calc(100% / 6);
                    border: 1px solid #e0ebff;
                    padding: 10px;
                    font-size: 13px;
                    color: #3E4959;
                    & > div {
                        max-width: 100%;
                        max-height: 56px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        &.operateWrap{
                            white-space: nowrap;
                        }
                        & > span {
                            color: #3d82f2;
                            cursor: pointer;
                            margin-right: 16px;
                        }
                    }
                }
                tr {
                    &:nth-of-type(odd) {
                        background-color: #f7faff;
                    }
                    &:first-of-type {
                        background-color: #ecf3ff;
                    }
                }
                .apiUrl {
                    color: #3d82f2;
                    cursor: pointer;
                }
                .ban {
                    cursor: not-allowed;
                    opacity: .4;
                }
            }
        }
    }
    .noData {
        text-align: center;
        top: 50%;
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        img {
            width: 180px;
            height: 130px;
        }
        p {
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.4);
        }
    }
    .page {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
    }
</style>