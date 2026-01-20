<template>
    <myModal :modal-name="tempData.name" width="640px" :showBottom="false" @onCancel="onCancel">
        <template #modal-body>
            <div class="tableTrendModal">
                <div ref="echartsRef" style="height: 100%;"></div>
            </div>
        </template>
    </myModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts';
import { getTableTrend } from '@/apis/board';
import { storeToRefs } from 'pinia';
import { modalStore } from '@/Stores/modalStore'
import homeStore from '@/Stores/homeStore'
import myModal from '@/components/myModal';
const useHomeStore = homeStore()
const useModalStore = modalStore()
const { tempData } = storeToRefs(useHomeStore)
const echartsRef = ref(null)
const xAxis = ref([])
const yAxis = ref([])
onMounted(() => {
    getTableTrend({
        tableId: tempData.value.id
    }).then(res => {
        if (res.code === 1 && res.data?.length) {
            if (res.data.length < 7) {
                const number = 7 - res.data.length
                const miniDate = res.data[0].dateValue
                let array = []
                for (let i = 1; i <= number; i++) {
                    array.unshift({
                        id: i,
                        dateValue: miniDate - i,
                        incCount: 0
                    })
                }
                res.data = [...array, ...res.data]
            }
            res.data.forEach(item => {
                item.dateText = String(item.dateValue).substring(4, 6) + '-' + String(item.dateValue).substring(6, 8)
            })
            xAxis.value = res.data.map(item => item.dateText)
            yAxis.value = res.data.map(item => Number(item.incCount))
            initEcharts()
        }
    })
})
const onCancel = () => {
    useModalStore.changeTableTrendModalVisible()
}
const initEcharts = () => {
    const myChart = echarts.init(echartsRef.value, null, { renderer: 'svg' });
    const option = {
        xAxis: {
            type: "category",
            data: xAxis.value,
            boundaryGap: false
        },
        yAxis: {
            offset: 120
        },
        series: [{
            showAllSymbol: true,
            data: yAxis.value,
            type: "line",
            symbol: "circle",
            itemStyle: {
                "lineStyle": {
                    "color": "#2B67FF",
                    "lineStyle": {
                        "color": "#2B67FF"
                    }
                }
            },
            label: {
                show: true,
            },
            endLabel: {
                show: false
            }
        }]
    }
    myChart.setOption(option)
}
</script>

<style lang="less" scoped>
.tableTrendModal {
    width: 640px;
    height: 430px;
    padding: 0 30px;
}
</style>