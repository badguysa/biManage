<template>
    <div class="tableWrapper">
        <table class="tableContainer">
            <tr>
                <td>{{ t('authManage.roleName') }}</td>
                <td>{{ t('common.desc') }}</td>
                <td>{{ t('authManage.mems') }}</td>
                <td>{{ t('common.operation') }}</td>
            </tr>
            <template v-if="roleList.length">
                <tr v-for="item in roleList" :key="item.id">
                    <td>
                        <a-tooltip placement="topLeft">
                            <template #title>
                                {{ item.name }}
                            </template>
                            <div>{{ item.name }}</div>
                        </a-tooltip>
                    </td>
                    <td>
                        <a-tooltip placement="topLeft">
                            <template #title>
                                {{ item.roleDesc }}
                            </template>
                            <div>{{ item.roleDesc }}</div>
                        </a-tooltip>
                    </td>
                    <td><div>{{ item.mems || 0 }}</div></td>
                    <td>
                        <div>
                            <span :class="[!item.showEdit ? 'ban' : '']" @click="editHandle(item)">{{ t('common.edit') }}</span>
                            <span :class="[!item.showRemove ? 'ban' : '']" @click="removeHandle(item)">{{ t('common.delete') }}</span>
                        </div>
                    </td>
                </tr>
            </template>
        </table>
    </div>
    <div class="noData" v-if="actvieType === 0 && !roleList.length">
        <img src="@/assets/images/img_null.png" alt="" />
        <p>{{ (accessConfig.perMgrAuth && accessConfig.perMgrAuth.read == 0) ? t('common.noAuth') : t('common.noData') }}</p>
    </div>
    <div class="page" v-if="roleDateTotal > 12">
        <a-pagination 
            v-model:current="rolePageNumber" 
            :total="roleDateTotal"
            :pageSize="12"
            show-less-items 
            @change="pageChange"
        />
    </div>
    <deleteModal ref="deleteModalRef" @confirmRemoveHandle="confirmRemoveHandle"></deleteModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia';
import { deleteSystemRole } from '@/apis/authorityManage';
import { apiManageStore } from '@/Stores/apiManageStore';
import { mainStore } from '@/Stores/mainStore';
import deleteModal from '../components/deleteModal.vue'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const emits = defineEmits(['goEdit'])
const useApiManageStore = apiManageStore()
const useMainStore = mainStore()
const { roleList, rolePageNumber, roleDateTotal } = storeToRefs(useApiManageStore)
const { accessConfig } = storeToRefs(useMainStore)
const deleteId = ref('') // 要删除的id
const actvieType = ref(0) // 当前显示的视图
const deleteModalRef = ref()

const removeHandle = record => {
    if (!record.showRemove) {
        return
    }
    if (accessConfig.value.perMgrAuth) {
        if (accessConfig.value.perMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    deleteId.value = record.id
    deleteModalRef.value.modalVisible = true
}

const editHandle = record => {
    if (!record.showEdit) {
        return
    }
    if (accessConfig.value.perMgrAuth) {
        if (accessConfig.value.perMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    emits('goEdit', {
        flag: 'edit',
        record
    })
}

const pageChange = (page, pageSize) => {
    useApiManageStore.initRoleList()
}

onMounted(() => {
})

const confirmRemoveHandle = () => {
    deleteSystemRole(
        [deleteId.value]
    ).then(res => {
        if(res.code === 1) {
            message.success(res.message)
            if (roleList.value.length === 1) {
                useApiManageStore.setRolePageNumber(rolePageNumber.value - 1 || 1)
            }
            useApiManageStore.initRoleList()
            deleteId.value = ''
        } else {
            message.error(res.message)
        }
    })
}
</script>

<style lang="less" scoped>
    .tableWrapper {
        position: relative;
        overflow: auto;
        .tableContainer {
            width: 100%;
            tr:first-of-type>td{
                font-weight: 600;
            }
            td {
                height: 40px;
                max-height: 56px;
                border: 1px solid #e0ebff;
                padding: 10px;
                color: #3E4959;
                font-size: 13px;
                & > div {
                    max-width: 100%;
                    max-height: 56px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    & > span {
                        color: #3d82f2;
                        cursor: pointer;
                        margin-right: 16px;
                    }
                    .ban {
                        cursor: not-allowed;
                        opacity: .4;
                    }
                }
            }
            td:nth-child(1) {
                width: 15%;
            }
            td:nth-child(2) {
                width: 35%;
            }
            td:nth-child(3) {
                width: 15%;
            }
            td:nth-child(4) {
                width: 35%;
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