<script setup>
import { useI18n } from 'vue-i18n'
import { throttle, debounce } from 'loadsh'
import { reactive, ref, onMounted, watch, useAttrs, computed, onUnmounted } from 'vue'
import { Dropdown, Input, message } from 'ant-design-vue'
import { getDataSourceList } from '@/apis/dataSourceManage'

const { t } = useI18n()

const attrs = useAttrs()

const emits = defineEmits(['select', 'update:modelValue'])

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  dataSourceType: {  // 数据源类型: DB/API?Kafka => 1/2/4
    type: String,
    default: 'DB',
  },
  placeholder: {
    type: String,
    default: '请输入',
  },
  disabled: { // 是否禁用菜单
    type: Boolean,
    default: false,
  }
})

// 数据源列表
let sourceList = ref([])
let visible = ref(false)

let keyword = ref('')
let containerRef = ref(null)

let inputRef = ref(null)

let inputTyping = ref(false)

let pageParams = reactive({
  pageNum: 1,
  pageSize: 20,
  loaded: false,
})

onMounted(() => {
  if(props.modelValue) {
    keyword.value = props.modelValue
  }
  getSourceList()
})

const sourceType = computed(() => {
  if (props.dataSourceType === 'DB') return 1
  if (props.dataSourceType === 'API') return 2
  if (props.dataSourceType === 'Kafka') return 4
  return 1
})

// 获取数据源列表
const getSourceList = (type = 'init') => {
  if(inputTyping.value) return
  // 搜索重置分页参数
  if (type === 'search') {
    if (!visible.value) {
      if(props.disabled) {
        visible.value = false
        emits('update:modelValue', keyword.value.trim())
        return
      } else {
        visible.value = true
      }
    }
    emits('update:modelValue', keyword.value.trim())
    pageParams.pageNum = 1
  }

  let { pageNum, pageSize } = pageParams

  getDataSourceList({
    pageNum,
    pageSize,
    kw: keyword.value.trim(),
    checks: sourceType.value,
  }).then(res => {
    if (res.code === 1) {
      if (type === 'search') {
        sourceList.value = res.data.records
      } else {
        sourceList.value = sourceList.value.concat(res.data.records)
      }
      pageParams.loaded = pageNum * pageSize > res.data.total
    } else {
      message.error(res.message)
    }
  })
}

const debounceSearch = debounce(getSourceList, 200, {
  leading: true
})

const selectItem = item => {
  keyword.value = item.sourceName
  visible.value = false
  emits('select', item.id)
  emits('update:modelValue', keyword.value.trim())
}

const scrollLoad = throttle(() => {
  // 加载完毕
  if (pageParams.loaded) return

  let { scrollHeight, scrollTop, clientHeight } = containerRef.value
  if (scrollHeight - scrollTop <= clientHeight) {
    pageParams.pageNum += 1
    getSourceList()
  }
  
}, 200)

defineExpose({
  visible,
  hideDropDownMenu() {
    visible.value = false
  },
  resetKeyword(){
    keyword.value = ''
    getSourceList()
  },
  focus(){
    inputRef.value.focus()
  },
  select(item){
    selectItem(item)
  }
})
</script>

<template>
  <Dropdown
    trigger="click"
    :overlayStyle="{ ...attrs.style, minWidth: 'unset' }"
    v-model:visible="visible"
    :disabled="disabled"
  >
    <div class="selectInput">
      <input
        ref="inputRef"
        type="text"
        :style="attrs.style"
        v-model="keyword"
        @input="debounceSearch('search')"
        @compositionstart="inputTyping=true"
        @compositionend="inputTyping=false"
        :placeholder="props.placeholder"
      />
    </div>
    <template #overlay>
      <div class="dropDownWrap">
        <div class="listContainer" ref="containerRef" @scroll="scrollLoad">
          <div
            class="sourceItem"
            v-for="item in sourceList"
            @click.stop="selectItem(item)"
            :title="item.sourceName"
          >
            {{ item.sourceName }}
          </div>
          <div class="noData" v-if="!sourceList.length">{{ t('common.noData') }}</div>
        </div>
      </div>
    </template>
  </Dropdown>
</template>

<style lang="less" scoped>
.selectInput {
  position: relative;
  &:hover {
    img {
      display: block;
    }
  }
  input {
    width: 100%;
    padding-right: 26px;
  }
}
.dropDownWrap {
  padding: 3px 0;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  background-color: #fff;
  box-shadow: 0px 6px 24px 0px rgba(31, 35, 41, 0.1);
  .topContainer {
    padding: 8px 12px;
    position: relative;
    input {
      width: 100%;
      padding-left: 30px;
    }
    img {
      width: 16px;
      position: absolute;
      top: 50%;
      left: 20px;
      cursor: pointer;
      transform: translateY(-50%);
    }
  }
  .listContainer {
    max-height: 250px;
    overflow: hidden auto;
    .sourceItem {
      white-space: nowrap;
      padding: 5px 12px;
      cursor: pointer;
      &:hover {
        background-color: #f3f3f3;
      }
    }
    .noData {
      padding: 20px;
      text-align: center;
    }
  }
}
</style>
