<template>
    <div v-if="authPageId === 'indexPage'" class="manageWrapper">
        <div class="topContainer">
            <div class="basic-tabs" @click="basicTabsChange">
                <div :class="[activeType === 0 ? 'tab-is-active' : '']" id="tab-a">用户管理</div>
                <div :class="[activeType === 1 ? 'tab-is-active' : '']" id="tab-b">角色权限</div>
                <div :class="[activeType === 2 ? 'tab-is-active' : '']" id="tab-c">单位管理</div>
            </div>
        </div>
        <div class="right-option">
                <myButton class="add-btn" @click="() => { showModal() }">
                <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                {{ t('selfConfig.add') }}
            </myButton>
            </div>
        <template v-if="activeType === 0">
            <userManage ref="userManageRef"></userManage>
        </template>
        <template v-if="activeType === 1">
            <roleManage @goEdit="showModal"></roleManage>
        </template>
        <template v-if="activeType === 2">
            <unitManage ref="unitManageRef"></unitManage>
        </template>
    </div>
    <template v-else-if="authPageId === 'rolePage'">
        <RoleInfoComponent @back="rolePageBack" :flag="roleEditFlag" :editData="roleEditData" />
    </template>
</template>

<script setup>
import { ref } from 'vue'
import myButton from '@/components/buttons/myButton.vue';
import roleManage from './roleManage.vue';
import userManage from './userManage.vue';
import unitManage from './unitManage.vue'
import RoleInfoComponent from './roleInfo.vue'
import { apiManageStore } from '@/Stores/apiManageStore';
import { mainStore } from '@/Stores/mainStore';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
const { t } = useI18n()
const activeType = ref(0) // 当前显示的视图
const authPageId = ref('indexPage') // indexPage 首页 rolePage 新建、编辑角色信息
const userManageRef = ref()
const useMainStore = mainStore()
const useApiManageStore = apiManageStore()
const roleEditFlag = ref('add')
const roleEditData = ref({}) // 角色管理编辑信息
const { accessConfig } = storeToRefs(useMainStore)

const unitManageRef = ref()

const showModal = (info = {}) => {
    if (accessConfig.value.perMgrAuth) {
        if (accessConfig.value.perMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
   if(activeType.value === 0) {
        userManageRef.value.showModal(false)
    } else if (activeType.value === 1) {
        roleEditFlag.value = info.flag || 'add'
        if (info.flag) {
            roleEditData.value = info.record
        } else {
            roleEditData.value = {}
        }
        authPageId.value = 'rolePage'
    } else if(activeType.value === 2) {
        unitManageRef.value.showAddModal()
    }
}
const basicTabsChange = async e => {
    const tabId = e.target.id
    if (tabId === 'tab-a') {
        activeType.value = 0
        useApiManageStore.initAuthorityList()
    } else if (tabId === 'tab-b') {
        activeType.value = 1
        useApiManageStore.initRoleList()
    } else if (tabId === 'tab-c') {
        activeType.value = 2
    }
}
const rolePageBack = () => {
    authPageId.value = 'indexPage'
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
        .title {
            font-weight: 600;
            font-size: 18px;
            line-height: 25px;
            color: rgba(0, 0, 0, 0.8);
            margin-bottom: 0;
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
    .right-option{
        position: absolute;
        right: 20px;
        top: 20px;
        z-index: 1;
    }
}
</style>