<script setup>

const props = defineProps(['connInfo'])

const paramList = ref([{ key: '', value: '' }])
const showDetail = ref(false)
const addBtnRef = ref()

const toggleShowDetail = async () => {
  showDetail.value = !showDetail.value
  await nextTick()
  if(showDetail.value && addBtnRef.value) {
    addBtnRef.value.scrollIntoView()
  }
}

// 高级参数回显
watch(() => props.connInfo, (nv) => {
  let tempList = []
  for(let key in nv) {
    // 过滤表空间
    if(key !== 'schemaName') {
      tempList.push({
        key: key,
        value: nv[key]
      })
    }
  }

  if(tempList.length){
    paramList.value = tempList
  } else {
    paramList.value = [{ key: '', value: '' }]
  }
})

const addParams = () => {
  paramList.value.push({
    key: '', value: ''
  })
  nextTick(() => {
    addBtnRef.value.scrollIntoView()
  })
}

const deleteFn = (index) => {
  paramList.value.splice(index, 1)
}

defineExpose({
  getParamList(){
    return paramList.value
  }
})

</script>

<template>
  <div class="advanceSetting">
    <div :class="{title: true, expand: showDetail}" @click="toggleShowDetail">高级设置</div>
    <template v-if="showDetail">
      <div class="settingBox">
        <div class="settingItem" v-for="(param, index) in paramList">
          <span>参数名称</span>
          <BiInput class="labelInput" v-model="param.key" placeholder="请输入" />
          <span>参数值</span>
          <BiInput v-model="param.value" placeholder="请输入" />
          <i class="deleteBtn" v-if="paramList.length>1" @click="deleteFn(index)"></i>
        </div>
      </div>
      <BiButton ref="addBtnRef" @click="addParams">添加参数</BiButton>
    </template>
  </div>
</template>

<style lang="less" scoped>
.advanceSetting {
  display: flex;
  flex-direction: column;
  gap: 16px;
  .title{
    width: fit-content;
    cursor: pointer;
    color: #00000066;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    &::after{
      content: '';
      display: inline-block;
      width: 12px;
      height: 12px;
      background: url('@/assets/icons/page-down.png') center/cover;
    }
    &.expand{
      &::after{
        transform: rotate(180deg);
      }
    }
  }
  .settingBox {
    display: flex;
    flex-direction: column;
    gap: 15px;
    .settingItem {
      display: flex;
      align-items: center;
      position: relative;
      & > span {
        margin-right: 12px;
      }
      :deep(input) {
        width: 133px;
      }
      .labelInput {
        margin-right: 30px;
      }
      .deleteBtn{
        cursor: pointer;
        width: 16px;
        height: 16px;
        background: url(@/assets/icons/delete.png) center/100%;
        position: absolute;
        right: -18px;
      }
    }
  }
  button{
    width: fit-content;
  }
}
</style>
