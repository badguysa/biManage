<script setup>
import { message } from 'ant-design-vue'
import addEditInput from './addEditInput.vue'
// import JSZip from 'jszip'
import { asBlob } from "html-docx-js-typescript";
import { saveAs } from "file-saver"
import { batchAPIDocument, moveGroupApi } from '@/apis/apiManage'
import { addStandardLibApi, updateStandardLibApi, deleteStandardLibApi } from '@/apis/dataStandard'
import createDialog from '@/utils/dialog'
import { handleExportHtmlStr } from '@/utils/utils'


const props = defineProps(['modalVisible', 'modalType', 'moveApi'])
const emits = defineEmits(['update:modalVisible'])

const useApiManageStore = apiManageStore()

const apiGroupObj = inject('API_GROUP_OBJ')

// api分组列表
const groupList = computed(() => {
  return apiGroupObj.list.value
})

const currentGroupId = ref(-1)

const addGroupState = reactive({
  show: false,
  name: '新建分组'
})

const editGroupState = reactive({
  name: '',
  id: ''
})

// 是否是管理分组
const isManageGroup = computed(() => {
  return props.modalType === 'manage'
})

const selectGroup = group => {
  currentGroupId.value = group.id
}

// 移动分组 选中当前api所在分组
watch(() => props.moveApi, () => {
  currentGroupId.value = props.moveApi.groupId ?? '-1'
}, {
  deep: true
})

watch(isManageGroup, () => {
  // 分组管理 不选中
  if(isManageGroup.value) {
    currentGroupId.value = ''
  }
} )

// 新建分组
const addGroup = type => {
  // 隐藏编辑input
  editGroupState.id = -1
  if (type === 'showInput') {
    addGroupState.show = true
    return
  }

  if (!addGroupState.name) {
    return message.warning('分组名称不能为空')
  }

  addStandardLibApi({
    name: addGroupState.name,
    pid: '-1',
    xpath: '-1',
    groupType: 2
  }).then(res => {
    if (res.code !== 1) return message.error(res.message)
    apiGroupObj.getList()
    addGroupState.show = false
  })
}

// 编辑分组
const editGroup = group => {
  // 隐藏新增input
  addGroupState.show = false
  editGroupState.id = group.id
  editGroupState.name = group.name
}

// 确定编辑分组
const confirmEdit = () => {
  updateStandardLibApi({
    id: editGroupState.id,
    name: editGroupState.name,
    groupType: 2
  }).then(res => {
    if (res.code !== 1) message.error(res.message)
    apiGroupObj.getList()
    editGroupState.id = -1
    editGroupState.show = false
    editGroupState.name = ''
  })
}

// 删除分组
const removeGroup = (group) => {
  emits('update:modalVisible', false)
  createDialog({
    title: '提示',
    content: '确定删除吗？',
    okText: '确定',
    cancelText: '取消',
  }).then(() => {
    deleteStandardLibApi({
      ids: group.id,
      groupType: 2
    }).then(res => {
      if (res.code !== 1) return message.error(res.message)
      apiGroupObj.getList()
      emits('update:modalVisible', true)
    })
  }).catch(() => {
    emits('update:modalVisible', true)
  })
}

// 批量导出
const batchExport = async () => {
  if (currentGroupId.value === -1) {
    return message.warning('请选择分组')
  }

  try {
    let htmlRes = await batchAPIDocument(currentGroupId.value)
    if (htmlRes.code === 0) {
      return message.error(htmlRes.message)
    }
    saveAs(await asBlob(handleExportHtmlStr(htmlRes)), 
      `${groupList.value.find(it => it.id === currentGroupId.value)?.name ?? '未分组'}_API文档.docx`
    );
  } catch (e) {
    console.log('批量导出异常', e)
  }
}


const okFn = () => {
  if (isManageGroup.value) {
    emits('update:modalVisible', false)
    return
  }

  // 移动分组
  moveGroupApi({
    apiId: props.moveApi.id,
    groupId: currentGroupId.value
  }).then(res => {
    if (res.code !== 1) return message.error(res.message)
    // apiGroupObj.getList()
    useApiManageStore.initApiList()
    emits('update:modalVisible', false)
    message.success(res.message)
  })
  // 确定移动
  console.log('move...')
}


// 单独导出api接口文档 已压缩包形式下载
const exportApiGroupDoc = async () => {
  const zip = new JSZip()

  let htmlList = []

  let blobList = htmlList.map((str) => {
    let html = handleHtmlStr(str)
    return asBlob(html)
  })

  let blobs = await Promise.all(blobList)

  blobs.forEach((b, i) => {
    zip.file(`${indexTableData.value[i].apiName}.docx`, b)
  })

  const zipBlob = await zip.generateAsync({ type: 'blob' })

  saveAs(zipBlob, '接口文档.zip');
}

const closeModal = () => {
  emits('update:modalVisible', false)
  addGroupState.show = false
  editGroupState.id = ''
}

</script>

<template>
  <BiModal class="api-group-modal" title="分组管理" :visible="modalVisible"
    @update:visible="closeModal">
    <div class="group-wrap">
      <!-- 新增分组input -->
      <addEditInput v-if="addGroupState.show" :modelValue="addGroupState.name"
        @update:modelValue="addGroupState.name = $event" @yes="addGroup('confrimAdd')"
        @no="addGroupState.show = false" />
      <template v-for="item in groupList">
        <div v-if="editGroupState.id !== item.id" :class="{
          'group-item': true,
          'selected-group': currentGroupId === item.id
        }" @click="selectGroup(item)">
          <span>{{ item.name }}</span>
          <BiIcon name="edit" color="#2b67ff" @click="editGroup(item)" />
          <BiIcon name="remove" color="#2b67ff" @click="removeGroup(item)" />
        </div>
        <!-- 编辑分组input -->
        <addEditInput v-else :modelValue="editGroupState.name" @update:modelValue="editGroupState.name = $event"
          @yes="confirmEdit" @no="editGroupState.id = ''" />
      </template>
    </div>
    <template #modal-bottom>
      <div class="operate-left">
        <div class="add-group">
          <BiIcon name="addOperate" />
          <span @click="addGroup('showInput')">添加分组</span>
        </div>
        <div class="batch-export">
          <BiIcon name="download" />
          <span @click="batchExport">批量导出</span>
        </div>
      </div>
      <div class="button-right">
        <BiButton @click="closeModal">取消</BiButton>
        <BiButton type="primary" @click="okFn">{{ isManageGroup ? '确定' : '移动' }}</BiButton>
      </div>
    </template>
  </BiModal>
</template>

<style lang="less" scoped>
.group-wrap {
  max-height: 300px;
  overflow: auto;

  .add-input {
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 4px;

    svg {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }

  .group-item {
    font-size: 14px;
    padding: 10px 12px;
    color: #000000cc;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &.selected-group,
    &:hover {
      font-weight: 500;
      color: #2b67ff;
      background-color: #e8f2ff;
    }

    &:not(:first-of-type):hover svg {
      display: block;
    }

    svg {
      width: 14px;
      height: 14px;
      display: none;

      &:first-of-type {
        margin-left: auto;
        margin-right: 20px;
      }
    }
  }
}

.operate-left {
  color: #2b67ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  &>div {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.button-right {
  display: flex;
  gap: 24px;

  .bi-button {
    padding: 7px 24px;
  }
}
</style>

<style lang="less">
.api-group-modal {
  .modal-container {
    .content {
      padding: 12px;
    }

    .bottom {
      justify-content: space-between;
    }
  }
}
</style>
