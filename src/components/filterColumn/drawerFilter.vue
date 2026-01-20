<script setup>
import filterColumn from '@/components/filterColumn/index.vue'

const props = defineProps(['drawerVisible'])
const emits = defineEmits(['closeDrawer', 'submitFn'])

const filterRef = ref()

defineExpose({
  getFilterData() {
    return filterRef.value?.getFilterData() || []
  },
  resetFilterState() {
    filterRef.value?.resetFilterInfo()
  },
  removeTrashKey() {
    filterRef.value?.removeTrashKey() 
  }
})
</script>

<template>
  <a-drawer
    class="filter-drawer"
    width="1040"
    :visible="props.drawerVisible"
    @close="$emit('closeDrawer')"
    title="筛选"
    placement="right"
  >
  <template #footer>
    <slot name="footer" v-if="$slots.footer"></slot>
    <template v-else>
      <BiButton @click="$emit('closeDrawer')">取消</BiButton>
      <BiButton type="primary" @click="$emit('submitFn')">确定</BiButton>
    </template>
  </template>
  <filterColumn ref="filterRef" />
  </a-drawer>
</template>

<style lang="less">
.filter-drawer {
  .ant-drawer-footer {
    display: flex;
    justify-content: flex-end;
    .bi-button {
      width: 80px;
      &:first-of-type {
        margin-right: 24px;
      }
    }
  }
  .ant-drawer-header-title {
    & > button {
      display: none;
    }
  }
}
</style>
