<template>
    <div class="custom-select" :style="{width: optionStyle.width}" ref="selectRef" @click="showOption">
        <div class="selector" :style="{cursor: disabled ? 'not-allowed' :''}">
            <span class="selected-items-text" :style="{color: selectedText ? 'rgba(0,0,0,.8)' : 'rgba(0,0,0,.4)'}">{{ selectedText || placeholder }}</span>
            <img class="arrow" src="@/assets/icons/arrows-down.png" alt="">
            <img v-if="selectedText" @click.top="clear" class="clear" src="@/assets/icons/clear.png" alt="">
        </div>
        <Teleport to="body">
            <div v-if="isVisible" ref="optionsRef" class="custom-select-option" @scroll="onScroll" :style="optionStyle" @click.stop>
                <div class="select-all" v-if="false">
                    <img @click="selectAll(2)" v-if="selectNum === 0" src="@/assets/icons/not_select.png" alt="">
                    <img @click="selectAll(1)" v-else-if="selectNum === total" src="@/assets/icons/is_select.png" alt="">
                    <img @click="selectAll(2)" v-else src="@/assets/icons/doing_select.png" alt="">
                    {{ t('common.selectAll') }}
                </div>
                <div class="search">
                    <input type="text" v-model.trim="searchValue" :placeholder="t('common.search')">
                    <img class="sear" src="@/assets/icons/search.png" alt="">
                </div>
                <div :class="{'option-item': true, disabled: item.disabled}" v-for="item in options" :key="item.value" :style="{ color: active(item) ? '#2B67FF' : 'rgba(0,0,0,.8)' }" @click="onSelect(item)">
                    <template v-if="multiple">
                        <img v-if="item.isSelect" src="@/assets/icons/is_select.png" alt="">
                        <img v-else src="@/assets/icons/not_select.png" alt="">
                    </template>
                    <div class="item-text">
                        {{ item.label }}
                    </div>
                </div>
                <div class="select-empty" v-if="!options.length">
                    {{ t('common.noData') }}
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const optionStyle = ref({})
const selectRef = ref()
const isVisible = ref(false)
const options = ref([])
const selectedList = ref([])
const noSelectList = ref([])
const searchValue = ref('')
const optionsRef = ref()
const props = defineProps({
    disabled: {
        type: Boolean,
        default: false
    },
    selectList: {
        default: []
    },
    placeholder: {
        default: ''
    },
    modelValue: {
        default: []
    },
    width: {
        type: Number,
        default: 200
    },
    multiple: {
        type: Boolean,
        default: false
    },
    isAll: {
        type: Boolean,
        default: false
    },
    total: {
        type: Number,
        default: 0
    }
})
const emits = defineEmits({
    'update:modelValue': (key) => true,
    'scroll': () => true,
    'search': () => true,
    'selectAll': () => true,
    'select': () => true,
    'clear': () => true
})
watch(props, (newProps) => {
    options.value = newProps.selectList
    if (newProps.modelValue.length) {
        if (!searchValue.value) {
            selectedList.value = []
        }
        const values = newProps.modelValue.map(item => item.value)
        options.value.forEach(item => {
            if (values.includes(item.value)) {
                item.isSelect = true
            } else {
                item.isSelect = false
            }
        })
        if (!searchValue.value) {
            selectedList.value = newProps.modelValue
        }
    }
    optionStyle.value.width = newProps.width + 'px'
})
watch(() => searchValue.value, (val) => {
    emits('search', val)
})
const selectedText = computed(() => {
    return selectedList.value.length ? selectedList.value.map(item => item.label).join(',') : ''
})
const selectNum = computed(() => {
    if (props.isAll) {
        return props.total - noSelectList.value.length
    }
    return selectedList.value.length
})
onMounted(() => {
    options.value = props.selectList
    optionStyle.value.width = props.width + 'px'
    window.addEventListener('click', bodyClick)
    window.addEventListener('resize', resize)
})
onUnmounted(() => {
    window.removeEventListener('click', bodyClick)
    window.removeEventListener('resize', resize)

})
const active = (record) => {
    const values = selectedList.value.map(item => item.value)
    if (values.includes(record.value)) {
        return true
    }
    return false
}
const bodyClick = (e) => {
    isVisible.value = false
}
const resize = () => {
    if (isVisible.value) {
        const { top, left } = selectRef.value.getBoundingClientRect()
        optionStyle.value.top = top + 40 + 'px'
        optionStyle.value.left = left + 'px'
    }
}
const showOption = (e) => {
    e.stopPropagation()
    if (props.disabled) {
        return
    }
    isVisible.value = !isVisible.value
    resize()
}
const onSelect = (record) => {
    if(record.disabled) return
    if (!props.multiple) {
        selectedList.value = [record]
        isVisible.value = false
        emits('update:modelValue', selectedList.value)
        emits('select', record)
        return
    }
    record.isSelect = !record.isSelect
    if (record.isSelect) {
        const values = selectedList.value.map(i => i.value)
        if (!values.includes(record.value)) {
            selectedList.value.push(record)
        }
    } else {
        selectedList.value = selectedList.value.filter(item => item.value !== record.value)
    }
    if (props.isAll) {
        if (!record.isSelect) {
            const values = noSelectList.value.map(item => item.value)
            if (!values.includes(record.value)) {
                noSelectList.value.push(record)
            }
        }
    }
    emits('update:modelValue', selectedList.value)
}
const onScroll = () => {
    if (optionsRef.value.clientHeight + optionsRef.value.scrollTop >= optionsRef.value.scrollHeight) {
        emits('scroll')
    }
}
const selectAll = (type) => {
    noSelectList.value = []
    if (type === 1) {
        selectedList.value = []
    } else {
        selectedList.value = options.value
    }
    emits('update:modelValue', selectedList.value)
    emits('selectAll', type)
}
const clear = () => {
    selectedList.value = []
    options.value.forEach(item => {
        item.isSelect = false
    })
    emits('update:modelValue', selectedList.value)
    emits('clear')
}
defineExpose({
    noSelectList
})
</script>

<style scoped lang="less">
</style>