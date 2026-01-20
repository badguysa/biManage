<template>
    <div class="menu-style">
        <div v-for="item in propsData" :key="item.key">
            <div v-if="IsArray(item.children)">
                <div v-if="item.children.length">
                    <div v-if="flag === 'first'" class="key-style">
                        <img @click="item.isExpand = !item.isExpand" v-show="!item.isExpand" class="do-style" :src="openImg" />
                        <img @click="item.isExpand = !item.isExpand" v-show="item.isExpand" class="do-style" :src="downImg" />
                        {{ item.title }}
                    </div>
                    <div v-else-if="flag === 'third'" class="type-style">
                    </div>
                    <div v-show="item.isExpand" :style="{marginLeft: flag === 'first' ? '20px': '0px'}">
                        <Menu :flag="flag" :props-data="item.children" />
                    </div>
                </div>
                <div v-else>
                    <div @click="onSelect(item)" v-if="flag === 'first'" class="key-style">
                        <img v-show="item.isSelect" class="img-style" src="@/assets/icons/radio-a.png" />
                        <img v-show="!item.isSelect" class="img-style" src="@/assets/icons/radio-n.png" />
                        {{ item.title }}
                    </div>
                    <div v-else-if="flag === 'third'" class="type-style">
                    </div>
                </div>
            </div>
            <div v-else>
                <div @click="onSelect(item)" v-if="flag === 'first'" class="key-style">
                    <img v-show="item.isSelect" class="img-style" src="@/assets/icons/radio-a.png" />
                    <img v-show="!item.isSelect" class="img-style" src="@/assets/icons/radio-n.png" />
                    {{ item.title }}
                </div>
                <div v-else-if="flag === 'third'" class="type-style">
                    <a-tooltip placement="topLeft">
                        {{ item.value }}
                        <template #title>{{ item.value }}</template>
                    </a-tooltip>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { mainStore } from '@/Stores/mainStore';
import { IsArray } from '@/utils/utils';
import Menu from './menu.vue'
import openImg from '@/assets/icons/openright.png'
import downImg from '@/assets/icons/downone.png'

const useMainStore = mainStore()
const { paramsRequestData } = storeToRefs(useMainStore)

const props = defineProps({
    propsData: {
        type: Array
    },
    flag: {
        type: String
    }
})


const onSelect = record => {
    resetData(paramsRequestData.value)
    record.isSelect = true
    useMainStore.setParamValue(record.value)
    useMainStore.setParamApiKey(record.key)
}
const resetData = (arr) => {
    arr.forEach(item => {
        if (item.children) {
            resetData(item.children)
        } else {
            item.isSelect = false
        }
    })
}
</script>

<style lang="less" scoped>
.menu-style {
    .key-style {
        display: flex;
        align-items: center;
        height: 32px;
        margin-top: 4px;
        cursor: pointer;
    }
    .input-style {
        margin-top: 4px;
        input {
            width: 180px;
        }
    }
    .type-style {
        height: 32px;
        margin-top: 4px;
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .img-style {
        width: 16px;
        height: 16px;
        cursor: pointer;
        margin-right: 8px;
    }
    .do-style {
        width: 12px;
        height: 12px;
        cursor: pointer;
        margin-right: 10px;
    }
}
</style>