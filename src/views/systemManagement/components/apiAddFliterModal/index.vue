<template>
    <div class="mask" :style="{ opacity: selectCodeModalVisible ? 0 : 1 }">
        <div class="modal-container">
            <div class="container-top">
                <span class="title">{{ t('selfConfig.formula') }}</span>
                <img src="@/assets/icons/close.png" alt="close" @click="cancel" />
            </div>
            <div class="container-middle">
<!--                <div class="field-input">-->
<!--                    <label for="filenName">字段名称</label>-->
<!--                    <input-->
<!--                        id="filenName"-->
<!--                        type="text"-->
<!--                        v-model.trim="modalState.filedName"-->
<!--                        placeholder="请输入要新增的字段名称"-->
<!--                    />-->
<!--                </div>-->
                <div class="input-wrapper">
                    <codeEditor ref="editorRef" :contentConfig="props.editRuleInfo" :codeList="codeSetList.codeBackList"/>
                    <!-- <div class="input-area" @input="inputHandle" contenteditable
                        placeholder="请在英文输入法下输入运算符号，或者从下方选择字段或函数插入">
                    </div> -->
                </div>
                <div class="middle-bottom">
                    <div class="operate-container">
                        <div class="top">{{ t('selfConfig.addFunc') }}</div>
                        <div class="search">
                            <input type="text" v-model.trim="methodKeyword" :placeholder="t('common.search')" />
                            <img src="@/assets/icons/search.png" alt="search" />
                        </div>
                        <a-tree
                            :expanded-keys="expandedKeys"
                            :tree-data="modalState.treeData"
                            @expand="onExpand"
                        >
                            <!-- 自定义折叠图标 -->
                            <template #switcherIcon="{ switcherCls }">
                                <img src="@/assets/icons/arrows-down.png" alt="change" />
                            </template>
                            <!-- 自定义列表样式 -->
                            <template #title="{ title, key, dataRef }">
                                <div style="display: flex;align-items: center;">
                                    <span class="treeNode"
                                        v-if="computedTreeTitle(title)?.indexOf(methodKeyword.toUpperCase()) > -1">
                                        <template v-if="title == '添加正则表达式'">
                                            <div class="nodeBox" @click.stop="addAndUpdate(dataRef)">
                                                <BiIcon name="addOperate"
                                                    style="height: 14px;width: 14px;line-height: 14px;margin-right: 4px;" />
                                                <span style="color: #2B67FF;">添加正则表达式</span>
                                            </div>
                                        </template>
                                        <template v-else-if="title == '加载更多'">
                                            <div class="nodeBox" @click.stop="getMore(dataRef)">
                                                <span style="color: #2B67FF;">加载更多</span>
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div class="nodeBox"  @click="selectMethod(dataRef)" @mouseenter="showMethod(dataRef)">
                                                <span> {{ computedTreeTitle(title).substr(0,computedTreeTitle(title).indexOf(methodKeyword.toUpperCase()))}}</span>
                                                <span style="color: #f50">{{ methodKeyword.toUpperCase() }}</span>
                                                <span>{{ computedTreeTitle(title).substr(computedTreeTitle(title).indexOf(methodKeyword.toUpperCase())+ methodKeyword.length)}}</span>
                                                <BiIcon v-if="dataRef.type == 'CUSTOM'" name="edit_light"
                                                    style="height: 14px;width: 14px;line-height: 14px;margin-right: 4px;position: absolute;right: 10px;"  @click.stop="addAndUpdate(dataRef)"/>
                                            </div>
                                        </template>
                                    </span>
                                    <span class="treeNode" @click="selectMethod(dataRef)" v-else>{{ computedTreeTitle(title) }}</span>
                                </div>
                            </template>
                        </a-tree>
                    </div>
                    <div class="operate-container">
                        <div class="top">{{ t('selfConfig.selectCode') }}</div>
                        <div class="search">
                            <input type="text" v-model.trim="filedNameKeyword" :placeholder="t('common.search')" />
                            <img src="@/assets/icons/search.png" alt="" />
                        </div>
                        <div class="field-container" ref="containerRef">
                            <template v-if="filedNameKeyword">
                                <div
                                    class="field-item"
                                    @click="selectFiledHandle(item)"
                                    v-for="item in codeListCopy"
                                >
                                    <img :src="getIconSrc(item)" alt="code" />
                                    <span :title="item.columnAlias || item.columnName">{{ item.columnAlias || item.columnName }}</span>
                                </div>
                            </template>
                            <template v-else>
                                <div
                                    class="field-item"
                                    @click="selectFiledHandle(item)"
                                    v-for="item in codeSetList.codeList"
                                >
                                    <img :src="getIconSrc(item)" alt="code" />
                                    <span :title="item.columnAlias || item.columnName">{{ item.columnAlias || item.columnName }}</span>
                                </div>
                            </template>
                            <template v-if="columnsConfig.otherTable && columnsConfig.otherTable.length">
                                <OtherTableComponent @selectCode="selectOtherTableCode" :columnsConfig="columnsConfig" />
                            </template>
                        </div>
                        <span @click="showSelectCodeModal" class="bottom-select"><img src="@/assets/images/table.png" alt="">{{ t('common.selectOtherTable') }}</span>
                    </div>
                    <div class="operate-container">
                        <div class="top">{{ t('common.apiDesc') }}</div>
                        <div class="explain-container">
                            <div style="opacity: .6;">{{ t('selfConfig.formulaTip') }}</div>
                            <!-- <div>公式编辑举例：AVERAGE(语文成绩,数学成绩)</div> -->
                            <div class="explain-content">
                                <p ref="paragraphRef"></p>
                                <a  v-if="!modalState.currentTips" href="https://sharewh2.xuexi365.com/share/61ffa047-6346-471f-88e3-738c05009be4?t=3" target="_blank">{{t('selfConfig.viewHelpDoc')}}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container-bottom">
                <button @click="cancel">{{ t('common.cancel') }}</button>
                <button @click="confirmHandle">{{ t('common.confirm') }}</button>
            </div>
        </div>
    </div>
    <SelectTableComponent @closeModal="showSelectCodeModal" @sendCodes="getSelectCodes" @scrollFn="scrollFieldWrap" v-if="selectCodeModalVisible" />
    <!-- 添加弹窗 -->
    <BiModal title="正则表达式" v-model:visible="biModalState.visible" :cancelText="cancelText" :cancelType="cancelType" @ok="okFn" @cancel="deleteRegFn">
        <div class="content-item">
            <span>函数名称</span>
            <BiInput v-model="biModalState.name" placeholder="请输入" @keydown.enter="okFn" />
        </div>
        <div class="content-item">
            <span>函数说明</span>
            <textarea v-model="biModalState.description" :style="{ height: '52px', width: '70%' }" placeholder="请输入"
                @keydown.enter="okFn"></textarea>
        </div>
        <div class="content-item">
            <div class="item-lable">
                <div>正则表达式</div>
                <tips tipsContent="修改表达式后,需等待15分钟,修改后的表达式才能进行校验" />
            </div>
            <BiInput v-model="biModalState.content" placeholder="请输入" @keydown.enter="okFn" />
        </div>
    </BiModal>
</template>

<script setup>
import { addCustomFunc,updateCustomFunc,getCustomFuncList,deleteCustomFuncDeatil} from '@/apis/customFunction'
import { ref, computed, reactive, onMounted, watch, toRaw, toRefs } from 'vue'
import codeEditor from '@/components/codeEditor/index.vue'
import { modalStore } from '@/Stores/modalStore'
import { mainStore } from '@/Stores/mainStore'
import { apiConfigStore } from '@/Stores/apiConfigStore';
import { storeToRefs } from 'pinia'
import { getIconSrc } from '@/utils/utils'
import SelectTableComponent from '@/components/selectTable'
import OtherTableComponent from '@/components/otherTable'
import { methodFunctionInfo } from '@/constants/logManage.js'
// 导入所有方法信息
import { methodInfo } from '@/utils/config'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import createDialog from '@/utils/dialog'
import tips from '@/components/tips'

const { t } = useI18n()

const useModalStore = modalStore()

const useApiConfigStore = apiConfigStore()

const useMainStore = mainStore()

const expandedKeys = ref([])

const selectCodeModalVisible = ref(false)

const containerRef = ref(null)

const paragraphRef = ref(null)

const columnsConfig = ref({})

const { allConfigData, operActiveId } = storeToRefs(useApiConfigStore)

const { systemConfig } = storeToRefs(useMainStore)

const cancelText = computed(() => biModalState.value.id ? '删除' : '取消')
const cancelType = computed(() => biModalState.value.id ? 'danger' : '')

const props = defineProps({
    editRuleInfo: {
        type: Array,
        default: () => []
    },
    sortItemIndex: {
        type: Number,
        default: -1
    }
})

let methodList = [] // 存储树形列表中所有方法数据
let treeDataCopy = [] // 备份树状数据
let codeListCopy = ref([]) // 备份字段数据
let methodKeyword = ref('') // 搜索框方法名
let filedNameKeyword = ref('') // 搜索框字段名

// 从store中获取表格字段
let codeSetList = computed(() => {
    let obj = {
        codeList: [],
        previewColumns: [],
        previewData: [],
    }
    if (allConfigData.value.length > 0) {
        allConfigData.value.forEach((item) => {
            if (item.uuid === operActiveId.value) {
                obj = item
            }
        })
    }
    return obj
})


const biModalState = ref({
    visible: false,
    name: '',
    description: '',
    content: '',
    id: '',//判断是否为新增自定义函数
})

const customState = ref({
    pageNum: 1,
    pageSize: 30,
    sw: '',
})

const customTotal = ref(0)

let modalState = reactive({
    selectedFileds: [], // 选中的字段
    filedName: '', // 新增字段名
    currentTips: '', // 方法说明
    treeData: [
        {
            title: 'selfConfig.mathFunc',
            key: 'MATH',
            root: true
        },
        {
            title: 'selfConfig.dateFunc',
            key: 'DATETIME',
            root: true
        },
        {
            title: 'selfConfig.textFunc',
            key: 'TEXT',
            root: true
        },
        {
            title: 'selfConfig.logicFunc',
            key: 'LOGIC',
            root: true
        },
        {
            title: 'selfConfig.seniorFunc',
            key: 'SENIOR',
            root: true
        },
        {
            title: 'selfConfig.customFunc',
            key: 'CUSTOM',
            root: true
        },
    ],
})
let customFuncList = []

const addAndUpdate =(item)=>{
    //新增按钮
    if(item.btn){
        biModalState.value.name = ''
        biModalState.value.description = ''
        biModalState.value.content = ''
        biModalState.value.id=''
    }else{
        biModalState.value.name = item.title
        biModalState.value.description = item.def
        biModalState.value.content = item.content
        biModalState.value.id=item.id
    }
    biModalState.value.visible = true
}

const okFn = async ()=>{
    if(!biModalState.value.name||!biModalState.value.description||!biModalState.value.content){
        message.warning('请检查信息是否填写完整')
        return
    }
    let res;
    if(biModalState.value.id){
        res = await updateCustomFunc(biModalState.value)
    }else{
        res = await addCustomFunc(biModalState.value)
    }
    if(res.code === 1){
        let msg = biModalState.value.id?'修改成功':'添加成功'
        message.success(msg)
        biModalState.value.visible = false
        biModalState.value.name = ''
        biModalState.value.description = ''
        biModalState.value.content = ''
        biModalState.value.id=''
        modalState.currentTips = ''
        customFuncList = []
        customState.value.pageNum = 1
        modalState.treeData = [
            {
                title: 'selfConfig.mathFunc',
                key: 'MATH',
                root: true
            },
            {
                title: 'selfConfig.dateFunc',
                key: 'DATETIME',
                root: true
            },
            {
                title: 'selfConfig.textFunc',
                key: 'TEXT',
                root: true
            },
            {
                title: 'selfConfig.logicFunc',
                key: 'LOGIC',
                root: true
            },
            {
                title: 'selfConfig.seniorFunc',
                key: 'SENIOR',
                root: true
            },
            {
                title: 'selfConfig.customFunc',
                key: 'CUSTOM',
                root: true
            },
        ]
        methodList = []
        formatTreeData()
    }
}

const deleteRegFn = () => {
    if(cancelText.value === '取消') {
        biModalState.value.visible = false
        return
    }
    createDialog({
    title: '提示',
    content: '确定删除吗？',
    okText: '确定',
    cancelText: '取消',
  }).then(() => {
    deleteCustom()
  }).catch(() => {
    biModalState.value.visible = false
  })
}

const deleteCustom = async ()=>{
    let res = await deleteCustomFuncDeatil({ids:biModalState.value.id})
    if(res.code == 1){
        message.success('删除成功')
        biModalState.value.visible = false
        biModalState.value.name = ''
        biModalState.value.description = ''
        biModalState.value.content = ''
        biModalState.value.id=''
        modalState.currentTips = ''
        customFuncList = []
        customState.value.pageNum = 1
        modalState.treeData = [
            {
                title: 'selfConfig.mathFunc',
                key: 'MATH',
                root: true
            },
            {
                title: 'selfConfig.dateFunc',
                key: 'DATETIME',
                root: true
            },
            {
                title: 'selfConfig.textFunc',
                key: 'TEXT',
                root: true
            },
            {
                title: 'selfConfig.logicFunc',
                key: 'LOGIC',
                root: true
            },
            {
                title: 'selfConfig.seniorFunc',
                key: 'SENIOR',
                root: true
            },
            {
                title: 'selfConfig.customFunc',
                key: 'CUSTOM',
                root: true
            },
        ]
        methodList = []
        formatTreeData()
    }
}

const getMore = ()=>{
    if(customState.value.pageNum*customState.value.pageSize>=customTotal.value){
        return
    }
    customState.value.pageNum++
    getList()
}

const getList = async () => {
    let res = await getCustomFuncList(customState.value)
    if (res.code === 1) {
        res?.data?.records.forEach((i, index) => {
            customFuncList.push({
                title: i.name,
                key: index,
                type: 'CUSTOM',
                def: i.description,
                root: false,
                ...i
            })
        })
        let addBtn = {
            title: '添加正则表达式',
                type: 'CUSTOM',
                key: 'add',
                def: "用于添加正则表达式，并不是自定义函数",
                btn: true,
        }
        let moreBtn = {
            title: '加载更多',
                type: 'CUSTOM',
                key: 'more',
                btn: true,
        }
        methodList = [...methodList, ...customFuncList]
        modalState.treeData[5].children = [addBtn,...customFuncList]
        if (customState.value.pageNum * customState.value.pageSize < customTotal.value) {
            modalState.treeData[5].children.push(moreBtn)
        }

    }
}


watch(() => modalState.currentTips, (newVal) => {
    if (newVal !== '') {
        const methodKey = newVal.split('.')[1]
        let htmlString;
        if (methodKey?.length) {
            htmlString = methodFunctionInfo[methodKey]
        } else {
            let item = customFuncList.find(i => i.id === newVal)
            htmlString = `<span style="color:#2B67FF">${item.name||item.title}</span><br/><span>说明:${item.def}</span><br/><span>正则表达式:${item.content}</span>`
        }
        paragraphRef.value.innerHTML = htmlString
    }else{
        paragraphRef.value.innerHTML = ''
    }
})

const computedTreeTitle = (title) => {
    if (title === 'selfConfig.mathFunc' || title === 'selfConfig.dateFunc' || title === 'selfConfig.textFunc' || title === 'selfConfig.logicFunc' || title === 'selfConfig.seniorFunc' || title === 'selfConfig.customFunc') {
        return t(title)
    }
    return title
}
// 编辑器ref
const editorRef = ref(null)

onMounted(() => {
    formatTreeData()
})


const emits = defineEmits(['changeParams'])

// 查找父节点的key
const getParentKey = (key, tree) => {
    let parentKey

    for (let i = 0; i < tree.length; i++) {
        const node = tree[i]

        if (node.children) {
            if (node.children.some((item) => item.key === key)) {
                parentKey = node.key
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children)
            }
        }
    }

    return parentKey
}

const showSelectCodeModal = () => {
    selectCodeModalVisible.value = !selectCodeModalVisible.value
}

const getSelectCodes = (info) => {
    info.table.children = info.codeList
    if (columnsConfig.value.otherTable?.length) {
        const tableIds = columnsConfig.value.otherTable.map(i => i.id)
        if (tableIds.includes(info.table.id)) {
            return
        } else {
            columnsConfig.value.otherTable = [...columnsConfig.value.otherTable, info.table]
        }
    } else {
        columnsConfig.value.otherTable = [ info.table ]
    }
}

const selectOtherTableCode = info => {
    if (info.type === 1) {
        editorRef.value.updateEditorText('table', info.record)
    } else {
        editorRef.value.updateEditorText('field', info.record)
    }
}

// 初始化函数列表树状数据
const formatTreeData = async () => {
    methodInfo.forEach((item, index) => {
        // 通过key与type进行匹配
        let targetItem = modalState.treeData.find((it) => it.key === item.type)
        if (!(systemConfig.value.dbType != 4 && item.name === 'ROW_NUMBER() OVER(ORDER BY )')) {
            if (targetItem) {
                if (!targetItem.children) {
                    targetItem.children = []
                }
                targetItem.children.push({
                    title: item.name,
                    key: index,
                    def: item.def,
                })
                // 存储所有方法
                methodList.push({
                    title: item.name,
                    key: index,
                    def: item.def,
                })
            }
        }
    })
    await getList()
    treeDataCopy = JSON.parse(JSON.stringify(modalState.treeData))
}

const cancel = () => {
    useModalStore.changeApiAddFliterModalVisible()
}

const onExpand = (keys) => {
    expandedKeys.value = keys
}

// 选择字段回调
const selectFiledHandle = (item) => {
    modalState.selectedFileds.push(item)
    // 选择的字段添加标记 增加选中样式
    codeSetList.value.codeList.forEach((field) => (field.addColumnSelected = false))

    item.addColumnSelected = true

    editorRef.value.updateEditorText('field', item)
}

// 单击只做展示
const showMethod = (dataRef) => {
    let { def, root } = dataRef
    if(!root) {
        if(dataRef.id){
            modalState.currentTips = dataRef.id            
        }else{
            modalState.currentTips = def
        }
    }
}

// 选择方法列表方法
const selectMethod = (dataRef) => {
    let { def, title, root, type } = dataRef
    if(root) {
        expandGroup(dataRef)
        return
    }

    // 仅点击具体方法更改编辑器内容
    if (def) {
        // 更新方法提示信息
        if(dataRef.id){
            modalState.currentTips = dataRef.id            
        }else{
            modalState.currentTips = def
        }
        if (title === 'ROW_NUMBER() OVER(ORDER BY )') {
            editorRef.value.updateEditorText('orderBy', ' ROW_NUMBER() OVER(ORDER BY ')
            editorRef.value.updateEditorText('orderBy', ' )')
        } else if (title === 'CASE WHEN') {
            editorRef.value.updateEditorText('caseWhen', 'CASE')
        } else if (type === 'CUSTOM') {
            editorRef.value.updateEditorText('CUSTOM', title, dataRef)
        } else {
            editorRef.value.updateEditorText('method', title)
        }
    }
}

const expandGroup = (dataRef) => {
    let {root, key} = dataRef
    // 点击根节点展开分组
    if(!root) return
    let expandKeys = expandedKeys.value
    if(expandKeys.includes(key)) {
        expandedKeys.value = expandKeys.filter(it => it !== key)
    } else {
        expandedKeys.value.push(key)
    }
}

// 确定新增回调
const confirmHandle = () => {
    // if (!modalState.filedName) {
    //     return message.warning('字段名称不能为空')
    // }

    // 获取编辑器格式化后的数据
    let config = editorRef.value.resolveEditorData()
    if (!config.expression) {
        return message.warning(t('selfConfig.blankExpression'))
    }

    // let addConfig = {
    //     uuid: operActiveId.value,
    //     action: 'add',
    //     contents: [
    //         {
    //             columnAlias: modalState.filedName, //添加的列别名
    //             columnName: Date.now() + parseInt(Math.random() * 10), //添加的列名(注意重复问题)
    //             expression: config.expression, // 表达式模板
    //             params: config.params,
    //         },
    //     ],
    // }
    config.value = editorRef.value.codeContent;
    emits('changeParams', config, props.sortItemIndex)
    // 关闭弹窗
    useModalStore.changeApiAddFliterModalVisible()
}


// 筛选树形列表数据
watch(methodKeyword, (value) => {
    const expanded = methodList
        .map((item) => {
            if (value && item.title.indexOf(value.toUpperCase()) > -1) {
                return getParentKey(item.key, modalState.treeData)
            }
            return null
        })
        .filter((item, i, self) => item && self.indexOf(item) === i)

    // 展开父级节点
    expandedKeys.value = expanded

    // 遍历备份的树形列表数据
    treeDataCopy.map((tree, index) => {
        if (tree.children) {
            let temp = []
            tree.children.filter((item, index) => {
                if (item.title.includes(value.toUpperCase())) {
                    temp.push(item)
                }
            })
            // 更新列表数据
            modalState.treeData[index].children = temp
        }
    })
})

// 从其它表选择字段后 手动滚动到底部
const scrollFieldWrap = async () => {
    await nextTick()

    let container = containerRef.value
    let offsetY = container.scrollHeight - container.clientHeight

    if(!container || !offsetY ) return

    container.scrollTop = offsetY
}

// 筛选字段列表
watch(filedNameKeyword, (value) => {
    codeListCopy.value = codeSetList.value.codeList.filter((item) => {
        if (item.columnAlias.includes(value)) {
            return true
        }
    })
})
</script>

<style lang="less" scoped>
.mask {
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9;
    .modal-container {
        width: 800px;
        background-color: #fff;
        border-radius: 8px;

        .container-top {
            width: 100%;
            padding: 15px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);
            .title {
                font-weight: 600;
                font-size: 16px;
                color: rgba(0, 0, 0, 0.8);
            }

            img {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
        }

        .container-middle {
            .field-input {
                display: flex;
                align-items: center;
                padding: 0 24px;
                margin: 24px 0 20px 0;

                label {
                    margin-right: 12px;
                }

                input {
                    flex: 1;
                }
            }

            .input-wrapper {
                margin-top:24px;
                padding: 0 24px 0 24px;
                margin-bottom: 12px;

                .input-area {
                    font-size: 14px;
                    line-height: 20px;
                    padding: 8px 12px;
                    width: 100%;
                    height: 100px;
                    outline: none;
                    border: none;
                    background: #f3f3f3;
                    border-radius: 4px;
                    resize: none;

                    &::-webkit-input-placeholder {
                        color: rgba(0, 0, 0, 0.2);
                    }
                }
            }

            .middle-bottom {
                padding: 0 24px;
                display: flex;
                justify-content: space-between;

                .operate-container {
                    width: 160px;
                    height: 335px;
                    border: 1px solid #e9e9e9;
                    border-radius: 4px;

                    &:last-of-type {
                        width: 408px;
                    }

                    .top {
                        font-size: 14px;
                        line-height: 20px;
                        color: rgba(0, 0, 0, 0.6);
                        padding: 8px 12px;
                        border-bottom: 1px solid #e9e9e9;
                    }

                    .search {
                        padding: 8px 12px;
                        position: relative;

                        img {
                            width: 16px;
                            height: 16px;
                            position: absolute;
                            left: 20px;
                            top: 50%;
                            transform: translateY(-50%);
                        }

                        input {
                            width: 100%;
                            padding-left: 29px;
                            padding-right: 10px;
                        }
                    }

                    .search-res {
                        max-height: calc(100% - 85px);
                        overflow: auto;

                        .res-item {
                            padding: 7px 28px;
                            cursor: pointer;
                        }
                    }
                    .treeNode{
                        display: inline-block;
                        width: 115px;
                        .nodeBox {
                            display: flex;
                            align-items: center;
                            position: relative;
                        }
                    }

                    :deep(.ant-tree) {
                        padding-left: 8px;
                        max-height: calc(100% - 85px);
                        overflow-y: auto;
                    }

                    :deep(.ant-tree-switcher) {
                        width: 20px;
                        height: 20px;

                        img {
                            width: 100%;
                            height: 100%;
                            position: relative;
                            top: -2px;
                            transition: all 0.2s;
                        }
                    }

                    :deep(.ant-tree-indent) {
                        display: none;
                    }

                    // 关闭时 图标旋转90度
                    :deep(.ant-tree-switcher_close) {
                        img {
                            transform: rotate(-90deg);
                        }
                    }

                    .bottom-select {
                        cursor: pointer;
                        height: 38px;
                        background: #fff;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #2B67FF;
                        border-top: 1px solid #E9E9E9;
                        img {
                            width: 14px;
                            margin-right: 6px;
                        }
                    }

                    .field-container {
                        height: calc(100% - 123px);
                        overflow-y: auto;
                        position: relative;

                        .field-item {
                            padding: 8px 14px;
                            display: flex;
                            cursor: pointer;

                            img {
                                width: 16px;
                                height: 16px;
                                margin-right: 4px;
                            }

                            span {
                                line-height: 18px;
                                font-size: 13px;
                                color: rgba(0, 0, 0, 0.8);
                                max-width: 80%;
                                white-space: pre-wrap;
                                display: -webkit-box;
                                -webkit-line-clamp: 2;
                                -webkit-box-orient: vertical;
                                overflow: hidden;
                            }
                        }

                        .field-item-active {
                            background: rgba(61, 130, 242, 0.1);
                        }
                        
                        .field-item:hover {
                            background: rgba(61, 130, 242, 0.1);
                        }
                    }

                    .explain-container {
                        padding: 12px;
                        font-weight: 400;
                        font-size: 14px;
                        line-height: 20px;
                        height: 300px;
                        overflow-y: auto;

                        .explain-content {
                            white-space: pre-line;
                        }
                    }
                }
            }
        }

        .container-bottom {
            padding: 16px;
            display: flex;
            justify-content: right;

            button {
                padding: 6px 26px;
                border-radius: 4px;
                border: none;
                background-color: #fff;
                border: 1px solid #3d82f2;
                color: #3d82f2;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                cursor: pointer;

                &:nth-of-type(2) {
                    color: #fff;
                    background-color: #3d82f2;
                    margin-left: 24px;
                }
            }
        }
    }
}
.content-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    .bi-input-wrap {
        width: 70%;
    }
    .item-lable {
        display: flex;
        align-items: center;
    }
}
</style>
