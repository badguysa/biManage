<template>
<div class="role-container">
    <div class="role-header">
        <div class="back">
            <div class="backbox" @click="goBack"><img src="@/assets/icons/return.png" alt="">{{ t('common.back') }}</div>
        </div>
    </div>
    <div class="role-block">
        <div class="role-info">
            <div class="h1-title mb-16">{{ t('authManage.roleMessage') }}</div>
            <a-form ref="roleInfoRef" :model="roleInfoState" v-bind="layout">
                <a-form-item 
                    name="roleName" 
                    :label="t('authManage.roleMessage')"
                    :colon="false"
                    :rules="[{ required: true, message: t('common.pleaseEnter') }]"
                >
                    <input class="role-input" v-model="roleInfoState.roleName" type="text" :placeholder="t('common.pleaseEnter')">
                </a-form-item>
                <a-form-item 
                    name="roleDesc" 
                    :label="t('authManage.roleDesc')" 
                    :colon="false"
                    :rules="[{ required: true, message: t('common.pleaseEnter') }]"
                >
                    <textarea class="desc-input" v-model="roleInfoState.roleDesc" type="text" :placeholder="t('common.pleaseEnter')"></textarea>
                </a-form-item>
                <a-form-item 
                    name="referenceRole" 
                    :colon="false"
                >
                    <template #label>
                        {{ t('authManage.referenceRole') }} 
                        <a-tooltip>
                            <template #title>
                                {{ t('authManage.tip3') }}
                            </template>
                            <img style="margin-left: 4px; width: 12px; cursor: pointer;" src="@/assets/icons/tips-small-icon.png" alt="warn">
                        </a-tooltip>
                    </template>
                    <customSelect 
                        :placeholder="t('common.pleaseSelect')" 
                        :width="300"
                        :selectList="selectList"
                        :disabled="isSpuerManager"
                        v-model.value="roleInfoState.referenceRole"
                        @scroll="onScroll"
                        @search="onSearch"
                        @select="onSelect"
                        @clear="onClear"
                    ></customSelect>
                </a-form-item>
            </a-form>
        </div>
        <div class="role-auth">
            <div class="h1-title mb-30">{{ t('authManage.roleAuth') }}</div>
            <div class="use-auth">
                <div class="mb-16">
                    <span class="h2-title">{{ t('authManage.operationAuth') }}</span>
                    <span class="sub-title">{{ t('authManage.tip1') }}</span>
                </div>
                <table class="table-container">
                    <tr>
                        <td>{{ t('authManage.funcMenu') }}</td>
                        <td>{{ t('common.check') }}</td>
                        <td>{{ t('authManage.use') }}</td>
                    </tr>
                    <template v-for="item in useAuthConfig" :key="item.id">                        
                        <tr>
                            <td width="66%">
                                <section class="flex-box">
                                    <template v-if="item.children">
                                        <img @click="item.isExpand = !item.isExpand" v-show="!item.isExpand" class="arrow" :src="openImg" />
                                        <img @click="item.isExpand = !item.isExpand" v-show="item.isExpand" class="arrow" :src="downImg" />
                                    </template>
                                    <div class="name">
                                        {{ item.title }}
                                    </div>
                                </section>
                            </td>
                            <td width="17%">
                                <a-switch
                                    :checkedValue="1"
                                    :unCheckedValue="0"
                                    :disabled="isSpuerManager && flag === 'edit'"
                                    v-model:checked="item.read"
                                    @click="changeUseAtuh(item, 1)"
                                />
                            </td>
                            <td width="17%">
                                <a-switch
                                    :checkedValue="1"
                                    :unCheckedValue="0"
                                    :disabled="isSpuerManager && flag === 'edit'"
                                    v-model:checked="item.use"
                                    @click="changeUseAtuh(item, 2)"
                                />
                            </td>
                        </tr>
                        <template v-if="item.children && item.isExpand">
                            <tr v-for="child in item.children" :key="child.id">
                                <td>
                                    <div :title="child.title" class="child-node">{{ child.title }}</div>
                                </td>
                                <td>
                                    <a-switch 
                                        :checkedValue="1"
                                        :unCheckedValue="0"
                                        :disabled="isSpuerManager && flag === 'edit'"
                                        v-model:checked="child.read" 
                                        @click="changeUseAtuh(child, 3)"
                                    />
                                </td>
                                <td>
                                    <a-switch 
                                        :checkedValue="1"
                                        :unCheckedValue="0"
                                        :disabled="isSpuerManager && flag === 'edit'"
                                        v-model:checked="child.use" 
                                        @click="changeUseAtuh(child, 4)"
                                    />
                                </td>
                            </tr>
                        </template>
                    </template>
                </table>
            </div>
            <div class="data-auth">
                <div class="mb-16 mt-30">
                    <span class="h2-title">{{ t('authManage.dataAuth') }}</span>
                    <span class="sub-title">{{ t('authManage.tip2') }}</span>
                </div>
                <table class="table-container">
                    <tr>
                        <td>{{ t('authManage.dataMenu') }}</td>
                        <td>{{ t('common.check') }}</td>
                        <td>{{ t('common.download') }}</td>
                        <td>{{ t('authManage.use') }}</td>
                    </tr>
                    <template v-for="item in groupList" :key="item.id">                        
                        <tr>
                            <td width="52%">
                                <section class="flex-box">
                                    <template v-if="item.children">
                                        <img @click="item.isExpand = !item.isExpand" v-show="!item.isExpand" class="arrow" :src="openImg" />
                                        <img @click="item.isExpand = !item.isExpand" v-show="item.isExpand" class="arrow" :src="downImg" />
                                    </template>
                                    <div class="father-node">
                                        <div :title="item.title">
                                            {{ item.title }}
                                        </div>
                                    </div>
                                </section>
                            </td>
                            <td width="16%">
                                <a-switch 
                                    :checkedValue="1"
                                    :unCheckedValue="0"
                                    :disabled="isSpuerManager && flag === 'edit'"
                                    v-model:checked="item.read" 
                                    @click="changeDataAtuh(item, 1)"
                                />
                            </td>
                            <td width="16%">
                                <a-switch 
                                    :checkedValue="1"
                                    :unCheckedValue="0"
                                    :disabled="isSpuerManager && flag === 'edit'"
                                    v-model:checked="item.download" 
                                    @click="changeDataAtuh(item, 2)"
                                />
                            </td>
                            <td width="16%">
                                <a-switch 
                                    :checkedValue="1"
                                    :unCheckedValue="0"
                                    :disabled="isSpuerManager && flag === 'edit'"
                                    v-model:checked="item.use" 
                                    @click="changeDataAtuh(item, 3)"
                                />
                            </td>
                        </tr>
                        <template v-if="item.children && item.isExpand">
                            <tr v-for="child in item.children" :key="child.id">
                                <td>
                                    <div :title="child.title" class="child-node">{{ child.title }}</div>
                                </td>
                                <td>
                                    <a-switch 
                                        :checkedValue="1"
                                        :unCheckedValue="0"
                                        :disabled="isSpuerManager && flag === 'edit'"
                                        v-model:checked="child.read" 
                                        @click="changeDataAtuh(child, 4)"
                                    />
                                </td>
                                <td>
                                    <a-switch 
                                        :checkedValue="1"
                                        :unCheckedValue="0"
                                        :disabled="isSpuerManager && flag === 'edit'"
                                        v-model:checked="child.download" 
                                        @click="changeDataAtuh(child, 5)"
                                    />
                                </td>
                                <td>
                                    <a-switch 
                                        :checkedValue="1"
                                        :unCheckedValue="0"
                                        :disabled="isSpuerManager && flag === 'edit'"
                                        v-model:checked="child.use" 
                                        @click="changeDataAtuh(child, 6)"
                                    />
                                </td>
                            </tr>
                        </template>
                    </template>
                </table>
            </div>
        </div>
    </div>
    <div class="footer">
        <myButton @click="save" type="primary">{{ t('common.confirm') }}</myButton>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getRoleList, getDataAccess, getFuncAccess, addSystemRole, editSystemRole } from '@/apis/authorityManage';
import myButton from '@/components/buttons/myButton.vue';
import { apiManageStore } from '@/Stores/apiManageStore';
import customSelect from '@/components/customSelect';
import openImg from '@/assets/icons/openright.png'
import downImg from '@/assets/icons/downone.png'
import { message } from 'ant-design-vue';
const { t } = useI18n()
const useApiManageStore = apiManageStore()
const emits = defineEmits(['back'])
const props = defineProps({
    flag: {
        default: 'add'
    },
    editData: {
        default: {}
    }
})
const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 10 } 
}
const selectList = ref([]) // 参考角色列表
const pageNum = ref(1) // 参考角色分页
const roleInfoRef = ref() // 角色信息form
const roleTotal = ref(0) // 角色列表总数
const isSpuerManager = ref(false) // 是否超管
const searchValue = ref('')
const roleInfoState = ref({
    roleName: '',
    roleDesc: '',
    referenceRole: []
}) // 角色信息状态
const useAuthConfig = ref([]) // 功能权限配置项
const groupList = ref([]) // 分组列表
onMounted(() => {
    initRoleList()
    if (props.flag === 'edit') {
        initEdit()
    } else {
        getAuthList(-1)
    }
})

// 获取功能权限、数据权限列表
const getAuthList = (id) => {
    const promises = [getFuncAccess(id), getDataAccess(id)]
    Promise.all(promises).then(res => {
        if (res[0].code == 1) {
            res[0].data.roleAccessList.forEach(item => {
                const authConfig = JSON.parse(item.authority) || {}
                isSpuerManager.value = res[0].data.spManager
                item.title = item.resourceName
                item.key = item.resourceId
                item.read = id === -1 ? 0 : (isSpuerManager.value ? 1 : (authConfig.read || 0))
                item.use = id === -1 ? 0 : (isSpuerManager.value ? 1 : (authConfig.use || 0))
                if (item.subList.length) {
                    item.isExpand = 1
                    item.subList.forEach(citem => {
                        const childConfig = JSON.parse(citem.authority) || {}
                        citem.title = citem.resourceName
                        citem.key = citem.resourceId
                        citem.read = id === -1 ? 0 : (isSpuerManager.value ? 1 : (childConfig.read || 0))
                        citem.use = id === -1 ? 0 : (isSpuerManager.value ? 1 : (childConfig.use || 0))
                    })
                    item.children = item.subList
                }
            })
            useAuthConfig.value = res[0].data.roleAccessList
        } else {
            message.error(res[0].message)
        }
        if (res[1].code == 1) {
            res[1].data.roleAccessList.forEach(item => {
                const authConfig = JSON.parse(item.authority) || {}
                item.title = item.resourceName
                item.key = item.resourceId
                item.read = id === -1 ? 0 : (isSpuerManager.value ? 1 : (authConfig.read || 0))
                item.use = id === -1 ? 0 : (isSpuerManager.value ? 1 : (authConfig.use || 0))
                item.download = id === -1 ? 0 : (isSpuerManager.value ? 1 : (authConfig.download || 0))
                if (item.subList.length) {
                    item.isExpand = 1
                    item.subList.forEach(citem => {
                        const childConfig = JSON.parse(citem.authority) || {}
                        citem.title = citem.resourceName
                        citem.key = citem.resourceId
                        citem.read = id === -1 ? 0 : (isSpuerManager.value ? 1 : (childConfig.read || 0))
                        citem.use = id === -1 ? 0 : (isSpuerManager.value ? 1 : (childConfig.use || 0))
                        citem.download = id === -1 ? 0 : (isSpuerManager.value ? 1 : (childConfig.download || 0))
                    })
                    item.children = item.subList
                }
            })
            groupList.value = res[1].data.roleAccessList
        }
    })
}

const initEdit = () => {
    getAuthList(props.editData.id)
    roleInfoState.value.roleName = props.editData.name
    roleInfoState.value.roleDesc = props.editData.roleDesc
}

// 参考角色
const initRoleList = (type) => {
    const jsonData = {
        pageNum: pageNum.value,
        pageSize: 12,
        search: searchValue.value
    }
    getRoleList(jsonData).then(res => {
        if (res.code == 1) {
            res.data.records.forEach(item => {
                item.label = item.name
                item.value = item.id
            })
            roleTotal.value = Number(res.data.total)
            if (type === 'scroll') {
                selectList.value = [...selectList.value, ...res.data.records]
            } else {
                selectList.value = res.data.records || []
            }
        }
    })
}

const onSearch = (value) => {
    searchValue.value = value
    pageNum.value = 1
    initRoleList()
}

const onSelect = (record) => {
    getAuthList(record.id)
}

const onClear = () => {
    getAuthList(-1)
}

/**
 * 更改功能权限项
 * 父级查看关闭 则该分组及子级下所有权限关闭
 * 父级查看开启 则该分组及子级下的查看权限开启，不涉及使用权限
 * 父级使用关闭 则该分组及子级的使用权限关闭，不涉及查看权限
 * 父级使用开启 则该分组及子级下所有权限开启
 * 子级使用开启 子级查看对应开启
 * 子级查看关闭 子级使用对应关闭
 * @param {object} record 
 * @param {number} type 1: 父级查看开关 2: 父级使用开关 3: 子级查看开关 4: 子级使用开关
 */
const changeUseAtuh = (record, type) => {
    if (type === 1) {
        if (!record.read) { // 父级查看关闭
            record.use = 0
            if (record.children) {
                record.children.forEach(item => {
                    item.read = 0
                    item.use = 0
                })
            }
        } else { // 父级查看开启
            if (record.children) {
                record.children.forEach(item => {
                    item.read = 1
                })
            }
        }
    } else if (type === 2) {
        if (record.use) { // 父级使用开启
            record.read = 1
            if (record.children) {
                record.children.forEach(item => {
                    item.read = 1
                    item.use = 1
                })
            }  
        } else { // 父级使用关闭
            if (record.children) {
                record.children.forEach(item => {
                    item.use = 0
                })
            }
        }
    } else if (type === 3) {
        if (!record.read) { // 子级查看关闭
            record.use = 0
        }
    } else if (type === 4) { // 子级使用开启
        if (record.use) {
            record.read = 1
        }
    }
}

const changeDataAtuh = (record, type) => {
    switch (type) {
        case 1:
            if (record.read) { // 父级开启查看
                if (record.children) {
                    record.children.forEach(item => {
                        item.read = 1
                    })
                }
            } else { // 父级关闭查看
                record.use = 0
                record.download = 0
                if (record.children) {
                    record.children.forEach(item => {
                        item.read = 0
                        item.use = 0
                        item.download = 0
                    })
                }
            }
            break
        case 2:
            if (record.download) { // 父级开启下载
                record.read = 1
                if (record.children) {
                    record.children.forEach(item => {
                        item.read = 1
                        item.download = 1
                    })
                }
            } else { // 父级关闭下载
                if (record.children) {
                    record.children.forEach(item => {
                        item.download = 0
                    })
                }
            }
            break
        case 3:
            if (record.use) { // 父级开启使用
                record.read = 1
                record.download = 1
                if (record.children) {
                    record.children.forEach(item => {
                        item.read = 1
                        item.download = 1
                        item.use = 1
                    })
                }
            } else { // 父级关闭使用
                if (record.children) {
                    record.children.forEach(item => {
                        item.use = 0
                    })
                }
            }
            break
        case 4:
            if(!record.read) { // 子级关闭查看
                record.download = 0
                record.use = 0
            }
            break
        case 5:
            if (record.download) { // 子级开启下载
                record.read = 1
            }
            break
        case 6:
            if (record.use) { // 子级开启使用
                record.read = 1
                record.download = 1
            }
            break
    }
}

const goBack = () => {
    emits('back')
}

const onScroll = () => {
    if (selectList.value.length == roleTotal.value) {
        return
    }
    pageNum.value++
    initRoleList('scroll')
}

const save = () => {
    let jsonData = {
        funcAccessList: useAuthConfig.value.map(item => {
            return {
                authority: JSON.stringify({
                    use: item.use,
                    read: item.read
                }),
                resourceId: item.resourceId,
                subList: (item.children && item.children.length) ? item.children.map(citem => {
                    return {
                        authority: JSON.stringify({
                            use: citem.use,
                            read: citem.read
                        }),
                        resourceId: citem.resourceId,
                    }
                }) : []
            }
        }),
        dataAccessList: groupList.value.map(item => {
            return {
                authority: JSON.stringify({
                    use: item.use,
                    read: item.read,
                    download: item.download
                }),
                resourceId: item.resourceId,
                subList: (item.children && item.children.length) ? item.children.map(citem => {
                    return {
                        authority: JSON.stringify({
                            use: citem.use,
                            read: citem.read,
                            download: citem.download
                        }),
                        resourceId: citem.resourceId,
                    }
                }) : []
            }
        }),
        name: roleInfoState.value.roleName,
        roleDesc: roleInfoState.value.roleDesc
    }
    if (props.flag === 'edit') {
        jsonData.roleId = props.editData.id
        jsonData.dataResourceList = jsonData.dataAccessList
        jsonData.funcResourceList = jsonData.funcAccessList
        editSystemRole(jsonData).then(res => {
            if (res.code == 1) {
                message.success(res.message)
                useApiManageStore.initRoleList()
                goBack()
            } else {
                message.error(res.message)
            } 
        })
    } else {
        addSystemRole(jsonData).then(res => {
            if (res.code == 1) {
                message.success(res.message)
                useApiManageStore.initRoleList()
                goBack()
            } else {
                message.error(res.message)
            }
        })
    }
}
</script>

<style lang="less" scoped>
.role-container {
    width: 100%;
    height: calc(100% - 101px);
    background-color: #fff;
    overflow: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    .h1-title {
        font-weight: 600;
        font-size: 18px;
        line-height: 25px;
        color: rgba(0, 0, 0, 0.8);
    }
    .h2-title {
        font-weight: 600;
        font-size: 16px;
        line-height: 22px;
        color: rgba(0, 0, 0, 0.8);
    }
    .sub-title {
        font-weight: 400;
        font-size: 12px;
        line-height: 17px;
        color: rgba(0, 0, 0, 0.4);
        margin-left: 12px;
    }
    .arrow {
        width: 15px;
        height: 15px;
        cursor: pointer;
        margin-right: 10px;
    }
    .table-container {
        width: 600px;
        td {
            height: 40px;
            max-height: 56px;
            border: 1px solid #e0ebff;
            padding: 10px;
            color: rgba(0, 0, 0, 0.8);
            font-size: 13px;
            .flex-box {
                display: flex;
                align-items: center;
            }
            .father-node {
                display: flex;
                align-items: center;
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
                }
            }
            .child-node {
                padding-left: 55px;
            }
            
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
    }
    .mb-16 {
        margin-bottom: 16px;
    }
    .mt-16 {
        margin-top: 16px;
    }
    .mt-30 {
        margin-top: 30px;
    }
    .mb-30 {
        margin-bottom: 30px;
    }
    :deep(.ant-switch) {
        min-width: 28px;
        height: 16px;
        width: 28px;
        .ant-switch-handle {
            width: 12px;
            height: 12px;
        }
    }
    :deep(.ant-switch-checked) {
        .ant-switch-handle {
            left: calc(100% - 12px - 2px);
        }
    }
    .role-header {
        width: 100%;
        background-color: #fff;
        margin-bottom: 12px;
        position: sticky;
        top: 0;
        z-index: 5;
        .back {
            height: 36px;
            padding: 8px 16px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);
            .backbox {
                width: fit-content;
                height: 20px;
                display: flex;
                align-items: center;
                font-weight: 400;
                font-size: 14px;
                color: #3D82F2;
                cursor: pointer;
                span {
                    display: flex;
                    align-items: center;
                }
                img {
                    width: 16px;
                    margin-right: 4px;
                }
            }
        }
    }
    .role-block {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 5px 30px 30px;
        .role-info {
            :deep(.ant-form-item-label) {
                text-align: left;
            }
            .role-input {
                width: 300px;
                height: 32px;
            }
            .desc-input {
                padding: 7px 8px 7px 12px;
                width: 300px;
                height: 120px;
            }
        }
    }
    .footer {
        position: fixed;
        width: calc(100% - 224px);
        bottom: 12px;
        padding: 16px 10px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        background: #FFF;
        border-top: 1px solid #E9E9E9;
    }
}
</style>