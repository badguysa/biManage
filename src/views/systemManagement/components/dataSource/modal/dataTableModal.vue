<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import myModal from '@/components/myModal'
import { getTableList } from '@/apis/dataSourceManage'
import { standardApplyTableList ,cancelRelat } from '@/apis/dataStandard'
import noData from '@/components/noData'
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router'
import { getGroupListApi } from '@/apis/group'
import { innerJumpToMenu, outJumpToMenu } from '@/hooks/dataCenter/useGoMenuItem'
import customTabs from '@/components/customTabs/index.vue'

const { t } = useI18n()
const router = useRouter()
const emits = defineEmits(['modalCancel'])

const props = defineProps({
  sourceId:{
    type: String
  },
  // sourceType 默认为0  0：数据源  1：数据标准
  sourceType: {
    type: Number,
    default: 0
  }
})

const dataTableList = ref([])

const current = ref(1)
const treeData = ref()
const total = ref(1)
const spinning = ref(false)
const pageSize = ref(20)
const tabList = ref([
  {name: '正在使用',key: '0'},
  {name: '历史使用',key: '1'}
])
const activeKey = ref('0')

onMounted(() => {
  getList()
})

const getList = async () => {
  spinning.value = true
  let api = null
  let data = {
    sourceId: props.sourceId,
    pageSize: pageSize.value,
    pageNum: current.value
  }
  if(!props.sourceType){
    api = getTableList
  } else {
    api = standardApplyTableList
    if(activeKey.value === '1'){
      data.deleted = 1
    }else{
      data.deleted = 0
    }
  }  
  const res = await api(data)
  if(res.code === 1 ){
    if(!props.sourceType){
      dataTableList.value = res.data || []
      total.value = parseInt(res.extendData.total)
    }else{
      dataTableList.value = res.data.records || []
      total.value = res.data.total
    }
    spinning.value = false
  }else{
    message.error(res.message)
  }
}

const cancelRelation = async (id)=>{
  let data = {
    stableId: props.sourceId,
    tableId: id
  }
  let res = await cancelRelat(data)
  if(res.code === 1){
    message.success('取消关联成功')
    await getList()
  }
}

const getTreeData = async ()=>{
  const res = await getGroupListApi()
  if(res.code ==1 ){
    treeData.value = res.data
  }
}

const jumpTo = async(currentItem) => {
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
    emits('modalCancel')
    return
  } else if(menuItem){
    outJumpToMenu( menuItem, currentItem, router)
    emits('modalCancel')
    return
  }
}

const onCancel = () => {
  emits('modalCancel')
}
watch(()=>activeKey.value, () => {
  getList()
})
</script>

<template>
  <myModal modalName="应用数据表" @onCancel="onCancel" :showBottom="false" width="640px">
    <template #modal-body>
      <div class="tableWrap" :class="{'sourceTypeTableWrap' : props.sourceType}">
      <!-- 只有系统管理-数据标准-标准管理的时候才显示customTabs -->
      <div v-if="props.sourceType">
        <customTabs v-model:tab-list="tabList" v-model:active-key="activeKey"/>
      </div>
        <a-spin :spinning="spinning">
          <div class="tableContainer">
            <table v-if="dataTableList.length">
              <tr>
                <td>序号</td>
                <td>数据表名</td>
                <td>路径</td>
                <td v-if="activeKey == 0">操作</td>
              </tr>
              <tr v-for="(item, index) in dataTableList">
                <td>{{ index + 1 + (current-1)*pageSize }}</td>
                <td :title="!props.sourceType ? item?.tableAlias : item.name">{{ !props.sourceType ? item?.tableAlias : item.name }}</td>
                <td :title="item.path">
                  <div class="path">
                    <span>{{ item.path }}</span>
                    <img v-if="props.sourceType && item.path != '回收站'" class="img" @click="jumpTo(item)" src="@/assets/icons/right_arrow.png" alt="" />
                  </div>
                </td>
                <td v-if="activeKey == 0">
                    <span class="cancel" @click="cancelRelation(item.id)">取消关联</span>                  
                </td>
              </tr>
            </table>
            <noData v-else/>
          </div>
          <div class="pageWrap" v-if="total > pageSize">
            <a-pagination
              v-model:current="current"
              :total="total"
              :pageSize="pageSize"
              show-less-items
              @change="getList"
            />
          </div>
        </a-spin>
      </div>
     
    </template>
  </myModal>
</template>

<style lang="less" scoped>
.tableWrap {
  font-size: 13px;
  height: 427px;
  padding: 24px;
  padding-right: 0;
  &.sourceTypeTableWrap{
    height: 463px;
    .ant-spin-nested-loading{
      height: calc(100% - 20px);
      :deep(.ant-spin-container){
        height: calc(100% - 20px);
      }
    }
  }
  .ant-spin-nested-loading{
    height: 100%;
    :deep(.ant-spin-container){
      height: 100%;
    }
  }
  .tableContainer {
    height: calc(100% - 50px);
    overflow-y: auto;
    padding-right: 24px;
    table {
      width: 100%;
      border-collapse: collapse;
      tr {
        &:nth-of-type(odd) {
          background-color: #f7faff;
        }
        &:first-of-type {
          font-weight: 600;
          background-color: #ecf3ff;
        }
        th,
        td {
          max-width: 200px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          padding: 10px 12px;
          border: 1px solid #e0ebff;
          width: calc(100% / 3);
          .cancel {
            color: #2B67FF;
            cursor: pointer;
          }
          .path{
            display: flex;
            align-items: center;
            padding-right: 26px;
            &:hover .img{
              display: block;
            }
            .img{
              display: none;
              width: 16px;
              margin-left: 10px;
              height: 16px;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
  .pageWrap {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    &>ul{
      display: flex;
    }
  }
}
</style>
