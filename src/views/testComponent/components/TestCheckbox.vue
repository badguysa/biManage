<script setup>
const checkboxValue = ref(['Apple'])
const options = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Pear', value: 'Pear' },
  { label: 'Orange', value: 'Orange' }
]

watch(checkboxValue, () => {
  console.log('checkbox', checkboxValue.value)
})
</script>

<template>
  <span>checkbox测试</span>
  <BiCheckbox v-model="checkboxValue" :options="options" />
  <br/>
</template>

<style lang="less" scoped></style>
