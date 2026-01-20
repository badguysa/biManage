<script setup>
import { getCollectionList, getPushTopic } from '@/apis/push'

const topicParams = reactive({})
const treeData = ref([])
const treeRef = ref(null)

const props = defineProps(['selectedKeys', 'expandedKeys'])
const emits = defineEmits(['update:selectedKeys', 'update:expandedKeys'])

onMounted(async () => {
  // 获取所有推送集合数据
  getAllCollection()
})

const getAllCollection = async () => {
  const params = {
    current: 1,
    total: 0,
    size: 20
  }

  // 递归加载所有推送集合
  do {
    await _getCollectionData()
    params.current += 1
  } while (params.total > treeData.value.length)

  // 分页获取推送集合数据
  function _getCollectionData() {
    return new Promise((resolve, reject) => {
      getCollectionList({
        pageNum: params.current,
        size: params.size
      })
        .then(res => {
          if (res.code == 1 && res.data?.records) {
            params.total = Number(res.data.total)
            // 增加children属性
            let temp = res.data.records.map(it => {
              it.children = []
              return it
            })
            treeData.value.push(...temp)
          }
          resolve()
        })
        .catch(e => reject(e))
    })
  }
}

// 获取推送集合下推送主题数据
const getpushTopicData = async collectionId => {
  if (!topicParams[collectionId]) {
    topicParams[collectionId] = {
      current: 1,
      size: 20,
      total: 0
    }
  }
  return new Promise((resolve, reject) => {
    getPushTopic({
      collectionId: collectionId,
      pageNum: topicParams[collectionId].current,
      size: topicParams[collectionId].size
    })
      .then(res => {
        resolve(res)
      })
      .catch(e => reject(e))
  })
}

// 加载数据
const loadDataFn = async (node, expanded) => {
  // 折叠无需加载数据
  if(expanded) return
  // 加载过数据 无需重新加载
  if (node.loadEnd !== undefined) return

  let res = await getpushTopicData(node.id)
  if (res.code == 1 && res.data?.records) {
    node.children = res.data.records
    // 增加标记 数据是否加载完毕
    node.loadEnd = node.children.length >= Number(res.data.total)
    node.total = res.data.total
  }
}

// 加载更多
const loadMoreFn = async node => {
  if (node.loadEnd) return
  topicParams[node.id].current++
  let res = await getpushTopicData(node.id)
  if (res.code == 1 && res.data?.records) {
    let records = res.data?.records
    node.children.push(...records)
    node.loadEnd = node.children.length >= Number(res.data.total)
  }
}

defineExpose({
  getNodeById(nodeId) {
    return treeRef.value.getNodeById(nodeId)
  }
})
</script>

<template>
  <BiTree
    ref="treeRef"
    :tree-data="treeData"
    v-model:expandedKeys="expandedKeys"
    v-model:selectedKeys="selectedKeys"
    @expand="loadDataFn"
    @loadMore="loadMoreFn"
    checkable
  >
  <template #nodeIcon>
    <BiIcon name="pushIcon" />
  </template>
  </BiTree>
</template>
