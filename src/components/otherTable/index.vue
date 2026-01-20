<template>
    <div v-if="columnsConfig.otherTable && columnsConfig.otherTable.length" class="select-other-table">
        <div class="other-table">{{ t('common.otherTable') }}</div>
        <div v-for="table in columnsConfig.otherTable" :key="table.id">
            <div class="father-node">
                <img class="arrow-img" @click="table.isExpand = !table.isExpand" v-show="!table.isExpand" :src="openImg" />
                <img class="arrow-img" @click="table.isExpand = !table.isExpand" v-show="table.isExpand" :src="downImg" />
                <img @click="onSelect(table, 1)" :src="table.imgSrc" alt="">
                <span @click="onSelect(table, 1)" class="node-text" :title="table.tableAlias">{{ table.tableAlias }}</span>
            </div>
            <div v-show="table.isExpand" class="child-node" v-for="code in table.children" :key="code.id" @click="onSelect(code, 2)">
                <img :src="getIconSrc(code)" alt=""> 
                <span class="node-text" :title="code.columnAlias || code.columnName">{{ code.columnAlias || code.columnName }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getIconSrc } from '@/utils/utils'
import openImg from '@/assets/icons/openright.png'
import downImg from '@/assets/icons/downone.png'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps({
    columnsConfig: {
        default: {}
    }
})
const emits = defineEmits(['selectCode'])
const onSelect = (record, type) => {
    emits('selectCode', { record, type })
}
</script>
<style lang="less" scoped>

.select-other-table {
    .other-table {
        color: rgba(0, 0, 0, 0.4);
        height: 17px;
        font-size: 12px;
        line-height: 17px;
        margin: 4px 0 4px 12px;
    }
    .father-node {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin: 6px 12px 0 2px;
        img {
            height: 18px;
            width: 18px;
            margin-right: 4px;
        }
        .arrow-img {
            width: 15px;
            height: 15px;
        }
    }
    .child-node {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin: 6px 12px 0 24px;
        img {
            height: 16px;
            width: 16px;
            margin-right: 4px;
        }
    }
    .child-node:hover, .father-node:hover {
        background-color: rgba(61, 130, 242, 0.1);
    }
    .node-text {
        width: 90%;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
}
</style>