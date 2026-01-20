<template>
    <div class="tableBox">
        <table class="mytable"  cellspacing="0" cellpadding="8">
            <thead>
                <tr>
                    <th v-for="headItem in tableColumns" :key="headItem.id" :width="headItem.width">
                        <div>                    
                            <img :src="headItem.src" alt="">
                            {{ headItem.text }}
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, i) in state.data" :class="i % 2 !== 0 ? 'blue' : ''" :key="i">
                    <th v-for="(thItem, index) in item" :key="index">
                        <div>
                        <a-tooltip>
                                <template #title>{{ thItem.text}}</template>
                                {{ thItem.text}}
                            </a-tooltip>
                        </div>
                    </th>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
const props = defineProps({
    tableData: {
        type: Array
    },
    tableColumns: {
        type: Array
    }
})
const state = reactive({
    data: []
})
onMounted(() => {
    intiTable()
})
const intiTable = () => {
    props.tableData.forEach((item) => {
        let arr = []
        props.tableColumns.forEach((key) => {
            let obj = {}
            obj[`text`] = item[key.dataIndex]
            arr.push(obj)
        })
        state.data.push(arr)
    })
}
</script>

<style lang="less" scoped>
.tableBox {
    width: 900px;
    height: calc(100vh - 275px);
    overflow: scroll;
    .mytable {
        width: 100%;
        thead {
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 600;
            font-size: 13px;
            color: rgba(0, 0, 0, 0.6);
            background: #ECF3FF;
            th {
                div {
                    height: 40px;
                    display: flex;
                    align-items: center;
                }
                border: 1px solid rgb(224, 235, 255);
            }
            img {
                width: 16px;
                margin-right: 8px;
                margin-left: 16px;
            }
        }
        tbody {
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 13px;
            color: rgba(0, 0, 0, 0.8);
            th {
                border: 1px solid rgb(224, 235, 255);
                height: 40px;
                max-height: 60px;
                div {
                    padding-left: 16px;
                    padding-top: 10px;
                    text-align: left;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            }
            .blue {
                background: #F7FAFF;
            }
        }
    }
}
</style>