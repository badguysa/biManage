<template>
  <div class="background" v-if="isShow">
    <div class="back">
      <div class="backbox" @click="change(false)"><img src="@/assets/icons/return.png" alt="">{{ t('common.back') }}
      </div>
    </div>
    <div class="content">
      <div class="setting">
        <div class="left">
          <div class="title">
            {{ id.length ==0 ? t('dataMarket.addResource') : t('dataMarket.upDateResource') }}
          </div>
          <div class="info">
            <div>
              <span class="text">{{ t('dataMarket.resourceName') }}</span>
              <input v-model="headerInfo.name" class="ipt" style="width: 25vw ;" type="text" :placeholder="t('dataMarket.resourceName')">
            </div>
            <div> 
              <span class="text">{{ t('dataMarket.description') }}</span>
              <input v-model="headerInfo.description" class="ipt" style="width: 25vw ;" type="text"
                :placeholder="t('dataMarket.description')">
            </div>
          </div>

          <div class="info">
              <span class="text" style="margin-right: 0;">{{ t('dataMarket.dataNum') }}</span>
              <counterInput v-model="headerInfo.dataNum" :minValue="0" :maxValue="100" />
              <span class="text">{{ t('dataMarket.line') }}</span>
          </div>

          <div class="checkBox">
            <span class="text">{{ t('dataMarket.visable') }}</span>
            <a-checkbox-group v-model:value="headerInfo.roles">
              <a-checkbox value="1"><span class="text">{{ t('dataMarket.download') }}</span></a-checkbox>
              <a-checkbox value="2"><span class="text">{{ t('dataMarket.api') }}</span></a-checkbox>
            </a-checkbox-group>
          </div>
          
          <div class="checkBox">
              <span class="text">数据字典显示</span>
              <a-switch v-model:checked="headerInfo.dictionaryDisplay" />
          </div>
        </div>
        <div class="right">
          <div style="text-align: right;">
            <myButton style="margin-right: 20px;" type="primary" @click="confirm()">
              {{ t('dataMarket.confirm') }}
            </myButton>
          </div>
        </div>

      </div>
      <div class="tableCode">
        <!-- 选表 -->
        <div class="selectTable">
          <div class="text">{{ t('common.selectTable') }}</div>
          <div class="search">
            <input type="text" v-model.trim="state.searchText" :placeholder="t('common.search')">
            <img class="sear" src="@/assets/icons/search.png" alt="">
          </div>
          <ul class="tableUl" ref="treeUlRef" @scroll="treeUlScroll"
            v-show="state.tableList.length && state.searchText">
            <li v-for="item in state.tableList" :class="[
              item.id === tableId ? 'tableLi activeTable' : 'tableLi',
              item.ulBottom ? 'bottom-item' : '',
            ]" :key="item.id" @click="onTableSelect(item)">
              <div :class="selectTableWrapClass(item)" :title="item.tableAlias">
                <BiIcon :class="selectTableIconClass(item)" :name="item.iconName" />
                <span class="text-long">{{ item.tableAlias }}</span>
              </div>
            </li>
            <div class="loading-text"
              v-if="state.searchTotal === state.tableList.length && state.tableList.length > 30">{{
                t('common.reachBottom') }}</div>
            <div class="loading-text" v-if="scrollLoading"><a-spin :indicator="indicator" />{{ t('common.scrollLoading')
              }}</div>
          </ul>

          <div class="tableUl" ref="treeRef" v-show="!state.tableList.length && !state.searchText" @scroll="treeScroll">
            <a-tree :tree-data="state.treeData" v-model:expandedKeys="state.expandedKeys"
              :selectedKeys="state.selectedKeys" :load-data="onLoadData" @load="loadHandle" @select="onSelect">
              <template #title="{ title, key, dataRef }">
                <span v-if="dataRef.xpath == '-1'" :title="title" class="outTreeTitle"
                  @click="clickTitleFn($event, dataRef)"> {{ title }}</span>
                <span v-else-if="dataRef.xpath && dataRef.xpath != '-1'" :title="title" class="child"
                  @click="clickTitleFn($event, dataRef)"> {{ title }}</span>
                <span v-else-if="dataRef.tip" type="bottom" class="tree-bottom">{{ title }}</span>
                <span style="color: rgba(0,0,0,.8);" v-else-if="dataRef.loadMore">
                  <SyncOutlined />&nbsp;{{ title }}
                </span>
                <div :class="selectTableWrapClass(dataRef)" :title="title" :groupid="dataRef.groupId" :id="dataRef.id"
                  v-else>
                  <BiIcon :class="selectTableIconClass(dataRef)" :name="dataRef.iconName" />
                  <span class='text-long'>{{ title }}</span>
                </div>
              </template>
            </a-tree>
          </div>
        </div>
        <!-- 选字段 -->
        <div class="selectCode" v-if="codeList.length">
          <div class="text">{{ t('selfConfig.selectCode') }}</div>
          <div class="search">
            <input type="text" v-model="state.codeText" :placeholder="t('common.search')">
            <img class="sear" src="@/assets/icons/search.png" alt="">
          </div>
          <div class="select-all">
            <img @click="selectAll(1)" v-if="selectedNum === 0" style="width: 16px" src="@/assets/icons/not_select.png"
              alt="">
            <img @click="selectAll(2)" v-else-if="selectedNum === codeBackList.length" style="width: 16px"
              src="@/assets/icons/is_select.png" alt="">
            <img @click="selectAll(3)" v-else style="width: 16px" src="@/assets/icons/doing_select.png" alt="">
            {{ t('common.selectAll') }}
          </div>
          <ul class="codeUl">
            <li :class="{ codeLi: true, errorCol: !!item.errorColumn }" v-for="item in codeList" :key="item.id"
              @click="selectCode(item)">
              <img class="check-input" v-if="item.isSelect" src="@/assets/icons/is_select.png" alt="">
              <img class="check-input" v-else src="@/assets/icons/not_select.png" alt="">
              <div class="iconWrap">
                <BiIcon :name="getTypeIconSvg(item)" :class="getTypeIconClassName(item)" />
              </div>
              <span :title="item.columnAlias || item.columnName">{{ item.columnAlias || item.columnName }}</span>
            </li>
          </ul>
        </div>
        <!-- 数据预览 -->
        <div v-if="!previewColumns.length" class='tableArea'>
          <div className='box'>
            <img src='@/assets/images/img_null.png' alt="" />
            <div class='blank-text'>{{ codeList.length ? t('common.selectTableCodeFromLeft') :
              t('common.selectTableFromLeft')
              }}</div>
          </div>
        </div>
        <preview-table v-else :tableLoading="tableLoading" :tableColumns="previewColumns" :tableData="previewData"
          :totalDataCount="totalDataCount" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { addDmResource, updateDmResource, getDetail } from '@/apis/dataMarket'
import myButton from '@/components/buttons/myButton.vue'
import { useI18n } from 'vue-i18n';
import { SyncOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { toRefs, reactive, defineProps, defineEmits, h, watch, ref, onMounted, toRaw, computed } from 'vue';
import { getTableList, getGroupListApi, getIndexTableDetail } from '@/apis/group'
import { getimgType, getCodeType } from '@/utils/utils'
import { getCodeList, getPreviewData } from '@/apis/config';
import { getTableImg, getTableSvg, getTypeIconSvg, getTypeIconClassName } from '@/utils/utils'
import { v4 as uuidv4 } from 'uuid'
import { message } from 'ant-design-vue';
import { nodeClickHandle } from '@/utils/treeUtil'
import previewTable from '@/components/selfconfig/previewTable'
import counterInput from '@/components/counterInput'

const props = defineProps(
  [
    'isShow',
    'id',
    'groupId'
])
const { isShow, id, groupId } = toRefs(props)
const { t } = useI18n()
const emit = defineEmits(['update:isShow', 'refreshList'])
const change = (val) => {
  emit('update:isShow', val)
}
const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '14px',
  },
  spin: true,
});
const headerInfo = ref({
  name: '',
  description: '',
  roles: ['1'],
  dataNum: 1,
  targetTableColumns: {},
  dictionaryDisplay: true
})
// 下方组件相关的参数
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
const codeList = ref([]) //渲染的经过filter的数据
const codeBackList = ref([]) //原始数据
const previewColumns = ref([])
const tableLoading = ref(false)
const previewData = ref([])
const totalDataCount = ref(0)
const tableId = ref('')
const sourceTableId = computed(() => tableId.value)
const selectedNum = computed(() => codeBackList.value.filter(item => item.isSelect).length)

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
// onMounted(async () => {
//   console.log(groupId.value, 'groupId');
//   console.log(id.value, 'id');
  
//   await loadTreeData()
//   await getDetailData()
//   await editInit()
//   await addInit()
// })
const getTableDate = async (params) => {
  let res = await getPreviewData(params)
  let _previewColumns = []
  let _previewData = []
  if (res.code == 1) {
    previewColumns.value = []
    previewData.value = []
    const columns = res.data.targetTableColumns
    headerInfo.value.targetTableColumns = columns
    const sortArr = res.data.columnNames
    for (let val in sortArr) {
      for (let key in columns) {
        if (sortArr[val] == columns[key].columnName) {
          columns[key].dataIndex = key
          columns[key].imgType = getimgType(columns[key].columnType)
          columns[key].type = getCodeType(columns[key].columnType)
          _previewColumns.push(columns[key])
        }
      }
    }
    _previewData = res.data.queryResult || []
    totalDataCount.value = res.extendData?.totalDataCount || 0
    previewColumns.value = _previewColumns
    previewData.value = _previewData
    tableLoading.value = false
  } else {
    previewColumns.value = []
    previewData.value = []
    totalDataCount.value = 0
    tableLoading.value = false
  }
}
const selectCode = async record => {
  record.isSelect = !record.isSelect
  let tableColumns = []
  codeList.value.filter(item => {
    if (item.isSelect) {
      tableColumns.push(item.columnName)
      return item
    }
  })
  let params = [
    {
      action: "select",
      contents: {
        tableId: tableId.value,
        columns: tableColumns
      }
    }
  ]
  getTableDate(params)
}
/**
 * 1 全选 2、3 全不选
 * @param {number} type 
 */
const selectAll = (type) => {
  let params;
  if (type === 1) {
    let columns = []
    codeBackList.value.forEach(item => {
      item.isSelect = true
      columns.push(item.columnName)
    })
    params = [
      {
        action: "select",
        contents: {
          tableId: tableId.value,
          columns
        }
      }
    ]
  } else {
    codeBackList.value.forEach(item => {
      item.isSelect = false
    })
    params = {
      action: "select",
      contents: {
        tableId: tableId.value,
        columns: []
      }
    }
  }
  getTableDate(params)
}
const onSelect = async (record, selectedNodes) => {
  if (selectedNodes.node.dataRef.loadMore) {
    const outIndex = state.treeData.findIndex(item => item.id === selectedNodes.node.dataRef.groupId)
    if (outIndex > -1) {
      onLoadData({ key: state.treeData[outIndex].id, children: [] }, 2, state.treeData[outIndex].pageNum, state.treeData[outIndex])
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
      onLoadData({ key: innerGroup.id, children: [] }, 2, innerGroup.pageNum, innerGroup)
    }
    return
  }
  if (selectedNodes.node.dataRef.pid) return
  state.selectedKeys = record
  codeList.value = []
  codeBackList.value = []
  tableId.value = selectedNodes.node.dataRef.id
  const params = {
    tableId: selectedNodes.node.dataRef.id
  }
  let res = await getCodeList(params)
  if (res.code == 1) {
    // 先处理字段的展示类型
    res.data.length && res.data.forEach(item => {
      item.imgType = getimgType(item.columnType)
      item.type = getCodeType(item.columnType)
    })
    codeList.value = res.data
    codeBackList.value = res.data
  }
  // useConfigStore.setCodeList([], activeTabKey.value)
  // useConfigStore.setPreviewData([], activeTabKey.value)
  // useConfigStore.setPreviewColumns([], activeTabKey.value)
  // if (record.length) {
  //   useConfigStore.setLeftMergeTable(selectedNodes.node.dataRef, activeTabKey.value)
  //   useConfigStore.getCodeList(selectedNodes.node.dataRef, activeTabKey.value)
  // } else {
  //   useConfigStore.setLeftMergeTable({}, activeTabKey.value)
  // }
}

const treeScroll = async () => {
  return
}
const treeUlScroll = () => {
  if (treeUlRef.value.clientHeight + treeUlRef.value.scrollTop >= treeUlRef.value.scrollHeight) {
    state.searchPageNum++
    onSearch('scroll')
  }
}


// 节点数据加载完毕后执行
const loadHandle = async (newLoadedKeys) => {
  let firstRenderNode = newLoadedKeys.length === 1 && newLoadedKeys[0] === tableGroupId.value

  let targetTableId = sourceTableId.value
  if (!firstRenderNode || rootNodeIndex.value === -1) return

  let nodeInfo = null, includeSource = false

  // 循环判断来源表是否包含在当前分组内
  while (1) {
    if (childNodeIndex.value === -1) {   // 来源表位于一级分组
      nodeInfo = state.treeData[rootNodeIndex.value]
    } else {    // 来源表位于二级分组
      nodeInfo = state.treeData[rootNodeIndex.value].children[childNodeIndex.value]
    }
    includeSource = nodeInfo.children.some(it => it.id === targetTableId)
    if (includeSource) {
      break
    }
    await onLoadData({ key: nodeInfo.id }, 2, nodeInfo.pageNum, nodeInfo)
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
      return { ...node, children }
    }
    if (node.children) {
      return { ...node, children: updateTreeData(node.children, key, children) }
    }
    return node
  })
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
// 点击节点名称 展开节点
const clickTitleFn = async (e, dataRef) => {
  nodeClickHandle({
    state, dataRef, e
  }, onLoadData)
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
// 编辑自助配置 自动定位当前编辑表
const editInit = async () => {
  state.selectedKeys = [sourceTableId.value]
  let tableDetailRes = await getIndexTableDetail({ id: sourceTableId.value })
  if (tableDetailRes.code === 1) {
    // 多表合并 左表设置svg图标
    tableDetailRes.data.iconName = getTableSvg(tableDetailRes.data.tableType)
    // // 获取来源表字段
    // useConfigStore.getCodeList(tableDetailRes.data, activeTabKey.value)
    expandGroup(tableDetailRes.data.groupId, sourceTableId.value)

    // state.expandedKeys = [tableDetailRes.data.groupId]
    if (tableId.value.length) {
      await onSelect([tableId.value], {
        node: {
          dataRef: tableDetailRes.data
        }
      })
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


const addInit = () => {
  if (headerInfo.value.targetTableColumns.length) {
    headerInfo.value.targetTableColumns.forEach(item => {
      codeBackList.value.find(i => i.id === item.id).isSelect = true
    })
    let params = [
      {
        action: "select",
        contents: {
          tableId: tableId.value,
          columns: headerInfo.value.targetTableColumns.map(item => item.columnName)
        }
      }
    ]
    getTableDate(params)
  }
}

const selectTableWrapClass = () => {
  return [
    'text-box'
  ]

  // disableSelectSelf(item.id) ? 'selfTable' : '',
  //     selectedTableError(item) ? 'errorItem' : ''
}
const selectTableIconClass = (item) => {
  return [
    'lefticon',
    item.iconName + 'Icon'
  ]
}

const confirm = async () => {
  let columns = []
  Object.keys(headerInfo.value.targetTableColumns).forEach(key => {
    columns.push({
      id: headerInfo.value.targetTableColumns[key].id,
      columnName: headerInfo.value.targetTableColumns[key].columnName,
    })
  });
  if(!columns.length){
    message.warning('请检查信息是否填写完整')
    return
  }
  if(!tableId.value){
    message.warning('请检查信息是否填写完整')
    return
  }
  if(headerInfo.value.roles.length < 1){
    message.warning('请检查信息是否填写完整')
    return
  }
  if(!headerInfo.value.name){
    message.warning('请检查信息是否填写完整')
    return
  }
  let data = {
    tableId: tableId.value,
    dataNum: headerInfo.value.dataNum,
    description: headerInfo.value.description,
    name: headerInfo.value.name,
    visible: headerInfo.value.roles.join(','),
    groupId: groupId.value,
    dictionaryDisplay: headerInfo.value.dictionaryDisplay ? 1 : 0,
    columns
  }  
  let res;
  if (id.value.length) {
    data.id = id.value
    res = await updateDmResource(data)
  } else {
    res = await addDmResource(data)
  }
  if (res.code == 1) {
    message.success('添加成功')
    emit('refreshList', 'reset')
    change(false)
  }
}

const getDetailData = async () => {
  if (!id.value.length) {
    return;
  }
  let res = await getDetail(id.value)
  if (res.code == 1) {
    let data = res.data
    headerInfo.value = {
      name: data.name,
      description: data.description,
      roles: data.visible.split(','),
      dataNum: Number(data.dataNum),
      targetTableColumns: data.columns,
      dictionaryDisplay: (data.dictionaryDisplay === null || data.dictionaryDisplay) ? true : data.dictionaryDisplay
    }
    tableId.value = res.data.tableId
    state.selectedKeys = [res.data.tableId]
  }
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
watch(()=>isShow.value,async(val)=>{
  if(val){
    await loadTreeData()
    await getDetailData()
    await editInit()
    await addInit()
  }else{
    state.treeData = []
    state.selectedKeys = []
    state.expandedKeys = []
    state.searchText = ''
    state.codeText = ''
    state.searching = false
    state.tableList = []
    state.searchPageNum = 1
    state.searchTotal = 0
    state.selectedKeys = []
    state.expandedKeys = []
    state.treeData = []
    treeLoading.value = false
    scrollLoading.value = false
    tableGroupId.value = ''
    rootNodeIndex.value = -1
    childNodeIndex.value = -1
    codeList.value = [] //渲染的经过filter的数据
    codeBackList.value = [] //原始数据
    previewColumns.value = []
    tableLoading.value = false
    previewData.value = []
    totalDataCount.value = 0
    tableId.value = ''
    headerInfo.value = {
      name: '',
      description: '',
      roles: ['1'],
      dataNum: 1,
      targetTableColumns: {}
    }
  }
})
</script>

<style lang="less" scoped>
:deep(.errorItem) {
  .text-long {
    color: #F53F3F;
    font-weight: 500;
  }
}

:deep(.ant-spin-nested-loading) {
  height: 100%;

  .ant-spin-container {
    height: 100%;
  }
}

:deep(.ant-checkbox-checked) {
  .ant-checkbox-inner {
    background: #2B67FF;
  }
}

.point {
  cursor: pointer;
}

.background {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #f2f4fa;

  .back {
    height: 36px;
    padding: 8px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    background-color: #fff;

    .backbox {
      width: 60px;
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

  .content {
    width: 100%;
    height: calc(100% - 36px);

    .setting {
      padding: 12px 16px;
      background-color: #fff;
      width: 100%;
      display: flex;
      justify-content: space-between;
      font-family: PingFang SC;
      font-size: 14px;
      font-weight: normal;

      .left {
        height: 100%;
        width: calc(100%-110px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .title {
          height: 25px;
          font-size: 18px;
          font-weight: bold;
        }


        .info {
          height: 32px;
          display: flex;
          align-items: center;
          margin-top: 10px;

          .text {
            font-size: 14px;
            height: 32px;
            line-height: 32px;
            margin-right: 20px;
          }

          .ipt {
            margin-right: 20px;
          }
        }

        .checkBox {
          height: 18px;
          line-height: 18px;
          margin-top: 10px;
          display: flex;
          gap: 20px;

          .text {
            font-size: 13px;
            line-height: 18px;
            flex-basis: 78px;
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
        }
      }
    }

    .tableCode {
      margin-top: 12px;
      width: 100%;
      height: calc(100% - 201px);
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

        .selfTable {
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


            .iconWrap {
              width: 22px;
              height: 16px;
              margin: 0px 8px;
              flex-shrink: 0;
              position: relative;

              svg {
                width: 16px;
                height: 16px;
              }

              .borderSymbol {
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

          .errorCol {
            span {
              color: #F53F3F;
            }
          }
        }

        .search {
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
        flex: 1;
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
  }
}
</style>