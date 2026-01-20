<template>
    <div class="container">
        <ul class="usageLists">
            <li class="usageItem" v-for="item in dataList" :key="item.key">
                <div class="itemTitle">
                    <div class="icon"></div>
                    <div class="title">{{ item.title }}</div>
                </div>
                <div class="echartContent">
                    <div :id="`echartLine${item.id}`" class="echartDiv"></div>
                    <div class="contentRight">
                        <div class="txt">-{{ t('logManage.used') }}-</div>
                        <div class="number">
                            <div class="num">{{ item.used }}</div>
                            <div class="unit">{{ item.unit || 'GB' }}</div>
                        </div>
                        <div class="txt total">-{{ t('logManage.total') }}-</div>
                        <div class="number">
                            <div class="num">{{ item.total }}</div>
                            <div class="unit">{{ item.unit || 'GB' }}</div>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>
<script setup>
import * as echarts from 'echarts';
import { ref, onMounted } from 'vue';
import { systemManageStore } from '@/Stores/systemManageStore';

const { t } = useI18n()
const useSystemManageStore = systemManageStore()
const { nodeRAMLists } = storeToRefs(useSystemManageStore)
const echartsInstances = {};

onMounted(()=>{
    echartInit()
})
const defaultList = [
    {
        id: 1,
        title: '节点内存使用率',
        total: 0,
        value: 0,
        used: 0,
        unit: 0,
    },
    {
        id: 2,
        title: '节点CPU使用率',
        total: 0,
        value: 0,
        used: 0,
        unit: 0,
    },
    {
        id: 3,
        title: '节点home/guandata磁盘使用率',
        total: 0,
        value: 0,
        used: 0,
        unit: 0,
    },
]
const dataList = computed(() => {
    if (nodeRAMLists.value.length > 0) {
        return nodeRAMLists.value
    } else {
        return defaultList
    }
})

watch(() => dataList.value, () => {
    echartInit();
}, { deep: true });

const echartInit = () => {
    const colorList = [{
        x: 0,
        y: 1,
        x2: 0,
        y2: 0,
        colorStops: [{
            offset: 0,
            color: '#2CDA6A' // 0% 处的颜色
        }, {
            offset: 1,
            color: '#30E69B' // 100% 处的颜色
        }],
    }, {
        x: 0,
        y: 1,
        x2: 0,
        y2: 0,
        colorStops: [{
            offset: 0,
            color: '#FFD02B' // 0% 处的颜色
        }, {
            offset: 1,
            color: '#FFE852' // 100% 处的颜色
        }],
    }, {
        x: 0,
        y: 1,
        x2: 0,
        y2: 0,
        colorStops: [{
            offset: 0,
            color: '#F13432' // 0% 处的颜色
        }, {
            offset: 1,
            color: '#F95A43' // 100% 处的颜色
        }],
    }];
    
    dataList.value.forEach((item) => {
        let myChart;
        if (echartsInstances[item.id]) {
            myChart = echartsInstances[item.id]; // 使用已有的 ECharts 实例
        } else {
            myChart = echarts.init(document.getElementById(`echartLine${item.id}`)); // 初始化新的 ECharts 实例
            echartsInstances[item.id] = myChart; // 保存实例引用
        }
        let value = Number(item.value)
        let name = item.title
        // 指定图表的配置项和数据
        let option = {
            backgroundColor: '#fff',
            angleAxis: {
                show: false,
                max: 200,
                type: "value",
                startAngle: 180, //极坐标初始角度
                endAngle: 0, //极坐标初始角度
                splitLine: {
                    show: false,
                },
            },
            radiusAxis: {
                show: false,
                type: "category",
            },
            //   圆环位置和大小
            polar: {
                center: ["50%", "50%"],
                radius: "157%",
            },
            title: {
                text: name,
                x: item.id === 3 ? '25%' : '35%',
                y: '55%',
                textStyle: {
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: "400",
                    color: "#3E4959",
                    width: 100,
                },
            },
            series: [
                // 内层刻度背景半圆
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    radius: '70%',
                    splitNumber: 2,
                    center: ["50%", "50%"],
                    connectNulls: true,
                    title: {
                        show: false,
                    },
                    detail: {
                        show: false,
                    },
                    detail: {
                        backgroundColor: '#fff',
                        fontSize: 30,
                        color: '#0A2040',
                        offsetCenter: [0, -10],
                        formatter: function () {
                            return `${Math.abs(value)}%`;
                        },
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            width: 10,
                            color: [
                                [0.6, colorList[0]],
                                [0.8, colorList[1]],
                                [1, colorList[2]],
                            ],
                            borderColor: '#000',
                            borderWidth: '10',
                        },
                    },
                    axisTick: {
                        distance: 0,
                        length: 15,
                        lineStyle: {
                            color: '#999',
                            width: 2
                        }
                    },
                    splitLine: {
                        length: 18,
                        distance: 0,
                        lineStyle: {
                            color: '#999',
                            width: 2
                        },
                    },
                    axisLabel: {
                        color: '#999',
                        formatter(value) {
                            return `${value}%`
                        },
                        z: 100,
                    },
                    pointer: {
                        show: false,
                    },
                    data: [{
                        value: value,
                    }]
                },
                // 外层灰色背景
                {
                    type: 'gauge',
                    radius: '85%',
                    center: ["50%", "50%"],
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    title: {
                        show: false
                    },
                    detail: {
                        show: false
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            width: 18,
                            color: [[1, 'rgba(225,225,225,0.4)']],
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        show: false
                    },
                    pointer: {
                        show: false,
                    },
                    itemStyle: {
                        // normal: {
                        color: '#54F200',
                        // },
                    },
                },
                {
                    type: "bar",
                    stack: "外层圈",
                    data: [
                        {
                            //上层圆环，显示数据
                            value: value,
                            name: "外层圈",
                            itemStyle: {
                                color: value <= 60 ?
                                    new echarts.graphic.LinearGradient(0, 0, 1, 0, colorList[0].colorStops) :
                                    value <= 80 ?
                                        new echarts.graphic.LinearGradient(0, 0, 1, 0, colorList[1].colorStops) :
                                        new echarts.graphic.LinearGradient(0, 0, 1, 0, colorList[2].colorStops)
                            },
                        },
                    ],

                    barGap: "-100%", //柱间距离,上下两层圆环重合
                    coordinateSystem: "polar",
                    z: 2, //圆环层级，同zindex
                },
                {
                    stack: "外层圈",
                    type: "bar",
                    data: [0.01],
                    showBackground: false,
                    coordinateSystem: "polar",
                    roundCap: true,
                    z: 100,
                    barWidth: 20,
                    itemStyle: {
                        color: "white",
                        borderColor: "white",
                        borderWidth: 5,
                        shadowColor: '#DDE9DD',
                        shadowBlur: 15,
                        shadowOffsetY: 2,
                    },
                },
            ]
        }
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    })
}

</script>
<style lang="less" scoped>
.container {
    width: 100%;
    margin-top: 20px;

    .usageLists {
        display: flex;
        overflow: hidden;
        gap: 12px;
        &:hover{
            overflow: auto hidden;
        }

        .usageItem {
            background-color: #fff;
            height: 273px;
            min-width: 556px;
            border-radius: 4px;

            .itemTitle {
                display: flex;
                align-items: center;
                padding: 16px 0 0 16px;

                .icon {
                    width: 4px;
                    height: 14px;
                    border-radius: 5px;
                    background: linear-gradient(97.83deg, #356FFF 5.97%, #61AAFF 101.98%);
                    margin-right: 8px;
                }

                .title {
                    font-size: 18px;
                    color: #000000;
                    line-height: 25px;
                    font-weight: 600;
                    opacity: 0.8;
                }
            }

            .echartContent {
                display: flex;

                .echartDiv {
                    width: 350px;
                    height: 350px;
                }

                .contentRight {
                    width: 200px;
                    height: 180px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: flex-end;
                    flex-direction: column;
                    padding-left: 40px;

                    .txt,
                    .number {
                        width: 100%;
                    }

                    .txt {
                        color: #474C59;
                        font-size: 15px;
                        line-height: 21px;
                        font-weight: 600;
                    }

                    .number {
                        margin-top: 6px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                    }

                    .number .num {
                        color: #131B26;
                        font-size: 24px;
                        font-weight: 700;
                        line-height: 32px;
                    }

                    .number .unit {
                        font-size: 14px;
                        font-weight: 400;
                        color: #131B26;
                        margin-left: 4px;
                        margin-top: 6px;
                    }

                    .total {
                        margin-top: 32px;
                    }
                }
            }
        }
    }
}
</style>