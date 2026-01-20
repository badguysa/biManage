<template>
    <div class="tabContainer">
        <div
            v-for="tab in tabsList"
            :key="tab.id"
            :class="tab.id === activeKey ? 'tabItem tabItemActive' : 'tabItem'"
            @click="toggleTabItem(tab)"
        >
            <a-tooltip>
                <template #title>
                    {{ t(tab.name) }}
                    <!-- {{ needI18n(tab) ? t(tab.name) : tab.name }} -->
                </template>
                <span class="tabName">
                    {{ t(tab.name) }}
                    <!-- {{ needI18n(tab) ? t(tab.name) : tab.name }} -->
                </span>
            </a-tooltip>
            <img v-if="tabsList.length > 1" src="@/assets/icons/tabclose.png" alt="" @click.stop="closeTab(tab)" />
        </div>
    </div>
</template>

<script setup>
import homeStore from '@/Stores/homeStore.js'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
const { t } = useI18n()

const useHomeStore = homeStore()

const router = useRouter()

const { tabsList, activeKey } = storeToRefs(useHomeStore)


// 判断是否需要国际化，如果是系统管理的路由的话则进行国际化，如果只是api详情则不能国际化
const needI18n = (tab) => {
    const noNeed = [
    ]
    if (noNeed.includes(true)) return false
    return true
}

// 切换tab页
const toggleTabItem = (tab) => {
    useHomeStore.changeActiveKey(tab.id)
    router.push(tab.path)
}

// 删除tab页
const closeTab = (tab) => {
    if (tabsList.value.length > 1) {
        const tabIndex = tabsList.value.findIndex(i => i.id === tab.id)
        useHomeStore.changeTabsList(tab, 'delete')
        let lastTab = tabsList.value[tabIndex] ? tabsList.value[tabIndex] : tabsList.value[tabsList.value.length - 1]
        useHomeStore.changeActiveKey(lastTab.id)
        router.push(lastTab.path)
    }
}
</script>

<style lang="less" scoped>
.tabContainer {
    width: 100%;
    height: 36px;
    padding-right: 15px;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    .tabItem {
        width: 160px;
        height: 100%;
        background: #f5f7fc;
        box-shadow: 2px 0px 8px rgba(0, 0, 0, 0.06);
        border-radius: 8px 8px 0px 0px;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        .tabName {
            font-size: 14px;
            line-height: 20px;
            color: rgba(0, 0, 0, 0.8);
            max-width: 112px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        img {
            width: 12px;
            height: 12px;
        }
    }
    .tabItemActive {
        background-color: #fff;
    }
}
.tabContainer::-webkit-scrollbar {
    height: 5px;
    background-color: #fff;
}
</style>
