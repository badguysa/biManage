<script setup>
const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue', 'yes', 'no'])
</script>

<template>
  <div class="add-edit-input-wrap">
    <BiInput
      style="width: 240px; height: 28px"
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      autoSelect
    />
    <BiIcon name="yes" @click="$emit('yes')" />
    <BiIcon name="no" @click="$emit('no')" />
  </div>
</template>

<style lang="less" scoped>
.add-edit-input-wrap {
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
</style>
