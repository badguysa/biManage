<template>
    <div class="container">
        <div class="title">节点负载</div>
        <div class="echartContent">
            <div id="echartLine" class="echartDiv"></div>
            <div class="rightTable">
                <table v-if="nodeLoadTrendData.length">
                    <tr>
                        <td></td>
                        <td>COLOR</td>
                        <td>MIN</td>
                        <td>MAX</td>
                        <td>AVG</td>
                        <td>CURRENT</td>
                    </tr>
                    <tr v-for="(item, index) in nodeLoadTrendData" :key="index">
                        <td>
                            <div :class="['common-class', `color${(index + 1) % 8}`]"></div>
                        </td>
                        <td :title="item.node">{{ item.node }}</td>
                        <td :title="item.min">{{ item.min }}</td>
                        <td :title="item.max">{{ item.max }}</td>
                        <td :title="item.avg">{{ item.avg }}</td>
                        <td :title="item.current">{{ item.current }}</td>
                    </tr>
                </table>
                <noData v-else />
            </div>
        </div>
    </div>
</template>
<script setup>
import * as echarts from 'echarts';
import noData from '@/components/noData'
import { ref, onMounted, toRaw, watch } from 'vue';
import { systemManageStore } from '@/Stores/systemManageStore';

const useSystemManageStore = systemManageStore()
const { nodeLoadTrendData, nodeOptions } = storeToRefs(useSystemManageStore)
const showAll = ref(false)
const xLabels = ref([])
const seriesLists = ref([])

onMounted(async ()=>{
    await nextTick()
    if(nodeLoadTrendData.value.length){
        echartInit();
    }
})

watch(()=> nodeLoadTrendData.value, (newData) => {
    if (newData.length) {
        echartInit();
    }
}, {
    deep: true
});

const nodeLoadLineData = computed(() => {
    let obj = {};
    nodeLoadTrendData.value.forEach((item) => {
        obj[item.node] = generateTimeData(item.trend);
    });
    return obj;
});

const generateTimeData = (obj)=> {
    let timeData = {};
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 5) {
            let h = hour < 10 ? '0' + hour : hour;
            let m = minute < 10 ? '0' + minute : minute;
            let timeLabel = `${h}:${m}`;
            timeData[timeLabel] = obj[timeLabel] ? obj[timeLabel] : undefined
        }
    }
    return timeData;
}

const getSeries = ()=>{
    // X轴的时间显示
    let timeLabels = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 5) {
            let h = hour < 10 ? '0' + hour : hour;
            let m = minute < 10 ? '0' + minute : minute;
            timeLabels.push(`${h}:${m}`);
        }
    }
    // 动态 series data
    const seriesList =  []
    const colors = [ '#F9B44F', '#23C343', '#FF7D00', '#14C9C9', '#7D5DFF', '#FF55DA', '#F98981', '#3A8BFF']
    let filteredTimeLabels = timeLabels.filter(label => label.endsWith(':00'));
    nodeOptions.value.forEach((item,index) => {
        let obj = {}
        obj.name = item.value
        obj.color = colors[(index % 8)]
        obj.data = showAll.value ? Object.values(nodeLoadLineData.value[item.value]) : filteredTimeLabels.map(label => nodeLoadLineData.value[item.value][label])
        seriesList.push(obj)
    })
    let series = []
    series = seriesList.map(item => ({
        name: item.name,
        type: 'line',
        showAllSymbol: true,
        symbolSize: 0,
        itemStyle: {},
        lineStyle: { color: item.color },
        data: item.data
    }));
    xLabels.value = showAll.value ? timeLabels : filteredTimeLabels
    seriesLists.value = series
}

const echartInit = () => {
    getSeries()
    let myChart = echarts.init(document.getElementById("echartLine"));
    let option = {
        backgroundColor: 'white',
        grid: {
            top: '20%',
            left: '4%',
            right: '5%',
            bottom: '8%',
            containLabel: false
        },
        tooltip: {
            trigger: 'axis',
            borderWidth: 1,
            axisPointer: {
                type: 'shadow'
            },
            extraCssText: 'z-index:2'
        },
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: 0,
                start: 0,
                end: 100,
                zoomOnMouseWheel: true // Enable mouse wheel zooming
            }
        ],
        xAxis: {
            type: 'category',
            name: '时间',
            nameLocation: 'end',
            nameGap: 15, // Gap between the name and the axis
            nameTextStyle: {
                color: '#3E4959',
                fontSize: 12,
                fontWeight: 400,
                align: 'center', // Align the name text to the center
                verticalAlign: 'top',
                padding: [ 5, 0, 0, 0] ,
            },
            data: toRaw(xLabels.value),
            axisLine: {
                show: false,
                onZero: false,
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: true,
                color: '#393939', //X轴文字颜色
                interval: showAll.value ? 11 : 0, // Display every 12th label (for each hour)
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dashed', // Set the line style to dashed
                    color: '#eeeeee'
                }
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '负载',
                nameTextStyle: {
                    color: '#3E4959',
                    fontSize: 12,
                    fontWeight: 400,
                    align: 'right',
                },
                min: 0, // 确保y轴从0开始
                nameGap: 20,  // 表现为上下位置
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#eeeeee'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#393939',
                    fontSize: 14,
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed', 
                        color: '#eeeeee'
                    }
                }
            }
        ],
        series: seriesLists.value,
    }
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);

    // 获取鼠标悬浮位置
    let zoomCenter = 50; // 初始化为中间位置

    myChart.getZr().on('mousemove', function (event) {
        let pointInPixel = [event.offsetX, event.offsetY];
        let pointInGrid = myChart.convertFromPixel('grid', pointInPixel);
        if (pointInGrid) {
            let xIndex = pointInGrid[0];
            let xDataLength = option.xAxis.data.length;
            zoomCenter = (xIndex / xDataLength) * 100;
        }
    });

    // 添加鼠标滚轮事件监听
    myChart.getZr().on('mousewheel', function (event) {
        const zoomSpeed = 10; // 缩放速度
        let dataZoom = option.dataZoom[0];
        let delta = event.wheelDelta;
        let start = dataZoom.start;
        let end = dataZoom.end;

        // 计算新的 start 和 end
        if (delta > 0) { // 放大
            let range = (end - start) * (1 - zoomSpeed / 100);
            start = Math.max(zoomCenter - range / 2, 0);
            end = Math.min(zoomCenter + range / 2, 100);
        } else { // 缩小
            let range = (end - start) * (1 + zoomSpeed / 100);
            start = Math.max(zoomCenter - range / 2, 0);
            end = Math.min(zoomCenter + range / 2, 100);
        }

        // 更新 dataZoom
        dataZoom.start = start;
        dataZoom.end = end;

        // 动态更新 X 轴标签的显示
        if (end - start >= 90) {
            if (showAll.value) {
                showAll.value = false;
                getSeries();
                option.xAxis.axisLabel.interval = 0;
                option.xAxis.data = toRaw(xLabels.value);
                option.series = toRaw(seriesLists.value);
            }
        } else {
            if (!showAll.value) {
                showAll.value = true;
                getSeries();
                option.xAxis.axisLabel.interval = 11;
                option.xAxis.data = toRaw(xLabels.value);
                option.series = toRaw(seriesLists.value);
            }
        }
        myChart.setOption(option);
    });

    // 监听 dataZoom 事件
    myChart.on('dataZoom', function (params) {
        let dataZoom = params.batch[0];
        let start = dataZoom.start;
        let end = dataZoom.end;
        // 动态更新 X 轴标签的显示
        if (end - start >= 90) {
            if (showAll.value) {
                showAll.value = false; // Show all data points
                getSeries();
                option.xAxis.axisLabel.interval = 0;
                option.xAxis.data = toRaw(xLabels.value);
                option.series = toRaw(seriesLists.value);
                myChart.setOption(option);
            }
        } else {
            if (!showAll.value) {
                showAll.value = true; // Limit data points
                getSeries();
                option.xAxis.axisLabel.interval = 11;
                option.xAxis.data = toRaw(xLabels.value);
                option.series = toRaw(seriesLists.value);
                myChart.setOption(option);
            }
        }
    });
}

</script>
<style lang="less" scoped>
.container {
    width: 100%;
    margin-top: 20px;
    background-color: white;
    height: 400px;
    padding: 16px 20px;

    .title {
        font-size: 18px;
        font-weight: 800;
        color: #000000;
        opacity: 0.8;
    }

    .echartContent {
        display: flex;
        overflow: hidden;
        &:hover {
            overflow: auto hidden;
        }

        .echartDiv {
            min-width: 1000px;
            height: 350px;
        }

        .rightTable {
            min-width: 620px;
            height: 320px;
            margin-left: 16px;
            overflow: hidden auto;
            position: relative;
            table {
                width: 100%;
                border-collapse: collapse;

                tr {
                    &:nth-of-type(odd) {
                        background-color: #f7faff;
                    }

                    &:first-of-type {
                        color: #8A8B99;
                        background-color: #ecf3ff;
                        position: sticky;
                        top: 0px;
                    }

                    th,
                    td {
                        max-width: 200px;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                        padding: 10px 12px;

                        // border: 1px solid #e0ebff;
                        &:first-of-type {
                            width: 30px;
                            padding: 0 0 0 10px;
                        }

                        .common-class {
                            width: 20px;
                            height: 5px;
                            border-radius: 4px;
                        }

                        .color0 {
                            background-color: #3A8BFF;
                        }

                        .color1 {
                            background-color: #F9B44F;
                        }

                        .color2 {
                            background-color: #23C343;
                        }

                        .color3 {
                            background-color: #FF7D00;
                        }

                        .color4 {
                            background-color: #14C9C9;
                        }

                        .color5 {
                            background-color: #7D5DFF;
                        }

                        .color6 {
                            background-color: #FF55DA;
                        }

                        .color7 {
                            background-color: #F98981;
                        }
                    }
                }
            }


        }
    }
}
</style>