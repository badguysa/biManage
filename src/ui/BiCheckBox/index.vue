<script setup>
const props = defineProps({
  modelValue: {
    required: true,
    type: Array
  },
  options: {
    required: true,
    type: Array
  }
})

const emits = defineEmits(['update:modelValue'])

const whetherChecked = target => {
  return props.modelValue.some(v => v === target.value)
}

const getCheckIconName = target => {
  return whetherChecked(target) ? 'checkbox_all' : 'checkbox_nothing'
}

const checkFn = target => {
  emits(
    'update:modelValue',
    whetherChecked(target)
      ? props.modelValue.filter(v => v !== target.value)
      : [...props.modelValue, target.value]
  )
}
</script>

<template>
  <div class="bi-checkbox-wrap">
    <div class="checkbox-item" v-for="item in options" @click="checkFn(item)">
      <BiIcon :name="getCheckIconName(item)" />
      <span class="checkbox-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.bi-checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 20px;
  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 13px;
    svg {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
