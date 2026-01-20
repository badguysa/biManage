import { mainStore } from '@/Stores/mainStore';
import { modalStore } from '@/Stores/modalStore';
import { configStore } from '@/Stores/configStore'

const useConfigStore = configStore()
const useMainStore = mainStore()
const useModalStore = modalStore()
const { leftMenuList, tabsList, activeTabKey } = storeToRefs(useMainStore)
const { globalSearchModalVisible } = storeToRefs(useModalStore)

// 二级目录的跳转
const innerJumpToMenu = async(menuItem, subMenuItem, treeItem, router) => {
    // 不是数据中心的路由，跳转到数据中心
    if (router.currentRoute.value.path.indexOf('datacenter') !== 1) {
        router.push('/datacenter')
    }
    // 更新高亮值
    useMainStore.updateActiveTabKey(subMenuItem.id)
    const tab = {
        id: subMenuItem.id,
        name: subMenuItem.name
    }
    useMainStore.selectLeftMenu({
        outItem: menuItem,
        innerItem: subMenuItem
    })
    // 新增 tabLists
    useMainStore.changeTabsList(tab, 'add')

    const tempData = tabsList.value.find(i => i.id === subMenuItem.id)
    // 设置当前tabList的选中
    if (tempData.type === 'pageConfig') {
        useMainStore.setPageId(tempData.type)
    } else {
        useMainStore.selectTabs(tab)
        useConfigStore.goBack(activeTabKey.value)
        useMainStore.setPageId('pageTable')
        useMainStore.setEditTableType(treeItem.tableType)
        useMainStore.setIndexTableActiveId(treeItem.id, activeTabKey.value)
        if (treeItem.tableSource && treeItem.tableType.value == 4) {
            useConfigStore.setTableSource(JSON.parse(treeItem.tableSource).config, 'equal', activeTabKey.value)
        }
        useMainStore.getIndexTable({
            id: treeItem.id
        })
        useMainStore.changeTablePages({
            id: treeItem.id,
            pageNum:  1,
            displaySize: 100
        }, 'treeClick')
    }
    if(leftMenuList.value.length === 0){
        await useMainStore.loadLeftMenuList()
    }
    const findIndex = leftMenuList.value.findIndex(item => item.id === menuItem.id)
    if (leftMenuList.value[findIndex].subList.length) {
        leftMenuList.value[findIndex].isExpanded = true
    }
    // 兼容全局搜索的跳转
    if(globalSearchModalVisible.value){
        useModalStore.changeGlobalSearchModalVisible()
    }
}

// 一级目录的跳转
const outJumpToMenu = async (menuItem, treeItem, router) => {
    if (router.currentRoute.value.path.indexOf('datacenter') !== 1) {
        router.push('/datacenter')
    }
    useMainStore.updateActiveTabKey(menuItem.id)
    const tab = {
        id: menuItem.id,
        name: menuItem.name
    }
    useMainStore.changeTabsList(tab, 'add')
    useMainStore.selectLeftMenu({
        outItem: menuItem
    })
    const tempData = tabsList.value.find(i => i.id === menuItem.id)
    if (tempData.type === 'pageConfig') {
        useMainStore.setPageId(tempData.type)
    } else {
        await useMainStore.selectTabs(tab)
        useConfigStore.goBack(activeTabKey.value)
        useMainStore.setPageId('pageTable')
        useMainStore.setEditTableType(treeItem.tableType)
        useMainStore.setIndexTableActiveId(treeItem.id, activeTabKey.value)
        if (treeItem.tableSource && treeItem.tableType.value == 4) {
            useConfigStore.setTableSource(JSON.parse(treeItem.tableSource).config, 'equal', activeTabKey.value)
        }
        useMainStore.getIndexTable({
            id: treeItem.id
        })
        useMainStore.changeTablePages({
            id: treeItem.id,
            pageNum:  1,
            displaySize: 100
        }, 'treeClick')
    }
    if(leftMenuList.value.length === 0){
        await useMainStore.loadLeftMenuList()
    }
    const findIndex = leftMenuList.value.findIndex(item => item.id === menuItem.id)
    if (leftMenuList.value[findIndex].subList.length) {
        leftMenuList.value[findIndex].isExpanded = true
    }
    // 兼容全局搜索的跳转
    if(globalSearchModalVisible.value){
        useModalStore.changeGlobalSearchModalVisible()
    }
}

export {
    innerJumpToMenu,
    outJumpToMenu
}