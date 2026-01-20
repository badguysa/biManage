<script setup>
/***
 * figema: https://www.figma.com/file/tWae3xVadg9oEpHEdYTxch/%E9%97%A8%E6%88%B72.0-%E8%AE%BE%E8%AE%A1%E5%9B%BE?type=design&node-id=10703-129344&mode=design&t=xbzlULNmfB6tikeO-0
 */
const props = defineProps({
  modelValue: {
    required: true,
  },
  type: {
    default: 'text',
  },
  placeholder: {
    type: String,
  },
  canSearch: {
    type: Boolean,
    default: false,
  },
  canRemove: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  autoFoucs: {
    type: Boolean,
    default: false,
  },
  autoSelect: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: '',
    validator(value) {
      return ['small', '', 'large'].includes(value)
    },
  },
})

const emit = defineEmits(['update:modelValue', 'search', 'input', 'blur', 'click', 'remove'])

const attrs = useAttrs()

const _elmRef = ref(null)

const inputWrapStyle = computed(() => {
  let inputWrapHeight = '28px'
  switch (props.size) {
    case 'small':
      inputWrapHeight = '28px'
      break
    case 'large':
      inputWrapHeight = '40px'
      break
    case '':
    default:
      inputWrapHeight = '32px'
      break
  }
  return {
    ...attrs.style,
    height: inputWrapHeight,
  }
})

const isComposition = ref(false)

onMounted(() => {
  props.autoFoucs && _elmRef.value.focus()
  props.autoSelect && _elmRef.value.select()
})

const inputHandle = e => {
  if(isComposition.value) return
  let inputVal = e.target.value
  emit('update:modelValue', inputVal)
  emit('input', inputVal, e)
}

const startFn = () => {
  isComposition.value = true
}

const endFn = (e) => {
  isComposition.value = false
  inputHandle(e)
}

defineExpose({
  getElm: () => _elmRef.value
})

</script>

<template>
  <div class="bi-input-wrap" :style="inputWrapStyle">
    <input
      ref="_elmRef"
      :style="{ paddingRight: canSearch ? '34px' : '' }"
      :type="type"
      :value="modelValue"
      :disabled="disabled"
      :placeholder="placeholder"
      @input="inputHandle($event)"
      @blur="$emit('blur')"
      @compositionstart="startFn"
      @compositionend="endFn"
      @click="$emit('click')"
      v-bind="$attrs"
    />
    <BiIcon v-if="canSearch" class="bi-icon" name="search" @click="emit('search')" />
    <BiIcon v-if="canRemove && modelValue" class="bi-icon" name="delete" @click="emit('remove')" />
  </div>
</template>

<style lang="less" scoped>
.bi-input-wrap {
  display: inline-flex;
  align-items: center;
  position: relative;
  min-width: 80px;
  input {
    width: 100%;
    height: 100%;
    background: #f3f3f3;
    border-radius: 4px;
    &:hover {
      background: #ebebeb;
    }
    &:focus {
      background: #f3f3f3;
      outline: none;
      box-shadow: inset 0px 0px 0px 2px #3d82f2;
    }
    &:disabled {
      background: #f5f5f5;
    }
    &::selection {
      background-color: rgb(152, 187, 243);
    }
  }
  .bi-icon {
    cursor: pointer;
    position: absolute;
    right: 10px;
  }
}
</style>
