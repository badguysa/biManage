<!-- 选表字段 -->
<template>
    <!-- <a-spin :spinning="tableLoading"> -->
        <div class="tableCode">
            <!-- 选表 -->
            <div class="selectTable">
                <div class="text">{{ t('common.selectTable') }}</div>
                <div class="search">
                    <!-- @keyup.enter="onSearch"
                    @click="onSearch" -->
                    <input type="text" v-model.trim="state.searchText" :placeholder="t('common.search')">
                    <img class="sear" src="@/assets/icons/search.png" alt="">
                </div>
                <ul class="tableUl" ref="treeUlRef" @scroll="treeUlScroll" v-show="state.tableList.length && state.searchText">
                    <li 
                        v-for="item in state.tableList"
                        :class="[
                            item.id === leftMergeTable.id ? 'tableLi activeTable' : 'tableLi', 
                            item.ulBottom ? 'bottom-item' : '',
                        ]"
                        :key="item.id"
                        @click="onTableSelect(item)"
                    >
                        <div :class="selectTableWrapClass(item)" :title="item.tableAlias">
                            <BiIcon :name="item.iconName" :class="selectTableIconClass(item)"/>
                            <span class="text-long">{{ item.tableAlias }}</span>
                        </div>
                    </li>
                    <div class="loading-text" v-if="state.searchTotal === state.tableList.length && state.tableList.length > 30">{{ t('common.reachBottom') }}</div>
                    <div class="loading-text" v-if="scrollLoading"><a-spin :indicator="indicator" />{{ t('common.scrollLoading') }}</div>
                </ul>
                <div class="tableUl" ref="treeRef" v-show="!state.tableList.length && !state.searchText" @scroll="treeScroll">
                    <a-tree
                        :tree-data="state.treeData"
                        v-model:expandedKeys="state.expandedKeys"
                        :selectedKeys="state.selectedKeys"
                        :load-data="onLoadData"
                        @select="onSelect" 
                        @expand="onExpand"
                        @load="loadHandle"
                    >
                        <template #title="{ title, key, dataRef  }">
                            <span v-if="dataRef.xpath == '-1'" :title="title" class="outTreeTitle" @click="clickTitleFn($event, dataRef)"> {{ title }}</span>
                            <span v-else-if="dataRef.xpath && dataRef.xpath != '-1'" :title="title" class="child" @click="clickTitleFn($event, dataRef)"> {{ title }}</span>
                            <span v-else-if="dataRef.tip" type="bottom" class="tree-bottom">{{ title }}</span>
                            <span style="color: rgba(0,0,0,.8);" v-else-if="dataRef.loadMore"><SyncOutlined />&nbsp;{{ title }}</span>
                            <div :class="selectTableWrapClass(dataRef)" :title="title" :groupid="dataRef.groupId" :id="dataRef.id" v-else  @click="clickTableFn(dataRef.id)">
                                <BiIcon :name="dataRef.iconName" :class="selectTableIconClass(dataRef)"/>
                                <span class='text-long'>{{ title }}</span>
                            </div>
                        </template>
                    </a-tree>
                    <div style="height: 50px;"></div>
                </div>
            </div>
            <!-- 选字段 -->
            <div class="selectCode" v-if="codeList.length || state.searching">
                <div class="text">{{ t('selfConfig.selectCode') }}</div>
                <div class="search">
                    <input type="text" v-model="state.codeText" :placeholder="t('common.search')">
                    <img class="sear" src="@/assets/icons/search.png" alt="">
                </div>
                <div class="select-all" >
                        <img @click="selectAll(1)" v-if="selectedNum === 0" style="width: 16px" src="@/assets/icons/not_select.png" alt="">
                        <img @click="selectAll(2)" v-else-if="selectedNum === codeBackList.length" style="width: 16px" src="@/assets/icons/is_select.png" alt="">
                        <img @click="selectAll(3)" v-else style="width: 16px" src="@/assets/icons/doing_select.png" alt="">
                    {{ t('common.selectAll') }}
                </div>
                <ul class="codeUl">
                    <li :class="{codeLi: true, errorCol: !!item.errorColumn}" v-for="item in codeList" :key="item.id" @click="selectCode(item)">
                        <img class="check-input" v-if="item.isSelect" src="@/assets/icons/is_select.png" alt="">
                        <img class="check-input" v-else src="@/assets/icons/not_select.png" alt="">
                        <div class="iconWrap">
                            <BiIcon :name="getTypeIconSvg(item)" :class="getTypeIconClassName(item)"/>
                        </div>
                        <span :title="item.columnAlias || item.columnName">{{ item.columnAlias || item.columnName }}</span>
                    </li>
                </ul>
            </div>
            <!-- 数据预览 -->
            <div 
                v-if="!previewColumns.length" class='tableArea'
                :style="{width: tableWidth}"
            >
                <div className='box'>
                    <img src='@/assets/images/img_null.png' alt="" />
                    <div class='blank-text'>{{ codeList.length ? t('common.selectTableCodeFromLeft') : t('common.selectTableFromLeft') }}</div>
                </div>
            </div>
            <preview-table v-else
                :tableLoading="tableLoading" 
                :tableColumns="previewColumns" 
                :tableData="previewData" 
                :totalDataCount="totalDataCount"
            />
        </div>
    <!-- </a-spin> -->
</template>

<script setup>
import { computed, reactive, watch, toRefs, ref, toRaw, onMounted, toRef, h, nextTick } from 'vue'
import { SyncOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { mainStore } from '@/Stores/mainStore'
import { configStore } from '@/Stores/configStore'
import { getTableList, getGroupListApi, getIndexTableDetail } from '@/apis/group'
import { storeToRefs } from 'pinia'
import { getTableImg, getTableSvg, getTypeIconSvg, getTypeIconClassName } from '@/utils/utils'
import { useI18n } from 'vue-i18n'
import * as _ from 'loadsh'
import { v4 as uuidv4 } from 'uuid'
import { message } from 'ant-design-vue';
import { nodeClickHandle } from '@/utils/treeUtil'
import previewTable from '@/components/selfconfig/previewTable'

const { t } = useI18n() 
const indicator = h(LoadingOutlined, {
    style: {
    fontSize: '14px',
    },
    spin: true,
});
const useMainStore = mainStore()
const useConfigStore = configStore()
const { leftMenuList, activeTabKey, indexTableDesc } = storeToRefs(useMainStore)
const { configUniqueData } = storeToRefs(useConfigStore)
const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})
const { errorConfigInfo, operActiveId, showType, codeList, previewColumns, 
    previewData, leftMergeTable, tableLoading, codeBackList, selfFlag, tableSource, totalDataCount
 } = toRefs(configData.value)
const state = reactive({
    showClearImg: false,
    showClearImg1: false,
    searchText: '',
    codeText: '',
    searching: false,
    tableList: [],
    searchPageNum: 1, // 搜索的分页
    searchTotal: 0, // 判断搜索状态下的触底
    selectedKeys: [],
    // expandedKeys: [leftMenuList.value[0]?.id],
    expandedKeys: [],
    treeData: [],
    mosueTreeNode: {},
    lastTreeNode: 0
})
const treeRef = ref()
const treeUlRef = ref()
const treeLoading = ref(false)
const scrollLoading = ref(false)
const tableGroupId = ref()
const rootNodeIndex = ref(-1)
const childNodeIndex = ref(-1)
const tableWidth = computed(() => {
    if (codeList.length) {
        return `calc(100% - 500px)`
    } else {
        return `calc(100% - 200px)`
    }
})
const selectedNum = computed(() => {
    return codeBackList.value.filter(i => i.isSelect).length
})
onMounted(async () => {
    await loadTreeData()
    await editInit()
    await addInit()
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
watch(() => state.codeText, val => {
    if (!val.trim()) {
        codeList.value = codeBackList.value
        state.searching = false
    } else {
        state.searching = true
        codeList.value = codeBackList.value.filter(item => 
            item.columnAlias ? item.columnAlias.indexOf(val.trim()) > -1 : item.columnName.indexOf(val.trim()) > -1
        )
    }
})

watch(showType, async () => {
    if(showType.value !== 'selectCode') return
    await nextTick()
    locateSourceTable()
})

// 点击节点名称 展开节点
const clickTitleFn = async(e, dataRef) => {
    nodeClickHandle({
        state, dataRef, e
    }, onLoadData)
}

// 节点数据加载完毕后执行
const loadHandle = async (newLoadedKeys) => {
    let firstRenderNode = newLoadedKeys.length === 1 && newLoadedKeys[0] === tableGroupId.value

    let targetTableId = sourceTableId.value

    if(!indexTableDesc.value) return

    if(!targetTableId) {
        targetTableId = indexTableDesc.value.id
    }

    if(!firstRenderNode || rootNodeIndex.value === -1) return

    let nodeInfo = null, includeSource = false
   
    // 循环判断来源表是否包含在当前分组内
    while(1) {
        if(childNodeIndex.value === -1) {   // 来源表位于一级分组
            nodeInfo = state.treeData[rootNodeIndex.value]
        } else {    // 来源表位于二级分组
            nodeInfo = state.treeData[rootNodeIndex.value].children[childNodeIndex.value]
        }
        includeSource = nodeInfo.children.some(it => it.id === targetTableId)
        if(includeSource) {
            break
        }
        await onLoadData({key: nodeInfo.id}, 2, nodeInfo.pageNum, nodeInfo)
    }

    locateSourceTable(targetTableId)
}

// 定位来源表
const locateSourceTable = (targetTableId) => {
    let targetElm = document.getElementById(targetTableId || sourceTableId.value)
    targetElm && targetElm.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    })
}

const sourceTableId = computed(() => tableSource.value[0]?.contents.tableId)

// 编辑自助配置 自动定位当前编辑表
const editInit = async () => {
    if(selfFlag.value !== 'edit') return
    state.selectedKeys = [sourceTableId.value]
    let tableDetailRes = await getIndexTableDetail({id: sourceTableId.value})
    if (tableDetailRes.code === 1) {
        // 多表合并 左表设置svg图标
        tableDetailRes.data.iconName = getTableSvg(tableDetailRes.data.tableType)
        useConfigStore.setLeftMergeTable(tableDetailRes.data, activeTabKey.value)
        // 获取来源表字段
        useConfigStore.getCodeList(tableDetailRes.data, activeTabKey.value)
        expandGroup(tableDetailRes.data.groupId, sourceTableId.value)
    } else {    // 来源表被删除
        if(errorConfigInfo.value.isError){
            useConfigStore.updateCodeList(activeTabKey.value)
        }
    }
}

// 新增自助配置 自动定位当前选中表或当前选中分组
const addInit = () => {
    if(selfFlag.value !== 'add') return
    // 含有选中表 选中该表
    if(JSON.stringify(indexTableDesc.value) !== '{}') {
        state.selectedKeys = [indexTableDesc.value.id]
        expandGroup(activeTabKey.value, indexTableDesc.value.id)
        // 展示表字段
        onSelect([indexTableDesc.value.id], {
            node: {
                dataRef: indexTableDesc.value
            }
        })
    } else {
        // TODO: 仅剩两张表 删除选中当前表 新增自主配置 卡死
        // expandGroup(activeTabKey.value)
    }
}

// 展开分组
const expandGroup = async (groupId, targetTableId) => {
    let treeData = state.treeData
    tableGroupId.value = groupId
    rootNodeIndex.value = treeData.findIndex(item => item.id === groupId)

    if(rootNodeIndex.value > -1) {  // 一级分组
        state.expandedKeys = [groupId]
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
    } else {    // 二级分组
        let tempId = -1
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
            }
        }
        // 来源表不存在 
        if(rootNodeIndex.value === -1) return console.log('来源表不存在');
        let targetNode = state.treeData[rootNodeIndex.value]
        // 展开一级分组 二级分组
        state.expandedKeys = [tempId, groupId]
        // 一级分组可能含其它表
        await onLoadData({key: targetNode.id}, 1, targetNode.pageNum, targetNode)
    }
}

const loadTreeData = async () => {
    let res = await getGroupListApi()
    if (res.code == 1) {
        res.data.length && res.data.forEach(item => {
            item.title = item.name
            item.key = item.id
            item.isLeaf = false
            item.pageNum = 1
            if (item.subList.length) {
                item.subList.forEach(citem => {
                    citem.title = citem.name
                    citem.key = citem.id
                    citem.isLeaf = citem.counts ? false : true
                    citem.pageNum = 1
                })
                item.children = item.subList
            }
        })
        state.treeData = res.data
    }
}

const onSearch = (from) => {
    if (!state.searchText.trim()) return
    const jsonData = {
        tableAlias: state.searchText,
        groupId: '',
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
    getTableList(jsonData).then(res => {
        if (res.code == 1) {
            res.data.records.forEach(item => {
                item.imgSrc = getTableImg(item.tableType)
                item.iconName = getTableSvg(item.tableType)
            })
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

const onSelect = (record, selectedNodes) => {
    // 编辑自助配置不能选择自身
    if(disableSelectSelf(record[0])) {
        return
    }
    if (selectedNodes.node.dataRef.loadMore) {
        const outIndex = state.treeData.findIndex(item => item.id === selectedNodes.node.dataRef.groupId)
        if (outIndex > -1) {
            onLoadData({key: state.treeData[outIndex].id, children: []}, 2, state.treeData[outIndex].pageNum, state.treeData[outIndex])
        } else {
            let innerGroup = {}
            state.treeData.forEach(item => {
                if (item.subList.length) {
                    item.children.forEach(i => {
                        if (i.id === selectedNodes.node.dataRef.groupId) {
                            innerGroup = i
                        }
                    })
                }
            })
            onLoadData({key: innerGroup.id, children: []}, 2, innerGroup.pageNum, innerGroup)
        }
        return
    }
    if (selectedNodes.node.dataRef.pid) return
    state.selectedKeys = record
    useConfigStore.setCodeList([], activeTabKey.value)
    useConfigStore.setPreviewData([], activeTabKey.value)
    useConfigStore.setPreviewColumns([], activeTabKey.value)
    if (record.length) {
        useConfigStore.setLeftMergeTable(selectedNodes.node.dataRef, activeTabKey.value)
        useConfigStore.getCodeList(selectedNodes.node.dataRef, activeTabKey.value)
    } else {
        useConfigStore.setLeftMergeTable({}, activeTabKey.value)
    }
}

const onTableSelect = record => {
    if(disableSelectSelf(record.id)) {
        return
    }
    state.selectedKeys = [record.id]
    useConfigStore.setLeftMergeTable(record, activeTabKey.value)
    useConfigStore.setCodeList([], activeTabKey.value)
    useConfigStore.setPreviewData([], activeTabKey.value)
    useConfigStore.setPreviewColumns([], activeTabKey.value)
    useConfigStore.getCodeList(record, activeTabKey.value)
}

const onExpand = (keys, {
    expanded,
    node,
}) => {
};

const onLoadData = ({ key, children }, from = 1, pageNum, record) => {
    return new Promise((resolve) => {
        if (!key) {
            resolve()
            return
        }
        if (from === 2) {
            if (record.pageNum == -1) {
                resolve()
                return
            }
            treeLoading.value = true
            record.pageNum++
        }
        const params = {
            groupId: key,
            pageSize: 30,
            pageNum: from === 2 ? record.pageNum : 1,
        }
        let nodes = []
        getTableList(params).then(res => {
            if (res.code == 1) {
                if (res.data.records.length) {
                    nodes = res.data.records.map(item => {
                        item.key = item.id
                        item.imgSrc = getTableImg(item.tableType)
                        item.iconName = getTableSvg(item.tableType)
                        item.title = item.tableAlias
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
                } else {
                    if (from === 2) {
                        record.children.pop()
                        record.children.push({
                            id: uuidv4(),
                            isLeaf: true,
                            key: uuidv4(),
                            title: t('common.reachBottom'),
                            tip: true
                        })
                        record.pageNum = -1
                        setTimeout(() => {
                            setBottomStyle()
                        }, 100)
                    }
                    treeLoading.value = false
                    resolve()
                }
            }
        })
    })
}

const setBottomStyle = () => {
    document.querySelectorAll('.tree-bottom').forEach(item => {
        item.parentElement.parentElement.parentElement.className = 'ant-tree-treenode ant-tree-treenode-leaf-last bottom-item'
    })
}


const updateTreeData = (list, key, children) => {
    return list.map((node) => {
        if (node.key === key && node.xpath != '-1' && node.xpath.indexOf('-1') > -1) {
            let nodeChildren = node.children ? node.children : []
            nodeChildren = nodeChildren.filter(i => !i.loadMore)
            let tempChildren = [...nodeChildren, ...children]
            if (!(tempChildren.length && tempChildren.length === tempChildren[0].total)) {
                tempChildren.push({
                    groupId: children[0]?.groupId || children[0]?.pid,
                    id: uuidv4(),
                    isLeaf: true,
                    key: uuidv4(),
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
                children.push({
                    groupId: children[0]?.groupId || children[0]?.pid,
                    id: uuidv4(),
                    isLeaf: true,
                    key: uuidv4(),
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

const treeScroll = async (e) => {
    return
}

const treeUlScroll = () => {
    if (treeUlRef.value.clientHeight + treeUlRef.value.scrollTop >=  treeUlRef.value.scrollHeight ) {
        state.searchPageNum++
        onSearch('scroll')
    }
}

const selectCode = record => {
    record.isSelect = !record.isSelect
    let columns = []
    let selectedCodeList = []
    selectedCodeList = codeBackList.value.filter(item => {
        if (item.isSelect) {
            columns.push(item.columnName)
            return item
        }
    })
    useConfigStore.setSelectedCodeList(selectedCodeList, activeTabKey.value)
    const selectConfig = {
        uuid: operActiveId.value,
        action: "select",
        contents: {
            tableId: leftMergeTable.value.id, //表ID
            columns//用户选择的列名
        }
    }
    useConfigStore.setTableSource(selectConfig, 'change', activeTabKey.value)
    useConfigStore.setSelfConfig(selectConfig, 'select', activeTabKey.value)
}
/**
 * 1 全选 2、3 全不选
 * @param {number} type 
 */
const selectAll = (type) => {
    if (type === 1) {
        let columns = []
        codeBackList.value.forEach(item => {
            item.isSelect = true
            columns.push(item.columnName)
        })
        useConfigStore.setSelectedCodeList(codeBackList.value, activeTabKey.value)
        const selectConfig = {
            uuid: operActiveId.value,
            action: "select",
            contents: {
                tableId: leftMergeTable.value.id,
                columns
            }
        }
        useConfigStore.setTableSource(selectConfig, 'change', activeTabKey.value)
        useConfigStore.setSelfConfig(selectConfig, 'select', activeTabKey.value)
    } else {
        codeBackList.value.forEach(item => {
            item.isSelect = false
        })
        const selectConfig = {
            action: "select",
            contents: {
                tableId: leftMergeTable.value.id,
                columns: []
            }
        }
        useConfigStore.setTableSource(selectConfig, 'change', activeTabKey.value)
        useConfigStore.setSelfConfig(selectConfig, 'select', activeTabKey.value)
    }
}

// 选中表是否需要标红展示
const selectedTableError = (table) => 
    errorConfigInfo.value.isError && table.id === sourceTableId.value

// 编辑模式下禁止选择表自身
const disableSelectSelf = (tableId) => 
    selfFlag.value === 'edit' && 
    tableId === indexTableDesc.value.id

const selectTableWrapClass = (item) => {
    return [
        'text-box',
        disableSelectSelf(item.id) ? 'selfTable' : '',
        selectedTableError(item) ? 'errorItem' : ''
    ]
}
const selectTableIconClass = (item) => {
    return [
        'lefticon', 
        item.iconName + 'Icon', 
        selectedTableError(item) ? 'errorStatus': ''
    ]
}

const clickTableFn = async(id) => {
    let detailRes = await getIndexTableDetail({id})
    if(detailRes.code === 1) {
        const flag = detailRes.data?.tableType.value === 4 ? true : false
        useMainStore.setIsSelfTable(flag)
    } else {
        message.error(detailRes.message)
    }
}
</script>

<style lang="less" scoped>

:deep(.ant-spin-nested-loading){
    height: 100%;
    .ant-spin-container{
        height: 100%;
    }
}
.tableCode {
    width: calc(100vw - 395px);
    height: 100%;
    display: flex;
    .text {
        width: 100%;
        height: 20px;
        font-weight: 400;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.8);
        margin-top: 12px;
        margin-left: 12px;
    }

    .search {
        width: 200px;
        height: 46px;
        padding: 8px 12px;
        position: relative;

        input {
            width: 176px;
            height: 30px;
            padding-right: 30px;
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



    .selectTable,
    .selectCode {
        width: 200px;
        height: 100%;
        background-color: #fff;
        border-radius: 4px;
        margin-right: 12px;
        display: flex;
        flex-direction: column;

        .tableUl {
            width: 100%;
            height: calc(100% - 99px);
            overflow: scroll;
            overflow-x: hidden;
            -ms-overflow-style: none;
            overflow: -moz-scrollbars-none;

            .tableLi {
                padding: 0px 12px 0px 20px;
                width: 200px;
                height: 50px;
                display: flex;
                align-items: center;
                cursor: pointer;

                .text-box {
                    display: inline-block;
                    height: 50px;
                    display: flex;
                    align-items: center;
                }

                .text-long {
                    width: 125px;
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
        }

        .selfTable{
            opacity: .6;
            cursor: not-allowed;
        }

        .codeUl {
            width: 100%;
            overflow-y: scroll;
            flex-grow: 1;
            .codeLi {
                height: 36px;
                display: flex;
                align-items: center;
                padding: 0px 16px 0px 12px;
                position: relative;
                cursor: pointer;

                .check-input {
                    width: 16px;
                    height: 16px;
                    margin: 0;
                }

                
                .iconWrap{
                    width: 22px;
                    height: 16px;
                    margin: 0px 8px;
                    flex-shrink: 0;
                    position: relative;
                    svg{
                        width: 16px;
                        height: 16px;
                    }
                    .borderSymbol{
                        display: inline-block;
                        border: 3px solid transparent;
                        border-right-color: #00000066;
                        border-bottom-color: #00000066;
                        position: absolute;
                        right: 2px;
                        bottom: 2px;
                    }
                }

                span {
                    display: inline-block;
                    width: 200px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }
            }

            .errorCol{
                span{
                    color: #F53F3F;
                }
            }
        }

        .search{
            margin-bottom: 8px;
        }

        .select-all {
            width: 200px;
            height: 40px;
            padding: 0px 16px 0px 12px;
            display: flex;
            flex-direction: row;
            align-items: center;
            img {
                margin-right: 8px;
                cursor: pointer;
            }
        }
    }

    .tableArea {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        background-color: #fff;
        .box {
            text-align: center;
        }
        img {
            width: 180px;
            height: 130px;
        }
        .blank-text {
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            color: rgba(0, 0, 0, 0.4);
        }
    }

    .table-con {
        background-color: #fff;

        p {
            float: right;
            margin-right: 12px;
            margin-top: 12px;
            color: rgba(0, 0, 0, 0.4);
            font-size: 12px;
            width: 215px;
            text-align: right;
        }

        .tables {
            width: calc(100vw - 1000px);
            background-color: #fff;
            overflow: scroll;
            padding-left: 12px;
        }
    }
}

:deep(.errorItem){
    .text-long{
        color: #F53F3F;
        font-weight: 500;
    }
}
</style>
