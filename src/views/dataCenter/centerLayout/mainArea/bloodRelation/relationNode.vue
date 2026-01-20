<template>
  <a-tooltip 
    placement="bottomLeft" 
    overlayClassName="relationTooltip" 
    :color="tableError || dataSourceLost ? '#F53F3F': ''"
  >
    <template #title>
      <span v-if="dataSourceLost">{{ t('indexPage.dataSourceDeleted') }}</span>
      <template v-else>
        <span v-if="tableError">{{ t('bloodRelation.currentTableUnuse') }}</span>
        <span>{{ tableNameLabel }}：{{ nodeData.tableAlias ?? '-' }}</span>
        <span v-if="iconName === 'dataSource'">{{ t('indexPage.dataSourceType') }}：{{ nodeData.dataSourceType ?? '-' }}</span>
        <!-- <span>{{ t('indexPage.position') }}：{{ nodeData.tableAlias }}</span> -->
        <span>{{ t('indexPage.createrName') }}：{{ nodeData.createrName ?? '-' }}</span>
        <template v-if="iconName !== 'dataSource'">
          <span>{{ t('apiManage.foundTime') }}：{{ timeFormat(nodeData.createTime) }}</span>
          <span>{{ t('indexPage.lastUpdateTime') }}：{{ timeFormat(nodeData.updateTime) }}</span>
        </template>
      </template>
    </template>
    <div :class="{itemWrapper: true, rootWrapper: nodeType === 'root', errorNode: tableError || dataSourceLost}">
      <BiIcon :name="iconName" :class="[iconName + 'Icon', nodeType + 'Icon']" />
      <span class="itemName">{{ nodeData?.tableAlias }}</span>
      <!-- 丢失数据源不支持跳转 TODO: 数据源支持跳转 -->
      <a-tooltip v-if="nodeType !== 'root' && !dataSourceLost && iconName !== 'dataSource'">
        <template #title>
          <span>{{ t('indexPage.jump') }}</span>
        </template>
        <BiIcon @click="jumpHandle" name="jump" :class="[nodeType + 'Icon', 'jumpIcon']" />
      </a-tooltip>
    </div>
  </a-tooltip>
</template>

<script setup>
import { getTableSvg, formatTime } from '@/utils/utils'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getGroupListApi } from '@/apis/group'
import { innerJumpToMenu, outJumpToMenu } from '@/hooks/dataCenter/useGoMenuItem'
import { databaseMap } from '@/utils/enums'
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'

const useSystemManageStore = systemManageStore()
const useApiManageStore = apiManageStore()
const router = useRouter()
const { t } = useI18n()
const treeData = ref()

const props = defineProps({
  nodeInfo: {
    // 节点信息
    type: Object,
    required: true,
  },
  nodeType: {
    // 节点类型 source/target/root
    type: String,
    default: 'root',
  },
})

const nodeData = computed(() => {
  let nodeInfo = props.nodeInfo
  switch (props.nodeType) {
    case 'source':
      if(!nodeInfo.source) return {}
      // api/db/kafka 血缘展示数据源
      if(nodeInfo.source.apiUrl) {
        nodeInfo.source.dataSourceType = 'API'
        nodeInfo.source.tableAlias = nodeInfo.source.sourceName
        nodeInfo.source.createrName = nodeInfo.createrName
      } else if(nodeInfo.source.dbName) {
        nodeInfo.source.dataSourceType = databaseMap[nodeInfo.source.dbType?.value] || 'DB'
        nodeInfo.source.tableAlias = nodeInfo.source.sourceName
        nodeInfo.source.createrName = nodeInfo.createrName
      } else if(nodeInfo.source.securityProtocol) {
        nodeInfo.source.dataSourceType = 'Kafka'
        nodeInfo.source.tableAlias = nodeInfo.source.sourceName
        nodeInfo.source.createrName = nodeInfo.createrName
      }
      return nodeInfo.source
    case 'root':
      return nodeInfo
    case 'target':
    if (nodeInfo.targetType.value === 0) {  // 自助配置 表

    } else if (nodeInfo.targetType.value === 1) {  // API 表
      nodeInfo.target = {
        ...nodeInfo.target,
        tableAlias: nodeInfo.target?.apiName
      }
    } else if (nodeInfo.targetType.value === 2) {   // 数据推送
      nodeInfo.target = {
        ...nodeInfo.target,
        tableAlias: nodeInfo.target?.name
      }
    }
    return nodeInfo.target ?? {}
  }
})

const iconName = computed(() => {
  let nodeInfo = props.nodeInfo

  if(dataSourceLost.value) return 'dataSource'

  switch (props.nodeType) {
    case 'source':
      // 数据源判断
      if(nodeInfo.source?.apiUrl || nodeInfo.source?.dbName || nodeInfo.source?.securityProtocol) {
       return 'dataSource'
      } 
      return getTableSvg(nodeInfo.source?.tableType)
    case 'root':
      return getTableSvg(nodeInfo?.tableType)
    case 'target':
      if (nodeInfo.targetType.value === 0) {  // 自助配置 表
        return getTableSvg(nodeInfo.target?.tableType)
      } else if (nodeInfo.targetType?.value === 1) {  // API 表
        return 'api'
      } else if (nodeInfo.targetType?.value === 2) {   // 数据推送
        return 'push'
      }
  }
})

// 表名label
const tableNameLabel = computed(() => {
  if(iconName.value === 'api') {
    return t('indexPage.apiTableName')
  }
  if(iconName.value === 'push') {
    return t('indexPage.pushTableName')
  }
  if(iconName.value === 'dataSource') {
    return t('indexPage.dataSourceName')
  }
  return t('indexPage.dataTableName')
})

// 当前表异常
const tableError = computed(() => {
  return nodeData.value?.tableStatus?.value === 4
})

// 数据源被删除
const dataSourceLost = computed(() => {
  return props.nodeType === 'source' && !props.nodeInfo.source
})

const timeFormat = (time) => {
  if(!time) return '-'
  return formatTime(time)
}

const getTreeData = async ()=>{
  const res = await getGroupListApi()
  if(res.code ==1 ){
    treeData.value = res.data
  }
}

// 血缘跳转
const jumpHandle = async() => {
  let currentItem
  const type = props.nodeType
  if(type === 'source'){
    // source: 来源对象
    currentItem = props.nodeInfo.source
  } else if (type === 'target'){
    // target:目标对象
    currentItem = props.nodeInfo.target
  } else {
    // 当前对象
    currentItem = props.nodeInfo
  }
  if (iconName.value === 'api') {
    // 跳转前的配置
    useApiManageStore.setApiPageId('apiManagePage') 
    useApiManageStore.setRelationName(currentItem.apiName)
    useApiManageStore.initApiList()
    // 左侧路由显示修改
    useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.API_MANAGE)
    return router.push('/system/apiManage')
  } else if (iconName.value === 'push'){
    // 跳转前的配置
    useApiManageStore.setApiPageId('pushTopicDetailPage')
    useApiManageStore.resetPushTopicPageNumber()
    useSystemManageStore.getCollection(currentItem.collectionId)
    useApiManageStore.initPushTopicList({
      collectionId: currentItem.collectionId,
      name: currentItem.name,
    })
    // 左侧路由显示修改
    useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.PUSH_MANAGE)
    useApiManageStore.addApiTab({
        name: 'pushManage.pushManage',
        id: SYSTEM_MENU_MAP.PUSH_MANAGE,
        path: '/system/pushManage',
    })
    return router.push('/system/pushManage')
  }
  // 不是push和api的 跳转路由
  if (router.currentRoute.value.path.indexOf('datacenter') !== 1) {
      router.push('/datacenter')
  }
  // 获取左侧menu的值
  await getTreeData()
  let menuItem
  let subMenuItem
  treeData.value.forEach((item) =>{
    if(item.id === currentItem.groupId){
      menuItem = item
    }
    if(item.subList.length>0){
      item.subList.forEach((subItem) => {
        if(subItem.id ===  currentItem.groupId){
          subMenuItem = subItem
          menuItem = item
        }
      })
    }
  })
  if(subMenuItem){
    innerJumpToMenu(menuItem, subMenuItem, currentItem, router)
    return
  } else if(menuItem){
    outJumpToMenu( menuItem, currentItem, router)
    return
  }
}

</script>
<style lang="less">
.relationTooltip {
  .ant-tooltip-inner {
    padding: 8px 12px;
    max-height: unset;
    display: flex;
    flex-direction: column;
  }
}
</style>
<style lang="less" scoped>
.itemWrapper {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  height: 100%;
  border-radius: 4px;
  border: 1px solid #e9e9e9;
  background: #fafafa;
  &.rootWrapper{
    background-color: #2b67ff;
  }
  &.errorNode{
    background: rgba(255, 78, 78, 0.05);
    border: 1px solid rgba(245, 63, 63, 0.2);
    color: #F53F3F;
    &.rootWrapper{
      background-color: #F53F3F;
      color: #fff;
    }
    svg{
      fill: #F53F3F;
    }
    &:hover {
      .jumpIcon{
        stroke: #F53F3F;
      }
    }
  }
  .itemName{
    white-space: nowrap;
  }
  &:hover {
    .jumpIcon {
      opacity: 1;
      pointer-events: unset;
      stroke: #2b67ff;
      outline: none;
      &.rootIcon {
        stroke: #fff;
      }
    }
  }
  .jumpIcon {
    opacity: 0;
    pointer-events: none;
    margin-left: 4px;
    margin-right: 0;
  }
  svg {
    margin-right: 4px;
    &.rootIcon {
      fill: #fff;
    }
  }
}
</style>
