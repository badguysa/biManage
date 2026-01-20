<template>
    <div class="girdBox" v-if="data.length > 0">
        <div class="gird-symbol">
            <div class="symbol" @mouseenter="isandenter" @mouseleave="isandleave">
                <div class="verline"
                    :class="{ qie_line: data[data.length - 1].logic == 'AND' && !data[data.length - 1].isNesting || data[data.length - 1].logic == 'OR' && data[data.length - 1].isNesting, huo_line: data[data.length - 1].logic == 'OR' && !data[data.length - 1].isNesting || data[data.length - 1].logic == 'AND' && data[data.length - 1].isNesting }">
                </div>
                <div class="condition huo_text"
                    v-if="data[data.length - 1].logic == 'OR' && !data[data.length - 1].isNesting || data[data.length - 1].isNesting && data[data.length - 1].logic == 'AND'">
                    或<img src="@/assets/icons/green_down.png" alt=""></div>
                <div class="condition qie_text" v-else>且<img src="@/assets/icons/yellow_down.png" alt=""></div>
            </div>
            <div class="change_box" @mouseenter="isandenter" @mouseleave="isandleave" v-show="state.isandVisible">
                <ul class="change">
                    <li v-for="i in option" @click="changeLogic(i.logic)">
                        {{ i.text }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="gird-right">
            <div class="gird-tree">
                <div class="condition-item" :key="index" v-for="(fliterItem, index) in data">
                    <div v-if="fliterItem.symbol == 'exp'">
                        <!--                    <span class="rule-container">{{ ruleInfo }}</span>-->
                        <span class="rule-container">{{ fliterItem.info }}</span>
                        <img src="@/assets/icons/delete.png" class="del" @click="removeFliter(index)" alt="删除图标">
                    </div>
                    <div style="display: flex; align-items:center ;" v-if="fliterItem.symbol == '' || fliterItem.symbol != 'exp'">

                        <!-- 第一步选择字段 -->
                        <a-select v-model:value="fliterItem.leftExpression.content" placeholder="请选择字段"
                            class="condition-sele mid-wid" @select="conditionChange(fliterItem)">
                            <a-select-option v-for="item in injectData.selectedCode" :value="item.columnName"
                                :disabled="item.disabled">
                                <span role="img">
                                    <img style=" width: 16px" :src="getIconSrc(item)" alt="">
                                </span>
                                {{ item.columnAlias || item.columnName }}
                            </a-select-option>
                        </a-select>

                        <!-- 第二步选择条件 -->
                        <a-select v-model:value="fliterItem.symbol" placeholder="请选择字段" class="condition-sele small-wid"
                            @select="conditionChange(fliterItem)">
                            <a-select-option v-for="item in operationList" :value="item.symbol">
                                {{ item.text }}
                            </a-select-option>
                        </a-select>

                        <!-- 第三步是否为动态参数 -->
                        <a-switch
                            v-if="!(fliterItem.symbol === 'notnull' || fliterItem.symbol === 'isnull' || fliterItem.symbol === 'isblank' || fliterItem.symbol === 'notblank')"
                             v-model:checked="fliterItem.checked" 
                             style="margin-right: 5px;" 
                             checked-children="动态参数开" 
                             un-checked-children="动态参数关" 
                             @change="switchChange(fliterItem)"
                        />
                        

                        <!-- 开启动态参数 -->
                        <div v-show="fliterItem.checked" style="display: flex; align-items: center;">
                            <div class="dynamic-text">{{ fliterItem.rightExpression.content }}</div>
                            <a-input 
                                style="width: 150px; 
                                margin-right: 5px;" 
                                v-model:value="fliterItem.rightExpression.apiParams.example" 
                                addon-before="示例："
                                @change="conditionChange(fliterItem)" 
                            />
                            <a-input 
                                v-if="!(fliterItem.symbol === 'notnull' || fliterItem.symbol === 'isnull' || fliterItem.symbol === 'isblank' || fliterItem.symbol === 'notblank')"
                                v-model:value="fliterItem.rightExpression.apiParams.desc" 
                                :key="index" 
                                style="width: 150px; margin-right: 5px;"
                                class="condition-input"
                                placeholder="参数说明" 
                            />
                            <a-switch v-model:checked="fliterItem.rightExpression.apiParams.require" style="margin-right: 5px;" checked-children="必须" un-checked-children="非必须" />
                        </div>

                        <!-- 未开启动态参数 -->
                        <a-input 
                            style="margin-left: 5px;"
                            v-if="!(fliterItem.symbol === 'notnull' || fliterItem.symbol === 'isnull' || fliterItem.symbol === 'isblank' || fliterItem.symbol === 'notblank') && !fliterItem.checked"
                            v-model:value="fliterItem.rightExpression.content" 
                            :key="index" 
                            class="condition-input"
                            placeholder="" 
                            @change="conditionChange(fliterItem)" 
                        />
                        <img src="@/assets/icons/delete.png" class="del" @click="removeFliter(index)" alt="删除图标">
                    </div>

                </div>
                <div class="addRelationBox">
                    <div class="addRelationbtn" @mouseenter="onmouseenter" @mouseleave="onmouseleave">
                        <img src="@/assets/icons/add_relation.png" alt="">
                        添加
                    </div>
                    <transition name="fade">
                        <ul @mouseenter="onmouseenter" @mouseleave="onmouseleave" v-show="state.menuVisible"
                            class="selectMenu" :style="{ 'zIndex': parseInt((new Date()).valueOf()) }">
                            <li v-for="item in addlist" :key="item.id" @click="addRelation(item.type)">
                                {{ item.text }}
                            </li>
                        </ul>
                    </transition>
                </div>
            </div>
            <div :key="index" v-for="(fliterItem, index) in data">
                <Menu v-if="fliterItem.nesting" :data="fliterItem.nesting" @updataTableData="filedChangeHandle"
                    @appendNesting="appendNesting" />
            </div>
        </div>
    </div>
    <addFliterModal v-if="addFliterModalVisible" ref="modalRef" @getRule="getEditorRule" />
</template>
<script setup>
import { computed, reactive, ref, defineExpose, inject, onUnmounted } from 'vue'
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from "pinia";
import { modalStore } from '@/Stores/modalStore'
import { apiSymbolKey } from '@/utils/utils'
import addFliterModal from '@/views/dataCenter/centerLayout/modals/addFliterModal';
import Menu from './tree.vue';
import text_img from "@/assets/icons/text.png";
import num_img from "@/assets/icons/number.png";
import time_img from "@/assets/icons/time.png";
const useMainStore = mainStore()
const { dynamicNum } = storeToRefs(useMainStore)

const injectData = inject(apiSymbolKey)

const useModalStore = modalStore()
const { addFliterModalVisible } = storeToRefs(useModalStore)
const props = defineProps({
    data: {
        type: Array,
    }
})
const emit = defineEmits(['updataTableData', 'appendNesting'])

const state = reactive({
    menuVisible: false,
    isandVisible: false,
})
const option = [{
    logic: 'AND',
    text: '且'
}, {
    logic: 'OR',
    text: '或'
}]
const addlist = [{
    text: '添加关系: 且',
    type: 1
}, {
    text: '添加关系: 或',
    type: 2
}, {
    text: '添加条件',
    type: 3
}]
const operationList = [{
    text: '等于',
    symbol: 'eq',
}, {
    text: '不等于',
    symbol: 'ne',
}, {
    text: '大于',
    symbol: 'gt',
}, {
    text: '大于等于',
    symbol: 'gte',
}, {
    text: '小于',
    symbol: 'lt',
}, {
    text: '小于等于',
    symbol: 'lte',
}, {
    text: '为空',
    symbol: 'isnull'
}, {
    text: '不为空',
    symbol: 'notnull'
}]
onUnmounted(() => {
    useMainStore.setDynamicNum('over')
})
//添加条件
const addRelation = (type) => {
    if (type === 1) {
        if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && (props.data[props.data.length - 1].logic == 'OR' && props.data[props.data.length - 1].isNesting || props.data[props.data.length - 1].logic == 'AND' && !props.data[props.data.length - 1].isNesting)) {
            props.data.push({
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
            // delete props.data[props.data.length-1]['isNesting'];
        } else if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && (props.data[props.data.length - 1].logic == 'OR' && !props.data[props.data.length - 1].isNesting || props.data[props.data.length - 1].logic == 'AND' && props.data[props.data.length - 1].isNesting)) {
            props.data[props.data.length - 1].nesting = [{
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
                "logic": "OR",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
                "isNesting": true,//有嵌套，需要特殊判断logic改变，记得去掉
            }];

        } else {
            // props.data.push({
            //     "leftExpression":{
            //         "type":"column",//类型 可选:column-表列;value-值
            //         "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
            //         "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
            //     },
            //     "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
            //     "rightExpression":{
            //         "type":"value",//类型 可选:column-表列;value-值
            //         "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
            //         "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
            //     },//右表达式 结构同左表达式
            //     "logic":"AND",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
            // })
        }
    } else if (type === 2) {
        if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && (props.data[props.data.length - 1].logic == 'AND' && props.data[props.data.length - 1].isNesting || props.data[props.data.length - 1].logic == 'OR' && !props.data[props.data.length - 1].isNesting)) {
            props.data.push({
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
                "logic": "OR",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
            })
            // delete props.data[props.data.length-1]['isNesting'];
        } else if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && (props.data[props.data.length - 1].logic == 'AND' && !props.data[props.data.length - 1].isNesting || props.data[props.data.length - 1].logic == 'OR' && props.data[props.data.length - 1].isNesting)) {
            props.data[props.data.length - 1].nesting = [{
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
                "isNesting": true,//有嵌套，需要特殊判断logic改变，记得去掉
            }];

        } else {
            // props.data[props.data.length-1].nesting = [{
            //     "leftExpression":{
            //         "type":"column",//类型 可选:column-表列;value-值
            //         "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
            //         "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
            //     },
            //     "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
            //     "rightExpression":{
            //         "type":"value",//类型 可选:column-表列;value-值
            //         "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
            //         "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
            //     },//右表达式 结构同左表达式
            //     "logic":"OR",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
            // }];
        }
    } else if (type === 3) {
        if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && !props.data[props.data.length - 1].isNesting) {
            props.data.push({
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
                "logic": props.data[props.data.length - 1].logic,//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
            })
        } else if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && props.data[props.data.length - 1].logic == 'AND' && props.data[props.data.length - 1].isNesting) {
            // delete props.data[props.data.length-1]['isNesting'];
            props.data.push({
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
                "logic": 'OR',//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
            })
        } else if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && props.data[props.data.length - 1].logic == 'OR' && props.data[props.data.length - 1].isNesting) {
            // delete props.data[props.data.length-1]['isNesting'];
            props.data.push({
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
                "logic": 'AND',//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
            })
        }
    } else if (type === 4) {
        showAddFliterModal();
    }
}
//改变且或关系
const changeLogic = (value) => {
    if (props.data[props.data.length - 1].logic != value && !props.data[props.data.length - 1].isNesting) {
        // props.data[props.data.length - 1].logic = value;
        props.data.forEach(it => {
            it.logic = value
        })
    } else if (props.data[props.data.length - 1].logic == 'AND' && props.data[props.data.length - 1].isNesting) {
        props.data[props.data.length - 1].logic = 'OR';
    } else if (props.data[props.data.length - 1].logic == 'OR' && props.data[props.data.length - 1].isNesting) {
        props.data[props.data.length - 1].logic = 'AND';
    }
    emit('updataTableData');
}
//删除条件
const removeFliter = (index) => {
    if (props.data[index].nesting && props.data[index].nesting.length > 0) {
        if (props.data.length > 1) {
            let dataNodeNest = JSON.parse(JSON.stringify(props.data[index].nesting));
            let dataIndex = index + 1;
            if (index == props.data.length - 1) {
                dataIndex = index - 1;
            }
            dataNodeNest.forEach((val, dataindex) => {
                if (!props.data[dataIndex].nesting) {
                    props.data[dataIndex].nesting = [];
                }
                props.data[dataIndex].nesting.unshift(val);
            })
            props.data.splice(index, 1);
            emit('updataTableData');
        } else {
            let dataNodeNest = JSON.parse(JSON.stringify(props.data[index].nesting));
            let param = {
                index: index,
                content: dataNodeNest,
            }
            props.data.splice(index, 1);
            emit('updataTableData');
            emit('appendNesting', param);
        }

    } else {
        props.data.splice(index, 1);
        emit('updataTableData');
    }


}

// 导入数据配置鼠标事件 begin
const onmouseenter = () => {
    state.menuVisible = true
}
const onmouseleave = () => {
    state.menuVisible = false
}
const isandenter = () => {
    state.isandVisible = true
}
const isandleave = () => {
    state.isandVisible = false
}
// 导入数据配置鼠标事件 end
const filedChangeHandle = (value) => {
    // 同一个字段不能被排序两次
    emit('updataTableData');
}
const conditionChange = value => {
    if (value.symbol === 'gt' || value.symbol === 'gte' || value.symbol === 'lt' || value.symbol === 'lte' ) {
        value.rightExpression.valueType = 'long'
        value.rightExpression.apiParams.example = Number(value.rightExpression.apiParams.example)
    } else {
        value.rightExpression.valueType = 'string'
    }

    if (value.symbol == 'notnull' || value.symbol == 'isnull' || value.symbol === 'isblank' || value.symbol === 'notblank') {
        value.rightExpression.content = ''
        emit('updataTableData');
    }

    if (value.rightExpression.content.trim() && value.leftExpression.content && value.symbol) {
        emit('updataTableData');
    }
}
// 获取字段图标类型
const getIconSrc = (item) => {
    let { imgType } = item
    if (imgType === 'textImg') {
        return text_img
    } else if (imgType === 'numImg') {
        return num_img
    } else {
        return time_img
    }
}
const modalRef = ref('')

const ruleInfo = ref('')

// 获取编辑器输入内容
const getEditorRule = (info) => {
    props.data.push({
        "leftExpression": {
            "type": "expression",//类型 可选:column-表列;value-值;multiValue-多值表达式;expression-表达式
            "content": info.expression,//值 当type为column是 此值为列名;当type是value时 此值为具体值;当type是multiValue时 此值为','分隔的字符串;当type为expression时 此值为公式模板
            "valueType": "",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
            "params": info.params,//当type为expression时有此值 格式见4的params
            "apiParams": {
                "desc": "",
                "example": "",
                "require": true
            }
        },
        "symbol": "exp",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
        "rightExpression": {},//右表达式 结构同左表达式
        "logic": "AND",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
        "betweenStartExpression": {},//between开始条件
        "betweenEndExpression": {},//between结束条件
        "info": info.value,//公式内容
    })
    ruleInfo.value = info.value;
    emit('updataTableData');
}
//删除带有子级的元素，只删除当前的，需要父级添加子级
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
            props.data.splice(value.index + index, 0, val)
        })
    }
}
const switchChange = (item) => {
    if(item.checked) {
        item.rightExpression.content = '$p' + dynamicNum.value
        useMainStore.setDynamicNum()

    } else {
        item.rightExpression.apiParams.desc = ''
        item.rightExpression.apiParams.example = ''
        item.rightExpression.apiParams.require = true
        item.rightExpression.content = ''
    }
}
//是否显示公式弹框
const showAddFliterModal = () => {
    useModalStore.changeAddFliterModalVisible()
}
defineExpose({
    showAddFliterModal
})

</script>
    
<style lang="less" scoped>
.filterData {
    width: 100%;
    height: 100%;
    font-family: 'PingFang SC';
    font-style: normal;
    display: flex;
    flex-direction: column;



    .topArea {
        width: 100%;
        min-height: 52px;
        padding: 12px 16px;
        background-color: #fff;

        .btnGroup {
            height: 32px;
            margin-bottom: 16px;

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
        }

        .setting {
            min-height: 32px;
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

                    .change_box {
                        position: absolute;
                        width: 38px;
                        height: 88px;
                        top: 50%;
                        left: -5%;
                        padding-top: 15px;
                    }

                    .change {
                        background: #FFFFFF;
                        border: 1px solid #E9E9E9;
                        box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
                        border-radius: 4px;

                        li {
                            width: 38px;
                            height: 40px;
                            padding: 10px 12px;
                            cursor: pointer;

                            &:hover {
                                color: #3D82F2;
                            }
                        }
                    }
                }

                .gird-right {
                    position: relative;
                    display: table-cell;
                    vertical-align: middle;
                    height: 100%;
                    padding-bottom: 50px;
                }
            }
        }
    }

    .table-container {
        margin-top: 12px;
        padding: 12px;
        box-sizing: border-box;
        background-color: #FFFFFF;

        .tips {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.4);
        }
    }

    .tables {
        height: 100%;
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
        margin-bottom: 10px;

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

    .condition-item {
        margin-bottom: 10px;

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

        .del {
            width: 16px;
            height: 16px;
            cursor: pointer;
            margin-left: 12px;
        }

        .dynamic-text {
            background: #F5F5F5; 
            border-radius: 4px; 
            width: 41px; 
            height: 28px;
            margin: 0px 5px;
            text-align: center;
            line-height: 28px;
        }

        .rule-container {
            display: inline-block;
            background: #F3F3F3;
            border-radius: 4px;
            padding: 0 12px;
            line-height: 32px;
            font-size: 14px;
            min-width: 400px;
        }
    }
}
</style>