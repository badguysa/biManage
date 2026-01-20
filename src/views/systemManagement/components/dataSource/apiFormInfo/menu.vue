<template>
    <div class="menu-style">
        <div v-for="item in propsData" :key="item.key">
            <div v-if="IsArray(item.children)">
                <div v-if="item.children.length">
                    <div v-if="flag === 'first'" class="key-style">
                        <img @click="nodeSelect(item)" v-show="item.isSelect" class="img-style" src="@/assets/icons/is_select.png" />
                        <img @click="nodeSelect(item)" v-show="!item.isSelect" class="img-style" src="@/assets/icons/not_select.png" />
                        <img @click="item.isExpand = !item.isExpand" v-show="!item.isExpand" class="do-style" :src="openImg" />
                        <img @click="item.isExpand = !item.isExpand" v-show="item.isExpand" class="do-style" :src="downImg" />
                        <span @click="item.isExpand = !item.isExpand">{{ item.title }}</span>
                    </div>
                    <div v-else-if="flag === 'second'" class="input-style">
                        <input :style="{ width: isCrossLevel ? '100px' : '120px' }" v-if="!item.children" @change="ipnutChange" type="text" v-model="item.originName">
                    </div>
                    <div v-else-if="flag === 'third'" class="type-style">
                    </div>
                    <div v-else-if="flag === 'fourth'" class="type-style">
                    </div>
                    <div v-show="item.isExpand" :style="{marginLeft: flag === 'first' ? '20px': '0px'}">
                        <Menu :flag="flag" :props-data="item.children" />
                    </div>
                </div>
                <div v-else>
                    <div @click="onSelect(item)" v-if="flag === 'first'" class="key-style">
                        <img v-show="item.isSelect" class="img-style" src="@/assets/icons/is_select.png" />
                        <img v-show="!item.isSelect" class="img-style" src="@/assets/icons/not_select.png" />
                        {{ item.title }}
                    </div>
                    <div v-else-if="flag === 'second'" class="input-style">
                        <input :style="{ width: isCrossLevel ? '100px' : '120px' }" v-if="!item.children" @change="ipnutChange" type="text" v-model="item.originName">
                    </div>
                    <div v-else-if="flag === 'third'" class="type-style">
                    </div>
                    <div v-else-if="flag === 'fourth'" class="type-style">
                    </div>
                </div>
            </div>
            <div v-else>
                <div @click="onSelect(item)" v-if="flag === 'first'" class="key-style">
                    <img v-show="item.isSelect" class="img-style" src="@/assets/icons/is_select.png" />
                    <img v-show="!item.isSelect" class="img-style" src="@/assets/icons/not_select.png" />
                    {{ item.title }}
                </div>
                <div v-else-if="flag === 'second'" class="input-style">
                    <input :style="{ width: isCrossLevel ? '100px' : '120px' }" v-if="!item.children" @change="ipnutChange" type="text" v-model="item.originName">
                </div>
                <div v-else-if="flag === 'third'" class="type-style">
                    <a-select 
                        :style="{ width: isCrossLevel ? '92px' : '98px' }"
                        v-model:value="item.numType"
                        @select="ipnutChange"
                    >
                        <a-select-option 
                            v-for="opItem in typeList" 
                            :key="opItem.value" 
                            :value="opItem.value"
                            :title="t(opItem.label)"
                        >
                            <span role="img">
                                <img style="width: 16px" :src="opItem.imgSrc" alt="">
                            </span>
                            {{ t(opItem.label) }}
                        </a-select-option>
                    </a-select>
                </div>
                <div v-else-if="flag === 'fourth'" class="type-style">
                    <a-switch
                        size="small"
                        v-if="item.isSelect && !item.notAllowed"
                        v-model:checked="item.isRelation"
                        @change="switchChange"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { mainStore } from '@/Stores/mainStore';
import { IsArray } from '@/utils/utils';
import { createTableData } from '@/utils/apiParse';
import Menu from './menu.vue'
import { message } from 'ant-design-vue';
import openImg from '@/assets/icons/openright.png'
import downImg from '@/assets/icons/downone.png'
import num_img from '@/assets/icons/number.png'
import text_img from '@/assets/icons/text.png'
import time_img from '@/assets/icons/time.png'
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const useMainStore = mainStore()

const { parentKeys, settingKeys, requestData, isCrossLevel } = storeToRefs(useMainStore)

const props = defineProps({
    propsData: {
        type: Array
    },
    flag: {
        type: String
    }
})

const typeList = [{
    id: 'textImg',
    value: 0,
    label: 'selfConfig.string',
    imgSrc: text_img
},{
    id: 'timeImg',
    value: 2,
    label: 'selfConfig.time',
    imgSrc: time_img
},{
    id: 'numImg',
    value: 1,
    label: 'api.numType',
    imgSrc: num_img
}]

const findParentNode = (originData, name) => {
    let findData = null
    for (let i = 0; i < originData.length; i++) {
        if (originData[i].originName === name) {
            findData = originData[i]
            return findData
        }
        if (originData[i].children){
            findData = findParentNode(originData[i].children, name)
            if (findData) {
                return findData
            }
        }
    }
}

const onSelect = record => {
    record.isSelect = !record.isSelect
    const temp = record.key.split('##')
    const key = temp.length > 2 ? temp.splice(0, temp.length - 1).join('').toString() : '###'
    const parentNode = findParentNode(requestData.value, record.key.split('##')[record.key.split('##').length - 2])
    if (record.isSelect) { // 选中
        if (!settingKeys.value.length && !parentKeys.value) { // 初始化
            useMainStore.setParentKeys(key)
            useMainStore.changeSettingKeys(record, 'add')
            if (parentNode && (settingKeys.value.length === parentNode.children?.length)) {
                parentNode.isSelect = true
            }
        } else if (settingKeys.value.length) {
            if (parentKeys.value === key) { // 保证 被勾选的节点有相同的直属父级节点
                useMainStore.changeSettingKeys(record, 'add')
                if (parentNode && (settingKeys.value.length === parentNode.children?.length)) {
                    parentNode.isSelect = true
                }
            } else {
                message.warn(t('api.selectNodeTip'))
                record.isSelect = false
            }
        }
    } else { // 取消选中
        useMainStore.changeSettingKeys(record, 'del')
        if (!settingKeys.value.length) { // 如果settingKeys长度为空,都已被取消,重置parentKeys
            useMainStore.setParentKeys('')
            if (parentNode) {
                parentNode.isSelect = false
            }
        }

    }
    // const table = createTableData(settingKeys.value)
    // useMainStore.setApiPreviewColumns(table.columns)
    // useMainStore.setApiPreviewData(table.data)
}
const nodeSelect = (item) => {
    item.isSelect = !item.isSelect
    if (item.isSelect) {

    }
    // if (item.children && item.children.length) {
    //     const record = item.children[0]
    //     const temp = record.key.split('##')
    //     const key = temp.length > 2 ? temp.splice(0, temp.length - 1).join('').toString() : '###'
    //     if (item.isSelect) {
    //         if ((!settingKeys.value.length && !parentKeys.value) || (parentKeys.value === key)) {
    //             item.children.forEach(i => {
    //                 i.isSelect = true
    //             })
    //             useMainStore.setParentKeys(key)
    //             useMainStore.changeSettingKeys(item.children, 'set')
    //         } else if (settingKeys.value.length) {
    //             message.warn(t('api.selectNodeTip'))
    //             item.isSelect = false
    //         }
    //     } else {
    //         if (parentKeys.value === key) { // 保证 被勾选的节点有相同的直属父级节点
    //             item.children.forEach(i => {
    //                 i.isSelect = false
    //             })
    //             useMainStore.setParentKeys('')
    //             useMainStore.changeSettingKeys([], 'set')
    //         }
    //     }
    //     const table = createTableData(settingKeys.value)
    //     useMainStore.setApiPreviewColumns(table.columns)
    //     useMainStore.setApiPreviewData(table.data)
    // } else {
    //     item.isSelect = false
    // }
}
const switchChange = () => {
    useMainStore.setMultiDataList()
}
// 确保每次的变化，表格数据都能实时刷新
const ipnutChange = () => {
    useMainStore.setMultiDataList()
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
        height: 32px;
        margin-top: 4px;
    }
    .type-style {
        height: 32px;
        margin-top: 4px;
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