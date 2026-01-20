<template>
  <Dropdown :overlayStyle="attrs.style" trigger="click" v-model:visible="visible">
    <div class="selectInput">
      <input type="text" :style="attrs.style" readonly v-model="tmpName"/>
      <img src="@/assets/icons/clear.png" v-show="tmpName" @click="clearHandle">
    </div>
    <template #overlay>
      <div class="dropDownWrap">
        <div class="topContainer">
          <!-- <Input type="text" v-model="searchKw"/> -->
          <input @input="onSearch" @compositionstart="onCompositionstart" @compositionend="onCompositionend" @click.stop="()=>{}" type="text" v-model="searchKw" :placeholder="t('common.search')">
          <img @click.stop="onSearch" src="@/assets/icons/search.png" alt="" />
        </div>
        <div class="listContainer" ref="containerRef" @scroll="scrollLoad">
          <!-- 渲染根节点 -->
          <div class="rootItem" v-for="item in tmpList" @click.stop="toggleTempList(item)">
            <div class="rootTitle" v-if="isGroupTemp(item)">
              <CaretDownOutlined v-if="item.expand" class="groupIcon"/>
              <CaretRightOutlined v-else class="groupIcon"/>
              <span>{{ item.groupName }}</span>
            </div>
            <div class="rootTitle" v-else>{{ item.templateName }}</div>
            <!-- 渲染子级模板列表 -->
            <div class="tempItem" v-for="temp in item.tempList" @click.stop="selectTemplate(temp)">
              <span>{{ temp.templateName }}</span>
            </div>
            <!-- 加载更多 -->
            <div class="loadingMore" v-if="showLoadingMore(item)" @click.stop="loadingHandle(item)">
              <ReloadOutlined />
              <span class="loadingText">{{ t('common.load') }}</span>
            </div>
          </div>
          <div class="noData" v-if="!tmpList.length">{{ t('common.noData') }}</div>
        </div>
      </div>
    </template>
  </Dropdown>
</template>

<script setup>
import * as _ from 'lodash'
import { useI18n } from 'vue-i18n';
import { onMounted, reactive, ref, useAttrs, shallowRef, watch } from 'vue';
import { Dropdown, Input, message } from 'ant-design-vue';
import { CaretRightOutlined, CaretDownOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import {getTmplGroup, getTemplateList, getDetailTemplate} from '@/apis/templateManage'

const { t } = useI18n()

const attrs = useAttrs()

const tmpName = ref('')
const searchKw = ref('')
const tmpList = ref([])
const tmpGroupPageNum = ref(1)
const tmpGroupLoadEnd = ref(false)

// 根目录是否加载完毕
const rootListState = reactive({
  pageNum: 1,
  loadEnd: false
})

const tmpListState = reactive({
  name: '',
  groupId: ''
})

const containerRef = shallowRef(null)

const inputLock = ref(false)

const PAGE_SIZE = 20

const emits = defineEmits(['update:value'])

const visible = ref(false)

onMounted(() => {
  echoTempName()
  loadTempGroup()
})

// 监听首次变化
const stopWatch = watch(
  () => attrs.value,
  () => {
    echoTempName()
  }
)

// 编辑状态 回显模板名称
const echoTempName = () => {
  if(!attrs.value) return
  getDetailTemplate({
    id: attrs.value
  }).then((res) => {
    if(res.code === 1) {
      tmpName.value = res.data.templateName
    } else {
      message.error(res.message)
    }
    stopWatch()
  })
}

const scrollLoad = _.throttle(() => {
  if(rootListState.loadEnd) return
  let {scrollHeight, scrollTop, clientHeight} = containerRef.value
  if(scrollHeight - scrollTop <= clientHeight + 10) {
    if(!tmpGroupLoadEnd.value) {
      tmpGroupPageNum.value += 1
      loadTempGroup()
    } else {
      if(tmpGroupPageNum.value > 1) {
        loadTempList('root')
        rootListState.pageNum++
      } else {
        rootListState.pageNum++
        loadTempList('root')
      }
    }
  }
}, 200)

const toggleTempList = (item) => {
  // 模板
  if(!isGroupTemp(item)) {
    // tmpName.value = item.templateName
    selectTemplate(item)
    return
  }
  // 分组
  item.loadPageNum = 1
  item.loadEnd = false

  if(!item.expand) {
    tmpListState.groupId = item.id
    loadTempList('son', 1)
  } else {
    tmpListState.groupId = ''
    item.tempList = []
  }

  item.expand = !item.expand
}

const selectTemplate = (item) => {
  tmpName.value = item.templateName
  visible.value = false
  emits('update:value', item.id, item.templateContent)
}

const loadingHandle = (item) => {
  tmpListState.groupId = item.id
  item.loadPageNum++
  loadTempList('son', item.loadPageNum)
}

// 加载模板分组
const loadTempGroup = () => {
  if(tmpGroupLoadEnd.value) return

  getTmplGroup({
    pageNum: tmpGroupPageNum.value,
    pageSize: PAGE_SIZE
  }).then((res) => {
    if (res.code === 1) {
      let result = res.data
      // 添加模板列表字段
      result.records.forEach(it => {
        it.expand = false
        it.tempList = []
        it.loadEnd = false
      })
      tmpList.value = tmpList.value.concat(result.records)
      tmpGroupLoadEnd.value = result.total <= result.size * result.current
      // 分组数据只有一页 手动加载模板列表数据
      if(tmpGroupLoadEnd.value && tmpGroupPageNum.value === 1) {
        loadTempList('root')
      }
    }
  })
}

// 加载分组列表 
// type: root/son 加载根/子目录模板列表 
// loadPageNum: 子目录加载分页页数
const loadTempList = (type, loadPageNum) => {
  let {name, groupId} = tmpListState

  getTemplateList({
    templateName: type === 'root' ?  name : '',
    pageSize: PAGE_SIZE,
    pageNum: type === 'root' ? rootListState.pageNum : loadPageNum,
    groupId: type === 'root' ? '' : groupId
  }).then((res) => {
    if (res.code == 1) {
        let result = res.data
        if(type === 'root') {
          tmpList.value = tmpList.value.concat(result.records)
          rootListState.loadEnd = result.total <= result.size * result.current
        } else {
          let targetGroup = tmpList.value.find(it => it.id === groupId)
          // 手动新增字段 供子目录分页使用
          targetGroup.tempList = targetGroup.tempList.concat(result.records)
          targetGroup.loadEnd = result.total <= result.size * result.current
          targetGroup.loadPageNum = targetGroup.loadPageNum ? targetGroup.loadPageNum++ : 1
        }
    } else {
        message.error(res.message)
    }
  })
}

// 是否为模板分组
const isGroupTemp = (item) => {
  return 'groupName' in item
}

const showLoadingMore = (item) => {
  return item.tempList?.length && !item.loadEnd
}

const onSearch = () => {
  if(inputLock.value) return
  rootListState.pageNum = 1
  rootListState.loadEnd = false
  tmpList.value = []
  tmpListState.name = searchKw.value
  if(searchKw.value) {
    loadTempList('root')
  } else {
    tmpGroupLoadEnd.value = false
    tmpGroupPageNum.value = 1
    loadTempGroup()
  }
}

const onCompositionstart = () => {
  inputLock.value = true
}

const onCompositionend = () => {
  inputLock.value = false
  onSearch()
}

const clearHandle = (e) => {
  tmpName.value = ''
  emits('update:value', '', '')
  e.stopPropagation()
}

const resetState = () => {
  searchKw.value = ''
  tmpList.value = []
  tmpGroupPageNum.value = 1
  tmpGroupLoadEnd.value = false
  rootListState.pageNum = 1
  rootListState.loadEnd = false
  tmpListState.name = ''
  tmpListState.groupId = ''
  inputLock.value = false
}

// 二次显示下拉框 重置组件状态 重新拉取数据
watch(visible, () => {
  if(!visible.value) return
  resetState()
  loadTempGroup()
})

</script>

<style lang='less' scoped>

.selectInput{
  position: relative;
  &:hover{
    img{
      display: block;
    }
  }
  input{
    padding-right: 26px;
  }
  img{
    display: none;
    width: 16px;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
}
.dropDownWrap{
  border-radius: 4px;
  border: 1px solid #F0F0F0;
  background-color: #fff;
  box-shadow: 0px 6px 24px 0px rgba(31, 35, 41, 0.10);
  height: 336px;
  .topContainer{
    padding: 8px 12px;
    position: relative;
    input{
      width: 100%;
      padding-left: 30px;
    }
    img{
      width: 16px;
      position: absolute;
      top: 50%;
      left: 20px;
      cursor: pointer;
      transform: translateY(-50%);
    }
  }
  .listContainer{
    height: calc(100% - 48px);
    overflow-y: auto;
    .rootItem{
      // display: flex;
      // align-items: center;

      .rootTitle{
        padding: 10px 12px;
        cursor: pointer;
        word-break: break-all;
        .groupIcon{
          color: rgba(0, 0, 0, .2);
          margin-right: 4px;
        }
        &:hover{
          background-color: #F2F3F5;
        }
      }

      .tempItem{
        padding: 10px 28px;
        cursor: pointer;
        &:hover{
          background-color: #F2F3F5;
        }
      }

      .loadingMore{
        padding: 5px 28px;
        &:hover{
          background-color: #F2F3F5;
        }
        cursor: pointer;
        .loadingText{
          margin-left: 5px
        }
      }
    }
    .noData{
      padding: 20px;
      text-align: center;
    }
  }
}
</style>
