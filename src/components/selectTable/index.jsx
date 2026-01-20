import { defineComponent, onMounted, reactive, computed, toRefs, ref, toRaw, h } from 'vue'
import { Tree, Spin, Tooltip } from 'ant-design-vue'
import { SyncOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { mainStore } from '@/Stores/mainStore';
import { getTableList, getGroupListApi } from '@/apis/group'
import { getCodeList, getPreviewData } from '@/apis/config';
import { getTableImg, getimgType } from '@/utils/utils'
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import searchImg from '@/assets/icons/search.png'
import myButton from '../buttons/myButton.vue'
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid'
import './index.less'
import { nodeClickHandle } from '@/utils/treeUtil'

export default defineComponent({
    name: 'selectTable',
    components: {
        myButton
    },
    emits: ['closeModal', 'sendCodes', 'scrollFn'],
    setup(props, { emit }) {
        const useMainStore = mainStore()
        const { leftMenuList } = storeToRefs(useMainStore)
        const { t } = useI18n()
        const indicator = h(LoadingOutlined, {
            style: {
            fontSize: '14px',
            },
            spin: true,
        });
        const scrollLoading = ref(false)
        const state = reactive({
            tableid: '',
            showElem: false,
            tableList: [],
            searchText: '',
            searchPageNum: 1, // 搜索的分页
            searchTotal: 0, // 判断搜索状态下的触底
            selectedKeys: [],
            // expandedKeys: [leftMenuList.value[0]?.id],
            expandedKeys: [],
            treeData: [],
            codeList: [],
            codeBackList: [],
            rightCodeArray: [],
            rightTableLoading: false,
            rightCodeLoading: false,
            tableColumns: [],
            tableData: [],
            selectCodes: [],
            selectedTable: {}
        })
        const selectedNum = computed(() => {
            if (state.codeBackList && state.codeBackList.length > 0) {
                return state.codeBackList && state.codeBackList.filter(i => i.isSelect).length
            }
            return 0
        })
        onMounted(() => {
            loadTreeData()
        })
        const codeSearch = (event) => {
            const value = event.target.value.trim()
            if (value) {
                state.codeList = state.codeBackList.filter(item => 
                    item.columnAlias ? item.columnAlias.indexOf(value.trim()) > -1 : item.columnName.indexOf(value.trim()) > -1
                )
            } else {
                state.codeList = state.codeBackList
            }
        }
        const loadTreeData = () => {
            getGroupListApi().then(res => {
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
                    // console.log('state.treeData', state.treeData);
                }
            })
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
            emit('closeModal')
        }
        const onOk = () => {
            if (state.codeList.length) {
                emit('sendCodes', state.selectedTable)
                emit('closeModal')
                emit('scrollFn')
            }
        }
        const selfGetCodeList = (params) => {
            state.rightCodeLoading = true
            state.tableColumns = []
            state.tableData = []
            state.selectCodes = []
            getCodeList(params).then(res => {
                if (res.code == 1) {
                    res.data.length && res.data.forEach(item => {
                        item.isSelect = false
                        item.imgType = getimgType(item.columnType)
                    })
                    state.codeList = res.data
                    state.codeBackList = state.codeList
                    state.selectedTable.codeList = state.codeList
                } else {
                    message.error(res.message)
                }
                state.rightCodeLoading = false
            })
        }
        const onSelect = (key, data) => {
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
            state.tableid = key[0]
            const record = {
                tableId: key[0]
            }
            state.selectedKeys = key
            state.selectedTable.table = data.node.dataRef
            if (key.length) {
                selfGetCodeList(record)
            } else {
                state.codeList = []
                state.codeBackList = []
                state.tableColumns = []
                state.tableData = []
            }
        }
        const onTableSelect = record => {
            state.selectedTable.table = record
            state.tableid = record.id
            const params = {
                tableId: record.id
            }
            state.selectedKeys = [record.id]
            selfGetCodeList(params)
        }
        const onExpandKeys = expandedKeys => {
            state.expandedKeys = expandedKeys
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
        const selfGetPreviewData = (selectConfig) => {
            state.rightTableLoading = true
            getPreviewData([selectConfig]).then(res => {
                if (res.code == 1) {
                    state.tableColumns = []
                    state.tableData = []
                    const columns = res.data.targetTableColumns
                    for (let key in columns) {
                        columns[key].dataIndex = key
                        columns[key].imgType = getimgType(columns[key].columnType)
                        state.tableColumns.push(columns[key])
                    }
                    state.tableData = res.data.queryResult || []
                } else {
                    message.error(res.message)
                }
                state.rightTableLoading = false
            })
        }
        const selectCode = record => {
            record.isSelect = !record.isSelect
            let columns = []
            state.codeBackList.forEach(item => {
                if (item.isSelect) {
                    columns.push(item.columnName)
                }
            })
            state.selectCodes = state.codeBackList.filter(i => i.isSelect)
            const selectConfig = {
                action: "select",
                contents: {
                    tableId: state.tableid, //表ID
                    columns//用户选择的列名
                }
            }
            selfGetPreviewData(selectConfig)
        }
        const selectAll = type => {
            if (type === 1) {
                let columns = []
                state.codeBackList.forEach(item => {
                    item.isSelect = true
                    columns.push(item.columnName)
                })
                state.selectCodes = state.codeBackList.filter(i => i.isSelect)
                const selectConfig = {
                    action: "select",
                    contents: {
                        tableId: state.tableid,
                        columns
                    }
                }
                selfGetPreviewData(selectConfig)
            } else {
                state.codeBackList.forEach(item => {
                    item.isSelect = false
                })
                const selectConfig = {
                    action: "select",
                    contents: {
                        tableId: state.tableid,
                        columns: []
                    }
                }
                state.selectCodes = []
                selfGetPreviewData(selectConfig)
            }
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
            clickTitleFn,
            expandFn,
            ...toRefs(state),
            leftMenuList,
            selectedNum,
            indicator,
            scrollLoading
        }
    },
    render() {
        const { onSearch, treeUlScroll, cancel, onSelect, onLoadData, onOk, onExpandKeys, tableSearchChange, onTableSelect, t, expandFn, clickTitleFn} = this
        const { expandedKeys, selectedKeys, searchTotal, indicator, scrollLoading, tableList, tableid, treeData} = this
        return (
            <div className='selectTable'>
                <div class="maskLayer"></div>
                <div class="popDiv divWidth">
                    <div class="popuHead">
                        <span class="popClose fr" onClick={cancel}><img style={{ width: '16px' }} src={closeImg} /></span>
                        <p class="fl colorDeep">{ t('common.selectTable') }</p>
                    </div>
                    <div className='modalBody'>
                        <div className='leftTree'>
                            <div className='search'>
                                <input type="text" onChange={tableSearchChange} placeholder={t('common.search')} />
                                <img onClick={onSearch} class="sear" src={searchImg} alt="" />
                            </div>
                            <div className='tableUl' style={{ display: tableList.length ? 'none' : 'block' }}>
                                <Tree
                                    treeData={treeData}
                                    onSelect={onSelect}
                                    selectedKeys={selectedKeys}
                                    expandedKeys={expandedKeys}
                                    onUpdate:expandedKeys={expandFn}
                                    onExpand={onExpandKeys}
                                    loadData={onLoadData}
                                >
                                    {{
                                        'title': ({ title, dataRef }) => {
                                            let treeNode = null
                                            if (dataRef.xpath == '-1') {
                                                treeNode = <span className="outTreeTitle" title={title} onClick={(e) => clickTitleFn(e, dataRef)}>{ title }</span>
                                            } else if (dataRef.xpath && dataRef.xpath != '-1') {
                                                treeNode = <span className="child" onClick={(e) => clickTitleFn(e, dataRef)}>{ title }</span>
                                            } else if (dataRef.tip) {
                                                treeNode = <span type="bottom" className="tree-bottom">{ title }</span> 
                                            } else if (dataRef.loadMore) {
                                                treeNode = <span style={{color: 'rgba(0,0,0,.8)'}}><SyncOutlined />&nbsp;{ title }</span>
                                            } else {
                                                treeNode = (<div className='text-box' title={title} groupid={dataRef.groupId} id={dataRef.id}>
                                                    <img className='lefticon' src={dataRef.imgSrc} alt="" />
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
                                            <div class="text-box">
                                                <img class="lefticon" src={item.imgSrc} alt="" />
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
                    </div>

                    <div class="popuBottom shadowBox">
                        <myButton class="fr mr25" onClick={onOk} type="primary">{ t('common.confirm') }</myButton>
                        <myButton class="fr mr25" onClick={cancel}>{ t('common.cancel') }</myButton>
                    </div>
                </div>
            </div>
        )
    }
})