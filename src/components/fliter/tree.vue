<template>
<div class="girdBox" v-if="data.length > 0">
    <div class="gird-symbol">
        <a-dropdown>
            <div class="symbol" @mouseenter="isandenter" @mouseleave="isandleave">
                <div class="verline" :class="{qie_line:data[data.length-1].logic == 'AND' && !data[data.length-1].isNesting || data[data.length-1].logic == 'OR' && data[data.length-1].isNesting,huo_line:data[data.length-1].logic == 'OR' && !data[data.length-1].isNesting || data[data.length-1].logic == 'AND' && data[data.length-1].isNesting}"></div>
                <div class="condition huo_text" v-if="data[data.length-1].logic == 'OR' && !data[data.length-1].isNesting || data[data.length-1].isNesting && data[data.length-1].logic == 'AND'">{{ t('selfConfig.or') }}<img src="@/assets/icons/green_down.png" alt=""></div>
                <div class="condition qie_text" v-else>{{ t('selfConfig.and') }}<img src="@/assets/icons/yellow_down.png" alt=""></div>
            </div>
            <template #overlay>
            <a-menu>
                <a-menu-item v-for="item in option"  @click="changeLogic(item.logic)">
                    {{ t(item.text) }}
                </a-menu-item>
            </a-menu>
            </template>
        </a-dropdown>
    </div>
    <div class="gird-right">
        <div class="gird-tree">
            <div class="condition-item" :key="index" v-for="(fliterItem, index) in data">
                <div v-if="fliterItem.symbol == 'exp'">
                    <span class="rule-container" @click="editRuleFn(fliterItem, index)" :class="expressRuleClass(fliterItem)" >{{ fliterItem.info }}</span>
                    <!-- <img v-if="fliterItem.info" src="@/assets/icons/edit.png" class="edit" @click="editRuleFn(fliterItem, index)" alt="edit"> -->
                    <img src="@/assets/icons/delete.png" class="del" @click="removeFliter(index)" alt="delete">
                </div>
                <div v-else-if="fliterItem.symbol == 'regexp'">
                    <span class="rule-container" @click="editRuleFn(fliterItem, index)"  >{{ fliterItem.info }}</span>
                    <!-- <img v-if="fliterItem.info" src="@/assets/icons/edit.png" class="edit" @click="editRuleFn(fliterItem, index)" alt="edit"> -->
                    <img src="@/assets/icons/delete.png" class="del" @click="removeFliter(index)" alt="delete">
                </div>
                <div v-else-if="fliterItem.symbol == '' || (fliterItem.symbol != 'exp' && fliterItem.symbol != 'regexp')">

                <!-- 筛选字段 -->
                <a-select 
                    v-model:value="fliterItem.leftExpression.content" 
                    class="condition-sele mid-wid"
                    :class="{errorField: errorCodeCols.includes(fliterItem.leftExpression.content) || !includeCurVal(fliterItem.leftExpression.content)}"
                    @select="conditionChange(fliterItem)"
                    :filter-option="filterOption"
                    show-search
                >
                    <a-select-option v-for="item in optionList" :label="item.columnAlias || item.columnName" :value="item.columnName" :disabled="item.disabled" @click="onSelectChange(item, fliterItem)">
                        <span role="img">
                            <BiIcon :name="getTypeIconSvg(item)" :class="getTypeIconClassName(item)"/>
                        </span>
                        <span class="colName">
                            {{ item.columnAlias || item.columnName }}
                        </span>
                    </a-select-option>
                </a-select>

                <!-- 筛选条件 -->
                <a-select 
                    v-model:value="fliterItem.symbol" 
                    class="condition-sele small-wid"
                    @select="conditionChange(fliterItem, 'changeSymbol')"
                >
                    <a-select-option 
                        :title="t(item.text)" 
                        v-for="item in fliterItem.operationList" 
                        :value="item.symbol"
                        :style="{ borderBottom: item.border ? '1px solid #F2F3F5' : '' }"
                    >
                        {{ t(item.text) }}
                    </a-select-option>
                </a-select>

                <!-- 条件输入框 -->
                <mutipleSelect 
                    v-if="['in', 'notIn'].includes(fliterItem.symbol)"
                    :columnName="fliterItem.leftExpression.content"
                    :multiValue="fliterItem.rightExpression.content"
                    @selectField="(columns)=>selectFn(columns, fliterItem)"
                />

                <template v-else>
                
                <a-input 
                    v-if="
                        !(fliterItem.symbol === 'notnull' || 
                        fliterItem.symbol === 'isnull' ||
                        fliterItem.symbol === 'isblank' || 
                        fliterItem.symbol === 'notblank') && 
                        fliterItem.codeType !== 'date' && 
                        !['between', 'notBetween'].includes(fliterItem.symbol)
                    " 
                    v-model:value.trim="fliterItem.rightExpression.content" 
                    :key="index" 
                    class="condition-input" 
                    placeholder="" 
                    @change="conditionChange(fliterItem)"
                />

                <template v-if="
                    !(fliterItem.symbol === 'notnull' || 
                    fliterItem.symbol === 'isnull' || 
                    fliterItem.symbol === 'isblank' || 
                    fliterItem.symbol === 'notblank') && 
                    fliterItem.codeType !== 'date' && 
                    ['between', 'notBetween'].includes(fliterItem.symbol)"
                >
                    <input
                        class="condition-sele" 
                        style="width: 105px;" 
                        type="text" 
                        v-model.trim="fliterItem.betweenStartExpression.content"
                        @change="conditionChange(fliterItem)"
                    >
                    <a-select 
                        class="condition-sele" 
                        style="width: 60px;" 
                        v-model:value="fliterItem.betweenStartSymbol"
                        @select="conditionChange(fliterItem)"
                    >
                        <a-select-option value="gt">{{ `<` }}</a-select-option>
                        <a-select-option value="gte">{{ `<=` }}</a-select-option>
                    </a-select>
                    <span class="condition-sele">{{ t('selfConfig.value') }}</span>
                    <a-select 
                        class="condition-sele" 
                        style="width: 60px;" 
                        v-model:value="fliterItem.betweenEndSymbol"
                        @select="conditionChange(fliterItem)"
                    >
                        <a-select-option value="lt">{{ `<` }}</a-select-option>
                        <a-select-option value="lte">{{ `<=` }}</a-select-option>
                    </a-select>
                    <input 
                        style="width: 105px;" 
                        type="text" 
                        v-model.trim="fliterItem.betweenEndExpression.content"
                        @change="conditionChange(fliterItem)"
                    >
                </template>

                
                <template v-if="
                    !(fliterItem.symbol === 'notnull' || 
                    fliterItem.symbol === 'isnull' || 
                    fliterItem.symbol === 'isblank' || 
                    fliterItem.symbol === 'notblank') && 
                    fliterItem.codeType === 'date'"
                >
                    <!-- 日期介于 -->
                    <template v-if="['between', 'notBetween'].includes(fliterItem.symbol)">
                        <a-date-picker 
                            show-time
                            :locale="locale === 'lo' ? Lo : zhCN"
                            format="YYYY-MM-DD HH:mm:ss"
                            :value="getDatePickerValue(fliterItem, 'start')"
                            @change="(a,b) => dateChange(fliterItem, a, b, 1)"
                            class="mid-wid condition-sele"
                        />
                        <span class="condition-sele">{{ t('selfConfig.to') }}</span>
                        <a-date-picker
                            show-time
                            :locale="locale === 'lo' ? Lo : zhCN"
                            format="YYYY-MM-DD HH:mm:ss"
                            :value="getDatePickerValue(fliterItem, 'end')"
                            @change="(a,b) => dateChange(fliterItem, a, b, 2)"
                            class="mid-wid condition-sele"
                        />
                    </template>

                    <!-- 日期最早/晚的N个 -->
                    <a-input
                        v-else-if="['topN', 'topNAsc'].includes(fliterItem.symbol)"
                        v-model:value.trim="fliterItem.rightExpression.content" 
                        :key="index" 
                        class="condition-input" 
                        placeholder="N=" 
                        @change="conditionChange(fliterItem)"
                    />

                    <!-- 日期 某个日期之前/后 -->
                    <dynamicTimeSelect :timeState="fliterItem.rightExpression" @updateTimeState="updateDynamicFn" v-else-if="['lt', 'gt'].includes(fliterItem.symbol)" />

                    <!-- 单个日期输入框 -->
                    <a-date-picker
                        v-else
                        show-time
                        :locale="locale === 'lo' ? Lo : zhCN"
                        format="YYYY-MM-DD HH:mm:ss"
                        :value="getDatePickerValue(fliterItem, 'normal')"
                        @change="(a,b) => dateChange(fliterItem, a, b, 3)"
                        class="mid-wid condition-sele"
                    />
                </template>

                </template>
                <template v-if="flag == 'init'">
                    <img v-if="data.length > 1" src="@/assets/icons/delete.png" class="del" @click="removeFliter(index)" alt="删除图标">
                </template>
                <template v-if="flag != 'init'">
                    <img src="@/assets/icons/delete.png" class="del" @click="removeFliter(index)" alt="删除图标">
                </template>
            </div>

            </div>
            <a-dropdown>
                <div class="addRelationbtn" @mouseenter="onmouseenter" @mouseleave="onmouseleave">
                    <img src="@/assets/icons/add_relation.png" alt="">
                    {{ t('selfConfig.add') }}
                </div>
                <template #overlay>
                <a-menu>
                    <a-menu-item v-for="item in addlist" :key="item.id" @click="addRelation(item.type)">
                        {{ t(item.text) }}
                    </a-menu-item>
                </a-menu>
                </template>
            </a-dropdown>
        </div>
        <div :key="index" v-for="(fliterItem, index) in data">
            <Menu v-if="fliterItem.nesting" :data="fliterItem.nesting" @updataTableData="filedChangeHandle" @appendNesting="appendNesting"/>
        </div>
    </div>
</div>
<addFliterModal :editRuleInfo="editRuleInfo" :sortItemIndex="sortItemIndex" v-if="addFliterModalVisible" ref="modalRef" @changeParams="changeParamsFn" />
</template>
<script setup>
    import {configStore} from "@/Stores/configStore";
    import { mainStore } from '@/Stores/mainStore'
    import { modalStore } from '@/Stores/modalStore'
    import addFliterModal from '@/views/dataCenter/centerLayout/modals/addFliterModal';
    import Menu from '@/components/fliter/tree.vue';
    import dayjs from 'dayjs';
    import { operationList, textOperationList, numberOperationList, timeOperationList } from '@/utils/config'
    import { useI18n } from 'vue-i18n';
    import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN';
    import Lo from '@/locale/lang/lo-datepicker'
    import { getTypeIconSvg, getTypeIconClassName } from '@/utils/utils'
    import dynamicTimeSelect from '@/components/filterColumn/dynamicTimeSelect.vue'
    import mutipleSelect from '@/components/multipleSelect'

    const { t, locale } = useI18n()
    onMounted(() => {
        datePickerLocal()
    })
    const datePickerLocal = async () => {
        if (locale.value === 'lo') {
            const lo = await import('dayjs/locale/lo');
            dayjs.locale(lo)
        } else {
            const zh = await import('dayjs/locale/zh-cn');
            dayjs.locale(zh)
        }
    }
    watch(locale, () => {
        datePickerLocal()
    })
    const useConfigStore = configStore()
    const useMainStore = mainStore()
    const { activeTabKey } = storeToRefs(useMainStore)
    const { configUniqueData } = storeToRefs(useConfigStore)
    const configData = computed(() => {
        return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
    })
    const { allConfigData, operActiveId } = toRefs(configData.value)
    const optionList = computed(() => {
        let arr = []
        if (allConfigData.value.length > 0) {
            allConfigData.value.forEach(item => {
                if (item.uuid === operActiveId.value) {
                    arr = item.codeList
                }
            })
        }
        return arr
    })
    const useModalStore = modalStore()
    const { addFliterModalVisible } = storeToRefs(useModalStore)
    const props = defineProps({
        data: {
            type: Array,
        },
        flag: {
            default: ''
        }
    })
    const emit = defineEmits(['updataTableData','appendNesting', 'updateFilterParams', 'addRelationFn'])
    const state = reactive({
        menuVisible: false,
        isandVisible: false,
    })
    const option = [{
        logic: 'AND',
        text: 'selfConfig.and'
    }, {
        logic: 'OR',
        text: 'selfConfig.or'
    }]
    const addlist = [{
        text: 'selfConfig.addRelationAnd',
        type:1
    },{
        text: 'selfConfig.addRelationOr',
        type:2
    },{
        text: 'selfConfig.addCondition',
        type:3
    },{
        text: 'selfConfig.addFormula',
        type:4
    }]

    const editRuleInfo = ref([])

    const sortItemIndex = ref(-1)

    const selectFn = (columnNames, fliterItem) => {
        fliterItem.rightExpression = {
            type: 'multiValue',
            content: columnNames,
        }
        conditionChange(fliterItem)
    }

    // 编辑公式信息
    const editRuleFn = (item, index) => {
        if(item.symbol == 'exp'){
            editRuleInfo.value = [{
                expression: item.leftExpression.content,
                params: item.leftExpression.params,
            }]
        }else if(item.symbol == 'regexp'){
            editRuleInfo.value = [{
                expression: item.leftExpression.expression,
                params: item.leftExpression.params,
                customData: item.customData
            }]
        }
        sortItemIndex.value = index
        useModalStore.changeAddFliterModalVisible()
    }

    // 重置编辑公式信息
    const resetEditRuleInfo = () => {
        sortItemIndex.value = -1
        editRuleInfo.value = []
    }

    //添加条件
    const addRelation = (type) => {
        if (type === 1) {
            if(props.data[props.data.length-1] && props.data[props.data.length-1].logic && (props.data[props.data.length-1].logic == 'OR' && props.data[props.data.length-1].isNesting || props.data[props.data.length-1].logic == 'AND' && !props.data[props.data.length-1].isNesting)){
                props.data.push({
                    operationList,
                    "leftExpression":{
                        "type":"column",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },
                    "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
                    "rightExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//右表达式 结构同左表达式
                    "logic":"AND",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
                    "betweenEndSymbol": "lte",
                    "betweenStartSymbol": "gte",
                    "betweenStartExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//between开始条件
                    "betweenEndExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    }//between结束条件
                })
                // delete props.data[props.data.length-1]['isNesting'];
            }else if(props.data[props.data.length-1] && props.data[props.data.length-1].logic && (props.data[props.data.length-1].logic == 'OR' && !props.data[props.data.length-1].isNesting || props.data[props.data.length-1].logic == 'AND' && props.data[props.data.length-1].isNesting)){
                props.data[props.data.length-1].nesting = [{
                    operationList,
                    "leftExpression":{
                        "type":"column",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },
                    "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
                    "rightExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//右表达式 结构同左表达式
                    "logic":"OR",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
                    "isNesting":true,//有嵌套，需要特殊判断logic改变，记得去掉
                    "betweenEndSymbol": "lte",
                    "betweenStartSymbol": "gte",
                    "betweenStartExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//between开始条件
                    "betweenEndExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    }//between结束条件
                }];

            }else{
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
        }else if (type === 2) {
            if(props.data[props.data.length-1] && props.data[props.data.length-1].logic && (props.data[props.data.length-1].logic == 'AND' && props.data[props.data.length-1].isNesting || props.data[props.data.length-1].logic == 'OR' && !props.data[props.data.length-1].isNesting)){
                props.data.push({
                    operationList,
                    "leftExpression":{
                        "type":"column",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },
                    "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
                    "rightExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//右表达式 结构同左表达式
                    "logic":"OR",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
                    "betweenEndSymbol": "lte",
                    "betweenStartSymbol": "gte",
                    "betweenStartExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//between开始条件
                    "betweenEndExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    }//between结束条件
                })
                // delete props.data[props.data.length-1]['isNesting'];
            }else if(props.data[props.data.length-1] && props.data[props.data.length-1].logic && (props.data[props.data.length-1].logic == 'AND' && !props.data[props.data.length-1].isNesting || props.data[props.data.length-1].logic == 'OR' && props.data[props.data.length-1].isNesting)){
                props.data[props.data.length-1].nesting = [{
                    operationList,
                    "leftExpression":{
                        "type":"column",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },
                    "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
                    "rightExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//右表达式 结构同左表达式
                    "logic":"AND",//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
                    "isNesting":true,//有嵌套，需要特殊判断logic改变，记得去掉
                    "betweenEndSymbol": "lte",
                    "betweenStartSymbol": "gte",
                    "betweenStartExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//between开始条件
                    "betweenEndExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    }//between结束条件
                }];

            }else{
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
        }else if (type === 3) {
            if(props.data[props.data.length-1] && props.data[props.data.length-1].logic && !props.data[props.data.length-1].isNesting){
                props.data.push({
                    operationList,
                    "leftExpression":{
                        "type":"column",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },
                    "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
                    "rightExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//右表达式 结构同左表达式
                    "logic":props.data[props.data.length-1].logic,//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
                    "betweenEndSymbol": "lte",
                    "betweenStartSymbol": "gte",
                    "betweenStartExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//between开始条件
                    "betweenEndExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    }//between结束条件
                })
            }else if(props.data[props.data.length-1] && props.data[props.data.length-1].logic && props.data[props.data.length-1].logic == 'AND' && props.data[props.data.length-1].isNesting){
                // delete props.data[props.data.length-1]['isNesting'];
                props.data.push({
                    operationList,
                    "leftExpression":{
                        "type":"column",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },
                    "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
                    "rightExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//右表达式 结构同左表达式
                    "logic":'OR',//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
                    "betweenEndSymbol": "lte",
                    "betweenStartSymbol": "gte",
                    "betweenStartExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//between开始条件
                    "betweenEndExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    }//between结束条件
                })
            }else if(props.data[props.data.length-1] && props.data[props.data.length-1].logic && props.data[props.data.length-1].logic == 'OR' && props.data[props.data.length-1].isNesting){
                // delete props.data[props.data.length-1]['isNesting'];
                props.data.push({
                    operationList,
                    "leftExpression":{
                        "type":"column",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },
                    "symbol":"",//符号 可选:eq-等于;ne-不等于;gt-大于;gte-大于等于;lt-小于;lte-小于等于;like-字符相似;between-介于...之间;in-在...中; (待定)
                    "rightExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"string"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//右表达式 结构同左表达式
                    "logic":'AND',//与前表达式的逻辑值(第一个条件不需要此表达式) 可选:AND-和;OR-或
                    "betweenEndSymbol": "lte",
                    "betweenStartSymbol": "gte",
                    "betweenStartExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    },//between开始条件
                    "betweenEndExpression":{
                        "type":"value",//类型 可选:column-表列;value-值
                        "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                        "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    }//between结束条件
                })
            }
        }else if (type === 4){
            showAddFliterModal();
            resetEditRuleInfo();
        }
        emit('addRelationFn')
    }
    //改变且或关系
    const changeLogic = (value) => {
        if(props.data[props.data.length-1].logic != value && !props.data[props.data.length-1].isNesting){
            // props.data[props.data.length-1].logic = value;
            props.data.forEach(it => {
                it.logic = value
            })
        }else if(props.data[props.data.length-1].logic == 'AND' && props.data[props.data.length-1].isNesting){
            props.data[props.data.length-1].logic = 'OR';
        }else if(props.data[props.data.length-1].logic == 'OR' && props.data[props.data.length-1].isNesting){
            props.data[props.data.length-1].logic = 'AND';
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
    const dateChange = (data, a, b, t) => {
        if (t === 1) {
            data.betweenStartExpression.content = b
        } else if (t === 2) {
            data.betweenEndExpression.content = b
        } else if (t === 3) {
            data.rightExpression.content = b
        }
        conditionChange(data)
    }
    const conditionChange = (value, type) => {
        if (value.symbol == 'notnull' || value.symbol == 'isnull' || value.symbol === 'isblank' || value.symbol === 'notblank') { // 为空||不为空
            value.rightExpression.content = ''
            emit('updataTableData');
            return;
        } else if (['between', 'notBetween'].includes(value.symbol)) { // 介于，且左右条件都有
            value.rightExpression.content = ''

            let betweenStartContent = value.betweenStartExpression.content

            let betweenEndContent = value.betweenEndExpression.content

            if (betweenStartContent && betweenEndContent) {
                if (value.codeType === 'number') {
                    value.betweenStartExpression.valueType = 'double'
                    value.betweenEndExpression.valueType = 'double'

                    if(String(betweenStartContent).includes('-')) {
                        value.betweenStartExpression.content = ''
                    }
                    if(String(betweenEndContent).includes('-')) {
                        value.betweenEndExpression.content = ''
                    }
                    value.betweenStartExpression.content = Number(betweenStartContent)
                    value.betweenEndExpression.content = Number(betweenEndContent)
                } else {
                    value.betweenStartExpression.valueType = 'date'
                    value.betweenEndExpression.valueType = 'date'

                    if(!String(betweenStartContent).includes('-')) {
                        value.betweenStartExpression.content = ''
                    }
                    if(!String(betweenEndContent).includes('-')) {
                        value.betweenEndExpression.content = ''
                    }
                }
                emit('updataTableData');
            }
            return;
        }

        // 日期/数值字段 valueType完善
        if(value.codeType === 'date') {
            value.rightExpression.valueType = 'date'
        } else if(value.codeType === 'number') {
            value.rightExpression.valueType = 'double'
        } else {
            value.rightExpression.valueType = 'string'
        }
        
        // 重置左右介于时间
        if (['between', 'notBetween'].includes(value.symbol)) {
            value.betweenStartExpression = {
                "type":"value",//类型 可选:column-表列;value-值
                "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
            }
            value.betweenEndExpression = {
                "type":"value",//类型 可选:column-表列;value-值
                "content":"",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                "valueType":"date"//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
            }
        }

        if(['topN', 'topNAsc'].includes(value.symbol)) {
            value.rightExpression.valueType = 'long'
        }

        // const tempContent = _.cloneDeep(value.rightExpression.content)

        // if (value.symbol === 'start') {
        //     value.rightExpression.content = '%' + tempContent
        // } else if (value.symbol === 'end') {
        //     value.rightExpression.content = tempContent + '%'
        // } else if (value.symbol === 'contain') {
        //     value.rightExpression.content = '%' + tempContent + '%'
        // }

        if(type === 'changeSymbol' && !['in', 'notIn'].includes(value.symbol)) {
            // 改变符号 多值切换到单值
            value.rightExpression.content = ''
            value.rightExpression.type = 'value'
            delete value.rightExpression.dynamicTime
        }

        let rightContent = value.rightExpression.content
        // 属于 不属于 content为数组
        if(Array.isArray(rightContent)) {
            rightContent.length && emit('updataTableData');
            return
        }
        
        if (rightContent.trim()) {
            emit('updataTableData');
            // value.rightExpression.content = tempContent
        }
    }
    
    // 更新动态时间状态
    const updateDynamicFn = (type, target, timeStr, dynamicTime) => {
        if(type === 'normal') {
            // 删除动态时间属性
            delete target.dynamicTime
            target.content = timeStr
        } else if(type === 'dynamic') {
            target.content = timeStr
            target.dynamicTime = dynamicTime
        }
        emit('updataTableData')
    }

    /**
     * 根据选择字段来匹配对应条件
     * @param {*} v 选中的字段
     * @param {*} f 整个数据集
     */
    const onSelectChange = (v, f) => {
        if (v.imgType === 'textImg') {
            if(v.encrypted){
                f.operationList = textOperationList.slice(0, 4).concat(textOperationList.slice(10))
            } else {
                f.operationList = textOperationList
            }
            f.codeType = 'text'
        } else if (v.imgType === 'numImg') {
            f.operationList = numberOperationList
            f.codeType = 'number'
        } else if (v.imgType === 'timeImg') {
            f.operationList = timeOperationList
            f.codeType = 'date'
        }
        f.symbol = ''
    }
    const modalRef = ref('')

    // 确定改变筛选参数回调
    const changeParamsFn = (info, editItemIndex) => {
        emit('updateFilterParams', editItemIndex, info)
        emit('updataTableData');
    }
    //删除带有子级的元素，只删除当前的，需要父级添加子级
    const appendNesting = (value) => {
        if(value.content && value.content.length > 0){
            value.content.forEach((val,index)=>{
                if(val.isNesting){
                    delete val['isNesting'];
                    if(val.logic == 'OR'){
                        val.logic = 'AND';
                    }else if(val.logic == 'AND'){
                        val.logic = 'OR';
                    }
                }
                props.data.splice(value.index+index,0,val)
            })
        }
    }
    //是否显示公式弹框
    const showAddFliterModal = () => {
        useModalStore.changeAddFliterModalVisible()
    }

    // 异常字段列名
    const errorCodeCols = computed(() => 
        optionList.value.filter(code => code.errorColumn)
            .map(it => it.columnName)
    )

    // 下拉列表是否包含当前值
    const includeCurVal = (value) => {
        if(!optionList.value?.length) return true
        return !value || optionList.value.some(item => item.columnName === value)
    }


    // 公式条件 异常判断
    const expressRuleClass = (item) => 
    {console.log(item);
    
        item.leftExpression.params
            .filter(p => p.type === 'column')
            .some(i => errorCodeCols.value.includes(i.content)) ?
                'errorRule' :
                ''}

    const filterOption = (input, option) => {
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }

    // 日期选择器回显日期
    const getDatePickerValue = (item, type) => {
        let timeStr = ''
        if(type === 'start' ) {
            timeStr = item.betweenStartExpression.content
        } else if(type === 'end') {
            timeStr = item.betweenEndExpression.content
        } else {
            timeStr = item.rightExpression.content
        }
        return String(timeStr).includes('-') ? dayjs(timeStr) : ''
    }

    defineExpose({
        showAddFliterModal,
        resetEditRuleInfo
    })

</script>

<style lang="less" scoped>
.errorField{
    :deep(.ant-select-selector) {
        background-color: #FF4E4E14 !important;
        .colName{
            color: #F53F3F;
        }
    }
    :deep(svg){
        fill: #F53F3F;
    }
}
.svgIcon{
    width: 16px;
    height: 16px;
    cursor: pointer;
    position: relative;
    top: 3px;
}
.colName{
    margin-left: 4px;
}

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
        width:34px;
        height: 100%;
        padding-right:16px;
        .symbol{
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
        .change_box{
            position: absolute;
            width: 38px;
            height: 88px;
            top: 50%;
            left: -5%;
            padding-top:15px;
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
                &:hover{
                    color:#3D82F2;
                }
            }
        }
    }
    .gird-right{
        position: relative;
        display: table-cell;
        vertical-align: middle;
        height: 100%;
        padding-bottom:50px;
    }
}
.addRelationbtn{
    display: flex;
    align-items: center;
    width: 48px;
    height: 32px;
    color: #3D82F2;
    cursor: pointer;
    img{
        width:16px;
        height: 16px;
        margin-right:4px;
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
        left:0;
        top: 32px;
        padding-top: 4px;
        li {
            height: 40px;
            padding: 10px 0 0 12px;
            cursor: pointer;
            line-height:20px;
        }
        li:hover {
            background: rgba(61, 130, 242, 0.1);
        }
    }
}
.condition-item{
    margin-bottom: 10px;
    
    &>div{
        display: flex;
        align-items: center;
    }
    .condition-sele{
        margin-right:8px;
        // :deep(.ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
        // color: #2B67FF;
        // font-weight: 600;
        // background-color: #fff;
        //     &:hover{
        //         background-color: #f5f5f5;
        //     }
        // }
        // :deep(.ant-select-item-option-active){
        //     background-color: #fff;
        // }
    }
    .condition-input{
        width:240px;
    }
    .mid-wid{
        width:200px;
    }
    .small-wid{
        min-width: 124px;
    }
    .del, .edit{
        width:16px;
        height: 16px;
        cursor: pointer;
        margin-left:12px;
    }
    .rule-container{
        cursor: pointer;
        max-width: 800px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
        background: #F3F3F3;
        border-radius: 4px;
        padding:0 12px;
        line-height: 32px;
        font-size:14px;
        min-width: 400px;
        &.errorRule{
            color: #F53F3F;
        }
    }
}
</style>
import { isArray } from "core-js/core/array";