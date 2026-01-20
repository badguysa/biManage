<script setup>
import myModal from '@/components/myModal'
import { getPushTopic, getTopicByIds } from '@/apis/push'
import pushCollectionTree from './pushCollectionTree.vue'
import useScrollBottom from '@/hooks/common/useScrollBottom'

const props = defineProps(['push'])

const emits = defineEmits(['cancel', 'confirm', 'update:push'])

const searchParams = reactive({
  current: 1,
  name: '',
  size: 20,
  total: 0
})

// 搜索列表
const searchList = ref([])

const pushTreeRef = ref(null)

const expandedKeys = ref([])

const selectedKeys = ref([])

const correctionTasks = ref([])

onMounted(() => {
  selectedKeys.value = props.push.map(it => it.id)
})

// 触底加载
useScrollBottom('.list-container', () => {
  scrollBottomHandle()
})

// 选中的推送集合
const chooseTasks = computed(() => {
  return selectedKeys.value.map(key => pushTreeRef.value.getNodeById(key)).filter(it => it)
})

const finalTasks = computed(() => {
  return chooseTasks.value.concat(correctionTasks.value)
})

// 回显选中任务节点
watch([() => chooseTasks.value.length, selectedKeys], () => {
  let tasks = chooseTasks.value,
    selectKeys = selectedKeys.value

  // 只选了推送集合 没有选推送主题
  if (tasks.length >= selectKeys.length) {
    // console.log('无需修正')
    correctionTasks.value = []
    return
  }

  // 选了推送主题 回显时需通过接口查询推送主题信息
  let missKeys = []

  // 获取推送主题id
  selectKeys.forEach(key => {
    let flag = tasks.find(task => task.id === key)
    if (!flag) {
      missKeys.push(key)
    }
  })

  getTopicInfo(missKeys.join(',')).then(topicList => {
    correctionTasks.value = topicList
  })
})

// 通过主题id获取主题信息
const getTopicInfo = ids => {
  // return
  return new Promise((resolve, reject) => {
    getTopicByIds({ ids })
      .then(res => {
        if (res.code === 1 && res.data) {
          resolve(res.data)
        } else {
          reject(res)
        }
      })
      .catch(e => reject(e))
  })
}

const scrollBottomHandle = () => {
  if (searchParams.total <= searchList.value.length) return
  searchParams.current += 1
  getPushList()
}

const removeTopic = (node, index) => {
  selectedKeys.value.splice(index, 1)
  correctionTasks.value = correctionTasks.value.filter(it => it.id !== node.id)
}

const inputFn = () => {
  searchParams.current = 1
  getPushList('search')
}

// 搜索推送主题
const getPushList = type => {
  getPushTopic({
    pageNum: searchParams.current,
    name: searchParams.name ?? undefined,
    pageSize: 20
  }).then(res => {
    if (res.code === 1 && res.data?.records) {
      searchParams.total = Number(res.data.total)
      if (type === 'search') {
        searchList.value = res.data.records
      } else {
        searchList.value.push(...res.data.records)
      }
    } 
    console.log(res.message)
  })
}

// 搜索列表选择推送主题
const selectPushTopic = item => {
  let index = selectedKeys.value.indexOf(item.id)
  if (index < 0) {
    getTopicInfo(item.id)
      .then(topicList => {
        correctionTasks.value.push(topicList[0])
        selectedKeys.value.push(item.id)
      })
      .catch(e => console.log(e))
  } else {
    removeTopic(item, index)
  }
}

const onConfirm = () => {
  emits('update:push', finalTasks.value)
  emits('cancel')
}
</script>

<template>
  <myModal
    width="840px"
    modalName="添加推送任务"
    @onConfirm="onConfirm"
    @onCancel="$emit('cancel')"
  >
    <template #modal-body>
      <div class="main-wrap">
        <div class="left-wrap">
          <div class="search-wrap">
            <BiInput
              v-model="searchParams.name"
              size="small"
              placeholder="搜索"
              @input="inputFn"
              @search="getPushList('search')"
              canSearch
            />
          </div>

          <div class="list-container">
            <!-- 搜索列表 -->
            <template v-if="searchParams.name">
              <template v-if="searchList.length">
                <div
                  :class="{
                    'push-topic': true,
                    active: selectedKeys.includes(item.id)
                  }"
                  v-for="item in searchList"
                  @click="selectPushTopic(item)"
                >
                  <span class="title" :title="item.name">{{ item.name }}</span>
                  <input type="checkbox" :checked="selectedKeys.includes(item.id)" />
                </div>
              </template>
              <template v-else>
                <span class="no-data">暂无数据</span>
              </template>
            </template>
            <!-- 推送集合树形列表 -->
            <pushCollectionTree
              v-show="!searchParams.name"
              v-model:selectedKeys="selectedKeys"
              v-model:expandedKeys="expandedKeys"
              ref="pushTreeRef"
            />
          </div>
        </div>
        <div class="right-wrap">
          <div class="top-tips">
            已选<span>{{ finalTasks.length }}</span
            >个集合
          </div>
          <div class="select-list">
            <div class="list-item" v-for="(item, index) in finalTasks">
              <BiIcon style="margin-right: 4px;" name="pushIcon" />
              <span class="title">{{ item.name ? item.name : '-' }}</span>
              <img
                class="remove-icon"
                @click="removeTopic(item, index)"
                src="@/assets/icons/close.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </myModal>
</template>

<style lang="less" scoped>
.main-wrap {
  height: 482px;
  display: flex;
  .left-wrap {
    padding: 12px;
    border-right: 1px solid #e9e9e9;
    width: 50%;
    .search-wrap {
      padding: 12px;
      .bi-input-wrap {
        width: 100%;
      }
    }
    .list-container {
      height: calc(100% - 52px);
      overflow-y: auto;
      position: relative;
      .push-topic {
        padding: 0 12px;
        height: 40px;
        display: flex;
        align-items: center;
        cursor: pointer;
        &.active {
          color: #2b67ff;
        }
        .title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        & > input {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #00000024;
          margin-left: auto;
          flex-shrink: 0;
          cursor: pointer;
          &:checked {
            border: none;
            background: url(../../../../assets/icons/is_select.png) center/contain;
          }
        }
        &:hover {
          background-color: #e8f2ff;
        }
      }
      .no-data {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
  .right-wrap {
    padding: 12px;
    width: 50%;
    .top-tips {
      padding: 12px;
      font-size: 16px;
      color: #00000066;
      span {
        color: #2b67ff;
        margin: 0 2px;
      }
    }
    .select-list {
      height: calc(100% - 50px);
      overflow-y: auto;
      .list-item {
        height: 52px;
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0 12px;
        border-radius: 4px;
        &:hover {
          background-color: #e8f2ff;
          .title {
            color: #2b67ff;
          }
          .remove-icon {
            display: block;
          }
        }
        .topicNum {
          color: #00000066;
          margin-left: 12px;
        }
        .remove-icon {
          width: 16px;
          height: 16px;
          margin-left: auto;
          cursor: pointer;
          display: none;
        }
      }
    }
  }
}
</style>
