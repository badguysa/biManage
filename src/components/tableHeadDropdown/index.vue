<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  checkList: {
    type: Array,
    required: true
  },
  needCheckAll: {
    type: Boolean,
    default: false
  }
})
const visible = ref(false)
const emits = defineEmits(['updateCheck'])

const selectValues = ref([])

const isCheckAll = ref(true)

watch(() => props.checkList, () => {
  selectValues.value = props.checkList.map(it => it.value)
}, {
  immediate: true
})

const selectHandle = target => {
  let targetValue = selectValues.value.find(v => v === target.value)
  if (targetValue !== undefined) {
    selectValues.value = selectValues.value.filter(v => v !== targetValue)
  } else {
    selectValues.value.push(target.value)
  }
  isCheckAll.value = selectValues.value.length === props.checkList.length
  emits('updateCheck', selectValues.value)
}

const checkAllFn = () => {
  isCheckAll.value = !isCheckAll.value
  selectValues.value = isCheckAll.value ? props.checkList.map(it => it.value) : []
  emits('updateCheck', selectValues.value)
}
</script>

<template>
  <a-dropdown v-model:visible="visible">
    <a class="label-text" @click.prevent>
      {{ title }}
      <BiIcon class="arrow-icon" name="downArrow" color="#2b67ff" />
    </a>
    <template #overlay>
      <a-menu class="bi-table-head-drop">
        <a-menu-item @click="checkAllFn" v-if="needCheckAll">
          <BiIcon v-if="isCheckAll" name="checkbox_all" />
          <BiIcon v-else name="checkbox_nothing" />
          <span>全选</span>
        </a-menu-item>
        <a-menu-item v-for="item in checkList" :key="item.value" @click="selectHandle(item)">
          <BiIcon v-if="selectValues.includes(item.value)" name="checkbox_all" />
          <BiIcon v-else name="checkbox_nothing" />
          <span> {{ item.label || item.name }}</span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<style lang="less" scoped>
.bi-table-head-drop {
  width: 160px;
}

.label-text {
  color: #2b67ff;
}

.arrow-icon {
  width: 10px;
  height: 10px;
}
</style>

<style>
.ant-dropdown-menu-title-content {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
