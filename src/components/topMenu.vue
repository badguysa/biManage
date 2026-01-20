<template>
    <div class="topmenu" v-if="routerPath !== '/login'">
        <div>
            <div class="logo">
                <img class="img" :src="menuLogo" >
                <div class="title">{{ customTitle }}</div>
            </div>
        </div>
        <div class="menu-list">
            <div v-for="item in showTopMenuList" :key="item.path" @click="changeMenu(item)"
                :class="{ 'opacity1': activeMenu(item) }">
                <img :src="item.imgUrl" alt="" />
                {{ t(item.title) }}
            </div>
        </div>
        <div class="right-area">
            <div class="global-search" @click="showGlobalSearch">
                {{ t('common.search') }}
                <img src="@/assets/icons/global-search.png" alt="">
            </div>
            <div @click="goTaskCenter" class="task-center">
                <div v-if="taskCountObj.redDot > 0" class="circle"></div>
                <img src="@/assets/icons/task-img.png" alt="">{{ t('task.taskCenter') }}
            </div>
            <div class="logout">
                <div class="avator" @click.stop="openUser"> </div>
            </div>
        </div>
        <div v-show="isShowUserInfo" ref="userInfoRef" class="person_menu">
            <div class="user_info">
                <img src="@/assets/icons/avator_light.png" alt="">
                <div class="name" :title="userInfo?.name || ''">{{ userInfo?.name }}</div>
            </div>
            <div class="quit_app" @click="quitApp">
                <!-- <div class="quit_app" @click="quitApp"> -->
                <img src="@/assets/icons/logout.png" alt="">
                <div class="text">{{ t('common.logout') }}</div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { apiManageStore } from '@/Stores/apiManageStore'
import { modalStore } from '@/Stores/modalStore'
import { mainStore } from '@/Stores/mainStore'
import homeStore from '@/Stores/homeStore'
import { storeToRefs } from 'pinia'
import menuLogo from '@/assets/images/menuLogo.png'
import { useI18n } from 'vue-i18n'
import { cloneDeep } from 'lodash'
import { isCustomizedMenuFid } from '@/utils/utils';
import useToTaskCenter from '@/hooks/dataCenter/useToTaskCenter'
import { clearCookie } from '@/apis/common';
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'

const { t } = useI18n()
const useApiManageStore = apiManageStore()
const useApiConfigStore = apiConfigStore()
const useMainStore = mainStore()
const useModalStore = modalStore()
const useHomeStore = homeStore()
const { tabsList } = storeToRefs(useHomeStore)

const { apiTabList, activeMenuName, taskCountObj, _systemActiveMenuName, _dataServiceActiveMenuName } = storeToRefs(useApiManageStore)
const { routerPath, topMenuList, systemConfig, userInfo } = storeToRefs(useMainStore)
const { activeKey } = storeToRefs(useHomeStore)
const customizeSysTemRoute = ['/templateManage', '/authorityManage', '/langManage', '/taskCenter']
const showTopMenuList = computed(() => {
    if (isCustomizedMenuFid()) {
        return topMenuList.value
    } else {
        return topMenuList.value.filter(i => !i.isCusTom)
    }
})
const activeMenu = computed(() => {
    return (item) => {
        const isSystemPath = routerPath.value.includes('/system');
        const isCustomizedMenu = isCustomizedMenuFid();

        if (isCustomizedMenu && isSystemPath && item.path === '/system') {
            const isCustomItem = !!item.isCusTom;
            const isCustomizedSystemRoute = customizeSysTemRoute.some(i => routerPath.value.includes(i));

            return isCustomItem ? !isCustomizedSystemRoute : isCustomizedSystemRoute;
        } else {
            return routerPath.value.includes(item.path);
        }
    };
});
const router = useRouter()

watch(
    () => router.currentRoute.value,
    (newValue) => {
        if (newValue.path === '/system/taskCenter') {
            // 在这里轮询获取任务数量
            useApiManageStore.setTaskSetInterval()
            useApiManageStore.setTaskListInterval('current')
        } else {
            useApiManageStore.clearTaskListInterval()
            useApiManageStore.clearTaskSetInterval()
        }
        useMainStore.setRouterPath(newValue.path)
    },
    { immediate: true }
)
const isShowUserInfo = ref(false)
const userInfoRef = ref()
onMounted(() => {
    watchRouter()
    // useApiManageStore.initRedDot()
    document.addEventListener('click', globalClick)
})

// 后续做通配
const customTitle = computed(()=>{
    if(userInfo.value && userInfo.value.fid === '29596'){
        return '数字基座'
    }else{
        return '数据中台'
    }
})

const globalClick = (event) => {
    if (userInfoRef.value && isShowUserInfo.value && !userInfoRef.value.contains(event.target)) {
        isShowUserInfo.value = false
    }
}
const quitApp = async () => {
    const _systemConfig = cloneDeep(systemConfig.value)
    useMainStore.clearLoginInfo()
    await clearCookie()
    isShowUserInfo.value = false
    // 镜像单位 统一认证登录 跳到登录地址
    if (_systemConfig.mirror && _systemConfig.openUnifCertif) {
        window.location.href = _systemConfig.unifCertifSignOutAddr
    } else if(_systemConfig.useCloudDisk) {
        // 展示云盘菜单 退出登录跳到登录页 清除cookie
        window.open('https://passport2.chaoxing.com/logout.html?refer=https://i.chaoxing.com')
    }
    // router.push(`/login`)
    window.location.reload()
}
const openUser = () => {
    isShowUserInfo.value = !isShowUserInfo.value
}
onUnmounted(() => {
    document.removeEventListener('click', globalClick)
})
const showGlobalSearch = () => {
    useModalStore.changeGlobalSearchModalVisible()
}

const goTaskCenter = () => {
    useToTaskCenter()
}

const watchRouter = () => {
    const pathname = window.location.hash.split('#')[1];
    if (pathname === '/') {
        useMainStore.setRouterPath('/dataBoard');
        return;
    }
    useMainStore.setRouterPath(pathname);
    const staticPaths = isCustomizedMenuFid()
        ? ['/system/historyRecord', '/system/pushManage', '/system/apiManage', '/system/dataSourceManage']
        : [
            '/system/apiManage','/system/historyRecord', '/system/templateManage', '/system/authorityManage', 
            '/system/langManage', '/system/pushManage', '/system/taskCenter', 
            '/system/dataSourceManage', '/system/resourceMonitor', '/system/auditLogs', 
            '/system/operationLogs', '/system/dataStandard', '/system/standardCheckConfig'
        ];
    const isSystemPath = pathname.includes('/system');
    const isDataBoardPath = pathname.includes('/dataBoard');

    // 动态路由判断
    const dynamicPath = [
        pathname.includes('/system/pushTopic'),
        pathname.includes('/system/apiDetail'),
        pathname.includes('/system/pushRecord'),
    ].some(Boolean);
    if (isSystemPath) {
        if (staticPaths.includes(pathname) || dynamicPath) {
            router.push('/system/apiManage');
        } else {
            useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.TEMPLATE_MANAGE);
            useApiManageStore.addApiTab({
                name: 'templateManage.templateManage',
                id: SYSTEM_MENU_MAP.TEMPLATE_MANAGE,
                path: '/system/templateManage',
            });
            router.push('/system/templateManage');
        }
    } else if (isDataBoardPath) {
        const boardPaths = [
            '/dataBoard/dataOverview',
            '/dataBoard/apiMonitor',
            '/dataBoard/visual',
            '/dataBoard/cloudStorage',
            '/dataBoard/dataMarket'
        ];
        // 数据看板下页面刷线跳转到概览页
        if (boardPaths.includes(pathname)) {
            router.push('/dataBoard/dataOverview');
        }
    }
};
const changeMenu = (item) => {
    useMainStore.setRouterPath(item.path)

    if(!item.path.includes('system')) {
        useApiConfigStore.setPhyCodeFlag('normal')
    }

    if (item.path.includes('system')) {
        // 定制
        if (isCustomizedMenuFid()) {
            if (item.isCusTom) {
                useApiManageStore.setActiveMenuName(_dataServiceActiveMenuName.value)
                let targetItem = apiTabList.value.find((item) => item.id === _dataServiceActiveMenuName.value)
                router.push(targetItem.path)
                return
            } else {
                useApiManageStore.setActiveMenuName(_systemActiveMenuName.value)
                let targetItem = apiTabList.value.find((item) => item.id === _systemActiveMenuName.value)
                if (targetItem) {
                    router.push(targetItem.path)
                } else {
                    useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.TEMPLATE_MANAGE)
                    
                    useApiManageStore.addApiTab({
                        name: 'templateManage.templateManage',
                        id: SYSTEM_MENU_MAP.TEMPLATE_MANAGE,
                        path: '/system/templateManage',
                    })
                    router.push('/system/templateManage')
                }
                return
            }
        } else {
            let targetItem = apiTabList.value.find((item) => item.id === activeMenuName.value)
            router.push(targetItem.path)
            return
        }
    }

    if (item.path.includes('dataBoard')) {
        let targetItem = tabsList.value.find(item => item.id === activeKey.value)
        router.push(targetItem.path)
        return
    }
    router.push(item.path)
}
</script>

<style scoped lang="less">
.person_menu {
    position: fixed;
    top: 48px;
    right: 12px;
    z-index: 1;
    width: 140px;
    padding: 4px 0px;
    border-radius: 4px;
    border: 1px solid #F0F0F0;
    background: #FFF;
    /* shadow/popup */
    box-shadow: 0px 6px 24px 0px rgba(31, 35, 41, 0.10);

    .user_info {
        display: flex;
        padding: 8px 12px;
        align-items: center;
        gap: 8px;
        align-self: stretch;

        img {
            width: 20px;
            height: 20px;
        }

        .name {
            max-height: 86px;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            word-break: break-all;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            /* 显示两行文本 */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .quit_app {
        display: flex;
        padding: 8px 16px;
        align-items: center;
        gap: 8px;
        align-self: stretch;
        border-top: 1px solid #F0F0F0;
        cursor: pointer;

        &:hover {
            background: #F2F3F5;
        }

        &:active {
            background: #F2F3F5;
        }

        img {
            width: 14px;
            height: 14px;
        }

        .text {
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            color: #2B67FF;
        }
    }
}

.topmenu {
    width: 100%;
    height: 60px;
    background: url(../assets/images/topback.png);
    background-size: cover;
    display: flex;
    align-items: center;
    position: relative;

    .logo {
        width: 200px;
        height: 60px;
        display: flex;
        align-items: center;
        .img{
            margin-left: 20px;
            width: 40px;
            height: 40px;
        }
        .title{
            font-weight: 600;
            font-size: 20px;
            color: #FFFFFF;
            margin-left: 6px;
        }
    }

    .menu-list {
        display: flex;
        height: 60px;
        align-items: center;

        img {
            height: 20px;
            width: 20px;
            margin-right: 10px;
        }

        &>div {
            display: flex;
            height: 60px;
            width: 152px;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            color: #fff;
            cursor: pointer;
            opacity: 0.6;
        }

        &>div:hover {
            background: linear-gradient(180deg, rgba(24, 120, 255, 0.18) 0%, rgba(24, 120, 255, 0.075) 100%);
        }

        .opacity1 {
            opacity: 1 !important;
            background: linear-gradient(180deg, rgba(24, 120, 255, 0.42) 0%, rgba(24, 120, 255, 0.175) 100%) !important;
        }
    }

    .right-area {
        position: absolute;
        right: 0;
        height: 60px;
        display: flex;
        align-items: center;

        .global-search {
            position: relative;
            width: 160px;
            height: 30px;
            line-height: 30px;
            background-color: rgba(255, 255, 255, 0.20);
            border-radius: 4px;
            padding-left: 12px;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.70);
            margin-right: 20px;
            cursor: pointer;

            img {
                width: 16px;
                height: 16px;
                position: absolute;
                right: 9px;
                top: 50%;
                transform: translateY(-50%);
            }
        }

        .global-search:hover {
            background-color: rgba(255, 255, 255, 0.30);
        }

        .logout {
            width: 54px;
            display: flex;
            height: 100%;
            align-items: center;
            justify-content: center;
            padding-right: 10px;

            .avator {
                background-image: url(@/assets/icons/avator_normal.png);
                background-size: cover;
                width: 24px;
                height: 24px;
                cursor: pointer;

                &:hover {
                    background-image: url(@/assets/icons/avator_hover.png);
                }

                &:active {
                    background-image: url(@/assets/icons/avator_hover.png);
                }
            }
        }

        .task-center {
            width: max-content;
            font-weight: 500;
            font-size: 15px;
            line-height: 20px;
            color: rgba(255, 255, 255, 0.6);
            display: flex;
            height: 60px;
            align-items: center;
            position: relative;
            cursor: pointer;
            margin: 0 30px;

            img {
                width: 20px;
                margin-right: 8px;
            }

            .circle {
                position: absolute;
                right: -8px;
                top: 15px;
                width: 10px;
                height: 10px;
                text-align: center;
                border-radius: 10px;
                background: #F53F3F;
                line-height: 16px;
                font-size: 12px;
                color: #FFF;
                margin-left: 6px;
                white-space: nowrap;
            }
        }
    }
}
</style>
