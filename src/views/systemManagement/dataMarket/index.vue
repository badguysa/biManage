<script setup>
import { colorList } from './constants'
import iconButton from '@/components/buttons/iconButton.vue'
import moreMenu from '@/views/systemManagement/components/moreMenu'
import sourceGroup from './components/sourceListPage.vue'
import {
  getStandardLibList,
  addStandardLibApi,
  updateStandardLibApi,
  deleteStandardLibApi,
  incrGroupView
} from '@/apis/dataStandard/index.js'
import { viewApproveRecrod, viewMyApproval} from '@/apis/dataMarket'
import { message } from 'ant-design-vue'
import noData from '@/components/noData'
import createDialog from '@/utils/dialog'
import { debounce } from 'loadsh'
import { mainStore } from '@/Stores/mainStore'
import { useOperateAuth } from './hook'

const useMainStore = mainStore()

const { dataSourceInfo } = storeToRefs(useMainStore)

const hasAuth = useOperateAuth()

let tabState = reactive({
  list: [],
  index: -1
})

let modalState = reactive({
  isEdit: false,
  visible: false,
  flag: 'type',
  sourceName: '',
  colorIndex: 0,
  editId: '-1'
})

let groupState = reactive({
  show: false,
  id: '-1'
})

let searchKw = ref('')

let editState = reactive({
  value: '',
  id: -1
})

let inputRef = ref(null)

const router = useRouter()

let groupRef = ref()

const tabMoreMenuList = [
  {
    title: '编辑',
    handle(target) {
      editFn(target, 'type')
    }
  },
  {
    title: '删除',
    handle(target) {
      deleteFn(target, 'type')
    }
  }
]

const groupMoreMenuList = [
  {
    title: '编辑',
    handle(target) {
      modalState.flag = 'group'
      modalState.colorIndex = target.icon || 0
      modalState.editId = target.id
      modalState.isEdit = true
      modalState.visible = true
      modalState.sourceName = target.name
    }
  },
  {
    title: '删除',
    handle(target) {
      deleteFn(target, 'group')
    }
  }
]


const getList = async () => {
  return new Promise((resolve, reject) => {
    getStandardLibList({ groupType: 1 })
      .then(res => {
        if (res.code == 1) {
          tabState.list = res.data
          if (tabState.list.length >= 1 && tabState.index < 0) {
            tabState.index = 0
          }
        } else {
          message.error(res.message)
        }
        resolve()
      })
      .catch(e => reject(e))
  })
}

const deleteFn = (target, flag) => {
  createDialog({
    title: '提示',
    content: '确定删除？',
    okText: '删除',
    cancelText: '取消'
  })
    .then(() => {
      _delete(target, flag)
    })
    .catch(e => {
      console.log('e', e)
    })
  function _delete(target, flag) {
    deleteStandardLibApi({ ids: target.id, groupType: 1 }).then(async res => {
      if (res.code == 1) {
        await getList()
        // 删除分类
        if (flag === 'type' && tabState.index > 0) {
          tabState.index--
        }
        message.success(res.message)
      } else {
        message.error(res.message)
      }
    })
  }
}

const editFn = async (target, flag) => {
  let list = flag === 'type' ? tabState.list : groupList.value
  let index = list.findIndex(it => it === target)
  if (index < 0) return
  editState.id = target.id
  editState.value = target.name
  await nextTick()
  inputRef.value[0]?.getElm()?.select()
}

const newFn = flag => {
  modalState.visible = true
  modalState.flag = flag
  modalState.isEdit = false
  modalState.sourceName = ''
  modalState.colorIndex = 0
}

// 确认修改名称
const confirmEditFn = item => {
  let isEditGroup = isGroup.value && modalState.isEdit

  editState.id = -1

  if (!isEditGroup && (!item || item.name === editState.value)) {
    return
  }

  updateStandardLibApi({
    pid: item.pid,
    id: item.id,
    icon: isEditGroup ? modalState.colorIndex : undefined,
    name: isEditGroup ? modalState.sourceName : editState.value,
    groupType: 1
  }).then(res => {
    // 编辑分组 重置编辑信息
    if (isEditGroup) {
      modalState.editId = -1
      modalState.isEdit = false
      modalState.visible = false
      modalState.sourceName = ''
    }
    if (res.code == 1) {
      getList()
    } else {
      message.error(res.message)
    }
  })
  editState.value = ''
}

const enterFn = debounce(() => {
  confirmEditFn()
}, 200)

const okFn = debounce(() => {
  let jsonData = {
    name: modalState.sourceName,
    pid: '-1',
    sort: 1,
    xpath: '-1',
    groupType: 1
  }

  let listData = isGroup.value ? groupList.value : tabState.list

  if (!jsonData.name.trim().length) return message.warning('分组名称不能为空')

  // 编辑分组
  if (isGroup.value && modalState.isEdit && modalState.editId > 0) {
    confirmEditFn(groupList.value.find(it => it.id === modalState.editId))
    return
  }

  // sort 排序值:越小越靠前
  if (listData.length > 0) {
    jsonData.sort = listData.at(-1).sort + 1
  }

  // 添加分组
  if (isGroup.value) {
    let targetTab = tabState.list[tabState.index]
    if (!targetTab) {
      console.log('targetTab 不存在')
      return
    }
    jsonData.pid = targetTab.id
    jsonData.xpath = `-1/${targetTab.id}`
    jsonData.icon = modalState.colorIndex
    modalState.colorIndex = 0
  }

  addStandardLibApi(jsonData).then(async res => {
    modalState.sourceName = ''
    if (res.code == 1) {
      message.success(res.message)
      getList()
    } else {
      message.error(res.message)
    }
    modalState.visible = false
  })
}, 200)

// 分组名 模糊匹配
const searchFn = () => {
  let kw = searchKw.value.trim()
  let currentList = tabState.list[tabState.index].subList

  if (!kw.length) {
    getList()
    return
  }

  if (!currentList?.length) return

  tabState.list[tabState.index].subList = currentList.filter(it => it.name.includes(kw))
}

const viewSource = source => {
  groupState.show = true
  groupState.id = source.id
  // 超管角色进入不需要统计查看计数
  !isSuperManager.value &&
    incrGroupView(source.id).then(res => {
      if (res.code != 1) {
        message.error(res.message)
      }
    })
}

const backFn = () => {
  groupState.show = false
  getList()
}

const isGroup = computed(() => modalState.flag === 'group')

const showDetail = computed(() => groupState.show)

const groupList = computed(() => {
  if (tabState.index < 0) return []
  let list = tabState.list[tabState.index]
  if (!list) return []
  return list.subList
})

const isSuperManager = computed(() => useMainStore.isSuperManager)

// 查看提交记录
const viewReocrd = () => {
  let requst = hasAuth.value ? viewMyApproval : viewApproveRecrod
  requst().then(res => {
    if(res.code === 1) {
      window.open(res.message, '_blank ')
    } else {
      message.error(res.message)
    }
  })
}

// 集市api跳转使用
watch(router.currentRoute, async (route) => {
  // 非数据集市页面返回
  if(!['marketManage', 'dataMarket'].includes(route.name)) return

  // 获取集市分组列表 
  await getList()
  let dmResourceInfo = dataSourceInfo.value
  if(!dataSourceInfo.value) return
  // 设置分组信息
  tabState.index = tabState.list.findIndex(it => 
    it.subList.some(s => s.id == dmResourceInfo.groupId)
  )

  // 显示集市列表页
  groupState.show = true
  groupState.id = dmResourceInfo.groupId
  
  await nextTick()
  setTimeout(() => {
    // 跳转对应集市资源详情页
    groupRef.value?.viewSourceDetail(dmResourceInfo)
    useMainStore.setDataSourceInfo(null)
  }, 100)
}, {
  immediate: true
})

</script>

<template>
  <div v-if="!showDetail" class="main-wrap">
    <!-- 资源切换tab -->
    <div class="tab-wrap">
      <div
        :class="{ 'tab-item': true, 'active-tab': index === tabState.index }"
        v-for="(tab, index) in tabState.list"
        :key="tab.id"
        @click="tabState.index = index"
      >
        <span v-if="editState.id !== tab.id" :title="tab.name">{{ tab.name }}</span>
        <BiInput
          v-else
          size="small"
          ref="inputRef"
          style="width: 100px"
          v-model="editState.value"
          @click.stop="() => {}"
          @keydown.enter="enterFn(tab)"
          @blur="confirmEditFn(tab)"
        />
        <moreMenu
          v-if="hasAuth"
          :menuList="tabMoreMenuList"
          :target="tab"
          :offset="[-50, 40]"
        />
      </div>
      <div v-if="hasAuth" class="add" @click="newFn('type')">
        <BiIcon name="addOperate" />
        <span>新建</span>
      </div>
    </div>
    <div v-if="tabState.list.length && tabState.index >= 0" class="content-wrap">
      <div class="operate">
        <BiInput
          style="width: 220px"
          v-model="searchKw"
          placeholder="搜索"
          @input="searchFn"
          @search="searchFn"
          canSearch
        />
        <div class="apply-recod">
          <BiIcon name="form" color="#2b67ff"/>
          <span @click="viewReocrd">{{ hasAuth ? '申请记录' : '提交记录' }}</span>
        </div>
        <iconButton v-if="hasAuth" title="新建" @addFn="newFn('group')" />
      </div>
      <!-- 资源分组 -->
      <div class="content" v-if="groupList.length">
        <div class="source-item" v-for="source in groupList" @click="viewSource(source)">
          <div class="top">
            <span class="icon-wrap" :style="{ background: colorList[source.icon] ?? colorList[0] }">
              <BiIcon name="bag" />
            </span>
            <span class="source-name" :title="source.name">{{ source.name }}</span>
            <moreMenu
              v-if="hasAuth"
              :menuList="groupMoreMenuList"
              :target="source"
            />
            <BiIcon class="enter-icon" v-else name="rightArrow" />
          </div>
          <div class="bottom">
            <span class="table-num"
              ><i>{{ source.counts }}</i
              >个数据表</span
            >
            <span class="view-num">
              <BiIcon name="eye" />
              {{ source.views }} 人次
            </span>
          </div>
        </div>
      </div>
      <noData v-else />
    </div>
    <noData v-else />
  </div>

  <!-- 添加弹窗 -->
  <BiModal
    :title="modalState.isEdit ? '编辑' : '添加'"
    v-model:visible="modalState.visible"
    @ok="okFn"
  >
    <div v-if="isGroup || modalState.isEdit" class="content-item">
      <span>图标颜色</span>
      <div class="color-wrap">
        <span
          :class="{ activeColor: modalState.colorIndex == i }"
          v-for="(c, i) in colorList"
          @click="modalState.colorIndex = i"
        >
          <i :style="{ background: c }"></i>
        </span>
      </div>
    </div>
    <div class="content-item">
      <span>资源{{ isGroup || modalState.isEdit ? '组' : '类' }}名称</span>
      <BiInput v-model="modalState.sourceName" placeholder="请输入" @keydown.enter="okFn" />
    </div>
  </BiModal>

  <!-- 资源组详情 -->
  <sourceGroup
    ref="groupRef"
    v-if="groupState.show"
    :tabState="tabState"
    :groupId="groupState.id"
    @back="backFn"
  />
</template>

<style lang="less" scoped>
.main-wrap {
  background-color: #fff;
  height: calc(100% - 36px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  .tab-wrap {
    display: flex;
    flex-wrap: wrap;
    border-bottom: 1px solid #f2f2f2;
    .tab-item {
      padding: 16.5px 20px;
      font-size: 15px;
      color: #828c99;
      display: flex;
      align-items: center;
      cursor: default;
      position: relative;
      padding-right: 20px;
      & > span {
        max-width: 200px;
        overflow: hidden;
        white-space: nowrap;
        line-height: 21px;
        text-overflow: ellipsis;
        cursor: pointer;
      }
      &.active-tab {
        & > span {
          color: #0a2040;
          font-weight: 500;
        }
        &::after {
          content: '';
          display: inline-block;
          background-color: #2b67ff;
          width: 30%;
          max-width: 50px;
          height: 3.6px;
          border-radius: 2px;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
      }
      &:hover {
        :deep(svg) {
          display: block;
        }
      }
    }
    .add {
      color: #2b67ff;
      font-size: 14px;
      padding: 16.5px 20px;
      display: flex;
      align-items: center;
      cursor: pointer;
      gap: 4px;
      span {
        line-height: 21px;
      }
      svg {
        width: 13px;
        height: 13px;
      }
    }
  }
  .content-wrap {
    padding: 20px;
    height: calc(100% - 55px);
    display: flex;
    flex-direction: column;
    .operate {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      .apply-recod{
        display: inline-flex;
        gap: 4px;
        align-items: center;
        margin-left: auto;
        font-size: 15px;
        color: #2b67ff;
        cursor: pointer;
        svg{
          width: 14px;
          height: 14px;
        }
      }
      .bi-button{
        margin-left: 20px;
      }
    }
    .content {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      // 用于解决最后一行更多菜单展示不全问题
      padding-bottom: 60px;
      overflow: auto;
      .source-item {
        width: 248px;
        padding: 14px 20px;
        border-radius: 8px;
        border: 1px solid #e9e9e9;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        height: 77px;
        .enter-icon {
          position: absolute;
          right: 0;
          display: none;
        }
        &:hover {
          :deep(svg) {
            display: block;
          }
        }
        .top {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          & > span {
            line-height: 20px;
          }
          svg {
            width: 12px;
            height: 12px;
            cursor: pointer;
          }
          .icon-wrap {
            width: 18px;
            height: 18px;
            display: inline-block;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .source-name {
            max-width: 80%;
            font-size: 14px;
            font-weight: 500;
            color: #000000cc;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
        .bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          & > span {
            line-height: 16px;
          }
          .table-num {
            i {
              font-style: normal;
              color: #00000099;
              font-size: 15px;
              font-weight: 700;
              margin-right: 2px;
              line-height: 16px;
            }
          }
          .view-num {
            font-size: 12px;
            font-weight: 400;
            display: flex;
            align-items: center;
            svg {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="less">
.content-item {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  & > span {
    flex-basis: 70px;
  }
  .color-wrap {
    display: flex;
    flex-grow: 1;
    justify-content: space-between;
    gap: 10px;
    & > span {
      display: inline-block;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      padding: 4px;
      cursor: pointer;
      &.activeColor {
        border: 3px solid #2b67ff;
        padding: 2px;
      }
      i {
        display: inline-block;
        width: 100%;
        height: 100%;
        border-radius: 3px;
      }
    }
  }
  .bi-input-wrap {
    flex-grow: 1;
  }
}
</style>
