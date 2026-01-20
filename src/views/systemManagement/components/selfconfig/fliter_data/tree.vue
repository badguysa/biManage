<template>
    <div class="girdBox" v-if="data.length > 0">
        <div class="gird-symbol">
            <!-- <div class="symbol" @mouseenter="isandenter" @mouseleave="isandleave">
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
            </div> -->
            <a-dropdown>
                <div class="symbol" @mouseenter="isandenter" @mouseleave="isandleave">
                    <div class="verline"
                        :class="{ qie_line: data[data.length - 1].logic == 'AND' && !data[data.length - 1].isNesting || data[data.length - 1].logic == 'OR' && data[data.length - 1].isNesting, huo_line: data[data.length - 1].logic == 'OR' && !data[data.length - 1].isNesting || data[data.length - 1].logic == 'AND' && data[data.length - 1].isNesting }">
                    </div>
                    <div class="condition huo_text"
                        v-if="data[data.length - 1].logic == 'OR' && !data[data.length - 1].isNesting || data[data.length - 1].isNesting && data[data.length - 1].logic == 'AND'">
                        {{ t('selfConfig.or') }}<img src="@/assets/icons/green_down.png" alt=""></div>
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
                        <span class="rule-container" @click="editRuleFn(fliterItem, index)" :class="expressRuleClass(fliterItem)">{{ fliterItem.info }}</span>
                        <img src="@/assets/icons/delete.png" class="del" @click="removeFliter(index)" alt="delete">
                    </div>
                    <div v-else-if="fliterItem.symbol == 'regexp'">
                        <span class="rule-container" @click="editRuleFn(fliterItem, index)">{{ fliterItem.info }}</span>
                        <img src="@/assets/icons/delete.png" class="del" @click="removeFliter(index)" alt="delete">
                    </div>
                    <div style="display: flex; align-items:center ;"
                        v-else-if="fliterItem.symbol == '' || (fliterItem.symbol != 'exp' && fliterItem.symbol != 'regexp')">

                        <!-- 第一步选择字段 -->
                        <a-select v-model:value="fliterItem.leftExpression.content"
                            class="condition-sele mid-wid"
                            :class="{errorField: errorCodeCols.includes(fliterItem.leftExpression.content) || !includeCurVal(fliterItem.leftExpression.content)}"
                            @select="conditionChange(fliterItem)"
                            :filter-option="filterOption"
                            show-search>
                            <a-select-option 
                                v-for="item in optionList" 
                                :value="item.columnName" 
                                :label="item.columnAlias || item.columnName"
                                :disabled="item.disabled" 
                                @click="onSelectChange(item, fliterItem)"
                            >
                                <span role="img">
                                    <!-- <img style=" width: 16px" :src="getIconSrc(item)" alt=""> -->
                                    <BiIcon :name="getTypeIconSvg(item)" :class="getTypeIconClassName(item)"/>
                                </span>
                                <span class="colName">
                                    {{ item.columnAlias || item.columnName }}
                                </span>
                            </a-select-option>
                        </a-select>

                        <!-- 第二步选择条件 -->
                        <a-select 
                            v-model:value="fliterItem.symbol" 
                            class="condition-sele small-wid"
                            @select="conditionChange(fliterItem, 2)"
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

                        <!-- 第三步是否为动态参数 -->
                        <a-switch 
                            v-if="!(fliterItem.symbol === 'notnull' || fliterItem.symbol === 'isnull' || fliterItem.symbol === 'isblank' || fliterItem.symbol === 'notblank')"
                            v-model:checked="fliterItem.checked" 
                            style="margin-right: 5px;" 
                            :checked-children="t('apiManage.dynamicParameterOpening')"
                            :un-checked-children="t('apiManage.dynamicParameterThreshold')" 
                            @change="switchChange(fliterItem)" 
                        />


                        <!-- 开启动态参数 -->
                        <div 
                            v-if="!(fliterItem.symbol === 'notnull' || fliterItem.symbol === 'isnull' || fliterItem.symbol === 'isblank' || fliterItem.symbol === 'notblank') && fliterItem.checked"
                            style="display: flex; align-items: center;"
                        >
                            <!-- 非日期类型 -->
                            <template v-if="fliterItem.codeType !== 'date'">
                                <!-- 介于 -->
                                <template v-if="['between', 'notBetween'].includes(fliterItem.symbol)">
                                    <div class="dynamic-text">{{ fliterItem.betweenStartExpression.content }}</div>
                                    <a-input 
                                        style="width: 150px; margin-right: 5px;" 
                                        v-model:value.trim="fliterItem.betweenStartExpression.apiParams.example"
                                        :addon-before="t('apiManage.example')"
                                        @change="conditionChange(fliterItem)" 
                                    />
                                    <a-input 
                                        v-model:value.trim="fliterItem.betweenStartExpression.apiParams.desc" 
                                        :key="index"
                                        style="width: 150px; margin-right: 5px;" class="condition-input"
                                        :placeholder="t('apiManage.parameterDesc')" 
                                    />
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
                                    <div class="dynamic-text">{{ fliterItem.betweenEndExpression.content }}</div>
                                    <a-input 
                                        style="width: 150px; margin-right: 5px;" 
                                        v-model:value.trim="fliterItem.betweenEndExpression.apiParams.example"
                                        :addon-before="t('apiManage.example')"
                                        @change="conditionChange(fliterItem)" 
                                    />
                                    <a-input 
                                        v-model:value.trim="fliterItem.betweenEndExpression.apiParams.desc" 
                                        :key="index"
                                        style="width: 150px; margin-right: 5px;" class="condition-input"
                                        :placeholder="t('apiManage.parameterDesc')" 
                                    />
                                </template>
                                <!-- 非介于 -->
                                <template v-else>
                                    <!-- <div class="dynamic-text">{{ fliterItem.rightExpression.content }}</div> -->
                                    <a-input
                                    class="inp-text"
                                    v-model:value.trim="fliterItem.rightExpression.name"
                                    :placeholder="fliterItem.rightExpression.content.replace('$', '')"
                                    />

                                  
                                    <a-input 
                                        style="width: 150px; margin-right: 5px;" 
                                        v-model:value.trim="fliterItem.rightExpression.apiParams.example"
                                        :addon-before="t('apiManage.example')"
                                        @change="conditionChange(fliterItem)" 
                                    />
                                    <a-input 
                                        v-model:value.trim="fliterItem.rightExpression.apiParams.desc" 
                                        :key="index"
                                        style="width: 150px; margin-right: 5px;" class="condition-input"
                                        :placeholder="t('apiManage.parameterDesc')" 
                                    />
                                    <a-switch 
                                        v-model:checked="fliterItem.rightExpression.apiParams.require"
                                        style="margin-right: 5px;" 
                                        :checked-children="t('apiManage.necessary')" 
                                        :un-checked-children="t('apiManage.notNecessary')"  
                                    />
                                </template>
                            </template>
                            <!-- 日期类型 -->
                            <template v-else>
                                <template v-if="['between', 'notBetween'].includes(fliterItem.symbol)">
                                    <!-- 开始条件 -->
                                    <!-- <div class="dynamic-text">{{ fliterItem.betweenStartExpression.content }}</div> -->
                                    <a-input
                                    class="inp-text"
                                    v-model:value.trim="fliterItem.betweenStartExpression.name"
                                    :placeholder="fliterItem.betweenStartExpression.content.replace('$', '')"
                                    />
                                    <div class="dynamic-text">&nbsp;{{ t('apiManage.example') }}</div>
                                    <a-date-picker 
                                        show-time 
                                        format="YYYY-MM-DD HH:mm:ss" 
                                        placeholder=""
                                        class="mid-wid condition-sele" 
                                        :locale="locale === 'lo' ? Lo : zhCN"
                                        :value="getDatePickerValue(fliterItem, 'start')"
                                        @change="(a,b) => dateChange(fliterItem, a, b, 1)"
                                    />
                                    <a-input 
                                        v-model:value.trim="fliterItem.betweenStartExpression.apiParams.desc" 
                                        :key="index"
                                        style="width: 150px; margin-right: 5px;" class="condition-input"
                                        :placeholder="t('apiManage.parameterDesc')" 
                                    />
                                    <a-switch 
                                        v-model:checked="fliterItem.betweenStartExpression.apiParams.require"
                                        style="margin-right: 5px;" 
                                        :checked-children="t('apiManage.necessary')" 
                                        :un-checked-children="t('apiManage.notNecessary')"  
                                    />
                                    <span class="condition-sele">{{ t('selfConfig.to') }}</span>
                                    <!-- 结束条件 -->
                                    <!-- <div class="dynamic-text">{{ fliterItem.betweenEndExpression.content }}</div> -->
                                    <a-input
                                    class="inp-text"
                                    v-model:value.trim="fliterItem.betweenEndExpression.name"
                                    :placeholder="fliterItem.betweenEndExpression.content.replace('$', '')"
                                    />
                                    <div class="dynamic-text">&nbsp;{{ t('apiManage.example') }}</div>
                                    <a-date-picker 
                                        show-time 
                                        placeholder=""
                                        class="mid-wid condition-sele" 
                                        :locale="locale === 'lo' ? Lo : zhCN"
                                        :value="getDatePickerValue(fliterItem, 'end')"
                                        @change="(a,b) => dateChange(fliterItem, a, b, 2)"
                                    />
                                    <a-input 
                                        v-model:value.trim="fliterItem.betweenEndExpression.apiParams.desc" 
                                        :key="index"
                                        style="width: 150px; margin-right: 5px;" class="condition-input"
                                        :placeholder="t('apiManage.parameterDesc')" 
                                    />
                                    <a-switch 
                                        v-model:checked="fliterItem.betweenEndExpression.apiParams.require"
                                        style="margin-right: 5px;" 
                                        :checked-children="t('apiManage.necessary')" 
                                        :un-checked-children="t('apiManage.notNecessary')"  
                                    />
                                </template>
                                <template v-else>
                                    <!-- <div class="dynamic-text">{{ fliterItem.rightExpression.content }}</div> -->
                                    <a-input
                                        class="inp-text"
                                        v-model:value.trim="fliterItem.rightExpression.name"
                                        :placeholder="fliterItem.rightExpression.content.replace('$', '')"
                                    />

                                    <div class="dynamic-text">&nbsp;{{ t('apiManage.example') }}</div>


                                    <!-- 日期最早/晚的N个 -->
                                    <!-- <a-input
                                        v-if="['topN', 'topNAsc'].includes(fliterItem.symbol)"
                                        v-model:value.trim="fliterItem.rightExpression.content" 
                                        :key="index" 
                                        class="condition-input" 
                                        placeholder="" 
                                        @change="conditionChange(fliterItem)"
                                    /> -->

                                    <!-- 单个日期输入框 -->
                                    <a-date-picker
                                        show-time 
                                        placeholder=""
                                        format="YYYY-MM-DD HH:mm:ss"
                                        class="mid-wid condition-sele" 
                                        :locale="locale === 'lo' ? Lo : zhCN"
                                        :value="getDatePickerValue(fliterItem, 'normal')"
                                        @change="(a,b) => dateChange(fliterItem, a, b, 3)"
                                    />
                                    <a-input 
                                        v-model:value.trim="fliterItem.rightExpression.apiParams.desc" 
                                        :key="index"
                                        style="width: 150px; margin-right: 5px;" 
                                        class="condition-input"
                                        :placeholder="t('apiManage.parameterDesc')" 
                                    />
                                    <a-switch 
                                        v-model:checked="fliterItem.rightExpression.apiParams.require"
                                        style="margin-right: 5px;" 
                                        :checked-children="t('apiManage.necessary')" 
                                        :un-checked-children="t('apiManage.notNecessary')"  
                                    />
                                </template>
                            </template>
                        </div>

                        <!-- 未开启动态参数 -->
                        <template v-if="!(fliterItem.symbol === 'notnull' || fliterItem.symbol === 'isnull' || fliterItem.symbol === 'isblank' || fliterItem.symbol === 'notblank') && !fliterItem.checked">
                            <template v-if="fliterItem.codeType !== 'date'">
                                <template v-if="!['between', 'notBetween'].includes(fliterItem.symbol)">
                                    <a-input
                                        v-model:value.trim="fliterItem.rightExpression.content" 
                                        :key="index" 
                                        class="condition-input"
                                        placeholder="" 
                                        @change="conditionChange(fliterItem)" 
                                    />
                                </template>
                                <template v-else>
                                    <input
                                        class="condition-sele" 
                                        style="width: 105px;" 
                                        type="text" 
                                        v-model="fliterItem.betweenStartExpression.content"
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
                                        v-model="fliterItem.betweenEndExpression.content"
                                        @change="conditionChange(fliterItem)"
                                    >
                                </template>
                            </template>

                            <template v-if="fliterItem.codeType === 'date'">
                                <!-- 日期介于 -->
                                <template v-if="['between', 'notBetween'].includes(fliterItem.symbol)">
                                    <a-date-picker 
                                        show-time 
                                        placeholder=""
                                        format="YYYY-MM-DD HH:mm:ss" 
                                        class="mid-wid condition-sele" 
                                        :locale="locale === 'lo' ? Lo : zhCN"
                                        :value="getDatePickerValue(fliterItem, 'start')"
                                        @change="(a,b) => dateChange(fliterItem, a, b, 1)"
                                    />
                                    <span class="condition-sele">{{ t('selfConfig.to') }}</span>
                                    <a-date-picker 
                                        show-time 
                                        placeholder=""
                                        class="mid-wid condition-sele" 
                                        :locale="locale === 'lo' ? Lo : zhCN"
                                        :value="getDatePickerValue(fliterItem, 'end')"
                                        @change="(a,b) => dateChange(fliterItem, a, b, 2)"
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
                                    placeholder=""
                                    format="YYYY-MM-DD HH:mm:ss"
                                    class="mid-wid condition-sele" 
                                    :locale="locale === 'lo' ? Lo : zhCN"
                                    :value="getDatePickerValue(fliterItem, 'normal')"
                                    @change="(a,b) => dateChange(fliterItem, a, b, 3)"
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
                <!-- <div class="addRelationBox">
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
                </div> -->
            </div>
            <div :key="index" v-for="(fliterItem, index) in data">
                <Menu v-if="fliterItem.nesting" :data="fliterItem.nesting" @updataTableData="filedChangeHandle"
                    @appendNesting="appendNesting" />
            </div>
        </div>
    </div>
    <apiAddFliterModal :editRuleInfo="editRuleInfo" :sortItemIndex="sortItemIndex" v-if="apiAddFliterModalVisible" ref="modalRef" @changeParams="changeParamsFn" />
</template>
<script setup>
import { computed, reactive, ref, defineExpose, onMounted, watch } from 'vue'
import * as _ from 'lodash'
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from "pinia";
import { modalStore } from '@/Stores/modalStore'
import { apiConfigStore } from '@/Stores/apiConfigStore';
import apiAddFliterModal from '@/views/systemManagement/components/apiAddFliterModal';
import Menu from './tree.vue';
import text_img from "@/assets/icons/text.png";
import num_img from "@/assets/icons/number.png";
import time_img from "@/assets/icons/time.png";
import dayjs from 'dayjs';
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN';
import Lo from '@/locale/lang/lo-datepicker'
import { getTypeIconSvg, getTypeIconClassName } from '@/utils/utils'
import { operationList, textOperationList, numberOperationList, timeOperationList } from '@/utils/config'
import { useI18n } from 'vue-i18n';
import 'dayjs/locale/zh-cn';
import dynamicTimeSelect from '@/components/filterColumn/dynamicTimeSelect.vue'

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
const useMainStore = mainStore()
const useApiConfigStore = apiConfigStore()
const { dynamicNum } = storeToRefs(useMainStore)

const { allConfigData, operActiveId } = storeToRefs(useApiConfigStore)

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
const { apiAddFliterModalVisible } = storeToRefs(useModalStore)
const props = defineProps({
    data: {
        type: Array,
    },
    flag: {
        default: ''
    }
})
const emit = defineEmits(['updataTableData', 'appendNesting', 'updateFilterParams', 'addRelationFn'])

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
}, {
    text: 'selfConfig.addFormula',
    type: 4
}
]

const editRuleInfo = ref([])

const sortItemIndex = ref(-1)

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
    useModalStore.changeApiAddFliterModalVisible()
}

// 重置编辑公式信息
const resetEditRuleInfo = () => {
    sortItemIndex.value = -1
    editRuleInfo.value = []
}


//添加条件
const addRelation = (type) => {
    if (type === 1) {
        if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && (props.data[props.data.length - 1].logic == 'OR' && props.data[props.data.length - 1].isNesting || props.data[props.data.length - 1].logic == 'AND' && !props.data[props.data.length - 1].isNesting)) {
            props.data.push({
                operationList,
                "leftExpression": {
                    "type": "column",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": ""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
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
                "betweenStartExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between开始条件
                "betweenEndExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between结束条件
                "betweenEndSymbol": "lte",
                "betweenStartSymbol": "gte",
            })
            // delete props.data[props.data.length-1]['isNesting'];
        } else if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && (props.data[props.data.length - 1].logic == 'OR' && !props.data[props.data.length - 1].isNesting || props.data[props.data.length - 1].logic == 'AND' && props.data[props.data.length - 1].isNesting)) {
            props.data[props.data.length - 1].nesting = [{
                operationList,
                "leftExpression": {
                    "type": "column",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": ""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
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
                "betweenStartExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between开始条件
                "betweenEndExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between结束条件
                "betweenEndSymbol": "lte",
                "betweenStartSymbol": "gte",
            }];

        } else {
        }
    } else if (type === 2) {
        if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && (props.data[props.data.length - 1].logic == 'AND' && props.data[props.data.length - 1].isNesting || props.data[props.data.length - 1].logic == 'OR' && !props.data[props.data.length - 1].isNesting)) {
            props.data.push({
                operationList,
                "leftExpression": {
                    "type": "column",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": ""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
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
                "betweenStartExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between开始条件
                "betweenEndExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between结束条件
                "betweenEndSymbol": "lte",
                "betweenStartSymbol": "gte",
            })
            // delete props.data[props.data.length-1]['isNesting'];
        } else if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && (props.data[props.data.length - 1].logic == 'AND' && !props.data[props.data.length - 1].isNesting || props.data[props.data.length - 1].logic == 'OR' && props.data[props.data.length - 1].isNesting)) {
            props.data[props.data.length - 1].nesting = [{
                operationList,
                "leftExpression": {
                    "type": "column",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": ""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
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
                "betweenStartExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between开始条件
                "betweenEndExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between结束条件
                "betweenEndSymbol": "lte",
                "betweenStartSymbol": "gte",
            }];

        } else {
        }
    } else if (type === 3) {
        if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && !props.data[props.data.length - 1].isNesting) {
            props.data.push({
                operationList,
                "leftExpression": {
                    "type": "column",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": ""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
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
                "betweenStartExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between开始条件
                "betweenEndExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between结束条件
                "betweenEndSymbol": "lte",
                "betweenStartSymbol": "gte",
            })
        } else if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && props.data[props.data.length - 1].logic == 'AND' && props.data[props.data.length - 1].isNesting) {
            // delete props.data[props.data.length-1]['isNesting'];
            props.data.push({
                operationList,
                "leftExpression": {
                    "type": "column",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": ""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
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
                "betweenStartExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between开始条件
                "betweenEndExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between结束条件
                "betweenEndSymbol": "lte",
                "betweenStartSymbol": "gte",
            })
        } else if (props.data[props.data.length - 1] && props.data[props.data.length - 1].logic && props.data[props.data.length - 1].logic == 'OR' && props.data[props.data.length - 1].isNesting) {
            // delete props.data[props.data.length-1]['isNesting'];
            props.data.push({
                operationList,
                "leftExpression": {
                    "type": "column",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": ""//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
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
                "betweenStartExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date",//值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between开始条件
                "betweenEndExpression": {
                    "type": "value",//类型 可选:column-表列;value-值
                    "content": "",//值 当type为column是 此值为列名 当type是value时 此值为具体值
                    "valueType": "date", //值类型 当type是value时要有此字段 可选:long-整型数值;string-字符串;double-浮点型数值;date-时间;null-空值;time-时间
                    "apiParams": {
                        "desc": "",
                        "example": "",
                        "require": true
                    }
                },//between结束条件
                "betweenEndSymbol": "lte",
                "betweenStartSymbol": "gte",
            })
        }
    } else if (type === 4) {
        showAddFliterModal();
        resetEditRuleInfo();
    }
    emit('addRelationFn')
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
const dateChange = (data, a, b, t) => {
    if (t === 1) {
        if (data.checked) {
            data.betweenStartExpression.apiParams.example = b
        } else {
            data.betweenStartExpression.content = b
        }
    } else if (t === 2) {
        if (data.checked) {
            data.betweenEndExpression.apiParams.example = b
        } else {
            data.betweenEndExpression.content = b
        }
    } else if (t === 3) {
        // data.rightExpression.content = b
        if (data.checked) {
            data.rightExpression.apiParams.example = b
        } else {
            data.rightExpression.content = b
        }
    }
    conditionChange(data)
}
const conditionChange = (value, type = 1) => {
    // 条件为空或不为空
    if (value.symbol == 'notnull' || value.symbol == 'isnull' || value.symbol === 'isblank' || value.symbol === 'notblank') {
        value.rightExpression.content = ''
        emit('updataTableData');
        return
    }

    // 如果切换条件选项，动态参数关闭，条件值全部重置
    if (type === 2) {
        value.checked = false
        switchChange(value)
        return
    }

    // 大于、小于、大于等于、小于等于，对条件转成long
    if ((value.symbol === 'gt' || value.symbol === 'gte' || value.symbol === 'lt' || value.symbol === 'lte') && value.codeType !== 'date') {
        value.rightExpression.valueType = 'long'
        value.rightExpression.apiParams.example = Number(value.rightExpression.apiParams.example)
    } else {
        value.rightExpression.valueType = 'string'
    }

    if (['between', 'notBetween'].includes(value.symbol)) {
        if (value.codeType === 'number') {
            value.betweenEndExpression.valueType = 'long'
            value.betweenStartExpression.valueType = 'long'
        } else if (value.codeType === 'date') {
            value.betweenEndExpression.valueType = 'date'
            value.betweenStartExpression.valueType = 'date'
        }
    } 

    // 日期/数值字段 valueType完善
    if(value.codeType === 'date') {
        value.rightExpression.valueType = 'date'
    } else if(value.codeType === 'number') {
        value.rightExpression.valueType = 'double'
    } else {
        value.rightExpression.valueType = 'string'
    }

    if(['topN', 'topNAsc'].includes(value.symbol)) {
        value.rightExpression.valueType = 'long'
    }

    // 条件为介于或不介于
    let isBetween = ['between', 'notBetween'].includes(value.symbol)

    // 开启动态参数，条件不为介于，且右边条件有值、左边字段已选，条件也选有
    const bool1 = value.checked && !isBetween && (value.rightExpression.apiParams.example || value.rightExpression.content) && value.leftExpression.content && value.symbol
    // 开启动态参数，条件为介于，且开始、结束条件有值、左边字段已选，条件也选有
    const bool2 = value.checked && isBetween && value.betweenStartExpression.apiParams.example && value.betweenEndExpression.apiParams.example && value.leftExpression.content && value.symbol
    // 未开启动态,参数,条件不为介于
    const bool3 = !value.checked && !isBetween && (value.rightExpression.content.trim() && value.leftExpression.content && value.symbol)
    // 未开启动态,参数,条件为介于
    const bool4 = !value.checked && isBetween && value.betweenStartExpression.content && value.betweenEndExpression.content && value.leftExpression.content && value.symbol
    if (bool1 || bool2 || bool3 || bool4) { // 未开启动态参数，且右边条件有值、左边字段已选，条件也选有，进行接口调用
        emit('updataTableData');
    }

    useApiConfigStore.setFilterConfig(props.data)
}

// 日期选择器回显日期
const getDatePickerValue = (item, type) => {
    let timeStr = ''
    if(item.checked) {  // 开启动态参数
        if(type === 'start' ) {
            timeStr = item.betweenStartExpression.apiParams.example
        } else if(type === 'end') {
            timeStr = item.betweenEndExpression.apiParams.example
        } else {
            timeStr = item.rightExpression.apiParams.example
        }
    } else {
        if(type === 'start' ) {
            timeStr = item.betweenStartExpression.content
        } else if(type === 'end') {
            timeStr = item.betweenEndExpression.content
        } else {
            timeStr = item.rightExpression.content
        }
    }
    return timeStr.includes('-') ? dayjs(timeStr) : ''
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
    f.checked = false
    f.rightExpression = {
        "type": "value",
        "content": "",
        "valueType": "string",
        "dynamicNum": f.dynamicNum,
        "apiParams": {
            "desc": "",
            "example": "",
            "require": true
        }
    }
    switchChange(f)
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

// 确定改变筛选参数回调
const changeParamsFn = (info, editItemIndex) => {
    emit('updateFilterParams', editItemIndex, info)
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
    if (item.checked) { // 开启动态参数
        if (!['between', 'notBetween'].includes(item.symbol)) { // 条件非介于
            if (!item.rightExpression.dynamicNum) {
                useMainStore.setDynamicNum()
            }
            item.rightExpression.dynamicNum = item.rightExpression.dynamicNum || dynamicNum.value
            item.rightExpression.content = '$p' + item.rightExpression.dynamicNum
        } else { // 条件介于
            if (!item.betweenStartExpression.dynamicNum) {
                useMainStore.setDynamicNum()
            }
            item.betweenStartExpression.dynamicNum = item.betweenStartExpression.dynamicNum || dynamicNum.value
            item.betweenStartExpression.content = '$p' + item.betweenStartExpression.dynamicNum

            if (!item.betweenEndExpression.dynamicNum) {
                useMainStore.setDynamicNum()
            }
            item.betweenEndExpression.dynamicNum = item.betweenEndExpression.dynamicNum || dynamicNum.value
            item.betweenEndExpression.content = '$p' + item.betweenEndExpression.dynamicNum
        }
    } else { // 关闭动态参数，数据重置
        // if (item.symbol !== 'between') {
            item.rightExpression.apiParams = {
                desc: "",
                example: "",
                require: true
            }
            item.rightExpression.content = ''
        // } else {
            item.betweenStartExpression.apiParams = {
                desc: "",
                example: "",
                require: true
            }
            item.betweenStartExpression.content = ''
            item.betweenEndExpression.apiParams = {
                desc: "",
                example: "",
                require: true
            }
            item.betweenEndExpression.content = ''
        // }
    }
}
//是否显示公式弹框
const showAddFliterModal = () => {
    useModalStore.changeApiAddFliterModalVisible()
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
    item.leftExpression.params
        .filter(p => p.type === 'column')
        .some(i => errorCodeCols.value.includes(i.content)) ?
            'errorRule' :
            ''

const filterOption = (input, option) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
.inp-text {
    width:100px;
    height:32px;
    margin-right:10px;
}
</style>