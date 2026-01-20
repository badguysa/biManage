<script setup>
import { message } from 'ant-design-vue'
import back from '@/components/back'
import noData from '@/components/noData'
import { getResourceList, applySource } from '@/apis/dataMarket'
import iconButton from '@/components/buttons/iconButton.vue'
import useScrollBottom from '@/hooks/common/useScrollBottom'
import Detail from './detail/index.vue'
import Update from './update/index.vue'
import sourceInfo from './sourceInfo.vue'
import { incrGroupView } from '@/apis/dataStandard/index.js'
import { removeDetail } from '@/apis/dataMarket/index.js'
import createDialog from '@/utils/dialog'
import { mainStore } from '@/Stores/mainStore'
import { useOperateAuth } from '../hook'
import applyData from './applyData'

const useMainStore = mainStore()
const isDetailShow = ref(false)
const isUpdateShow = ref(false)
const hasAuth = useOperateAuth()
const props = defineProps(['tabState', 'groupId'])
const emits = defineEmits(['back'])

const sortList = [
  { title: '默认排序', value: 'default' },
  { title: '浏览量', value: 'view' },
  { title: '申请量', value: 'app' },
  { title: '更新时间', value: 'updateTime' },
]
const sortState = reactive({
  type: 'default',
  flag: 'down'
})

let sourceList = ref([])

let expandIds = ref([])
// 资源组id
let selectId = ref(-1)
// 是否显示数据字典
let dictionaryDisplay = ref(true)

const wrapRef = shallowRef()

let applyPageState = reactive({
  show: false,
  dataInfo: {}
})

const params = reactive({
  current: 1,
  searchVal: '',
  size: 20,
  total: 0
})

const comId = ref('')
const comSource = ref('')

onMounted(() => {
  echoSourceGroup()
  getSourceList()
})

// 触底加载
useScrollBottom('.source-wrap', removeScroll => {
  // 数据加载完毕
  if (sourceList.value.length >= params.total) {
    // removeScroll()
    return
  }
  params.current += 1
  getSourceList()
})

const needSort = computed(() => sortState.type !== 'default')

// 回显资源分组
const echoSourceGroup = () => {
  let currentTab = props.tabState.list[props.tabState.index]
  if (!currentTab) return
  selectId.value = props.groupId
  expandIds.value = [currentTab.id]
}

const getSourceList = (type) => {
  let requestParams = {}
  // 重置查询参数
  if (type === 'reset') {
    params.current = 1
    params.searchVal = ''
  } else if(needSort.value) {
    // 升序 降序
    requestParams[sortState.type] = sortState.flag === 'up'
  }

  requestParams = {
    ...requestParams,
    pageNum: params.current,
    sw: params.searchVal ?? undefined,
    pageSize: params.size,
    groupId: selectId.value
  }

  getResourceList(requestParams).then(res => {
    if (res.code === 1 && res.data?.records) {
      params.total = Number(res.data.total)
      if (type || params.current === 1) {
        sourceList.value = res.data.records
      } else {
        sourceList.value.push(...res.data.records)
      }
    } else {
      message.error(res.message)
    }
  })
}

const expandFn = item => {
  let targetIndex = expandIds.value.findIndex(id => id === item.id)
  if (targetIndex >= 0) {
    return expandIds.value.splice(targetIndex, 1)
  }
  expandIds.value.push(item.id)
}

// 切换分组
const toggleGroup = source => {
  selectId.value = source.id
  // 超管角色进入不需要统计查看计数
  !isSuperManager.value &&
    incrGroupView(source.id).then(res => {
      if (res.code != 1) {
        message.error(res.message)
      }
    })
  getSourceList('reset')
}

const inputFn = () => {
  params.current = 1
  sortState.type = 'default'
  sortState.flag = 'down'
  getSourceList('search')
}

const toggleSortType = item => {
  if (item.value !== 'default' && sortState.type === item.value) {
    sortState.flag = sortState.flag === 'down' ? 'up' : 'down'
  } else {
    sortState.type = item.value
    // 默认降序
    sortState.flag = 'down'
  }
  sortHandle()
}

const sortHandle = () => {
  wrapRef.value.scrollTop = 0
  params.current = 1
  params.searchVal = ''
  getSourceList()
}

const iconColor = (type, flag) => {
  return sortState.type === type && sortState.flag === flag ? '#2b67ff' : '#ACB4BF'
}

// 新增
const newSourceFn = () => {
  comId.value = ''
  isUpdateShow.value = true
}

// 编辑
const editSource = (source) => {
  comId.value = source.id
  isUpdateShow.value = true
}

// 删除
const deleteSource = (source) => {
  createDialog({
    title: '提示',
    content: '确定删除？',
    okText: '删除',
    cancelText: '取消'
  })
    .then(() => {
      removeDetail({
        ids: source.id,
        groupId: selectId.value
      }).then(res => {
        if (res.code !== 1) {
          return message.error(res.message)
        }
        setTimeout(() => {
          getSourceList('reset')
        }, 400)
      })
    })
    .catch(e => {
      console.log('e', e)
    })
}

// 申请使用
const applyFn = (source) => {
  applyPageState.show = true
  applyPageState.dataInfo = source
}

const applyBackFn = () => {
  applyPageState.show = false
}

const clickSource = source => {
  dictionaryDisplay.value = source.dictionaryDisplay
  comId.value = source.id
  comSource.value = source
  isDetailShow.value = true
}

const isSuperManager = computed(() => useMainStore.isSuperManager)

defineExpose({
  // 查看数据源详情
  viewSourceDetail: async (source) => {
    // 分组高亮
    echoSourceGroup()
    await nextTick()
    // 显示详情
    clickSource(source)
  }
})
</script>

<template>
  <div class="group-wrap" v-show="!applyPageState.show">
    <back @backFn="$emit('back')" />
    <div class="main-container">
      <!-- 资源分组 -->
      <div class="list-wrap">
        <div class="source-group" v-for="group in tabState.list" @click="expandFn(group)">
          <div :class="{ 'group-item': true, expand: expandIds.includes(group.id) }">
            <span :title="group.title">{{ group.name }}</span>
            <BiIcon v-if="!expandIds.includes(group.id)" name="downArrow" />
            <BiIcon v-else name="upArrow" />
          </div>
          <div v-if="group.subList.length && expandIds.includes(group.id)">
            <div
              :class="{ 'list-item': true, active: selectId === item.id }"
              v-for="item in group.subList"
              @click.stop="toggleGroup(item)"
            >
              <span :title="item.title">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 分组下资源列表 -->
      <div class="group-list">
        <div class="operate">
          <div class="top">
            <BiInput
              style="width: 220px"
              v-model="params.searchVal"
              placeholder="搜索"
              @input="inputFn"
              @search="getSourceList('search')"
              canSearch
            />
            <iconButton v-if="hasAuth" title="新建" @addFn="newSourceFn" />
          </div>
          <div class="bottom">
            <span class="total"
              >共<i>{{ params.total }}</i
              >个信息资源目录</span
            >
            <div class="sort-container">
              <div
                :class="{ 'sort-active': sortState.type === item.value }"
                v-for="item in sortList"
                @click="toggleSortType(item)"
              >
                <span>{{ item.title }}</span>
                <span v-if="item.value !== 'default'" class="icon-wrap">
                  <BiIcon name="dropUp" :color="iconColor(item.value, 'up')" />
                  <BiIcon name="dropDown" :color="iconColor(item.value, 'down')" />
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- 资源列表 -->
        <div class="source-wrap" ref="wrapRef">
          <div v-if="sourceList.length" class="source-container">
            <div class="source-item" v-for="source in sourceList" @click="clickSource(source)">
              <div class="top">
                <span class="name" :title="source.name">{{ source.name }}</span>
                <template v-if="hasAuth">
                  <div class="operate-btn" @click.stop="editSource(source)">
                    <BiIcon color="#2b67ff" name="edit"/>
                    <i>编辑</i>
                  </div>
                  <div class="operate-btn remove" @click.stop="deleteSource(source)">
                    <BiIcon color="#f33131" name="remove"/>
                    <i>删除</i>
                  </div>
                </template>
                <!-- 游客申请使用 -->
                <template v-else>
                  <div class="operate-btn" @click.stop="applyFn(source)">
                    <BiIcon name="addOperate"/>
                    <i>申请使用</i>
                  </div>
                </template>
              </div>
              <sourceInfo :source="source" />
            </div>
          </div>
          <noData v-else />
        </div>
        
      </div>
    </div>
    <Detail
      v-model:isShow="isDetailShow"
      v-model:id="comId"
      v-model:source="comSource"
      :showDict="dictionaryDisplay"
      @replyFn="applyFn"
      @refreshList="getSourceList"
    />
    <Update
      v-model:isShow="isUpdateShow"
      v-model:id="comId"
      v-model:groupId="selectId"
      @refreshList="getSourceList"
    />
  </div>
  <!-- 申请资源 -->
  <applyData v-if="applyPageState.show" @back="applyBackFn" :dataInfo="applyPageState.dataInfo"/>
</template>

<style lang="less" scoped>
.group-wrap {
  background-color: #fff;
  height: calc(100% - 36px);
  display: flex;
  flex-direction: column;
  position: relative;
  .main-container {
    display: flex;
    flex-grow: 1;
    height: calc(100% - 36px);
    .list-wrap {
      width: 200px;
      border-right: 1px solid #f0f0f0;
      padding: 10px 0;
      flex-shrink: 0;
      overflow: auto;
      .source-group {
        .group-item,
        .list-item {
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          color: #3e4959;
          &.expand {
            color: #2b67ff;
            font-weight: 500;
            svg {
              fill: #2b67ff;
            }
          }
          &.active {
            color: #2b67ff;
            font-weight: 500;
            background-color: #e8f2ff;
          }
          & > span {
            width: 90%;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            word-break: break-all;
          }
          &:hover {
            background-color: #e8f2ff;
            color: #2b67ff;
            font-weight: 500;
            svg {
              fill: #2b67ff;
            }
          }
          svg {
            flex-shrink: 0;
            width: 12px;
            height: 12px;
          }
        }
      }
    }
    .group-list {
      flex-grow: 1;
      padding: 10px;
      overflow: hidden;
      min-width: 500px;
      .operate {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: 85px;
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .bi-button{
            gap: 4px;
            :deep(svg){
              width: 14px;
              height: 14px;
            }
          }
        }
        .bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .total {
            font-size: 12px;
            i {
              font-style: normal;
              color: #2b67ff;
              margin: 0 2px;
            }
          }
          .sort-container {
            display: flex;
            align-items: center;
            gap: 20px;
            font-size: 14px;
            user-select: none;
            & > div {
              display: flex;
              align-items: center;
              gap: 4px;
              cursor: pointer;
              cursor: pointer;
              &.sort-active {
                color: #2b67ff;
              }
            }
            .icon-wrap {
              display: flex;
              flex-direction: column;
              svg {
                width: 8px;
                height: 8px;
              }
            }
          }
        }
      }
    }
    .source-wrap {
      height: calc(100% - 85px);
      overflow-y: auto;
    }
    .source-container {
      .source-item {
        cursor: pointer;
        padding: 12px 16px;
        &:hover{
          background-color: #FAFAFA;
        }
        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          & > span {
            color: #000000cc;
            font-size: 14px;
            font-weight: 600;
          }
          .name {
            font-size: 16px;
            max-width: 70%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .operate-btn{
            display: flex;
            align-items: center;
            gap: 4px;
            svg{
              width: 14px;
              height: 14px;
            }
            i{
              font-style: normal;
            }
            &:first-of-type {
              margin-left: auto;
              margin-right: 20px;
              color: #2b67ff;
            }
            &.remove {
              color: #f33131;
            }
          }
        }
      }
    }
  }
}
</style>
