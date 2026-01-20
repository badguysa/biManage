<script setup>
import myModal from '@/components/myModal'
import { getDataSourceList } from '@/apis/dataSourceManage'
import DB from '@/assets/icons/database.png'
import API from '@/assets/icons/api-icon.png'
import Kafka from '@/assets/icons/kafka.png'
import useScrollBottom from '@/hooks/common/useScrollBottom'

const props = defineProps(['dataSources'])
const emits = defineEmits(['cancel', 'update:dataSources'])

const params = reactive({
  current: 1,
  searchVal: '',
  total: 0
})
const sourceList = ref([])

// 已选择的数据源
const chooseSources = ref([...props.dataSources])

onMounted(() => {
  getSourceList()
})

// 触底加载
useScrollBottom('.list-container', removeScroll => {
  // 数据加载完毕
  if (sourceList.value.length >= params.total) {
    removeScroll()
    return
  }
  params.current += 1
  getSourceList()
})

const getSourceList = type => {
  getDataSourceList({
    pageNum: params.current,
    kw: params.searchVal ?? undefined,
    pageSize: 20,
    checks: '1,2,4'
  }).then(res => {
    if (res.code === 1 && res.data?.records) {
      params.total = Number(res.data.total)
      res.data.records.map(it => {
        it.name = it.sourceName
        return it
      })
      if (type === 'search') {
        sourceList.value = res.data.records
      } else {
        sourceList.value.push(...res.data.records)
      }
    } else {
      message.error(res.message)
    }
  })
}

const inputFn = () => {
  params.current = 1
  getSourceList('search')
}

const getImgSrc = source => {
  let sourceValue = source.sourceType.value
  if (sourceValue === 5) return API
  if (sourceValue === 6) return Kafka
  return DB
}

const selectSource = source => {
  // 取消选择
  if (chooseSources.value.find(it => it.id === source.id)) {
    chooseSources.value = chooseSources.value.filter(
      item => item.id !== source.id
    )
  }
  // 选择
  else {
    chooseSources.value.push(source)
  }
}

const isActive = source => {
  return chooseSources.value.find(it => it.id === source.id)
}

const onConfirm = () => {
  emits('update:dataSources', chooseSources.value)
  emits('cancel')
}
</script>

<template>
  <myModal
    width="840px"
    modalName="添加数据源"
    @onConfirm="onConfirm"
    @onCancel="$emit('cancel')"
  >
    <template #modal-body>
      <div class="main-wrap">
        <div class="left-wrap">
          <div class="search-wrap">
            <BiInput
              v-model="params.searchVal"
              size="small"
              placeholder="搜索"
              @input="inputFn"
              @search="getSourceList('search')"
              canSearch
            />
          </div>
          <div class="list-container">
            <div
              :class="{
                source: true,
                active: isActive(source)
              }"
              @click="selectSource(source)"
              v-for="source in sourceList"
            >
              <img class="icon" :src="getImgSrc(source)" />
              <span class="title" :title="source.name">{{ source.name }}</span>
              <input type="checkbox" :checked="isActive(source)" />
            </div>
          </div>
        </div>
        <div class="right-wrap">
          <div class="top-tips">
            已选<span>{{ chooseSources.length }}</span
            >个数据源
          </div>
          <div class="select-list">
            <div class="source" v-for="it in chooseSources">
              <img class="icon" :src="getImgSrc(it)" />
              <span class="title" :title="it.name"> {{ it.name }}</span>
              <img
                class="remove-icon"
                @click="selectSource(it)"
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
      .source {
        cursor: default;
      }
    }
  }

  .source {
    padding: 0 12px;
    height: 40px;
    display: flex;
    align-items: center;
    cursor: pointer;
    &.active {
      color: #2b67ff;
    }
    .icon {
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }
    .title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .remove-icon {
      width: 16px;
      height: 16px;
      margin-left: auto;
      cursor: pointer;
      display: none;
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
      .remove-icon {
        display: block;
      }
    }
  }
}
</style>
