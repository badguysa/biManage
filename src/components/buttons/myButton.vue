<template>
    <button 
        ref="buttonRef" 
        @click="handleClickDebounce" 
        :class="className"
        :disabled="props.disabled"
        type="button"
    >
        <slot />
    </button>
</template>

<script>
import { defineComponent, useSlots, onMounted, computed, reactive, toRefs, watch } from 'vue'
import * as _ from 'loadsh' 

export default defineComponent({
    name: "cx-button",
    props: {
        type: {
            type: String,
            default: 'text'
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    emits: ["click"],
    setup(props, { emit }) {
        const state = reactive({
            className: 'primaryBtn'
        })
        onMounted(() => {
            setClass()
        })
        watch(props, () => {
            setClass()
        })
        const setClass = () => {
            if (props.disabled && props.type === 'primary') {
                state.className = `disabledBtn`
            } else if (props.disabled && props.type !== 'primary') {
                state.className = `disabledTextBtn`
            } else {
                if (props.type === 'text') {
                state.className = `textBtn`
                } else if (props.type === 'primary') {
                    state.className = `primaryBtn`
                }
            }
        }
        const handleClick = () => {
            emit("click")
        }
        // 给总体的按钮设置100ms的防抖，防止恶意重复点击
        const handleClickDebounce = _.debounce(handleClick, 100)
        return {
            handleClick,
            handleClickDebounce,
            ...toRefs(state),
            props
        }
    }
})
</script>

<style lang="less" scoped>
button{
    outline: none;
}
.disabledBtn {
    padding: 0 16px;
    word-break: keep-all;
    white-space: nowrap;
    height: 32px;
    cursor: pointer;
    /* 浅色风格/主要颜色/主色禁用 */
    border: none;
    background: rgba(61, 130, 242, 0.5);
    border-radius: 4px;
    color: #fff;
}
.disabledTextBtn {
    padding: 0 16px;
    word-break: keep-all;
    white-space: nowrap;
    height: 32px;
    cursor: pointer;
    /* 浅色风格/主要颜色/主色禁用 */
    border: none;
    background: #fff;
    border: 1px solid rgba(61, 130, 242, 0.5);
    border-radius: 4px;
    color: rgba(61, 130, 242, 0.5);
}
.primaryBtn {
    padding: 0 16px;
    word-break: keep-all;
    white-space: nowrap;
    height: 32px;
    line-height: 32px;
    background: #2B67FF;
    border-radius: 4px;
    border: none;
    color: #fff;
    font-family: 'PingFang SC';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    cursor: pointer;
}
.primaryBtn:hover {
    background: rgba(61, 130, 242, 0.8);
    border-radius: 4px;
}
.textBtn {
    padding: 0 16px;
    word-break: keep-all;
    white-space: nowrap;
    height: 32px;
    line-height: 32px;
    background: #fff;
    border-radius: 4px;
    border: none;
    color: #2B67FF;
    font-family: 'PingFang SC';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid #2B67FF;
}
.textBtn:hover {
    background: rgba(61, 130, 242, 0.1);
    border: 1px solid #2B67FF;
    border-radius: 4px;
}
</style>