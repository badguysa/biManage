<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  maxValue: {
    type: Number,
    default: Infinity,
  },
  minValue: {
    type: Number,
    default: 1,
  },
})

const emits = defineEmits(['update:modelValue'])

const increaseFn = () => {
  let { modelValue, maxValue } = props
  let newValue = modelValue + 1 > maxValue ? maxValue : modelValue + 1
  emits('update:modelValue', Number(newValue))
}

const decreaseFn = () => {
  let { modelValue, minValue } = props
  let newValue = modelValue - 1 < minValue ? minValue : modelValue - 1
  emits('update:modelValue', Number(newValue))
}

const inputFn = e => {
  let { minValue, maxValue } = props
  let newValue = e.target.value

  newValue = newValue > maxValue ? maxValue : newValue
  newValue = newValue < minValue ? minValue : newValue
  e.target.value = newValue

  emits('update:modelValue', Number(newValue))
}
</script>

<template>
  <div class="counterWrap">
    <span :class="{ btn: true, disabled: modelValue <= minValue }" @click="decreaseFn">-</span>
    <input type="number" :value="modelValue" @input="inputFn" />
    <span :class="{ btn: true, disabled: modelValue >= maxValue }" @click="increaseFn">+</span>
  </div>
</template>

<style lang="less" scoped>
.counterWrap {
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 0 10px;
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 6px;
    background-color: #f3f3f3;
    cursor: pointer;
    user-select: none;
    &.disabled {
      pointer-events: none;
      color: #ced2d9;
    }
    &:first-of-type {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    &:last-of-type {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }
  input {
    width: 46px;
    height: 26px;
    text-align: center;
  }
}
</style>
