<!-- 最左侧各种步骤 -->
<template>
    <div class="selectOper">
        <ul class="operUl">
            <template v-for="(item, index) in operationList">
                <li 
                    @click="selectProgressDebounce(item, 1)"
                    :class="stepClass(item, index)"
                    @mouseenter="liOnmouseenter(index)"
                    @mouseleave="liOnmouseleave(index)"
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
            <a-tooltip placement="bottomLeft" v-if="bloodErrorSteps.length || selfconfigErrorSteps.length" :title="t('bloodRelation.progressErrorTips')" color="#F53F3F">
                <li ref="addOperateRef" :class="addOperateClass()" @click="showProgress" @mouseleave="onmouseleave('add')">
                    <BiIcon name="addSymbol" color="#000"></BiIcon>
                </li>
            </a-tooltip>
            <li ref="addOperateRef" v-else :class="addOperateClass()" @click="showProgress" @mouseleave="onmouseleave('add')">
                <BiIcon name="addSymbol" color="#000"></BiIcon>
            </li>
            <Teleport to="body">
                <div 
                    class="custom-dropmenu" 
                    :style="dropMenuStyle"                         
                    @mouseenter="onmouseenter"
                    @mouseleave="onmouseleave"
                >
                    <ul 
                        class="innerUl" 
                        v-show="state.menuVisible"
                    >
                        <template v-for="pItem in progressList">
                            <a-tooltip v-if="disabledFn(pItem)" placement="right">
                                <template #title>
                                    {{ t('selfConfig.addPushLimit') }}
                                </template>
                                <li :class="{ 'innerLi': true, 'liDisabled': disabledFn(pItem) }">
                                    <img :src="pItem.src" alt="">
                                    <span>{{ t(pItem.text) }}</span>
                                </li>
                            </a-tooltip>
                            <li  v-else class="innerLi" @click="selectProgress(pItem, 2)">
                                <img v-if="pItem.id !== 'groupData'" :src="pItem.src" alt="">
                                <a-tooltip v-else>
                                    <template #title>
                                        {{ t('selfConfig.groupDesc') }}
                                    </template>
                                    <img :src="pItem.src" alt="">
                                </a-tooltip>
                                <span>{{ t(pItem.text) }}</span>
                            </li>
                        </template>
                    </ul>
                </div>
            </Teleport>
        </ul>
    </div>
</template>

<script setup>
import { reactive, computed, onMounted, ref } from 'vue'
import * as _ from 'loadsh'
import { apiConfigStore } from '@/Stores/apiConfigStore'
import { mainStore } from '@/Stores/mainStore'
import { modalStore } from '@/Stores/modalStore'
import { storeToRefs } from 'pinia'
import fliterImg from '@/assets/icons/guolv.png'
import sortImg from '@/assets/icons/sort.png'
import addcolumnsImg from '@/assets/icons/addcolumns.png'
import groupImg from '@/assets/icons/group.png'
import codeImg from '@/assets/icons/codeset.png'
import hebingImg from '@/assets/icons/hebing.png'
import activeFliterImg from '@/assets/icons/active_two.png'
import activeSortImg from '@/assets/icons/active_three.png'
import activeAddcolumnsImg from '@/assets/icons/active_four.png'
import activeGroupImg from '@/assets/icons/active_five.png'
import activeCodeImg from '@/assets/icons/active_six.png'
import activeHebingImg from '@/assets/icons/active_seven.png'
import selectImg from '@/assets/icons/selectcode.png'
import selectedImg from '@/assets/icons/active_one.png'
import { useI18n } from 'vue-i18n'
import { v4 as uuidv4 } from 'uuid'
import validatePhyCode from '@/hooks/pushManage/usePhyFieldValidate'

const { t } = useI18n()
const useApiConfigStore = apiConfigStore()
const useMainStore = mainStore()
const useModalStore = modalStore()

const { codeList, operationList, operActiveId, tableSource, selfFlag, selfconfigErrorSteps, bloodErrorSteps } = storeToRefs(useApiConfigStore)

const selectCodeList = computed(() => {
    return codeList.value.filter(i => i.isSelect)
})

const state = reactive({
    menuVisible: false,
    delVisible: false,
    top: 'auto'
})
const progressList = [{
    id: 'filterData',
    src: fliterImg,
    activeSrc: activeFliterImg,
    iconName: 'filter',
    text: 'selfConfig.filter',
    action: 'where'
}, {
    id: 'sortData',
    src: sortImg,
    activeSrc: activeSortImg,
    iconName: 'sort',
    text: 'selfConfig.sort',
    action: 'order'
}, {
    id: 'addColumns',
    src: addcolumnsImg,
    activeSrc: activeAddcolumnsImg,
    iconName: 'addCol',
    text: 'selfConfig.addColumns',
    action: 'add'
}, {
    id: 'groupData',
    src: groupImg,
    activeSrc: activeGroupImg,
    iconName: 'group',
    text: 'selfConfig.groupSummary',
    action: 'group'
}, {
    id: 'codeSetting',
    src: codeImg,
    activeSrc: activeCodeImg,
    iconName: 'codeSet',
    text: 'selfConfig.codeSet',
    action: 'setting'
}, {
    id: 'mergeData',
    src: hebingImg,
    activeSrc: activeHebingImg,
    iconName: 'merge',
    text: 'selfConfig.mergeTable',
    action: 'join'
}]

const dropMenuStyle = ref({
    position: 'absolute',
    left: '228px',
    top: ''
})

const showTimeout = ref(null)

const insertIndex = ref(-1) // 插入索引

// 获取主题的状态信息
const themeState = inject('themeState', undefined)

onMounted(() => {
    useApiConfigStore.setOperActiveId(operationList.value[0].uuid, 2)
    initEdit()
})

const sourceTableId = computed(() => tableSource.value[0]?.contents.tableId)

const initEdit = () => {
    if (selfFlag.value !== 'edit') {
        return
    }

    if(!tableSource.value.length) {
        return
        // tableSource.value = [{
        //     action: 'select',
        //     contents: {
        //         columns: [],
        //         tableId: ''
        //     },
        //     uuid: uuidv4(),

        // }]
    }

    // 编辑自助配置含有多个步骤 获取来源表字段 allconfigData赋值
    if(tableSource.value.length > 1) {
        useApiConfigStore.getCodeList({id: sourceTableId.value})
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
                activeSrc: selectedImg,
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
    })
    const lastNumber = tableSource.value[tableSource.value.length - 1].lastNumber
    if (lastNumber) {
        useMainStore.setDynamicNum('change', lastNumber)
    } else {
        useMainStore.setDynamicNum('change', 100)
    }
    // 得到selfConfig
    useApiConfigStore.changeSelfConfig(configList)
    useApiConfigStore.changeOperationList(arr)
    useApiConfigStore.setOperActiveId(arr[arr.length - 1].uuid, 1)
    useApiConfigStore.setShowType(arr[arr.length - 1].id)
    useApiConfigStore.editClickOperActiveId(arr[arr.length - 1])
}

// 禁止点击
const disabledFn = (item)=>{
    if(themeState?.dataMode===2 && (item.id==='addColumns' || item.id==='mergeData')){
        return true
    } else {
        return false
    }
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
        }, 300)
    } else {
        state.menuVisible = false
    }
}

const liOnmouseenter = (index) => {
    // if (index !== operationList.value.length - 1 || operationList.value.length < 2) return
    state.delVisible = true
}

const liOnmouseleave = (index) => {
    // if (index !== operationList.value.length - 1 || operationList.value.length < 2) return
    state.delVisible = false
}

const showProgress = _.debounce(() => {
    // 重置插入索引
    insertIndex.value = -1
    const { top } = document.querySelector('.addcion').getBoundingClientRect()
    if (document.documentElement.clientHeight - top - 40 > 250) { // 说明下面放得下
        dropMenuStyle.value.top = top + 40 + 'px'
    } else {
        dropMenuStyle.value.top = top - 250 + 'px'
    }
    if (!selectCodeList.value.length) return
    state.menuVisible = true
}, 200, {
    leading: true,
    trailing: false
})

// 插入步骤
const insertOperate = (e, index) => {
    if (!selectCodeList.value.length || selfconfigErrorSteps.value.length) return
    const { top } = e.target.getBoundingClientRect()
    if (document.documentElement.clientHeight - top - 40 > 250) { // 说明下面放得下
        dropMenuStyle.value.top = top + 16 + 'px'
    } else {
        dropMenuStyle.value.top = top - 250 + 'px'
    }
    state.menuVisible = true
    insertIndex.value = index
}

// 导入数据配置鼠标事件 end
const selectProgress = (record, type) => {
    // 点击当前步骤 
    // if(record.uuid === operActiveId.value) return

    if(validatePhyCode()) return

    if (type === 2) {   // 添加步骤
        if(insertIndex.value !== -1) {  // 步骤中间插入
            useApiConfigStore.insertOperationList(record, insertIndex.value)
            let configInfo = {
                uuid: operActiveId.value,
                action: record.action,
                contents: [],
                default: true
            }
            useApiConfigStore.setSelfConfig(configInfo, record.action, insertIndex.value)
        }else {
            useApiConfigStore.setOperationList(record)
            // 新增selfConfig默认配置 更新字段时需使用
            let configInfo = {
                uuid: operActiveId.value,
                action: record.action,
                contents: [],
                default: true
            }
            useApiConfigStore.setSelfConfig(configInfo, record.action)
        }
    }
    if (record.uuid) {
        if (selfFlag.value === 'edit') {
            const uuids = tableSource.value.map(item => item.uuid)
            if (uuids.includes(record.uuid)) {
                if (record.id !== 'selectCode') {
                    useApiConfigStore.setOperActiveId(record.uuid, 1)
                    useApiConfigStore.editClickOperActiveId()
                } else {
                    useApiConfigStore.setOperActiveId(record.uuid, 2)
                }
            } else {
                useApiConfigStore.setOperActiveId(record.uuid, 2)
            }
        } else {
            useApiConfigStore.setOperActiveId(record.uuid, 2)
            useApiConfigStore.updateAllConfigData(record.uuid)
        }
    }
    useApiConfigStore.setShowType(record.id)
    state.menuVisible = false
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
    useModalStore.changeApiDelProgressModalVisible()

    if(record.action === 'setting') {
        useApiConfigStore.setPhyCodeFlag('normal')
    }
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

const addOperateClass = () => {
    return [
        selectCodeList.value.length && !bloodErrorSteps.value.length && !selfconfigErrorSteps.value.length ? 
        'operLi addcion' : 'operLi addcion ban'
    ]
}
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
            width: 128px;
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
                width: 77px;
                line-height: 1;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
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

        .innerUl {
            position: absolute;
            width: 128px;
            height: 242px;
            border: 1px solid #E9E9E9;
            box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
            border-radius: 4px;
            left: 0px;
            margin-top: 3px;
            z-index: 5;
            background: #FFF;
            li:nth-child(2) {
                border-bottom: 1px solid rgba(0, 0, 0, 0.07);
            }

            li:nth-child(5) {
                border-bottom: 1px solid rgba(0, 0, 0, 0.07);
            }

            .innerLi {
                display: flex;
                align-items: center;
                padding: 10px 12px;
                width: 128px;
                height: 40px;
                background: #FFFFFF;
                cursor: pointer;

                img {
                    width: 16px;
                    margin-right: 8px;
                }
            }
            .liDisabled {
                color: #00000040;
                border-color: #d9d9d9;
                background: #f5f5f5;
                cursor: not-allowed;
            }
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
.liDisabled {
    color: #00000040;
    border-color: #d9d9d9;
    background: #f5f5f5;
    cursor: not-allowed;
}
</style>