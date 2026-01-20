import { defineComponent, onMounted, reactive, computed, toRefs, ref, toRaw, h, nextTick , watch } from 'vue'
import { Tree, Spin, Tooltip } from 'ant-design-vue'
import { SyncOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { configStore } from '@/Stores/configStore';
import { getTableList, getGroupListApi } from '@/apis/group'
import myTable from '@/components/table'
import { getTableImg, getTableSvg, getTypeIconSvg, getTypeIconClassName } from '@/utils/utils'
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import num_img from '@/assets/icons/num_img.png'
import text_img from '@/assets/icons/text_img.png'
import time_img from '@/assets/icons/time_img.png'
import selectblank1 from '@/assets/images/img_null1.png'
import searchImg from '@/assets/icons/search.png'
import notSelectImg from '@/assets/icons/not_select.png'
import isSelectImg from '@/assets/icons/is_select.png'
import doingSelectImg from '@/assets/icons/doing_select.png'
import myButton from '../../../../../components/buttons/myButton'
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid'
import './index.less'
import { nodeClickHandle } from '@/utils/treeUtil'
import { debounce } from 'lodash'

export default defineComponent({
    name: 'mergeModal',
    components: {
        myButton
    },
    setup() {
        const useModalStore = modalStore()
        const useMainStore = mainStore()
        const useConfigStore = configStore()
        const { mergeModalVisible } = storeToRefs(useModalStore)
        const { leftMenuList, activeTabKey, indexTableDesc } = storeToRefs(useMainStore)
        const { configUniqueData } = storeToRefs(useConfigStore)
        const { t } = useI18n()
        const indicator = h(LoadingOutlined, {
            style: {
            fontSize: '14px',
            },
            spin: true,
        });
        const scrollLoading = ref(false)
        const tableGroupId = ref()
        const rootNodeIndex = ref(-1)
        const childNodeIndex = ref(-1)

        const configData = computed(() => {
            return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
        })
        const { rightCodeList, rightCodeArray, operActiveId, 
            rightTableLoading, rightCodeLoading, rightErrorCodeList, selfFlag, rightMergeTable } = toRefs(configData.value)
        const mergeData = computed(() => {
            let data = {
                codeList: [],
                codeBackList: [],
                tableColumns: [],
                tableData: [],
                defaultExpandedKeys: [leftMenuList.value[0]?.id],
                defaultSelectedKeys: []
            }
            if (rightCodeArray.value.length) {
                rightCodeArray.value.forEach(item => {
                    if (item.uuid === operActiveId.value) {
                        data = item
                    }
                })
            }
            return data
        })
        const state = reactive({
            tableid: '',
            originTableId: '',
            showElem: false,
            tableList: [],
            searchText: '',
            searchPageNum: 1, // 搜索的分页
            searchTotal: 0, // 判断搜索状态下的触底
            selectedKeys: [],
            // expandedKeys: [leftMenuList.value[0]?.id],
            expandedKeys: [],
            treeData: [],
        })
        const selectedNum = computed(() => {
            if (mergeData.value.codeBackList && mergeData.value.codeBackList.length > 0) {
                return mergeData.value.codeBackList && mergeData.value.codeBackList.filter(i => i.isSelect).length
            }
            return 0
        })
        onMounted(async() => {
            await loadTreeData()
            state.tableid = mergeData.value.defaultSelectedKeys && mergeData.value.defaultSelectedKeys.length > 0 ? mergeData.value.defaultSelectedKeys[0] : ''
            state.originTableId = state.tableid
            await addInit()
        })
        const codeSearch = (event) => {
            const value = event.target.value.trim()
            if (value) {
                mergeData.value.codeList = mergeData.value.codeBackList.filter(item => {
                    return item.columnAlias?.indexOf(value) > -1 || item.columnName?.indexOf(value) > -1
                })
                // console.log('e', leftMenuList);
            } else {
                mergeData.value.codeList = mergeData.value.codeBackList
            }
        }
        const loadTreeData = async () => {
            const res = await getGroupListApi()
            if (res.code == 1) {
                res.data.length && res.data.forEach(async item => {
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
        const tableSearchChange = (event) => {
            const value = event.target.value.trim()
            if (value.trim()) {
                state.searchText = value
                state.searchPageNum = 1
                onSearch()
            } else {
                state.tableList = []
                state.searchText = ''
                document.getElementById('treeUlRef').scrollTop = 0
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
                    const tempData = [...state.tableList, ...res.data.records].reduce((pre, cur) => {
                        const preId = pre.map(i => i.id)
                        if (preId.includes(cur.id)) {
                            return pre
                        } else {
                            return pre.concat(cur)
                        }
                    }, [])
                    state.tableList = tempData
                    if (state.searchTotal && (state.searchTotal === state.tableList.length)) {
                        state.searchTotal = state.tableList.length
                    }
                } else {
                    message.error(res.message)
                }
                scrollLoading.value = false

            })
        }
        const cancel = () => {
            useModalStore.changeMergeModalVisible()
        }
        const onOk = () => {
            useModalStore.changeMergeModalVisible()
        }
        const onSelect = (key, data) => {
            // 编辑自助配置不能选择自身
            if(disableSelectSelf(key[0])) {
                return
            }
            if (data.node.dataRef.loadMore) {
                const outIndex = state.treeData.findIndex(item => item.id === data.node.dataRef.groupId)
                if (outIndex > -1) {
                    onLoadData({key: state.treeData[outIndex].id, children: []}, 2, state.treeData[outIndex].pageNum, state.treeData[outIndex])
                } else {
                    let innerGroup = {}
                    state.treeData.forEach(item => {
                        if (item.subList.length) {
                            item.children.forEach(i => {
                                if (i.id === data.node.dataRef.groupId) {
                                    innerGroup = i
                                }
                            })
                        }
                    })
                    onLoadData({key: innerGroup.id, children: []}, 2, innerGroup.pageNum, innerGroup)
                }
                return
            }
            if (data.node.dataRef.pid) return
            useConfigStore.setExpandedKeys(key, 2, activeTabKey.value)
            state.tableid = key[0]
            const record = {
                id: key[0]
            }
            if (key.length) {
                useConfigStore.setRightMergeTable(data.node.dataRef, activeTabKey.value)
                useConfigStore.getRightCodeList(record, activeTabKey.value)
            } else {
                useConfigStore.setRightMergeTable({}, activeTabKey.value)
                useConfigStore.setRightCodeList([], activeTabKey.value)
                mergeData.value.tableColumns = []
            }
        }
        const onTableSelect = record => {
            if(disableSelectSelf(record.id)) {
                return
            }
            useConfigStore.setExpandedKeys([record.id], 2, activeTabKey.value)
            state.tableid = record.id
            useConfigStore.setRightMergeTable(record, activeTabKey.value)
            useConfigStore.getRightCodeList(record, activeTabKey.value)
        }
        const onExpandKeys = expandedKeys => {
            useConfigStore.setExpandedKeys(expandedKeys, 1, activeTabKey.value)
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
        
        const treeUlScroll = () => {
            if (document.getElementById('treeUlRef').clientHeight + document.getElementById('treeUlRef').scrollTop >=  document.getElementById('treeUlRef').scrollHeight ) {
                state.searchPageNum++
                onSearch('scroll')
            }
        }
        const selectCode = record => {
            record.isSelect = !record.isSelect
            let columns = []
            rightCodeList.value.forEach(item => {
                if (item.isSelect) {
                    columns.push(item.columnName)
                }
            })
            const selectConfig = {
                action: "select",
                contents: {
                    tableId: state.tableid, //表ID
                    columns//用户选择的列名
                }
            }
            useConfigStore.getRightPreviewData(selectConfig, activeTabKey.value)
        }
        const selectAll = type => {
            if (type === 1) {
                let columns = []
                mergeData.value.codeBackList.forEach(item => {
                    item.isSelect = true
                    columns.push(item.columnName)
                })
                const selectConfig = {
                    action: "select",
                    contents: {
                        tableId: state.tableid,
                        columns
                    }
                }
                useConfigStore.getRightPreviewData(selectConfig, activeTabKey.value)
            } else {
                mergeData.value.codeBackList.forEach(item => {
                    item.isSelect = false
                })
                const selectConfig = {
                    action: "select",
                    contents: {
                        tableId: state.tableid,
                        columns: []
                    }
                }
                useConfigStore.getRightPreviewData(selectConfig, activeTabKey.value)
            }
        }

        // 是否需要标红展示
        const tableMarkRed = (table) => {
            return JSON.stringify(rightErrorCodeList.value) !== '{}' && table.id === state.originTableId
        }

        const selectTableWrapClass = (item) => [
            'text-box',
            tableMarkRed(item) ? 'errorItem' : '',
            disableSelectSelf(item.id) ? 'selfTable' : ''
        ]

        // 编辑模式下禁止选择表自身
        const disableSelectSelf = (tableId) => 
            selfFlag.value === 'edit' && 
            tableId === indexTableDesc.value.id
            

        const selectTableIconClass = (item) => {
            return [
                'lefticon', 
                item.iconName + 'Icon', 
                tableMarkRed(item) ? 'errorStatus': ''
            ]
        }

        // 点击节点名称 展开节点
        const clickTitleFn = async(e, dataRef) => {
            nodeClickHandle({
                state, dataRef, e
            }, onLoadData)
        }

        const expandFn = (e) => {
            state.expandedKeys = e
        }

        // 节点数据加载完毕后执行
        const loadHandle = async (newLoadedKeys) => {
            let firstRenderNode = newLoadedKeys.length === 1 && newLoadedKeys[0] === tableGroupId.value
            
            let targetTableId = state.tableid

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
            await nextTick()
            locateSourceTable(targetTableId)
        }

        // 新增自助配置 自动定位当前选中表或当前选中分组
        const addInit = async () => {
            if(state.tableid === '') return
            // 含有选中表 选中该表
            if(JSON.stringify(indexTableDesc.value) !== '{}') {
                state.selectedKeys = [indexTableDesc.value.id]
                if(rightMergeTable.value.length > 0){
                    const expandItem = rightMergeTable.value.filter((item)=> item.id === state.tableid)[0]
                    expandGroup(expandItem.groupId, expandItem.id)
                }
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

        // 定位来源表
        const locateSourceTable = (targetTableId) => {
            let targetElm = document.getElementById('merge_' + targetTableId)
            targetElm && targetElm.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }

        const handleScroll = debounce(() => {
            let targetElm = document.getElementById('merge_' + state.tableid)
            if(targetElm && isElementInView(targetElm)){
                // 执行滚动结束的回调函数
                const parentNode = document.querySelector('.mergeTable .tableUl')
                if(parentNode){
                    parentNode.scrollLeft = 0
                }
            }
        },200)

        const  isElementInView = (element)=> {
            if(element){
                const rect = element.getBoundingClientRect();
                const dialogHeight = document.querySelector('.mergeTable .popDiv').offsetHeight
                const elementToBottom = window.innerHeight - (window.innerHeight - dialogHeight)/2 - 62
                return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= elementToBottom &&
                rect.right <= (window.innerHeight || document.documentElement.clientWidth)
                );
            }
        }
        return {
            cancel,
            onSelect,
            onLoadData,
            selectCode,
            onOk,
            onExpandKeys,
            selectAll,
            codeSearch,
            onTableSelect,
            tableSearchChange,
            treeUlScroll,
            onSearch,
            t,
            selectTableIconClass,
            selectTableWrapClass,
            expandFn,
            addInit,
            expandGroup,
            locateSourceTable,
            loadHandle,
            clickTitleFn,
            handleScroll,
            ...toRefs(state),
            leftMenuList,
            mergeModalVisible,
            mergeData,
            selectedNum,
            rightTableLoading,
            rightCodeLoading,
            indicator,
            scrollLoading,
        }
    },
    render() {
        const { onSearch, treeUlScroll, cancel, onSelect, onLoadData, selectCode, onOk, onExpandKeys, 
            selectAll, codeSearch, tableSearchChange, onTableSelect, t, selectTableIconClass, selectTableWrapClass, expandFn, clickTitleFn, loadHandle, handleScroll } = this
        const { expandedKeys, searchTotal, indicator, scrollLoading, mergeModalVisible, leftMenuList, mergeData, rightTableLoading, selectedNum, rightCodeLoading, showElem, tableList, tableid, treeData } = this
        return (
            mergeModalVisible ?
                <div className='mergeTable'>
                    <div class="maskLayer"></div>
                    <div class="popDiv divWidth">
                        <div class="popuHead">
                            <span class="popClose fr" onClick={cancel}><img style={{ width: '16px' }} src={closeImg} /></span>
                            <p class="fl colorDeep">{ t('selfConfig.selectData') }</p>
                        </div>
                        <div className='modalBody'>
                            <div className='leftTree'>
                                <div className='search'>
                                    <input type="text" onChange={tableSearchChange} placeholder={t('common.search')} />
                                    <img onClick={onSearch} class="sear" src={searchImg} alt="" />
                                </div>
                                <div className='tableUl' style={{ display: tableList.length ? 'none' : 'block' }} onScroll={handleScroll} >
                                    <Tree
                                        treeData={treeData}
                                        onSelect={onSelect}
                                        expandedKeys={expandedKeys}
                                        onUpdate:expandedKeys={expandFn}
                                        selectedKeys={mergeData.defaultSelectedKeys}
                                        onExpand={onExpandKeys}
                                        loadData={onLoadData}
                                        onLoad={loadHandle}
                                    >
                                        {{
                                            'title': ({ title, dataRef }) => {
                                                let treeNode = null
                                                if (dataRef.xpath == '-1' || dataRef.xpath == '-1/') {
                                                    treeNode = <span className="outTreeTitle" onClick={(e) => clickTitleFn(e, dataRef)}>{ title }</span>
                                                } else if (dataRef.xpath && dataRef.xpath != '-1') {
                                                    treeNode = <span className="child" onClick={(e) => clickTitleFn(e, dataRef)}>{ title }</span>
                                                } else if (dataRef.tip) {
                                                   treeNode = <span type="bottom" className="tree-bottom">{ title }</span> 
                                                } else if (dataRef.loadMore) {
                                                    treeNode = <span style={{color: 'rgba(0,0,0,.8)'}}><SyncOutlined />&nbsp;{ title }</span>
                                                } else {
                                                    treeNode = (<div class={selectTableWrapClass(dataRef)} groupid={dataRef.groupId} id={'merge_'+dataRef.id} title={title}>
                                                        <BiIcon name={dataRef.iconName} class={selectTableIconClass(dataRef)}/>
                                                        <span className='text-long'>{ title }</span>
                                                    </div>)
                                                }
                                                return treeNode;
                                            }
                                        }}
                                    </Tree>
                                </div>
                                <ul id={"treeUlRef"} onScroll={treeUlScroll} class="tableUl" style={{ display: tableList.length ? 'block' : 'none' }}>
                                    {
                                        tableList.length > 0 ? tableList.map(item => (
                                            <li 
                                                key={item.id} 
                                                className={ (item.id === tableid ? 'tableLi activeTable' : 'tableLi') + ' ' + (item.ulBottom ? 'bottom-item' : '') }
                                                onClick={() => {onTableSelect(item)}}
                                            >
                                                <div class={selectTableWrapClass(item)}>
                                                    <BiIcon name={item.iconName} class={selectTableIconClass(item)}/>
                                                    <span title={item.tableAlias} class="text-long">{ item.tableAlias }</span>
                                                </div>
                                            </li>
                                        )) : null
                                    }
                                    {
                                        searchTotal === tableList.length && tableList.length > 30 ?
                                        <div className="loading-text">{ t('common.reachBottom') }</div> : null
                                    }
                                    {
                                        scrollLoading ? 
                                        <div className="loading-text"><Spin indicator={indicator} />{ t('common.scrollLoading') }</div> : null
                                    }
                                </ul>
                            </div>
                            <div className='rightArea'>
                                <div className='centerCode'>
                                    <div className='code_header'>
                                        {
                                            mergeData.codeBackList && mergeData.codeBackList.length > 0 ?
                                                <div className='search'>
                                                    <input type="text" onChange={codeSearch} placeholder={t('common.search')} />
                                                    <img class="sear" src={searchImg} alt="" />
                                                </div> : null
                                        }
                                        <div className='title'>{ t('selfConfig.selectCode') }</div>
                                    </div>
                                    <Spin spinning={rightCodeLoading}>
                                    <ul className='codeUl'>
                                        {
                                            mergeData.codeBackList && mergeData.codeBackList.length > 0 ?
                                                <div className="select-all" >
                                                    {
                                                        selectedNum === 0 ? <img onClick={() => selectAll(1)} style={{ width: '16px' }} src={notSelectImg} alt="" /> :
                                                            (selectedNum === mergeData.codeBackList.length ? <img onClick={() => selectAll(2)} style="width: 16px" src={isSelectImg} alt="" /> :
                                                                <img onClick={() => selectAll(3)} style="width: 16px" src={doingSelectImg} alt="" />
                                                            )
                                                    }
                                                    {t('common.selectAll')}
                                                </div> : null
                                        }

                                        {
                                            mergeData.codeBackList && mergeData.codeBackList.length > 0 ? mergeData.codeList.map(item => (
                                                <li className={!!item.errorColumn ? 'codeLi errorCol': 'codeLi'} key={item.id} onClick={() => selectCode(item)}>
                                                    {
                                                      item.isSelect ?  <img class="check-input" src={isSelectImg} alt="" /> : <img class="check-input" src={notSelectImg} alt="" />
                                                    }
                                                    {/* <img src={item.imgType == 'textImg' ? text_img : (item.imgType == 'numImg' ? num_img : time_img)} alt="" /> */}
                                                    <div class="iconWrap">
                                                        <BiIcon name={getTypeIconSvg(item)} class={getTypeIconClassName(item)}/>
                                                    </div>
                                                    <Tooltip title={item.columnAlias || item.columnName} getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                                        <span>{item.columnAlias || item.columnName}</span>
                                                    </Tooltip>
                                                </li>
                                            )) : <div className='codeBlank'>
                                                <div className='box'>
                                                    <img src={selectblank1} alt="" />
                                                    <div className='text'>{ t('common.selectTableFromLeft') }</div>
                                                </div>
                                            </div>
                                        }
                                    </ul>
                                    </Spin>
                                </div>
                                <div className='right-area'>
                                    <Spin spinning={rightTableLoading}>
                                        <div className='rightTable'>
                                            {
                                                mergeData.tableColumns && mergeData.tableColumns.length > 0 ?
                                                    <myTable
                                                        tableColumns={mergeData.tableColumns || []}
                                                        tableData={mergeData.tableData || []}
                                                    /> : <div className='tableBlank'>
                                                        <div className='box'>
                                                            <img src={selectblank1} alt="" />
                                                            <div className='text'>{ t('common.selectTableCodeFromLeft') }</div>
                                                        </div>
                                                    </div>
                                            }
                                        </div>
                                    </Spin>
                                </div>
                            </div>
                        </div>

                        <div class="popuBottom shadowBox">
                            <myButton class="fr mr25" onClick={onOk} type="primary">{ t('common.confirm') }</myButton>
                            <myButton class="fr mr25" onClick={cancel}>{ t('common.cancel') }</myButton>
                        </div>
                    </div>
                </div>
                : null
        )
    }
})