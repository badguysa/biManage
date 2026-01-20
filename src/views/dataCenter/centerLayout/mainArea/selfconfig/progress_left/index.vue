<!-- 最左侧各种步骤 -->
<template>
    <div class="selectOper" >
        <ul class="operUl" >
            <template v-for="(item, index) in operationList">
                <li 
                    @click="selectProgressDebounce(item, 1)"
                    :class="stepClass(item, index)"
                    @mouseenter="liOnmouseenter(index)"
                >
                    <BiIcon :name="item.iconName" :class="svgClass(item, index)"/>
                    <span class="oper-text">{{ t(item.text) }}</span>
                    <BiIcon
                        v-show="state.delVisible && index !== 0"
                        @click="e => { delProgress(e, item, index) }" 
                        name="trash" 
                        class="trashIcon"
                    />
                </li>
                <li class="li-line">
                    <div class="ver-line"></div>
                    <!-- 插入图标 -->
                    <BiIcon name="addOperate" @click="insertOperate($event, index)" @mouseleave="onmouseleave('add')" v-if="index !== operationList.length - 1"></BiIcon>
                </li>
            </template>
            <a-tooltip placement="bottomLeft" :title="selfconfigErrorSteps.length ? t('bloodRelation.progressErrorTips') : ''" color="#F53F3F">
                <li ref="addOperateRef" :class="addOperateClass()" @click="showProgress" @mouseleave="onmouseleave('add')">
                    <BiIcon name="addSymbol" color="#000"></BiIcon>
                </li>
            </a-tooltip>
            <Teleport to="body">
                <div 
                    class="custom-dropmenu" 
                    :style="dropMenuStyle"                         
                    @mouseenter="onmouseenter"
                    @mouseleave="onmouseleave"
                >
                    <ul 
                        ref="operateMenuRef"
                        class="innerUl" 
                        v-show="state.menuVisible"
                    >
                    <template v-for="pItem in progressList">
                        <a-tooltip v-if="stepDisabledClass(pItem)==='innerLiDisabled'">
                            <template #title>
                                {{ t('selfConfig.mergeLimitFive') }}
                            </template>
                            <li     
                                class="innerLiDisabled" 
                                @mouseenter="operateLiEnterFn(pItem)"
                                @mouseleave="operateLiLeaveFn(pItem)"
                            >
                                <img :src="pItem.src" alt="">
                                <span>{{ t(pItem.text) }}</span>
                            </li>
                        </a-tooltip>
                        <li 
                            v-else
                            :class="stepDisabledClass(pItem)" 
                            @click="selectProgress(pItem, 2)" 
                            @mouseenter="operateLiEnterFn(pItem)"
                            @mouseleave="operateLiLeaveFn(pItem)"
                        >
                            <img v-if="pItem.id !== 'groupData'" :src="pItem.src" alt="">
                            <a-tooltip v-else>
                                <template #title>
                                    {{ t('selfConfig.groupDesc') }}
                                </template>
                                <img :src="pItem.src" alt="">
                            </a-tooltip>
                            <span>{{ t(pItem.text) }}</span>
                            <template v-if="pItem.id === 'more'">
                                <img class="moreIcon" :src="rightArrow" alt="">
                                <div :class="['moreWrap', childMenuDirection]" ref="childMenuRef">
                                    <ul class="childUl" v-show="showMore">
                                        <li class="childLi"
                                            v-for="cItem in pItem.childItems" 
                                            :key="cItem.id"
                                            @click="selectProgress(cItem, 2)"
                                        >
                                            <img :src="cItem.src" alt="">
                                            <span>{{ t(cItem.text) }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </template>
                        </li>
                    </template>
                    </ul>
                </div>
            </Teleport>
        </ul>
    </div>
</template>

<script setup>
import * as _ from 'loadsh'
import { v4 as uuidv4 } from 'uuid'
import { configStore } from '@/Stores/configStore'
import { mainStore } from '@/Stores/mainStore'
import { modalStore } from '@/Stores/modalStore'
import { storeToRefs } from 'pinia'
import selectImg from '@/assets/icons/selectcode.png'
import fliterImg from '@/assets/icons/guolv.png'
import sortImg from '@/assets/icons/sort.png'
import addcolumnsImg from '@/assets/icons/addcolumns.png'
import groupImg from '@/assets/icons/group.png'
import codeImg from '@/assets/icons/codeset.png'
import hebingImg from '@/assets/icons/hebing.png'
import moreImg from '@/assets/icons/more.png'
import rightArrow from '@/assets/icons/arrows-right.png'
import deweight from '@/assets/icons/deweight.png'
import { useI18n } from 'vue-i18n'
import useUpdateErrorStep from '@/hooks/selfConfig/useUpdateErrorStep'

const { t } = useI18n()
const useConfigStore = configStore()
const useMainStore = mainStore()
const useModalStore = modalStore()

const operateMenuRef = ref(null)
const addOperateRef = ref()
const showMore = ref(false)
const childMenuRef = ref(null)
const childMenuDirection = ref('right')

const updateErrorStep = useUpdateErrorStep()


const { indexTableColumns, indexTableDesc, activeTabKey } = storeToRefs(useMainStore)
const { configUniqueData } = storeToRefs(useConfigStore)
const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})
const { codeList, operationList, operActiveId, tableSource, selfFlag, selfconfigErrorSteps, bloodErrorSteps  } = toRefs(configData.value)

const selectCodeList = computed(() => {
    return codeList.value.filter(i => i.isSelect)
})

onMounted(() => {
    progressInit()
})

const state = reactive({
    menuVisible: false,
    delVisible: false,
    top: 'auto'
})
const progressList = [{
    id: 'filterData',
    src: fliterImg,
    iconName: 'filter',
    text: 'selfConfig.filter',
    action: 'where'
}, {
    id: 'sortData',
    src: sortImg,
    iconName: 'sort',
    text: 'selfConfig.sort',
    action: 'order'
}, {
    id: 'addColumns',
    src: addcolumnsImg,
    iconName: 'addCol',
    text: 'selfConfig.addColumns',
    action: 'add'
}, {
    id: 'groupData',
    src: groupImg,
    iconName: 'group',
    text: 'selfConfig.groupSummary',
    action: 'group'
}, {
    id: 'codeSetting',
    src: codeImg,
    iconName: 'codeSet',
    text: 'selfConfig.codeSet',
    action: 'setting'
}, {
    id: 'mergeData',
    src: hebingImg,
    iconName: 'merge',
    text: 'selfConfig.mergeTable',
    action: 'join'
},{
    id: 'more',
    src: moreImg,
    text: 'overview.more',
    childItems: [{
        id: 'distinct', // 去重
        src: deweight,
        iconName: 'deweight',
        text: 'selfConfig.deweight',
        action: 'distinct'
    }]
}]

const dropMenuStyle = ref({
    position: 'absolute',
    left: '228px',
    top: ''
})

const showTimeout = ref(null)

const insertIndex = ref(-1) // 插入索引

const sourceTableId = computed(() => tableSource.value[0]?.contents.tableId)

const mergeDisabled = computed(()=> {
    const mergeOperNum = operationList.value.filter((item)=> item.id === 'mergeData').length
    if(mergeOperNum < 5){
        return false
    } else {
        return true
    }
})

const progressInit = async () => {
    if (selfFlag.value !== 'edit') {
        useConfigStore.setOperActiveId(operationList.value[0].uuid, 2, activeTabKey.value)
        return
    }

    // 编辑自助配置含有多个步骤 获取来源表字段 allconfigData赋值
    if(tableSource.value.length > 1) {
        useConfigStore.getCodeList({id: sourceTableId.value}, activeTabKey.value)
    }

    let arr = [] 
    let configList = []
    let config = []
    tableSource.value.forEach((item, i) => {
        const v = item.action
        const uuid = item.uuid || uuidv4()
        if (!item.uuid) {
            item.uuid = uuid
        }
        config = [...config, item]
        configList.push({
            config,
            uuid
        })
        if (v === 'select') {
            arr.push({
                id: 'selectCode',
                uuid,
                src: selectImg,
                iconName: 'select',
                text: 'selfConfig.selectTableAndCode'
            })
        }
        if (v === 'where') {
            arr.push({
                uuid,
                ...progressList[0]
            })
        }
        if (v === 'order') {
            arr.push({
                uuid,
                ...progressList[1]
            })
        }
        if (v === 'add') {
            arr.push({
                uuid,
                ...progressList[2]
            })
        }
        if (v === 'group') {
            arr.push({
                uuid,
                ...progressList[3]
            })
        }
        if (v === 'setting') {
            arr.push({
                uuid,
                ...progressList[4]
            })
        }
        if (v === 'join') {
            arr.push({
                uuid,
                ...progressList[5]
            })
        }
        if (v === 'distinct') {
            arr.push({
                uuid,
                ...progressList[6].childItems[0]
            })
        }
    })
    useConfigStore.changeSelfConfig(configList, activeTabKey.value)
    useConfigStore.changeOperationList(arr, activeTabKey.value)
    useConfigStore.setOperActiveId(arr[arr.length - 1].uuid, 1, activeTabKey.value)
    useConfigStore.setShowType(arr[arr.length - 1].id, activeTabKey.value)
    await useConfigStore.editClickOperActiveId(activeTabKey.value)
    // 数据获取完毕 更新去重数据加载状态
    useConfigStore.setDistinctConfigDataLoaded(true, activeTabKey.value)
}
// 导入数据配置鼠标事件 begin
const onmouseenter = () => {
    state.menuVisible = true
    clearTimeout(showTimeout.value)
}
const onmouseleave = (flag) => {
    if (flag === 'add') {
        if (showTimeout.value) {
            clearTimeout(showTimeout.value)
        }
        showTimeout.value = setTimeout(() => {
            state.menuVisible = false
            showMore.value = false
        }, 300)
    } else {
        state.menuVisible = false
        showMore.value = false
    }
}

const liOnmouseenter = () => {
    state.delVisible = true
}

// 展示操作菜单
const showOperateMenu = async (type, e) => {
    if (!selectCodeList.value.length ||  // 未选择字段
        (type === 'add' && includeErrorStep.value) ||  // 新增含有错误步骤
        (type === 'insert' && stepError(insertIndex.value)))   // 插入步骤在错误步骤之后
    {
        return
    }

    state.menuVisible = true
    // console.log('menuVisible', state.menuVisible)

    await nextTick()

    let top = 0, dh = 0

    if(type === 'insert') {
        top = e.target.getBoundingClientRect().top
        dh = 16
    } else if(type === 'add') {
        top = addOperateRef.value.getBoundingClientRect().top
        dh = 40
    }

    if (document.documentElement.clientHeight - top - 40 > operateMenuHeight.value) { // 说明下面放得下
        dropMenuStyle.value.top = top + dh + 'px'
    } else {
        dropMenuStyle.value.top = top - operateMenuHeight.value + 'px'
    }

}

const showProgress =  _.debounce(() => {
    // 重置插入索引
    insertIndex.value = -1
    showOperateMenu('add')
}, 200, {
    leading: true,
    trailing: false
})

// 插入步骤
const insertOperate = (e, index) => {
    insertIndex.value = index
    showOperateMenu('insert', e)
}

// 导入数据配置鼠标事件 end
const selectProgress = (record, type) => {
    // 点击当前步骤 
    // if(record.uuid === operActiveId.value) return

    if(record.id === 'more'){
        return
    }

    if (type === 2) {   // 添加步骤
        // 添加去重步骤 重置去重数据加载状态
        if(record.id === 'distinct') {
            useConfigStore.setDistinctConfigDataLoaded(false, activeTabKey.value)
        }
        if(insertIndex.value !== -1) {  // 步骤中间插入
            useConfigStore.insertOperationList(record, activeTabKey.value, insertIndex.value)
            let configInfo = {
                uuid: operActiveId.value,
                action: record.action,
                contents: [],
                default: true
            }
            useConfigStore.setSelfConfig(configInfo, record.action, activeTabKey.value, insertIndex.value)

            // 异常步骤之前插入 更新异常步骤索引
            updateErrorStep('insert')
        } else {    // 末尾新增
            useConfigStore.setOperationList(record, activeTabKey.value)
            // 新增selfConfig默认配置 更新字段时需使用
            let configInfo = {
                uuid: operActiveId.value,
                action: record.action,
                contents: [],
                default: true
            }
            useConfigStore.setSelfConfig(configInfo, record.action, activeTabKey.value)
        }
    }

    if (record.uuid) {
        if (selfFlag.value === 'edit') {    // 编辑状态切换步骤
            const uuids = tableSource.value.map(item => item.uuid)
            if (uuids.includes(record.uuid)) {
                if (record.id !== 'selectCode') {
                    useConfigStore.setOperActiveId(record.uuid, 1, activeTabKey.value)
                    useConfigStore.editClickOperActiveId(activeTabKey.value)
                } else {
                    useConfigStore.setOperActiveId(record.uuid, 2, activeTabKey.value)
                }
            } else {
                useConfigStore.setOperActiveId(record.uuid, 2, activeTabKey.value)
            }
        } else {    // 新增状态切换步骤
            useConfigStore.setOperActiveId(record.uuid, 2, activeTabKey.value)
            useConfigStore.updateAllConfigData(record.uuid, activeTabKey.value)
        }
    }
    useConfigStore.setShowType(record.id, activeTabKey.value)
    state.menuVisible = false
    showMore.value = false
}

const operateLiEnterFn = (item) => {
    if(item.id !== 'more') return

    let { right } =  operateMenuRef.value.getBoundingClientRect()

    let rightAreaWidth = document.documentElement.clientWidth - right

    // 右边区域放不下更多菜单
    if(rightAreaWidth < 128 + 5) {
        childMenuDirection.value = 'left'
    } else {
        childMenuDirection.value = 'right'
    }

    showMore.value = true
    childMenuRef.value
}

const operateLiLeaveFn = (item) => {
    if(item.id !== 'more') return
    showMore.value = false
}

const selectProgressDebounce = _.debounce(selectProgress, 130)

const delProgress = (e, record, index) => {
    e.stopPropagation()
    // 删除中间步骤 保存索引值
    let itemIndex = operationList.value.findIndex(it => it === record)
    if(itemIndex !== operationList.value.length - 1) {
        record.deleteIndex = itemIndex
    } else {
        record.deleteIndex = -1
    }
    useMainStore.setDeleteData(record) 
    useModalStore.changeDeleteProgressVisible()
}

const stepError = (index) => {

    // return bloodErrorSteps.value.includes(index) || selfconfigErrorSteps.value.includes(index)

    // 如果前面的步骤出现异常 则后面的步骤都异常
    return index >= bloodErrorSteps.value[0] || index >= selfconfigErrorSteps.value[0]
}

const svgClass = (item, index) => {
    return [
        operActiveId.value === item.uuid ? 'activeStatus': '',
        stepError(index) ? 'errorStatus': ''
    ]
}

const stepClass = (item, index) => {
    return [
        operActiveId.value == item.uuid ? 'operLi active': 'operLi',
        stepError(index) ? 'errorStep': ''
    ]
}

const stepDisabledClass = (item, index) => {
    if(item.id === 'mergeData' && mergeDisabled.value){
        return 'innerLiDisabled'
    } else {
        return 'innerLi'
    }
}

const addOperateClass = () => {
    return [
        // selectCodeList.value.length && !bloodErrorSteps.value.length && !selfconfigErrorSteps.value.length ? 
        selectCodeList.value.length && !selfconfigErrorSteps.value.length ? 
        'operLi addcion' : 'operLi addcion ban'
    ]
}

// 包含错误步骤
const includeErrorStep = computed(() => {
    return selfconfigErrorSteps.value[0] || bloodErrorSteps.value[0]
})

const operateMenuHeight = computed(() => operateMenuRef.value?.clientHeight)

</script>

<style lang="less" scoped>
.selectOper {
    width: 160px;
    display: flex;
    justify-content: center;
    background-color: #fff;
    padding: 20px 16px 0px 16px;

    .operUl {
        position: relative;
        height: calc(100% - 20px);
        overflow-y: scroll;
        overflow-x: hidden;
        width: 100%;
        // 兼容新chorme 隐藏滚动条
        scrollbar-width: none;
        .li-line {
            background: none;
            border: none;
            width: 10px;
            height: 40px;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            margin: 0 auto;
            svg{
                width: 16px;
                height: 16px;
                position: absolute;
                display: none;
                cursor: pointer;
            }
            &:hover{
                svg{
                    display: block;
                }
            }
            .ver-line {
                width: 1px;
                height: 32px;
                background: #E9E9E9;
            }
        }

        .operLi {
            height: 40px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            padding: 8px;
            gap: 8px;
            cursor: pointer;
            background: #FAFAFA;
            border: 1px solid #E9E9E9;
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            position: relative;
            svg, img {
                width: 16px;
                height: 16px;
            }
            .del-icon {
                position: absolute;
                right: 8px;
            }
            .trashIcon{
                position: absolute;
                right: 8px;
                display: none;
            }
            &:hover{
                .trashIcon{
                    display: block;
                }
            }
            .oper-text { 
                width: 64px;
                white-space: nowrap;
            }
        }

        .operLi:hover {
            background: rgba(61, 130, 242, 0.1);
        }

        .active {
            background: rgba(61, 130, 242, 0.1);
            border: 1px solid rgba(61, 130, 242, 0.8);
            font-weight: 600;
            font-size: 14px;
            color: #3D82F2;
            &.errorStep{
                border: 1px solid #F53F3F;
                background: rgba(255, 78, 78, 0.10);
                .oper-text{
                    font-weight: 600;
                }
            }
        }

        .errorStep{
            .oper-text{
                color: #F53F3F;
            }
        }

        .addcion {
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid #E9E9E9;
            border-radius: 4px;
            font-size: 15px;

            img {
                width: 24px;
            }
        }
        .addcion:hover {
            background-color: #FAFAFA;
        }

        .ban {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .innerLi:hover {
            background: rgba(61, 130, 242, 0.1);
        }

        .bottomText {
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            bottom: -5px;
            width: 100%;
            height: 40px;
            background: #FFFFFF;
            border-top: 1px solid rgba(0, 0, 0, 0.07);
            font-weight: 400;
            font-size: 14px;
            color: #3D82F2;
            cursor: pointer;
        }
    }
    .operUl::-webkit-scrollbar {
        width: 0 !important;
    }
}
</style>
<style lang="less">
.innerUl{
    .innerLiDisabled {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        width: 128px;
        height: 40px;
        position: relative;
        color: #00000040;
        border-color: #d9d9d9;
        background: #f5f5f5;
        cursor: not-allowed;
        img{
            width: 16px;
            height: 16px;
            margin-right: 8px;
        }
    }
}
</style>