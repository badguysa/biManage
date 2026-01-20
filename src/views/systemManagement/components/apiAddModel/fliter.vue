<!-- 筛选 -->
<template>
    <div class="filterData">
        <div class="topArea">
            <div class="btnGroup">
                <myButton @click="addRelation(1)" class="pbtn" type="primary">添加关系:且</myButton>
                <myButton @click="addRelation(2)" class="pbtn" type="primary">添加关系:或</myButton>
                <myButton @click="addRelation(3)" class="tbtn">添加条件</myButton>
                <!-- <myButton @click="addRelation(4)" class="tbtn">添加公式</myButton> -->
                <a-tooltip color="rgba(24, 30, 51, 0.8);" :getPopupContainer="(triggerNode) => triggerNode.parentNode">
                    <template #title>
                        且: 满足所有条件 <br>
                        或: 满足任意条件
                    </template>
                    <img src="@/assets/icons/info.png" alt="">
                </a-tooltip>
                <div class="hide-text" @click="infoExpand = false" v-if="infoExpand">收起<img style="width: 10px; margin-left:4px ;" src="@/assets/icons/top-arraw-icon.png"/></div>
                <div class="hide-text" @click="infoExpand = true" v-else>展开<img style="width: 10px; margin-left:4px ;" src="@/assets/icons/down-arraw-icon.png"/></div>
            </div>
            <!-- ------------------------------------------------------------------------------------------------------------- -->
            <div class="setting" v-show="infoExpand">
                <transition name="mybox">
                    <Menu
                        :data='sortItemList' 
                        @updataTableData="filedChangeHandle" 
                        @appendNesting="appendNesting"
                        ref="RefTreeComponent" 
                    />
                </transition>
            </div>
        </div>
        <a-spin :spinning="tableLoading">
            <div class="table-container">
                <p class="tips">预览只显示前100条数据</p>
                <myTable 
                    :tableColumns="previewColumns" 
                    :tableData="previewTableData"
                    v-if="previewTableData.length"
                />
                <div class='table-blank' v-if="!previewTableData.length && !tableLoading">
                    <div class='box'>
                        <img :src="selectblank1" alt="" />
                        <div class='text'>暂无该筛选条件数据</div>
                    </div>
                </div>
            </div>
        </a-spin>
    </div>
</template>

<script setup>
import { ref, reactive, defineExpose } from 'vue'
import myButton from '@/components/buttons/myButton.vue'
import myTable from '@/components/table';
import selectblank1 from '@/assets/images/img_null1.png'

import Menu from './tree.vue'

const RefTreeComponent = ref(null);
const infoExpand = ref(true)

const emits = defineEmits(["getFilterTableData"])
const props = defineProps({
    tableLoading: {
        type: Boolean,
        default: false
    },
    previewColumns: {
        type: Array
    },
    previewTableData: {
        type: Array
    }
})
const sortItemList = reactive([{
    "leftExpression": {
        "type": "column",//类型 可选:column-表列;value-值
        "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
        "valueType": "", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间,
    },
    "symbol": "",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
    "rightExpression": {
        "type": "value",//类型 可选:column-表列;value-值
        "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
        "valueType": "string",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
        "apiParams": {
            "desc": "",
            "example": "",
            "require": true
        }
    },//右表达式 结构同左表达式
    "logic": "AND",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
}])
const addRelation = (type) => {
    if (type === 1) {
        sortItemList.push({
            "leftExpression": {
                "type": "column",//类型 可选:column-表列;value-值
                "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                "valueType": "", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间,
            },
            "symbol": "",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
            "rightExpression": {
                "type": "value",//类型 可选:column-表列;value-值
                "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                "valueType": "string",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                "apiParams": {
                    "desc": "",
                    "example": "",
                    "require": true
                }
            },//右表达式 结构同左表达式
            "logic": "AND",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        })
    } else if (type === 2) {
        if (sortItemList.length > 0) {
            sortItemList[sortItemList.length - 1].nesting = [{
                "leftExpression": {
                    "type": "column",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                },
                "symbol": "",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
                "rightExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "string",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//右表达式 结构同左表达式
                "logic": "OR",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
            }];
        } else {
            sortItemList.push({
                "leftExpression": {
                    "type": "column",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间

                },
                "symbol": "",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
                "rightExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "string",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//右表达式 结构同左表达式
                "logic": "AND",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
            })
        }

    } else if (type === 3) {
        sortItemList.push({
            "leftExpression": {
                "type": "column",//类型 可选:column-表列;value-值
                "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                "valueType": "",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间

            },
            "symbol": "",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
            "rightExpression": {
                "type": "value",//类型 可选:column-表列;value-值
                "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                "valueType": "string",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                "apiParams": {
                    "desc": "",
                    "example": "",
                    "require": true
                }
            },//右表达式 结构同左表达式
            "logic": "AND",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        })
    } else {
        RefTreeComponent.value.showAddFliterModal();
    }
}
// 导入数据配置鼠标事件 end
const filedChangeHandle = (value) => {
    updataTableData()
}

// 更新数据
const updataTableData = () => {
    if (sortItemList.length > 0) {
        let orderConfig = {
            action: "where",
            contents: sortItemList
        }
        emits('getFilterTableData', orderConfig)
    }
}
const appendNesting = (value) => {
    if (value.content && value.content.length > 0) {
        value.content.forEach((val, index) => {
            if (val.isNesting) {
                delete val['isNesting'];
                if (val.logic == 'OR') {
                    val.logic = 'AND';
                } else if (val.logic == 'AND') {
                    val.logic = 'OR';
                }
            }
            sortItemList.splice(value.index + index, 0, val)
        })
    }
}
defineExpose({
    sortItemList
})

</script>

<style lang="less" scoped>
.filterData {
    font-family: 'PingFang SC';
    font-style: normal;
    display: flex;
    flex-direction: column;

    .mybox-leave-active,
    .mybox-enter-active {
        transition: all 2s ease;
    }
    .mybox-leave-active,
    .mybox-enter {
        height: 0px !important;
    }
    .mybox-leave,
    .mybox-enter-active {
        height: auto;
    }


    .topArea {
        width: 100%;
        /*min-height: 252px;*/
        padding: 12px 16px;
        background-color: #fff;

        /*overflow-y: scroll;*/
        .btnGroup {
            position: relative;
            text-align: center;
            height: 32px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            .pbtn {
                width: 103px;
                margin-right: 20px;
            }

            .tbtn {
                margin-right: 20px;
            }

            img {
                width: 24px;
            }

            .hide-text {
                position: absolute;
                right: 5px;
                top: 5px;
                display: flex;
                align-items: center;
                color: #2B67FF;
                cursor: pointer;
            }
        }

        .setting {
            min-height: 82px;
            width: 100%;

            .girdBox {
                position: relative;
                z-index: 2;
                display: table;
                width: 100%;
                height: 100%;
                white-space: nowrap;

                .gird-symbol {
                    position: relative;
                    display: table-cell;
                    vertical-align: middle;
                    width: 34px;
                    height: 100%;
                    padding-right: 16px;

                    .symbol {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .verline {
                        position: absolute;
                        height: calc(100% + 12px);
                    }

                    .qie_line {
                        border: 1px solid #FFA63F;
                    }

                    .huo_line {
                        border: 1px solid #46B673;
                    }

                    .condition {
                        z-index: 2;
                        width: 34px;
                        height: 22px;
                        border-radius: 4px;
                        font-weight: 500;
                        font-size: 14px;
                        font-feature-settings: 'tnum' on, 'lnum' on;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        padding: 4px;

                        img {
                            width: 8px;
                            margin-left: 4px;
                        }
                    }

                    .qie_text {
                        background: #F8EBEA;
                        color: #FFA63F;
                    }

                    .huo_text {
                        color: #46B673;
                        background: #EAF8EA;
                    }

                    .change {
                        position: absolute;
                        width: 38px;
                        height: 88px;
                        top: 53%;
                        left: -5%;
                        background: #FFFFFF;
                        border: 1px solid #E9E9E9;
                        box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
                        border-radius: 4px;

                        li {
                            width: 38px;
                            height: 40px;
                            padding: 10px 12px;
                            cursor: pointer;
                        }
                    }
                }

                .gird-right {
                    position: relative;
                    display: table-cell;
                    vertical-align: middle;
                    height: 100%;
                }
            }
        }
    }

    .table-container {
        width: 62vw;
        margin-top: 12px;
        padding: 12px;
        box-sizing: border-box;
        background-color: #FFFFFF;

        .tips {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.4);
        }

        .table-blank {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;

            .box {
                text-align: center;
            }

            img {
                width: 180px;
                height: 130px;

            }

            .text {
                font-family: 'PingFang SC';
                font-style: normal;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                color: rgba(0, 0, 0, 0.4);
            }
        }
    }

    .tables {
        overflow: scroll;
        width: 100%;
        background-color: #fff;
    }

    .addRelationbtn {
        display: flex;
        align-items: center;
        width: 48px;
        height: 32px;
        color: #3D82F2;
        cursor: pointer;

        img {
            width: 16px;
            height: 16px;
            margin-right: 4px;
        }
    }

    .addRelationBox {
        position: relative;

        .selectMenu {
            position: absolute;
            width: 103px;
            background: #FFFFFF;
            border: 1px solid #E9E9E9;
            box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
            border-radius: 4px;
            left: 0;
            top: 32px;
            padding-top: 4px;

            li {
                height: 40px;
                padding: 10px 0 0 12px;
                cursor: pointer;
                line-height: 20px;
            }

            li:hover {
                background: rgba(61, 130, 242, 0.1);
            }
        }
    }

    .condition-sele {
        margin-right: 8px;
    }

    .condition-input {
        width: 240px;
    }

    .mid-wid {
        width: 200px;
    }

    .small-wid {
        width: 96px;
    }

    .condition-item {
        margin-bottom: 10px;
    }
}
</style>