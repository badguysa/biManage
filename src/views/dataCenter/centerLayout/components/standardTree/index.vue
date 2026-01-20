<template>
    <div class="treeContainer">
        <div class="search">
            <input type="text" v-model="state.searchText" :placeholder="t('common.search')">
            <img class="sear" src="@/assets/icons/search.png" alt="">
        </div>
        <ul class="searchUl" ref="treeUlRef" @scroll="treeUlScroll" v-show="state.tableList.length && state.searchText">
            <li 
                v-for="item in state.tableList"
                :class="[item.id == dataCenterImportStandardKey ? 'searchLi active' : 'searchLi']"
                :key="item.id"
                @click="onTableSelect(item)"
            >
                {{ item.name }}
            </li>
            <div class="loading-text" v-if="state.searchTotal === state.tableList.length && state.tableList.length > 30">{{ t('common.reachBottom') }}</div>
            <div class="loading-text" v-if="scrollLoading"><a-spin :indicator="indicator" />{{ t('common.scrollLoading') }}</div>
        </ul>
        <div class="tableUl" ref="treeRef" v-show="!state.tableList.length && !state.searchText" @scroll="treeScroll">
            <template v-if="state.treeData.length">
                <a-tree
                    :show-line="true"
                    :tree-data="state.treeData"
                    v-model:expandedKeys="state.expandedKeys"
                    :selectedKeys="state.selectedKeys"
                    :load-data="onLoadData"
                    @select="onSelect" 
                    @expand="onExpand"
                    @load="loadHandle"
                >
                    <template #title="{ name, key, dataRef  }">
                        <span v-if="dataRef.xpath == '-1'" :title="name" class="outTreeTitle" @click="clickTitleFn($event, dataRef)"> {{ name }}</span>
                        <span v-else-if="dataRef.xpath && dataRef.xpath != '-1'" :title="name" class="child" @click="clickTitleFn($event, dataRef)">{{ name }}</span>
                        <span v-else-if="dataRef.tip" type="bottom" class="tree-bottom">{{ name }}</span>
                        <span v-else-if="dataRef.loadMore" style="color: rgba(0,0,0,.8);" ><SyncOutlined /></span>
                        <div  v-else :title="name" :groupid="dataRef.groupId" :id="dataRef.id">
                            <span class='text-long'>{{ name }}</span>
                        </div>
                    </template>
                </a-tree>
                <div style="height: 50px;"></div>
            </template>
            <div v-else class="empty">
                <Empty :isSlot="true">
                    <div class="text">
                        {{ t('common.noContent') }},<span class="emptyBtn" @click="toCreate">去创建</span>
                    </div>
                </Empty>
            </div>
        </div>
    </div>
</template>

<script setup>
import Empty from '@/components/empty'
import { computed, reactive, watch, toRefs, ref, toRaw, onMounted, toRef, h, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { getStandardTableList } from '@/apis/dataStandard/index.js'
import { useI18n } from 'vue-i18n'
import { SyncOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { v4 as uuidv4 } from 'uuid'
import { message } from 'ant-design-vue';
import { nodeClickHandleStandard } from '@/utils/treeUtil'
import { apiManageStore } from '@/Stores/apiManageStore';
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'

const useApiManageStore = apiManageStore()
const emits = defineEmits(['emitSelect'])
const { t } = useI18n()
const useDataStandardStore = dataStandardStore()
const { leftDataList, dataCenterImportStandardKey, dataCenterImportStandardStatus, groupObject, dataCenterImportStandardDetail } = storeToRefs(useDataStandardStore)
const state = reactive({
    searchText: '',
    tableList: [],  // 用于搜索情况下
    searchPageNum: 1, // 搜索的分页
    searchTotal: 0, // 判断搜索状态下的触底
    selectedKeys: [],
    expandedKeys: [],
    treeData: [],
})
const router = useRouter()
const treeRef = ref()
const treeUlRef = ref()
const treeLoading = ref(false)
const scrollLoading = ref(false)
const tableGroupId = ref()
const rootNodeIndex = ref(-1)
const childNodeIndex = ref(-1)
const groundsonNodeIndex = ref(-1)

const indicator = h(LoadingOutlined, {
    style: {
    fontSize: '14px',
    },
    spin: true,
});

onMounted(async () => {
    await loadTreeData()
    await initData()
})

watch(() => state.searchText, val => {
    if (val.trim()) {
        state.searchTotal = 0
        state.searchPageNum = 1
        treeUlRef.value.scrollTop = 0
        onSearch('watch')
    } else {
        state.tableList = []
        treeUlRef.value.scrollTop = 0
    }
})

const toCreate =async () => {
    useApiManageStore.setApiPageId('dataStandardManagePage')
    useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.STANDARD_MANAGE)
    useApiManageStore.addApiTab({
        name: 'dataStandard.standardManage',
        id: SYSTEM_MENU_MAP.STANDARD_MANAGE,
        path: '/system/dataStandard',
    })
    await useDataStandardStore.getLeftDataListFn()
    router.push({
        path: '/system/dataStandard'
    })
}

const loadTreeData = async ()=>{
    await useDataStandardStore.getLeftDataListFn()
    state.treeData = leftDataList.value.map((item)=>{
        item.isLeaf = false
        item.key = item.id
        if (item.subList.length) {
            item.subList.forEach(citem => {
                citem.key = citem.id
                citem.isLeaf =  false
                citem.pageNum = 1
                if(citem.subList.length){
                    citem.subList.forEach(ccitem => {
                        ccitem.key = ccitem.id
                        ccitem.isLeaf = false
                        ccitem.pageNum = 1
                    })
                    citem.children = citem.subList
                }
            })
            item.children = item.subList
        }
        return item
    })
}

const initData = async()=>{
    if(dataCenterImportStandardStatus.value){
        state.selectedKeys = [dataCenterImportStandardKey.value]
        expandGroup(dataCenterImportStandardDetail.value.libId, dataCenterImportStandardKey.value)
        emits('emitSelect')
    }
}

const onLoadData = ({ key, children }, from = 1, pageNum, record) => {
    return new Promise((resolve) => {
        if (!key) {
            resolve()
            return
        }
        if (from === 2) {
            if(!record.pageNum) {
                record.pageNum = 1
            }
            if (record.pageNum == -1) {
                resolve()
                return
            }
            treeLoading.value = true
            record.pageNum++
        }
        const params = {
            libId: key,
            pageSize: 30,
            pageNum: from === 2 ? record.pageNum : 1,
        }
        let nodes = []
        getStandardTableList(params).then(res => {
            if (res.code == 1) {
                if (res.data.records.length) {
                    nodes = res.data.records.map(item => {
                        item.key = item.id
                        item.isLeaf = true
                        item.total = Number(res.data.total)
                        return item
                    })
                    const expandItem = state.treeData.find(i => i.id === key)
                    if (expandItem && expandItem.children && expandItem.children.length) {
                        const newArr = [...toRaw(expandItem.children), ...nodes].reduce((pre, cur) => {
                            const preId = pre.map(i => i.id)
                            if (preId.includes(cur.id)) {
                                return pre
                            } else {
                                return pre.concat(cur)
                            }
                        }, [])
                        nodes = newArr
                    }
                    state.treeData = updateTreeData(state.treeData, key, nodes)
                    treeLoading.value = false
                    resolve()
                } 
                else {
                    if (from === 2) {
                        record.pageNum = -1
                    }
                    treeLoading.value = false
                    resolve()
                }
            }
        })
    })
}

// 点击节点名称 展开节点
const clickTitleFn = async(e, dataRef) => {
    nodeClickHandleStandard({
        state, dataRef, e
    }, onLoadData, false)
}

// 节点数据加载完毕后执行
const loadHandle = async (newLoadedKeys) => {
    let firstRenderNode = newLoadedKeys.length === 1 && newLoadedKeys[0] === tableGroupId.value
    let targetTableId = dataCenterImportStandardKey.value
    if(!firstRenderNode || rootNodeIndex.value === -1) return
    let nodeInfo = null, includeSource = false
    // 循环判断来源表是否包含在当前分组内
    while(1) {
        if(childNodeIndex.value === -1) {   // 来源表位于一级分组
            nodeInfo = state.treeData[rootNodeIndex.value]
        } else if(childNodeIndex.value !== -1 && groundsonNodeIndex.value === -1) {    // 来源表位于二级分组
            nodeInfo = state.treeData[rootNodeIndex.value].children[childNodeIndex.value]
        }else if(childNodeIndex.value !== -1 && groundsonNodeIndex.value !== -1) {    // 来源表位于三级分组
            nodeInfo = state.treeData[rootNodeIndex.value].children[childNodeIndex.value].children[groundsonNodeIndex.value]
        }
        includeSource = nodeInfo.children.some(it => it.id === targetTableId)
        if(includeSource) {
            break
        }
        await onLoadData({key: nodeInfo.id}, 2, nodeInfo.pageNum, nodeInfo)
    }
}

const onSearch = (from) => {
    if (!state.searchText.trim()) return
    const jsonData = {
        sw: state.searchText,
        pageSize: 30,
        pageNum: state.searchPageNum
    }
    newGetTableList(jsonData, from)
}

const newGetTableList = (jsonData, from) => {
    if (state.searchTotal && (state.searchTotal === state.tableList.length)) {
        return
    }
    if (from === 'scroll') {
        scrollLoading.value = true
    }
    getStandardTableList(jsonData).then(res => {
        if (res.code == 1) {
            state.searchTotal = Number(res.data.total)
            if (from === 'scroll') {
                const tempData = [...state.tableList, ...res.data.records].reduce((pre, cur) => {
                    const preId = pre.map(i => i.id)
                    if (preId.includes(cur.id)) {
                        return pre
                    } else {
                        return pre.concat(cur)
                    }
                }, [])
                state.tableList = tempData
            } else if (from === 'watch') {
                if (state.searchText) {
                    state.tableList = res.data.records
                } else {
                    state.tableList = []
                }
            } else {
                state.tableList = res.data.records
            }
            if (state.searchTotal && (state.searchTotal === state.tableList.length)) {
                state.searchTotal = state.tableList.length
            }
        } else {
            message.error(res.message)
        }
        scrollLoading.value = false
    })
}

const updateTreeData = (list, key, children) => {
    return list.map((node) => {
        if (node.key === key && node.xpath != '-1' && node.xpath.indexOf('-1') > -1) {
            let nodeChildren = node.children ? node.children : []
            nodeChildren = nodeChildren.filter(i => !i.loadMore)
            let tempChildren = [...nodeChildren, ...children]
            // tempChildren中有分组也有标准表，只对标准表做分页判断
            let leaf = tempChildren.filter(i => i.isLeaf)
            if (!(leaf.length && leaf.length === leaf[0].total)) {
                let id = uuidv4()
                tempChildren.push({
                    groupId: node.key || node.id,
                    id: id,
                    isLeaf: true,
                    key: id,
                    title: t('common.load'),
                    loadMore: true
                })
            }
            return { ...node, children: tempChildren }
        }
        if (node.key === key && node.xpath === '-1') {
            children = children.filter(i => !i.loadMore)
            const tempChildren = children.filter(i => !i.pid)
            if (!(tempChildren.length && tempChildren.length === tempChildren[0].total)) {
                let id = uuidv4()
                children.push({
                    groupId: node.key || node.id,
                    id: id,
                    isLeaf: true,
                    key: id,
                    title: t('common.load'),
                    loadMore: true
                })
            }
            return { ...node, children}
        }
        if (node.children) {
            return { ...node, children: updateTreeData(node.children, key, children) }
        }
        return node
    })
}

const onSelect = async (record, selectedNodes) => {
    
    state.selectedKeys = record
    // 加载更多逻辑
    if (selectedNodes.node.dataRef.loadMore) {
        const outIndex = state.treeData.findIndex(item => item.id === selectedNodes.node.dataRef.groupId)
        if (outIndex > -1) {
            onLoadData({key: state.treeData[outIndex].id}, 2, state.treeData[outIndex].pageNum, state.treeData[outIndex])
        } else {
            let innerGroup = {}
            let id = selectedNodes.node.dataRef.groupId
            state.treeData.forEach(item => {
                if (item.subList.length) {
                    item.children.forEach(i => {
                        if (i.id === id) {
                            innerGroup = i
                        }
                        if(i.children&&i.children.length){
                            i.children.forEach(j => {
                                if (j.id === id) {
                                    innerGroup = j
                                }
                            })
                        }
                    })
                }
            })
            onLoadData({key: innerGroup.id}, 2, innerGroup.pageNum, innerGroup)
        }
        return
    }
    if(selectedNodes.node.isLeaf){
        if(selectedNodes.node.parent && selectedNodes.node.parent.parent && selectedNodes.node.parent.parent.parent){
            let outItem = selectedNodes.node.parent.parent.parent.node
            let innerItem = selectedNodes.node.parent.parent.node
            let innerInnerItem = selectedNodes.node.parent.node
            useDataStandardStore.selectLeftList({
                outItem: outItem,
                innerItem: innerItem,
                innerInnerItem: innerInnerItem
            })
        }else if(selectedNodes.node.parent && selectedNodes.node.parent.parent){
            let outItem = selectedNodes.node.parent.parent.node
            let innerItem = selectedNodes.node.parent.node
            useDataStandardStore.selectLeftList({
                outItem: outItem,
                innerItem: innerItem
            })
        } else {
            let outItem = selectedNodes.node.parent.node
            useDataStandardStore.selectLeftList({
                outItem: outItem
            })
        }
        useDataStandardStore.updateImportStandardKey(record[0])
        emits('emitSelect')
    }
}

// 展开分组
const expandGroup = async (groupId, targetTableId) => {
    let treeData = state.treeData
    tableGroupId.value = groupId
    rootNodeIndex.value = treeData.findIndex(item => item.id === groupId)
    if(rootNodeIndex.value > -1) {  // 一级分组
        state.expandedKeys = [groupId]
        let outItem = { id: groupId }
        useDataStandardStore.selectLeftList({
            outItem
        })
        let targetNode = state.treeData[rootNodeIndex.value]
        // 根节点children含有数据 更改expankdKey不会触发load-data事件 手动触发
        if(targetNode.children?.length && targetTableId) {   // 含有二级分组 手动查询数据
            await onLoadData({key: targetNode.id}, 1, targetNode.pageNum, targetNode)
            let includeSource = false
            while(1) {
                includeSource = targetNode.children.some(it => it.id === targetTableId)
                if(includeSource) break
                await onLoadData({key: targetNode.id}, 2, targetNode.pageNum, targetNode)
                targetNode = state.treeData[rootNodeIndex.value]
            }
            locateSourceTable(targetTableId)
        }
    } else {    // 非一级目录
        let tempId = -1
        let tempChildId = -1
        for(let i = 0; i < treeData.length; i++) {
            let nodeInfo = treeData[i].children
            if(!nodeInfo) continue
            for(let j = 0; j < nodeInfo.length; j++) {
                if(nodeInfo[j].id === groupId) {
                    rootNodeIndex.value = i
                    childNodeIndex.value = j
                    tempId = treeData[i].id
                    break
                }
                let innerNodeInfo = nodeInfo[j].children
                if(!innerNodeInfo) continue
                for(let k = 0; k < innerNodeInfo.length; k++) {
                    if(innerNodeInfo[k].id === groupId) {
                        rootNodeIndex.value = i
                        childNodeIndex.value = j
                        groundsonNodeIndex.value = k
                        tempId = treeData[i].id
                        tempChildId = treeData[i].children[j].id
                        break
                    }
                }
            }
        }
        // 来源表不存在 
        if(rootNodeIndex.value === -1) return console.log('来源表不存在');
        if(groundsonNodeIndex.value == -1){
            //二级目录
            let targetNode = state.treeData[rootNodeIndex.value]
            // 展开一级分组 二级分组
            state.expandedKeys = [tempId, groupId]
            let outItem = { id: tempId }
            let innerItem = { id: groupId }
            useDataStandardStore.selectLeftList({
                outItem,
                innerItem
            })
            // 一级分组可能含其它表
            await onLoadData({key: targetNode.id}, 1, targetNode.pageNum, targetNode)
        }else{
            //三级目录
            let targetNode = state.treeData[rootNodeIndex.value].children[childNodeIndex.value]
            // 展开一级分组 二级分组
            state.expandedKeys = [tempId, tempChildId,groupId]
            let outItem = { id: tempId }
            let innerItem = { id: tempChildId }
            let innerInnerItem = { id: groupId }
            useDataStandardStore.selectLeftList({
                outItem,
                innerItem,
                innerInnerItem
            })
            // 一级分组可能含其它表
            await onLoadData({key: targetNode.id}, 1, targetNode.pageNum, targetNode)
        }
        
    }
}

// 定位来源表
const locateSourceTable = (targetTableId) => {
    let targetElm = document.getElementById(targetTableId)
    targetElm && targetElm.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    })
}

const treeScroll = async (e) => {
    return
}

const onExpand = (keys, {
    expanded,
    node,
}) => {
};

const treeUlScroll = () => {
    if (treeUlRef.value.clientHeight + treeUlRef.value.scrollTop >=  treeUlRef.value.scrollHeight ) {
        state.searchPageNum++
        onSearch('scroll')
    }
}

const onTableSelect = (item) => {
    if(item.xpath === '-1'){
        useDataStandardStore.selectLeftList({
            outItem: item.libId
        })
    } else {
        const libPID = item.xpath.split('/')[1]
        const libChildPID = item.xpath.split('/')[2] || ''
        if(libChildPID){
            useDataStandardStore.selectLeftList({
                outItem: libPID,
                innerItem: libChildPID,
                innerInnerItem: item.libId,
            })
        }else{
            useDataStandardStore.selectLeftList({
                outItem: libPID,
                innerItem: item.libId,
            })
        }
    }
    state.selectedKeys = [item.id]
    state.expandedKeys = [item.libId]
    useDataStandardStore.updateImportStandardKey(item.id)
    emits('emitSelect')
}
</script>

<style lang="less" scoped>
.treeContainer{
    width: 240px;
    .search {
        width: 240px;
        height: 46px;
        padding: 8px 12px;
        position: relative;
        input {
            width: 216px;
            height: 30px;
        }
        .sear {
            width: 16px;
            position: absolute;
            top: 16px;
            right: 22.6px;
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
    .searchUl {
        width: 100%;
        height: calc(100% - 64px);
        .searchLi{
            width: 100%;
            min-height: 40px;
            padding: 10px 18px 10px 18px;
            line-height: 1.4;
            cursor: pointer;
            &:hover {
                background: rgba(61, 130, 242, 0.1);
                color: #3D82F2;
            }
        }
        .active {
            background: rgba(61, 130, 242, 0.1);
            color: #3D82F2;
        }
    }
    .tableUl {
        width: 100%;
        height: 550px;
        overflow: auto;
        overflow-x: hidden;
        -ms-overflow-style: none;
        overflow: -moz-scrollbars-none;
        .empty {
            height: 100%;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            .text {
                color: rgba(0, 0, 0, 0.40);
                font-family: PingFang SC;
                font-size: 14px;
                font-style: normal;
                font-weight: 400;
                line-height: normal;
                .emptyBtn {
                    margin-left: 8px;
                    color: #2B67FF;
                    cursor: pointer;
                }
            }
        }
        .tableLi {
            padding: 0px 12px 0px 20px;
            width: 100%;
            height: 50px;
            display: flex;
            align-items: center;
            cursor: pointer;
            .text-box {
                width: 100%;
                display: inline-block;
                height: 50px;
                display: flex;
                align-items: center;
            }
            .text-long {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .lefticon {
                width: 16px;
                margin-right: 4px;
            }
        }
    
        .loading-text {
            color: rgba(0, 0, 0, 0.4);
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
    
        .tableLi:hover {
            background: rgba(61, 130, 242, 0.1);
        }
    
        .activeTable {
            background: rgba(61, 130, 242, 0.1);
        }
        .ant-tree-title {
            display: flex;
            align-items: center;
        
            .text-box {
                display: inline-block;
                height: 40px;
                display: flex;
                align-items: center;
                margin-left: 0px;
            }
        
            .text-long {
                width: 90%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        
            .lefticon {
                width: 16px;
                margin-right: 4px;
            }
        
            .child {
                width: 100%;
                max-height: 50px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
        
                img {
                    display: none;
                }
            }
        
            .outTreeTitle {
                width: 100%;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        }
        
        :deep(.ant-tree .ant-tree-treenode) {
            width: 240px;
        }
        
        :deep(.ant-tree .ant-tree-node-content-wrapper) {
            width: 240px;
        }
    }
    
    .ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
        width: 100%;
        margin-left: 0px;
        padding-left: 28px;
        background: rgba(61, 130, 242, 0.1);
    }
}
</style>