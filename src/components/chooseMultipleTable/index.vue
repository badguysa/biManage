<template>
    <div class="mask">
        <div class="popupContainer">
            <div class="popupHeader">
                <div class="title">{{ popupTitle }}</div>
                <img v-if="showClose" class="close" @click="cancel" src="@/assets/icons/close.png" alt="">
            </div>
            <div class="popupMain">
                <div class="leftList">
                    <div class="search" v-if="showSearch">
                        <input  type="text" v-model.trim="state.searchText" :placeholder="t('common.search')">
                        <img class="sear" src="@/assets/icons/search.png" alt="" />
                    </div>
                    <ul class="tableUl" ref="treeUlRef" @scroll="treeUlScroll" v-show="state.tableList.length && state.searchText">
                        <li 
                            v-for="item in state.tableList"
                            :class="[
                                'tableLi', 
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
                            v-model:checkedKeys="state.checkedKeys"
                            :selectedKeys="state.selectedKeys"
                            checkable
                            :defaultExpandAll="true"
                            :load-data="onLoadData"
                            @select="onSelect"
                            @expand="onExpand"
                            @load="loadHandle"
                            @check="onCheck"
                        >
                            <template #title="{ title, key, dataRef  }">
                                <span v-if="dataRef.xpath == '-1'" :title="title" class="outTreeTitle" @click="clickTitleFn($event, dataRef)"> {{ title }}</span>
                                <span v-else-if="dataRef.xpath && dataRef.xpath != '-1'" :title="title" class="child" @click="clickTitleFn($event, dataRef)"> {{ title }}</span>
                                <span v-else-if="dataRef.tip" type="bottom" class="tree-bottom">{{ title }}</span>
                                <span v-else-if="dataRef.loadMore" style="color: rgba(0,0,0,.8);" ><SyncOutlined />&nbsp;{{ title }}</span>
                                <div  v-else :class="selectTableWrapClass(dataRef)" :title="title" :groupid="dataRef.groupId" :id="dataRef.id">
                                    <BiIcon :name="dataRef.iconName" :class="selectTableIconClass(dataRef)"/>
                                    <span class='text-long'>{{ title }}</span>
                                </div>
                            </template>
                        </a-tree>
                        <div style="height: 50px;"></div>
                    </div>
                </div>
                <div class="rightList">
                    <div class="selectedNum">已选 <span class="num">{{ state.selectedList.length }}</span> 张表</div>
                    <ul class="selectedList">
                        <li v-for="item in state.selectedList" :key="item.id" class="itemLi">
                            <div :class="selectTableWrapClass(item)" :title="item.tableAlias">
                                <BiIcon :name="item.iconName" :class="selectTableIconClass(item)"/>
                                <span class="text-long">{{ item.tableAlias }}</span>
                            </div>
                            <div class="itemRight" @click="changeSelect(item.id)">
                                <img class="close" src="@/assets/icons/close.png" alt="close">
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="popupFooter" v-if="showFooter">
                <button @click="cancel">{{ t('common.cancel') }}</button>
                <button @click="confirmHandle">{{ t('common.confirm') }}</button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed, reactive, watch, toRefs, ref, toRaw, onMounted, toRef, h, nextTick } from 'vue'
import { SyncOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { getTableList, getGroupListApi } from '@/apis/group'
import { getTableImg, getTableSvg } from '@/utils/utils'
import { v4 as uuidv4 } from 'uuid'
import { message } from 'ant-design-vue';
import { nodeClickHandle } from '@/utils/treeUtil'
import { getTableByIds } from '@/apis/common'

const { t } = useI18n()
const emits = defineEmits([ 'modalConfirm', 'modalCancel'])
const props = defineProps({
    popupTitle:{
        type: String,
        default: '选择数据',
    },
    showClose:{
        type: Boolean,
        default: true,
    },
    showFooter: {
        type: Boolean,
        default: true,
    },
    showSearch: {
        type: Boolean,
        default: true,
    },
    rightSelectedKey:{
        type: Array,
        default: []
    }
})
const state = reactive({
    searchText: '',
    tableList: [],  // 用于搜索情况下
    searchPageNum: 1, // 搜索的分页
    searchTotal: 0, // 判断搜索状态下的触底
    selectedKeys: [],
    expandedKeys: [],
    treeData: [],
    checkedKeys: [], // 复选中的key
    checkedNodes: [], // 复选中展示出来的节点
    selectedList: [] //点击选中的选项
})
const treeRef = ref()
const treeUlRef = ref()
const treeLoading = ref(false)
const scrollLoading = ref(false)
const tableGroupId = ref()
const rootNodeIndex = ref(-1)
const childNodeIndex = ref(-1)

const preNodes = ref([])

const indicator = h(LoadingOutlined, {
    style: {
    fontSize: '14px',
    },
    spin: true,
});

onMounted(async ()=>{
    await loadTreeData()
    state.checkedKeys = props.rightSelectedKey
    echoCheckedTables()
})

// 回显选中数据表
const echoCheckedTables = () => {
    if(!state.checkedKeys.length) return
    getTableByIds({ids: state.checkedKeys.join(',')}).then((res) => {
        if(res.code === 1) {
            preNodes.value = res.data
            state.checkedNodes = res.data
        }
    })
}

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

const loadTreeData = async () => {
    let res = await getGroupListApi()
    if (res.code == 1) {
        res.data.length && res.data.forEach(item => {
            item.title = item.name
            item.key = item.id
            item.isLeaf = false
            item.pageNum = 1
            item.checkable = item.xpath?.includes('-1') ? false : true
            item.disableCheckbox = item.xpath?.includes('-1') ? true : false
            if (item.subList.length) {
                item.subList.forEach(citem => {
                    citem.title = citem.name
                    citem.key = citem.id
                    citem.isLeaf = citem.counts ? false : true
                    citem.pageNum = 1
                    citem.disableCheckbox = citem.xpath?.includes('-1') ? true : false
                    citem.checkable = item.xpath?.includes('-1') ? false : true
                })
                item.children = item.subList
            }
        })
        state.treeData = res.data
    }
}

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
                        item.disableCheckbox =  props.rightSelectedKey?.includes(item.id) ? true : false
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

const onCheck = (checkedKeys, selectedNodes)=> {
    // console.log('keys', checkedKeys)
    // console.log('nodes', selectedNodes)
    state.checkedNodes = preNodes.value.concat(selectedNodes.checkedNodes)
    state.selectedList = selectedNodes.checkedNodes.filter((item)=> !props.rightSelectedKey.includes(item.id))
    state.checkedKeys = checkedKeys
}

// 点击节点名称 展开节点
const clickTitleFn = async(e, dataRef) => {
    nodeClickHandle({
        state, dataRef, e
    }, onLoadData)
}
const onSelect = (record, selectedNodes) => {
    // 编辑自助配置不能选择自身
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
    // state.selectedKeys = record
}
// 节点数据加载完毕后执行
const loadHandle = async (newLoadedKeys) => {
    let firstRenderNode = newLoadedKeys.length === 1 && newLoadedKeys[0] === tableGroupId.value

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

const selectTableWrapClass = (item) => {
    return [
        'text-box',
    ]
}
const selectTableIconClass = (item) => {
    return [
        'lefticon', 
        item.iconName + 'Icon',
    ]
}

const onTableSelect = (record) => {
    state.checkedNodes.push(record)
    state.checkedKeys.push(record.id)
    state.selectedList.push(record)
}

const changeSelect = (id)=> {
    state.checkedKeys = state.checkedKeys.filter(cid => cid !== id)
    state.selectedList = state.selectedList.filter(item => item.id !== id)
}

const cancel = () => {
    emits('modalCancel')
}

const confirmHandle = () => {
    const data = {
        checkedKeys: state.checkedKeys,
        checkedNodes: state.checkedNodes
    }
    emits('modalConfirm', data)
}

</script>
<style lang="less" scoped>
.mask {
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 6;
    .popupContainer{
        width: 640px;
        height: 600px;
        border-radius: 8px;
        background-color: #ffffff;
        .popupHeader{
            padding: 14px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #E9E9E9;
            .title{
                font-size: 16px;
                font-weight: 600;
            }
            .close{
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
        }
        .popupMain{
            height: 482px;
            display: flex;

            .leftList{
                padding: 8px 12px;
                width: 320px;
                border-right: 1px solid #E9E9E9;
                .ant-tree-title {
                    display: flex;
                    align-items: center;
                    .text-box {
                        display: inline-block;
                        height: 22px;
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
                    width: 100%;
                    align-items: center;
                    padding: 8px;
                    margin-bottom: 4px;
                    border-radius: 4px;
                }
                :deep(.ant-tree-treenode-checkbox-checked) {
                    background-color: #E8F2FF;
                }
                :deep(.ant-tree .ant-tree-treenode:hover){
                    background-color:#E8F2FF; 
                }
                :deep(.ant-tree .ant-tree-treenode .ant-tree-checkbox){
                    position: absolute;
                    right: 0;
                    z-index: 9;
                }
                :deep(.ant-tree .ant-tree-node-content-wrapper) {
                    width: 75%;
                }
                :deep(.ant-tree .ant-tree-node-content-wrapper:hover){
                    background-color: transparent;
                }
                .ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
                    width: 100%;
                    margin-left: 0px;
                    padding-left: 28px;
                    background: rgba(61, 130, 242, 0.1);
                }
                :deep(.ant-tree-checkbox){
                    margin-top: 0px;
                }
                :deep(.ant-tree .ant-tree-node-content-wrapper-normal:hover){
                    margin-left: 0px;
                }
                .search {
                    width: 296px;
                    height: 32px;
                    position: relative;
                    margin-bottom: 8px;
        
                    input {
                        width: 100%;
                        height: 30px;
                    }
        
                    .sear {
                        width: 16px;
                        position: absolute;
                        top: 50%;
                        right: 10px;
                        cursor: pointer;
                        transform: translateY(-50%);
                    }
        
                    .clear {
                        position: absolute;
                        top: 15.5px;
                        right: 46.6px;
                        width: 16px;
                        cursor: pointer;
                    }
                }
                .tableUl {
                    width: 100%;
                    height: 428px;
                    overflow: scroll;
                    overflow-x: hidden;
                    -ms-overflow-style: none;
                    overflow: -moz-scrollbars-none;

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
                }
            }
            .rightList{
                padding: 8px 12px;
                width: 320px;
                .selectedNum{
                    line-height: 18px;
                    height: 18px;
                    font-size: 13px;
                    font-weight: 400;
                    margin-bottom: 8px;
                    color: #828C99;
                    .num{
                        color: #2B67FF;
                        font-size: 13px;
                    }
                }
                .selectedList{
                    height: 442px;
                    overflow-y: auto;
                    margin-bottom: 0;
                    .itemLi{
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        height: 40px;
                        padding: 8px 12px;
                        border-radius: 6px;
                        margin-bottom: 2px;
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
                        .itemRight {
                            display: none;
                            .close{
                                width: 14px;
                                height: 14px;
                                cursor: pointer;
                            }
                        }
                        &:hover{
                            background-color: #E8F2FF;
                            .itemRight{
                                display: block;
                            }
                        }
                    }
                }
            }
        }
        .popupFooter{
            padding: 16px;
            display: flex;
            justify-content: right;
            border-top: 1px solid #E9E9E9;
            button {
                padding: 6px 26px;
                border-radius: 4px;
                border: none;
                background-color: #fff;
                border: 1px solid #3d82f2;
                color: #3d82f2;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                cursor: pointer;
                &:nth-of-type(2) {
                    color: #fff;
                    background-color: #3d82f2;
                    margin-left: 24px;
                }
            }
        }
    }
}
</style>