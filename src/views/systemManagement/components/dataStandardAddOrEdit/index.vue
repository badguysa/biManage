<template>
    <div class="manageWrapper">
        <back @backFn="backFn"/>
        <!-- 添加和编辑数据标准 -->
        <div class="addDrawer">
            <div class="headContent">
                <p class="title">
                    <span>{{ isEdit ? t('dataStandard.editStandard') : t('dataStandard.addStandard') }}</span>
                </p>
                <div class="buttonGroup">
                    <input v-show="false" type="file" accept=".xls,.xlsx" ref="inputRef" id="fileInput" @change="changHandle" />
                    <myButton v-if="activeStandardType==0" @click="uploadFileFn" class="uploadButton" :disabled="uploadLoading"><span v-if='uploadLoading'><loadingIcon/></span>{{ uploadLoading ? t('dataStandard.uploadLoading') : t('common.upload') }}</myButton>
                    <myButton type="primary" @click="onOk">{{ t('common.confirm') }}</myButton>
                </div>
            </div>
            <div class="templateContent" v-if="!isEdit&&activeStandardType==0">
                <div class="download">
                    <BiIcon name="excel" class="svgIcon excelIcon"></BiIcon>
                    <span class="tempText">{{ t('dataStandard.dataStandardTemplate') }}</span>
                    <img class="img" src="@/assets/icons/download.png" alt="download" @click="downloadTemplate">
                    <span class="downText" @click="downloadTemplate">{{ t('common.download') }}</span>
                </div>
                
            </div>
            <div class="contentItem">
                <div class="label">{{ t('dataStandard.standardTableName') }}</div>
                <input type="text" v-if="activeStandardType==0" class="inputItem" v-model="state.name">
                <input type="text" v-else class="inputItem" v-model="brainState.name">
            </div>
            <div class="contentItem">
                <div class="label">{{ t('dataStandard.standardTableDescription') }}</div>
                <input type="text" v-if="activeStandardType==0" class="inputItem" v-model="state.description">
                <input type="text" v-else class="inputItem" v-model="brainState.description">
            </div>
            <div class="contentItem" v-if="!isEdit">
                <div class="label">
                    <span>参考标准</span>
                    <tips tipsContent="默认填充参考标准的所有规则，便于快速设置新标准的规则" />
                </div>
                <selectStandard @select="selectFn"/>
            </div>
            <template v-if="activeStandardType==0">
                <div class="ruleContainer">
                    <p class="title">{{ t('dataStandard.ruleContent') }}</p>
                    <table class="ruleTable">
                        <thead>
                            <tr>
                                <th v-for="item in tableHeadInfo">
                                    <template v-if="item == t('dataStandard.fieldLength')">
                                        <div class="tips-wrap">
                                            <span>{{ item }} </span>
                                            <tips tipsContent="仅作为表结构长度校验，如需校验数据长度，可在校验规则内使用LENGTH函数校验；不填写此内容则不校验长度" />
                                        </div>
                                    </template>
                                    <template v-else>
                                        {{ item }}
                                    </template>
                                </th>
                                <th>{{ t('common.operation') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="list-item" v-for="(item,i) in state.attrs" :key="i">
                                <td class="input-td">
                                    <input  class="ipt" ref="iptRef1" type="text" maxlength="50"
                                    v-model="item.name" placeholder="请输入" />
                                </td>
                                <td :class="{'input-td': true, 'isError': i === repeatIndex }">
                                    <input  class="ipt" type="text" ref="iptRef2"  maxlength="255"
                                    v-model="item.fieldName" placeholder="请输入" />
                                </td>
                                <td class="select-td">
                                    <a-select 
                                        style="width: 100%"
                                        v-model:value="item.dataType"
                                        @select="updateData(item)"
                                    >
                                        <a-select-option 
                                            v-for="opItem in fieldTypeList" 
                                            :key="opItem.value" 
                                            :value="opItem.value"
                                            :title="t(opItem.label)"
                                        >
                                            <div style="display: flex;align-items: center;height: 100%;">
                                                <img style="width: 16px;margin-right: 4px" :src="opItem.imgSrc" alt="">
                                                <span>{{ t(opItem.label) }}</span>
                                            </div>
                                        </a-select-option>
                                    </a-select>
                                </td>
                                <td class="input-td length-td">
                                    <input class="ipt" type="text" maxlength="255" ref="iptRef3" 
                                    v-model="item.dataLength" placeholder="请输入" />
                                </td>
                                <td class="check-td" align="center">
                                    <a-checkbox v-model:checked="item.required"></a-checkbox>
                                </td>
                                <td class="input-td">
                                    <input class="ipt" type="text"
                                    v-model="item.description" placeholder="请输入" />
                                </td>
                                <td class="verify-td">
                                    <!-- 无校验规则 -->
                                    <span class="add" v-if="!hasVerifyRule(item)" @click="addOrEditVerify(item.dataType,i)">{{ t('common.add') }}</span>
                                    <!-- 含有校验规则 -->
                                    <div v-else class="verifyRuleText">
                                        <div class="ruleTextContent">
                                            <span v-for="rule in getRuleTextLoop(t, item)">
                                                <span class="rule-text">{{ rule.text }}</span>
                                                <span class="logic-opereate" v-if="rule.showLogic && !rule.isLast">{{ rule.logic }}</span>
                                                <span class="more-info" v-if="rule.hasMore && rule.isLast">...</span>
                                            </span>
                                        </div>
                                        <img class="edit" @click="addOrEditVerify(item.dataType,i)" src="@/assets/icons/edit1.png" alt="">
                                    </div>
                                </td>
                                <td class="oper-td">
                                    <span @click="useField(item, i)">引用字段</span>
                                    <span @click="setFieldTemplate(item)">设为模板</span>
                                    <span @click="removeItem(i)">{{ t('common.delete') }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="addRuleTableItem" @click="addItem">
                    <img src="@/assets/icons/plus.png" alt="" />
                    {{ t('dataStandard.addField') }}
                </div>
            </template>
            <template  v-else>
                <div class="bRuleContainer">
                    <p class="title fixed-l">{{ t('dataStandard.ruleContent') }}</p>
                    <table class="bRuleTable">
                        <thead>
                            <tr>
                                <th v-for="(item,index) in barainTableHeadInfo" :key="index" :class="{'fixed-l':index < 3 }" 
                                :style="{'left':index < 3 ? (index*150)+'px' : 'unset','width':index == 5 ? '80px' : index == 10 ? '500px':'150px'}">
                                    {{ item }}
                                </th>
                                <th class="fixed-r">{{ t('common.operation') }}</th>
                            </tr> 
                        </thead>
                        <tbody>
                            <tr class="list-item" v-for="(item,i) in brainState.attrs" :key="i">
                                <td class="input-td fixed-l">
                                    <input  class="ipt" type="text" maxlength="50"
                                    v-model="item.code" placeholder="请输入" />
                                </td>
                                <td class="fixed-l" :class="{'input-td': true, 'isError': i === repeatIndex }" style="left: 150px;">
                                    <input  class="ipt" type="text" ref="biptRef2"  maxlength="255"
                                    v-model="item.fieldName" placeholder="请输入" />
                                </td>
                                <td class="fixed-l" :class="{'input-td': true, 'isError': i === repeatIndex }" style="left: 300px;">
                                    <input  class="ipt" type="text" ref="biptRef1"  maxlength="255"
                                    v-model="item.name" placeholder="请输入" />
                                </td>
                                <td class="select-td">
                                    <a-select 
                                        style="width: 100%"
                                        v-model:value="item.dataType"
                                        @select="updateData(item)"
                                    >
                                        <a-select-option 
                                            v-for="opItem in brainFieldTypeList" 
                                            :key="opItem.value" 
                                            :value="opItem.value"
                                            :title="t(opItem.label)"
                                        >
                                            <div style="display: flex;align-items: center;height: 100%;">
                                                <img style="height: 12px;margin-right: 4px" :src="opItem.imgSrc" alt="">
                                                <span>{{ t(opItem.label) }}</span>
                                            </div>
                                        </a-select-option>
                                    </a-select>
                                </td>
                                <td class="input-td length-td">
                                    <input class="ipt" type="text" maxlength="255" ref="iptRef3" 
                                    v-model="item.dataLength" placeholder="请输入" />
                                </td>
                                <td class="check-td" align="center">
                                    <a-checkbox v-model:checked="item.required"></a-checkbox>
                                </td>
                                <td class="input-td">
                                    <input class="ipt" type="text"
                                    v-model="item.valueSpace" placeholder="请输入" />
                                </td>
                                <td class="input-td">
                                    <input class="ipt" type="text"
                                    v-model="item.explanation" placeholder="请输入" />
                                </td>
                                <td class="input-td">
                                    <input class="ipt" type="text"
                                    v-model="item.refCode" placeholder="请输入" />
                                </td>
                                <td class="input-td">
                                    <input class="ipt" type="text"
                                    v-model="item.description" placeholder="请输入" />
                                </td>
                                <td class="verify-td">
                                    <!-- 无校验规则 -->
                                    <span class="add" v-if="!hasVerifyRule(item)" @click="addOrEditVerify(item.dataType,i)">{{ t('common.add') }}</span>
                                    <!-- 含有校验规则 -->
                                    <div v-else class="verifyRuleText">
                                        <div class="ruleTextContent">
                                            <span v-for="rule in getRuleTextLoop(t, item)">
                                                <span class="rule-text">{{ rule.text }}</span>
                                                <span class="logic-opereate" v-if="rule.showLogic && !rule.isLast">{{ rule.logic }}</span>
                                                <span class="more-info" v-if="rule.hasMore && rule.isLast">...</span>
                                            </span>
                                        </div>
                                        <img class="edit" @click="addOrEditVerify(item.dataType,i)" src="@/assets/icons/edit1.png" alt="">
                                    </div>
                                </td>
                                <td class="oper-td fixed-r">
                                    <span @click="removeItem(i)">{{ t('common.delete') }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="addRuleTableItem" @click="addItem">
                    <img src="@/assets/icons/plus.png" alt="" />
                    {{ t('dataStandard.addField') }}
                </div>
            </template>
            <myModal v-if="showChangeModal" modalName="提示" @onCancel="()=>showChangeModal = false" @onConfirm="()=>showChangeModal = false" width="640px">
                <template #modal-body>
                    <div class="delbox">
                        当前标准已关联表
                        <span class="text" v-for="item in relatedTableList">{{ item.name }}</span>
                        ，确认编辑？
                    </div>
                </template>
            </myModal>
        </div>
    </div>

    <!-- 字段筛选抽屉组件 -->
    <drawerFilter 
        ref="drawerFilterRef" 
        :drawerVisible="drawerVisible"
        @closeDrawer="drawerVisible=false"
        @submitFn="submitFn"
     /> 

    <!-- 字段模板弹窗 -->
    <templateFieldModal v-if="modalVisible" @close="modalVisible = false" @useFn="useFieldFn"/>
</template>
<script setup>
import { message } from 'ant-design-vue';
import myModal from '@/components/myModal'
import { fieldTypeList,brainFieldTypeList } from '@/constants/dataStandard.js'
import { apiManageStore } from '@/Stores/apiManageStore';
import myButton from '@/components/buttons/myButton.vue';
import loadingIcon from '@/components/loadingIcon.vue'
import { mainStore } from '@/Stores/mainStore';
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { standardTableAdd, standardTableEdit, standardTemplateDownload, standardUpload, standardApplyTableList, addStandardField } from '@/apis/dataStandard'
import { uploadFile } from '@/apis/cloud'
import { handleEditDataList, getRuleTextLoop, hasVerifyRule } from '@/hooks/dataStandard/useGetRuleText.js'
import { cloneDeep } from 'lodash'
import { useI18n } from 'vue-i18n'
import back from '@/components/back'
import { getimgType, getCodeType, getObjectBase64Str } from '@/utils/utils';
import drawerFilter from '@/components/filterColumn/drawerFilter.vue';
import { standardTableDetail } from '@/apis/dataStandard'
import tips  from '@/components/tips'
import selectStandard from '../selectDataStandrad'
import templateFieldModal from './templateFieldModal.vue';

const { t } = useI18n()
const useApiManageStore = apiManageStore()
const useMainStore = mainStore()
const { uploadInfo } = storeToRefs(useMainStore)
const useDataStandardStore = dataStandardStore()
const { activeStandardKey, activeStandardType, editDataStandardObj, addOrEditDataStandardStatus } = storeToRefs(useDataStandardStore)

const modalVisible = ref(false)
const operateIndex = ref(-1)

const tableHeadInfo = [ 
    t('dataStandard.fieldAlias'),
    t('dataStandard.pyhFieldName'),
    t('dataStandard.fieldType'),
    t('dataStandard.fieldLength'),
    t('dataStandard.allowEmpty'),
    t('dataStandard.remark'),
    t('dataStandard.verifyRule')
]

const barainTableHeadInfo = [ 
    t('dataStandard.brainIndex'),
    t('dataStandard.brainFieldName'),
    t('dataStandard.brainName'),
    t('dataStandard.brainFieldType'),
    t('dataStandard.brainFieldLength'),
    t('dataStandard.allowEmpty'),
    t('dataStandard.brainValueSpace'),
    t('dataStandard.brainExplanation'),
    t('dataStandard.brainRefCode'),
    t('dataStandard.description'),
    t('dataStandard.verifyRule')
]
const state = reactive({
    name: '',
    description: '',
    attrs: [
        {
            name: "",
            fieldName: "",
            dataType: "CHARACTER",
            dataLength: "",
            description: '',
            required: true,
        },
    ],
})

const brainState = reactive({
    name: '',
    description: '',
    attrs: [
        {
            name: "",
            fieldName: "",
            dataType: "C",
            dataLength: "",
            code:'',
            valueSpace:'',
            explanation:'',
            refCode:'',
            description: '',
            bizAttrs:[],
            required: true,
        },
    ],
})

const showAdd = ref(false) // 展示抽屉
const ruleIndex = ref() // 新增/编辑校验规则的索引
const dataType = ref()  // 校验规则内的类型
const isEdit = ref(false) // 是否编辑
const editId = ref() // 编辑id
const inputRef = ref() //文件上传
const uploadLoading = ref(false) //文件上传状态
const repeatIndex = ref(-1)
const iptRef1 = ref(null)
const biptRef1 = ref(null)
const iptRef2 = ref(null)
const biptRef2 = ref(null)
const iptRef3 = ref(null)
const initState = ref(true) //初始化修改
const showChangeModal = ref(false) // 变化提示弹窗
const relatedTableList = ref() // 关联表的列表
const hasShow = ref(false)

const drawerVisible= ref(false)
const drawerFilterRef = shallowRef()

// 过滤组件字段
const filterColumns = reactive({
    allColumns: []
})

const currentFilterOption = ref([])

// 字段筛选组件使用
provide('FILTER_COLUMNS', filterColumns)
// 字段筛选组件配置项
provide('FILTER_OPTIONS', currentFilterOption)
// 筛选组件添加公式隐藏选择其他表
provide('HIDE_SELECT_OTHER_TABLE', true)

watch(()=> addOrEditDataStandardStatus.value,async (newVal)=>{
    await nextTick()
    if(!newVal){
        initAdd()
    } else {
        initEdit()
    }
},{
    immediate: true
})

watch(state, ()=>{
  // 非初始化修改 
  if(isEdit.value && !initState.value && !hasShow.value){
    handleChangeState()
  }else if(isEdit.value && initState.value){
    initState.value = false
  }
})

watch(brainState, ()=>{
  // 非初始化修改 
  if(isEdit.value && !initState.value && !hasShow.value){
    handleChangeState()
  }else if(isEdit.value && initState.value){
    initState.value = false
  }
})

// 选择参考模板回调
const selectFn = async (node) => {
    let res = await standardTableDetail(node.id)
    if(res.code !== 1) message.error(res.message)
    if(activeStandardType.value == 0){
        if(res.data.groupType&&res.data.groupType == 'STD_BRAIN'){
            state.attrs = res.data.attrs.map(it => {
                let dataType
                if(['C','M','B','T'].includes(it.dataType)){
                    dataType = 'CHARACTER'
                }else{
                    dataType = 'NUMBER'
                }
                return {
                    dataLength: '',
                    dataType: dataType,
                    description: it.description ?? '',
                    fieldName: it.fieldName,
                    name: it.name,
                    required: !Boolean(it.required),
                    selfConfigWhere: it.selfConfigWhere
                }
            })
        }else{
            state.attrs = res.data.attrs.map(it => {
                return {
                    dataLength: it.dataLength,
                    dataType: it.dataType,
                    description: it.description ?? '',
                    fieldName: it.fieldName,
                    name: it.name,
                    required: !Boolean(it.required),
                    selfConfigWhere: it.selfConfigWhere
                }
            })
        }
    }else{
        if(res.data.groupType&&res.data.groupType == 'STD_BRAIN'){
            brainState.attrs = res.data.attrs.map(it => {
                return {
                    name: it.name ?? '',
                    code: it.code ?? '',
                    valueSpace: it.valueSpace ?? '',
                    explanation: it.explanation ?? '',
                    refCode: it.refCode ?? '',
                    dataLength:it.dataLength ?? '',
                    dataType: it.dataType ?? 'C',
                    description: it.description ?? '',
                    fieldName: it.fieldName ?? '',
                    required: !Boolean(it.required),
                    selfConfigWhere: it.selfConfigWhere
                }
            })
        }else{
            brainState.attrs = res.data.attrs.map(it => {
                let dataType
                if(['CHARACTER','DATE_TIME'].includes(it.dataType)){
                    dataType = 'C'
                }else{
                    dataType = 'N'
                }
                let selfConfigWhere = []
                if(['CHARACTER','NUMBER'].includes(it.dataType)){
                    selfConfigWhere = it.selfConfigWhere
                }
                return {
                    dataType: dataType,
                    description: it.description ?? '',
                    fieldName: it.fieldName,
                    name: it.name,
                    required: !Boolean(it.required),
                    selfConfigWhere: selfConfigWhere
                }
            })
        }
    }
}

const updateFilterColumns = () => {
    let targetRow
    if(activeStandardType.value == 0){
        targetRow = state.attrs[ruleIndex.value]
    }else{
        targetRow = brainState.attrs[ruleIndex.value]
    }
    if(!targetRow) return
    // 无校验规则 添加时 重置筛选状态
    !hasVerifyRule(targetRow) && drawerFilterRef.value.resetFilterState()
    let dataType
    if(activeStandardType.value == 0){
        dataType = targetRow.dataType
    }else{
        // 将新类型转换为旧类型 CMBT对应CHARACTER，N对应NUMBER
        if(['C','M','B','T'].includes(targetRow.dataType)){
            dataType = 'CHARACTER'
        }else{
            dataType = 'NUMBER'
        }
    }
    filterColumns.allColumns = [
        {
            columnName: targetRow.fieldName,
            columnAlias: targetRow.name,
            columnType: dataType,
            imgType: getimgType(dataType),
            type: getCodeType(dataType),
            dataIndex: targetRow.fieldName
        }
    ]
}

watchEffect(() => {
    updateFilterColumns() 
})

const initAdd = () => {
    if(activeStandardType.value==0){
        state.name = '' 
        state.description = '' 
        state.attrs = [
            {
                name: "",
                fieldName: "",
                dataType: "CHARACTER",
                dataLength: "",
                description: '',
                required: true,
            },
        ]
    }else{
        brainState.name = ''
        brainState.description = ''
        brainState.attrs = [
            {
                name: "",
                fieldName: "",
                dataType: "C",
                dataLength: "",
                code:'',
                valueSpace:'',
                explanation:'',
                refCode:'',
                description: '',
                bizAttrs:[],
                required: true,
            },
        ]
    }
    showAdd.value = true
    isEdit.value = false
}

const initEdit = async()=> {
    let dataClone = cloneDeep(editDataStandardObj.value)
    dataClone = {
        ...dataClone,
        attrs: handleEditDataList(dataClone.attrs)
    }
    const { name, description, attrs} = dataClone
    if(activeStandardType.value==0){
        state.name = name
        state.description = description
        state.attrs = attrs
    }else{
        brainState.name = name
        brainState.description = description
        brainState.attrs = attrs
    }
    showAdd.value = true
    isEdit.value = true
    editId.value = editDataStandardObj.value.id
}

const handleChangeState = async()=> {
    const res = await standardApplyTableList({sourceId: editId.value})
    if(res.code === 1) {
        if(res.data.total > 0) {
            relatedTableList.value = res.data.records
            showChangeModal.value = true
        } else {
            showChangeModal.value = false
        }
        hasShow.value= true
    }
}

const backFn = () => {
    useApiManageStore.setApiPageId('dataStandardManagePage')
    useDataStandardStore.getLeftDataListFn()
}

const onOk = async() => {
    if(!validateTable()) return
    let data
    if(activeStandardType.value==0){
        data = cloneDeep({...state})
    }else{
        data = cloneDeep({...brainState})
    }
    data.libId = activeStandardKey.value
    let attrs = data.attrs.map((item)=>{
        return {
            ...item,
            required: item.required ? 0 : 1,
        }
    })
    delete data.attrs
    // console.log('attrs', attrs)
    data.attrsStr = getObjectBase64Str(attrs)
    if(isEdit.value){
        data.id = editId.value
    }
    let api = isEdit.value ? standardTableEdit : standardTableAdd
    const res = await api(data)
    if(res.code === 1){
        if(isEdit.value){
            message.success('编辑成功')
        }else{
            message.success('新增成功')
        }
        useDataStandardStore.getStandardTableListFn()
        backFn()
    }else{
        message.error(res.message)
    }
}

const submitFn = () => {
    let filterInfo = drawerFilterRef.value.getFilterData()
    // TODO: 去除operationList
    if(activeStandardType.value == 0){
        state.attrs[ruleIndex.value].selfConfigWhere = [{
            action: 'where',
            contents: filterInfo
        }]
    }else{
        brainState.attrs[ruleIndex.value].selfConfigWhere = [{
            action: 'where',
            contents: filterInfo
        }]
    }
    drawerVisible.value = false
}

const downloadTemplate = () => {
    if(!isEdit.value){
        addDownload()
    }
}

const addDownload = async() =>{
    const res = await standardTemplateDownload()
    // 这是失败的情况，返回封装的二进制json数据
    if(res.type === 'application/json'){
        let result
        let reader = new FileReader();
        // 设置 FileReader 对象的 onload 回调函数
        reader.onload = function(event) {
            // 读取 Blob 中的数据
            const data = event.target.result;
            // 将数据解析为 JavaScript 对象
            result = JSON.parse(data);
            if (result.code === 0) {
                message.error(result.message)
            }
        }
        // 读取 Blob 中的数据
        reader.readAsText(res);
    // 返回成功的情况，返回二进制文本数据
    } else if ( res.type === 'application/vnd.ms-excel'){
        let data = res;
        if(res.data){
            data = res.data;
        }
        const blob = new Blob([data])
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = '数据标准模版' + '.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}


// type：当前列的数据类型  i：新增列的索引
const addOrEditVerify = (type, i) => {
    drawerVisible.value = true
    ruleIndex.value = i
    dataType.value = type
    let configInfo
    if(activeStandardType.value == 0){
        configInfo = cloneDeep(state.attrs[i].selfConfigWhere)
    }else{
        configInfo = cloneDeep(brainState.attrs[i].selfConfigWhere)
    }
    // 回显筛选组件配置项
    currentFilterOption.value = configInfo || []
}


// 修改列的类型
const updateData = (item)=> {
    dataType.value = item.dataType
    updateFilterColumns()
}

const addItem = ()=>{
    if(activeStandardType.value==0){
        state.attrs.push(
            {
                name: "",
                fieldName: "",
                dataType: "CHARACTER",
                dataLength: "",
                description: '',
                required: true,
            },
        )
    }else{
        brainState.attrs.push(
            {
                name: "",
                fieldName: "",
                dataType: "C",
                dataLength: "",
                code:'',
                valueSpace:'',
                explanation:'',
                refCode:'',
                description: '',
                bizAttrs:[],
                required: true,
            },
        )
    }
}

const removeItem = (index)=>{
    if(activeStandardType.value == 0){
        state.attrs.splice(index, 1)
    }else{
        brainState.attrs.splice(index, 1)
    }
}

const uploadFileFn = async()=>{
    uploadLoading.value = true
    await nextTick()
    inputRef.value.click()
    setTimeout(() => {
        uploadLoading.value = false
    }, 3000);
}

const changHandle = (e, type) => {
    if(!fileSizeValidate(e.target.files)){
        uploadLoading.value = false
        return
    }
    const formData = new FormData()
    const jsonData = {
        puid: uploadInfo.value.puid,
        _token: uploadInfo.value.token,
    }
    for (let key in jsonData) {
        formData.append(key, jsonData[key])
    }
    formData.append('file', e.target.files[0])
    uploadFile(formData)
        .then(async (res) => {
            // 重置input fileList数据 解决上传同一文件change事件不触发问题
            inputRef.value.value = null
            if (res.data.data && res.data.result) {
                // 手动延时 解决接口报错: objectId对应云盘文件不存在
                setTimeout(() => {
                    uploadFn(res.data.objectId)
                }, 200)
                
            }
        })
        .catch((e) => {
            uploadLoading.value = false
        })
}

const uploadFn = async (objectId) => {
    const uploadRes = await standardUpload({
        objectId,
        // 编辑标准 传递标准id 用于后端记录操作日志
        id: isEdit.value ? editId.value : undefined
    })

    if(uploadRes){
        uploadLoading.value = false
        const data = uploadRes.data
        if(uploadRes.code == 0) {
            return message.error(uploadRes.message)
        }
        if(data.length > 0){
            state.attrs = state.attrs.concat(handleEditDataList(data))
        } else {
            return message.error('文件上传失败，格式错误')
        }
        message.success(uploadRes.message)
    }
}

// 上传文件大小校验
const fileSizeValidate = (files) => {
    let sizeValidateRes = true
    files.forEach(it => {
        if(it.size > 50 * 1024 * 1024) {
            sizeValidateRes = false
            files = []
            return
        }
    })
    !sizeValidateRes && message.error('上传失败,限制导入最大50M')
    return sizeValidateRes
}

// 检验字段名是否重复或者为空
/*  
    checkArray: 要检查的数组,
    elm：当前对象,
    index: 索引值,
    property: 属性名,
    propertyCN： 属性中文名,
    checkEmpty: 默认true 检查空值
    checkRepeat: 默认false 检查重复
    signalCheck: 默认false 单个的检查
*/  
const validatePhyCode = (checkArray, elm, index, property, propertyCN, checkEmpty=true, checkRepeat=false, signalCheck=false)=>{
    if(checkEmpty){
        if(!elm[property]) {
            repeatIndex.value = signalCheck ? index : -1
            message.error(`${propertyCN}不能为空`)
            return true
        }else {
            repeatIndex.value = -1
        }
    }
    if(checkRepeat){
        let isRepeat = checkArray.some((it) => it !== elm && it[property] === elm[property])
        // 物理字段名不能重复
        if(isRepeat) {
            repeatIndex.value = signalCheck ? index : -1
            message.error(`${propertyCN}重复`)
            return true
        }else {
            repeatIndex.value = -1
        }
    }
    return false
}

// 校验规则table
const validateTable = ()=> {
    if(activeStandardType.value == 0){
        if(!state.name){
            message.error('标准表名称不能为空')
            return false
        }
        const validateArray = state.attrs
        const propertyMap = new Map()
        propertyMap.set('name', '名称')
        propertyMap.set('fieldName', '物理字段名')
        propertyMap.set('dataLength', '字段长度')
        resetInputError()
        let flag = false
        validateArray.forEach((item,index)=>{
            if(flag){
                return
            }
            for (const [key, value] of propertyMap) {
                let itemToFocus
                if(key === 'name' && validatePhyCode(validateArray ,item, index , key, value)){
                    itemToFocus = iptRef1.value.find((item,i) => index === i)
                }else if(key === 'fieldName' && validatePhyCode(validateArray ,item, index , key, value, true, true)){
                    itemToFocus = iptRef2.value.find((item,i) => index === i)
                }
                if (itemToFocus) {
                    itemToFocus.parentNode.classList.add('isError')
                    flag = true
                    break;
                }
            }
        })
        return flag ? false : true
    }else{
        if(!brainState.name){
            message.error('标准表名称不能为空')
            return false
        }
        const validateArray = brainState.attrs
        const propertyMap = new Map()
        propertyMap.set('name', '中文简称')
        propertyMap.set('fieldName', '数据项名')
        resetBrainInputError()
        let flag = false
        validateArray.forEach((item,index)=>{
            if(flag){
                return
            }
            for (const [key, value] of propertyMap) {
                let itemToFocus
                if(key === 'name' && validatePhyCode(validateArray ,item, index , key, value)){
                    itemToFocus = biptRef1.value.find((item,i) => index === i)
                }else if(key === 'fieldName' && validatePhyCode(validateArray ,item, index , key, value, true, true)){
                    itemToFocus = biptRef2.value.find((item,i) => index === i)
                }
                if (itemToFocus) {
                    itemToFocus.parentNode.classList.add('isError')
                    flag = true
                    break;
                }
            }
        })
        return flag ? false : true
    }
}

const resetInputError = ()=>{
    // 清除所有输入框的isError
    iptRef1.value.forEach((domItem)=>{
        domItem.parentNode.classList.remove('isError')
    })
    iptRef2.value.forEach((domItem)=>{
        domItem.parentNode.classList.remove('isError')
    })
    iptRef3.value.forEach((domItem)=>{
        domItem.parentNode.classList.remove('isError')
    })
}

const resetBrainInputError = ()=>{
    // 清除所有输入框的isError
    biptRef1.value.forEach((domItem)=>{
        domItem.parentNode.classList.remove('isError')
    })
    biptRef2.value.forEach((domItem)=>{
        domItem.parentNode.classList.remove('isError')
    })
}

// 引用字段
const useField = (item, i) => {
    operateIndex.value = i
    modalVisible.value = true
}

// 设置模板字段
const setFieldTemplate = async (item) => {
    let result = await addStandardField({
      attrStr: getObjectBase64Str({
        name: item.name,
        dataType: item.dataType,
        fieldName: item.fieldName,
        dataLength: item.dataLength,
        description: item.description,
        required: item.required ? 0 : 1,
        selfConfigWhere: item.selfConfigWhere,
      })
    })
    if(result.code !== 1) {
        message.error(result.message)
    } else {
        item.standardFieldId = result.data
        message.success(result.message)
    }
}

// 引用字段回调
const useFieldFn = (record) => {
    // 物理字段名不允许重复
    let target = state.attrs.find((it,i) => {
        return i !== operateIndex.value && it.fieldName === record.fieldName
    })
    if(target) {
        message.error('物理字段名重复')
        return
    }
    state.attrs[operateIndex.value].standardFieldId = record.id
    state.attrs[operateIndex.value].name = record.name
    state.attrs[operateIndex.value].dataType = record.dataType
    state.attrs[operateIndex.value].fieldName = record.fieldName
    state.attrs[operateIndex.value].dataLength = record.dataLength
    state.attrs[operateIndex.value].description = record.description
    state.attrs[operateIndex.value].required = !Boolean(record.required)
    state.attrs[operateIndex.value].selfConfigWhere = record.selfConfigWhere
    modalVisible.value = false
}

</script>

<style lang="less" scoped>
.manageWrapper {
    width: 100%;
    height: 100%;
    background-color: #fff;
    overflow: auto;
    display: flex;
    flex: 1;
    flex-direction: column;
    position: relative;
    .addDrawer{
        padding: 16px;
        line-height: 25px;
        padding-bottom: 40px;
        height: 90%;
        overflow-y: auto;
        .headContent{
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            .title{
                font-weight: 600;
                font-size: 18px;
                color: rgba(0,0,0, 0.8);
                height: 25px;
            }
            .buttonGroup{
                display: flex;
                align-items: center;
                .uploadButton{
                    min-width: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 8px
                }
            }
        }
        .templateContent{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            .download{
                display: flex;
                align-items: center;
                background-color: #F2F3F5;
                padding: 6px 12px;
                border-radius: 4px;
                height: 32px;
                .svgIcon, img{
                    width: 14px;
                    height: 14px;
                }
                .svgIcon{
                    color: green;
                    margin-right: 4px
                }
                .img{
                    margin-left: 20px;
                    cursor: pointer;
                }
                .tempText{
                    font-size: 13px;
                    color: rgba(0,0,0,0.6);
                }
                .downText{
                    color: #2B67FF;
                    cursor: pointer;
                    padding-left: 4px
                }
            }
            
        }
        .contentItem{
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            color:  rgba(0, 0, 0, 0.8);
            font-weight: 400;
            .label {
                width: 80px;
                margin-right: 18px;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .inputItem{
                width: 300px;
                border-radius: 4px;
                background-color: #f3f3f3;
            }
        }

        .ruleContainer{
            margin-top: 16px;
            .title{
                font-size: 16px;
                color: rgba(0, 0, 0, 0.8);
                font-weight: 600;
            }
            .ruleTable {
                border-collapse: collapse;
                border-spacing: 0;
                width: 100%;
                .tips-wrap {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                    & > span {
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                    }
                }
                thead tr {
                    th {
                        text-align: left;
                        border: 1px solid #E0EBFF;
                        background: #ECF3FF;
                        height: 36px;
                        padding: 0px 10px;
                        line-height: 1;
                        position: relative;
                        font-weight: 500;
                        white-space: nowrap;
                    }
                }

                .list-item {
                    height: 36px;
                    td {
                        height: 36px;
                        padding: 4px 8px;
                        border: 1px solid #E0EBFF;
                        // width: calc(100% / 6);
                    }
                    .select-td {
                        width: 150px;
                        :deep(.ant-select .ant-select-selector){
                            width: 100%;
                            border-radius: 4px;
                            background-color: #f3f3f3 !important;
                        }
                    }
                    .oper-td {
                        white-space: nowrap;
                        span {
                            color: #3d82f2;
                            cursor: pointer;
                            margin-right: 16px;
                        }
                    }
                    .input-td{
                        .ipt{
                            width: 100%;
                            border-radius: 4px;
                            background-color: #f3f3f3;
                        }
                        &.length-td{
                            width: 80px;
                        }
                    }
                    .isError{
                        .ipt, .ipt:focus{
                            border: 1px solid #ff4d4f;
                            box-shadow: none;
                        }
                    }
                    .check-td{
                        width: 80px;
                    }
                    .verify-td{
                        width: 500px;
                        .add {
                            color: #3d82f2;
                            cursor: pointer;
                            margin-right: 16px;
                        }
                        .verifyRuleText{
                            width: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            color: rgba(0, 0, 0, 0.8);
                            .ruleTextContent{
                                width: 460px;
                                flex:1;
                                white-space: nowrap; /* 不换行 */
                                text-overflow: ellipsis; /* 超出部分显示省略号 */
                                overflow: hidden; /* 超出部分隐藏 */
                                .rule-text{
                                    padding: 4px 10px;
                                    background-color: #F3F3F3;
                                    border-radius: 4px;
                                    display: inline-block;
                                }
                                .logic-opereate{
                                    margin: 0 6px;
                                }
                                .more-info{
                                    margin-left: 4px;
                                }
                            }
                            .edit {
                                cursor: pointer;
                                width: 16px;
                                margin-left: 8px;
                            }
                        }
                    }
                    .oper-td{
                        width: 210px;
                    }
                }
            }
        }
        .bRuleContainer{
            margin-top: 16px;
            width: 100%;
            overflow: hidden;
            &:hover{
                overflow: auto;
            }
            .fixed-l {
                position: sticky;
                left: 0;
                z-index: 1;
                width: 150px;
            }
            .fixed-r {
                position: sticky;
                right: 0;
                z-index: 1;
                width: 150px;
            }
            .title{
                font-size: 16px;
                color: rgba(0, 0, 0, 0.8);
                font-weight: 600;
            }
            .bRuleTable {
                border-collapse: separate;
                border-spacing: 0;
                table-layout: fixed;
                width: 100%;
                overflow: auto;
                td,th {
                    overflow: hidden;
                }
                thead tr {
                    th {
                        text-align: left;
                        border: 1px solid #E0EBFF;
                        background: #ECF3FF;
                        height: 36px;
                        padding: 0px 10px;
                        line-height: 1;
                        font-weight: 500;
                        white-space: nowrap;
                        width: 150px;
                    }
                }

                .list-item {
                    height: 36px;
                    td {
                        height: 36px;
                        padding: 4px 8px;
                        border: 1px solid #E0EBFF;
                        background-color: #fff;
                    }
                    .select-td {
                        width: 150px;
                        :deep(.ant-select .ant-select-selector){
                            width: 100%;
                            border-radius: 4px;
                            background-color: #f3f3f3 !important;
                        }
                    }
                    .oper-td {
                        white-space: nowrap;
                        span {
                            color: #3d82f2;
                            cursor: pointer;
                            margin-right: 16px;
                        }
                    }
                    .input-td{
                        .ipt{
                            width: 100%;
                            border-radius: 4px;
                            background-color: #f3f3f3;
                        }
                        &.length-td{
                            width: 80px;
                        }
                    }
                    .isError{
                        .ipt, .ipt:focus{
                            border: 1px solid #ff4d4f;
                            box-shadow: none;
                        }
                    }
                    .check-td{
                        width: 80px;
                    }
                    .verify-td{
                        width: 500px;
                        .add {
                            color: #3d82f2;
                            cursor: pointer;
                            margin-right: 16px;
                        }
                        .verifyRuleText{
                            width: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            color: rgba(0, 0, 0, 0.8);
                            .ruleTextContent{
                                width: 460px;
                                flex:1;
                                white-space: nowrap; /* 不换行 */
                                text-overflow: ellipsis; /* 超出部分显示省略号 */
                                overflow: hidden; /* 超出部分隐藏 */
                                .rule-text{
                                    padding: 4px 10px;
                                    background-color: #F3F3F3;
                                    border-radius: 4px;
                                    display: inline-block;
                                }
                                .logic-opereate{
                                    margin: 0 6px;
                                }
                                .more-info{
                                    margin-left: 4px;
                                }
                            }
                            .edit {
                                cursor: pointer;
                                width: 16px;
                                margin-left: 8px;
                            }
                        }
                    }
                    .oper-td{
                        width: 210px;
                    }
                }
            }
        }

        .addRuleTableItem {
            display: flex;
            align-items: center;
            width: 100%;
            height: 38px;
            color: #3d82f2;
            cursor: pointer;
            border: 1px solid #E0EBFF;
            justify-content: center;
            border-top: none;
            img {
                width: 16px;
                height: 16px;
                margin-right: 4px;
            }
        }

        .footer-box{
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
        .closeImg{
            width: 20px;
            height: 20px;
            opacity: 0.6;
            cursor: pointer;
        }
    }
}
.delbox {
    padding: 30px 20px 30px 20px;
    font-weight: 400;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.8);
    .text {
        font-weight: 600;
        margin: 0px 5px;
        color: #3D82F2;
    }
}
</style>
