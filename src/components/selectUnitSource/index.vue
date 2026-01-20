<script setup>
import { useI18n } from 'vue-i18n'
import { throttle, debounce } from 'loadsh'
import { Dropdown, Input, message } from 'ant-design-vue'
import { getApiAuthList } from '@/apis/apiAuth'

const { t } = useI18n()

const attrs = useAttrs()

const emits = defineEmits(['select', 'update:modelValue', 'clearFn'])

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请选择'
  }
})

// 单位列表
let unitList = ref([])
let visible = ref(false)

let keyword = ref('')
let containerRef = ref(null)

let inputTyping = ref(false)

let pageParams = reactive({
  pageNum: 1,
  pageSize: 10,
  loaded: false
})

onMounted(() => {
  getUnitList()
})

watch(
  () => props.modelValue,
  () => {
    keyword.value = props.modelValue
  }, {
    immediate: true
  }
)

// 获取单位列表
const getUnitList = (type = 'init') => {
  if (inputTyping.value) return
  // 搜索重置分页参数
  if (type === 'search') {
    if (!visible.value) {
      visible.value = true
    }
    emits('update:modelValue', keyword.value.trim())
    pageParams.pageNum = 1
  }

  let { pageNum, pageSize } = pageParams

  getApiAuthList({
    pageNum,
    pageSize,
    enable: 1,
    sw: keyword.value.trim()
  }).then(res => {
    if (res.code === 1) {
      if (type === 'search') {
        unitList.value = res.data.records
      } else {
        unitList.value = unitList.value.concat(res.data.records)
      }
      pageParams.loaded = pageNum * pageSize >= res.data.total
    } else {
      message.error(res.message)
    }
  })
}

const debounceSearch = debounce(getUnitList, 200, {
  leading: true
})

const selectItem = item => {
  keyword.value = item.unitName
  visible.value = false
  emits('select', item)
  emits('update:modelValue', keyword.value.trim())
}

const scrollLoad = throttle(() => {
  // 加载完毕
  if (pageParams.loaded) return

  let { scrollHeight, scrollTop, clientHeight } = containerRef.value
  if (scrollHeight - scrollTop <= clientHeight) {
    pageParams.pageNum += 1
    getUnitList()
  }
}, 200)

const clearValue = () => {
  keyword.value = ''
  emits('clearFn')
  emits('update:modelValue', '')
}
</script>

<template>
  <Dropdown
    trigger="click"
    :overlayStyle="{ ...attrs.style, minWidth: 'unset' }"
    v-model:visible="visible"
  >
    <div class="selectInput">
      <input
        type="text"
        :style="attrs.style"
        v-model="keyword"
        @input="debounceSearch('search')"
        @compositionstart="inputTyping = true"
        @compositionend="inputTyping = false"
        :placeholder="props.placeholder"
      />
      <BiIcon v-if="keyword" class="bi-icon" name="delete" @click.stop="clearValue" />
    </div>
    <template #overlay>
      <div class="dropDownWrap">
        <div class="listContainer" ref="containerRef" @scroll="scrollLoad">
          <div
            class="sourceItem"
            v-for="item in unitList"
            @click.stop="selectItem(item)"
            :title="item.unitName"
          >
            {{ item.unitName }}
          </div>
          <div class="noData" v-if="!unitList.length">
            {{ t('common.noData') }}
          </div>
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
  .bi-icon{
    position: absolute;
    right: 6px;
    top: 7px;
    cursor: pointer;
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
