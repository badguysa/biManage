<template>
    <div v-if="addStandardLibModalVisible" class="groupModal">
        <div class="maskLayer"></div>
        <div :class="groupModalStatus.indexOf('delete') > -1 ? 'popDiv wid400' : 'popDiv wid480'">
            <div class="popHead">
                <span class="popClose fr" @click="cancel"><img style="width: 16px" :src="closeImg" /></span>
                <p class="fl fs18 colorDeep">
                    {{ groupModalStatus.indexOf('delete') > -1 ? t('common.delete') : (groupModalStatus.indexOf('edit')
        > -1 ? t('dataStandard.editStandardLib') : t('dataStandard.addStandardLib')) }}
                </p>
            </div>
            <div v-if="groupModalStatus.indexOf('delete') > -1" class="delbox">
                {{ t('dataStandard.deleteSure') }}<span class="text">{{ groupName }}</span>?
            </div>
            <div v-else class="modalBody">
                <div class="title" v-if="groupModalStatus.indexOf('edit') == -1">
                    自定义标准库
                </div>
                <div class="row">
                    <div class="col1">{{ t('dataStandard.standardLibName') }}</div>
                    <div class="col2">
                        <input type="text" @input="iptChange" v-model="groupName" maxlength="50"
                            :placeholder="t('common.pleaseEnter')" />
                    </div>
                </div>
                <div class="title" v-if="groupModalStatus.indexOf('edit') == -1">
                    选择模版创建
                </div>
                <div class="row" v-if="groupModalStatus.indexOf('edit') == -1">
                    <div class="col1">模版</div>
                    <div class="col2">
                        <a-radio @click.native.prevent="rdoChange(isBrain)" v-model:checked="isBrain">全国职业教育智慧大脑院校中台【中高职】</a-radio>
                    </div>
                </div>
            </div>
            <div class="popBottom shadowBox">
                <template v-if="groupModalStatus.indexOf('delete') > -1">
                    <myButton class="fr mr25" @click="onOK" type="primary">{{ t('common.confirm') }}</myButton>
                </template>
                <template v-else>
                    <myButton class="fr mr25" @click="onOK" type="primary">{{ t('common.confirm') }}</myButton>
                </template>
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onUnmounted, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { modalStore } from '@/Stores/modalStore'
import { mainStore } from '@/Stores/mainStore'
import { addStandardLibApi, updateStandardLibApi, deleteStandardLibApi  } from '@/apis/dataStandard/index.js'
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import myButton from '@/components/buttons/myButton'
import { useI18n } from 'vue-i18n'
import * as _ from 'lodash'

const useDataStandardStore = dataStandardStore()
const useModalStore = modalStore()
const useMainStore = mainStore()
const { t } = useI18n()

const { addStandardLibModalVisible } = storeToRefs(useModalStore)
const { groupModalStatus, groupObject, iconPreviewUrl, leftDataList, } = storeToRefs(useDataStandardStore)
const groupName = ref(groupModalStatus.value == 'fedit' || groupModalStatus.value == 'fdelete' ? 
groupObject.value.outItem.name : 
(groupModalStatus.value == 'cedit' || groupModalStatus.value == 'cdelete' ? 
groupObject.value.innerItem.name : 
(groupModalStatus.value == 'gedit' || groupModalStatus.value == 'gdelete')?groupObject.value.innerInnerItem.name:''))

const isBrain = ref(false)

const cancel = () => {
    useDataStandardStore.changeGroupModalStatus('')
    useModalStore.changeAddStandardLibModalVisible()
}

const iptChange = (e) => {
    groupName.value = e.target.value.trim()
}

const rdoChange = (val) => {
    isBrain.value = !val
}

const onOK = _.debounce(() => {
    if (!groupName.value && !isBrain.value && groupModalStatus.value.indexOf('delete') === -1) return message.warn(t('dataStandard.fillStandardLib'))
    const v = groupModalStatus.value
    if (v == 'default' || v == 'fadd') {
        let itemSort = ''
        if (leftDataList.value.length > 0) {
            if (leftDataList.value[leftDataList.value.length - 1]) {
                itemSort = leftDataList.value[leftDataList.value.length - 1].sort
            }
        } else {
            itemSort = 1
        }
        let jsonData = {
            icon: iconPreviewUrl.value,
            name: groupName.value,
            pid: '-1',
            sort: Number(itemSort) + 1,
            xpath: `-1`,
            groupType: 0
        }
        if(isBrain.value){
            jsonData.subType = 'STD_BRAIN'
        }
        addStandardLibApi(jsonData).then(async (res) => {
            if (res.code == 1) {
                message.success(res.message)
                await useDataStandardStore.getLeftDataListFn()
                useDataStandardStore.changeGroupModalStatus('')
                useModalStore.changeAddStandardLibModalVisible()
            } else {
                message.error(res.message)
            }
        })
    } else if (v == 'cadd') {
        // 子级添加
        let jsonData = {
            icon: '',
            name: groupName.value,
            pid: groupObject.value.outItem.id,
            sort: groupObject.value.outItem.subList.length + 1,
            xpath: `-1/${groupObject.value.outItem.id}`,
            groupType: 0
        }
        if(isBrain.value){
            jsonData.subType = 'STD_BRAIN'
        }
        addStandardLibApi(jsonData).then(async (res) => {
            if (res.code == 1) {
                message.success(res.message)
                await useDataStandardStore.getLeftDataListFn()
                // 添加子级分组 传递 ADD_CHILD_CB
                useDataStandardStore.changeGroupModalStatus('', 'ADD_CHILD_CB')
                useModalStore.changeAddStandardLibModalVisible()
            } else {
                message.error(res.message)
            }
        })
    } else if (v == 'gadd') {
        // 孙级添加
        let jsonData = {
            icon: '',
            name: groupName.value,
            pid: groupObject.value.innerItem.id,
            sort: groupObject.value.innerItem.subList.length + 1,
            xpath: `-1/${groupObject.value.outItem.id}/${groupObject.value.innerItem.id}`,
            groupType: 0
        }
        if(isBrain.value){
            jsonData.subType = 'STD_BRAIN'
        }
        addStandardLibApi(jsonData).then(async (res) => {
            if (res.code == 1) {
                message.success(res.message)
                await useDataStandardStore.getLeftDataListFn()
                // 添加子级分组 传递 ADD_CHILD_CB
                useDataStandardStore.changeGroupModalStatus('', 'ADD_CHILD_CB')
                useModalStore.changeAddStandardLibModalVisible()
            } else {
                message.error(res.message)
            }
        })
    } else if (v == 'fedit') {
        // console.log('父级修改');
        const jsonData = {
            icon: iconPreviewUrl.value || groupObject.value.outItem.icon,
            name: groupName.value,
            id: groupObject.value.outItem.id,
            pid: '-1',
            sort: groupObject.value.outItem.sort,
            xpath: `-1`,
            groupType: 0
        }
        updateStandardLibApi(jsonData).then(async(res) => {
            if (res.code == 1) {
                message.success(res.message)
                await useDataStandardStore.getLeftDataListFn()
                useDataStandardStore.changeGroupModalStatus('')
                useModalStore.changeAddStandardLibModalVisible()
            } else {
                message.error(res.message)
            }
        })
    } else if (v == 'fdelete' || v == 'cdelete' || v == 'gdelete') {
        let jsonData = {}
        if (v == 'fdelete') {
            jsonData = {
                ids: groupObject.value.outItem.id
            }
        } else if (v == 'cdelete') {
            jsonData = {
                ids: groupObject.value.innerItem.id
            }
        }else{
            jsonData = {
                ids: groupObject.value.innerInnerItem.id
            }
        }
        deleteStandardLibApi(jsonData).then(async(res) => {
            if (res.code == 1) {
                message.success(res.message)
                await useDataStandardStore.getLeftDataListFn()
                useDataStandardStore.changeGroupModalStatus('')
                useModalStore.changeAddStandardLibModalVisible()
            } else {
                message.error(res.message)
            }
        })
    } else if (v == 'cedit') {
        const jsonData = {
            icon: '',
            name: groupName.value,
            id: groupObject.value.innerItem.id,
            pid: groupObject.value.innerItem.pid,
            sort: groupObject.value.innerItem.sort,
            xpath: `-1/${groupObject.value.innerItem.pid}`,
            groupType: 0
        }
        updateStandardLibApi(jsonData).then(async(res) => {
            if (res.code == 1) {
                message.success(res.message)
                // useMainStore.loadLeftMenuList('update')
                await useDataStandardStore.getLeftDataListFn()
                useDataStandardStore.changeGroupModalStatus('')
                useModalStore.changeAddStandardLibModalVisible()
            } else {
                message.error(res.message)
            }
        })
    } else if (v == 'gedit') {
        const jsonData = {
            icon: '',
            name: groupName.value,
            id: groupObject.value.innerInnerItem.id,
            pid: groupObject.value.innerInnerItem.pid,
            sort: groupObject.value.innerInnerItem.sort,
            xpath: `-1/${groupObject.value.innerItem.pid}/${groupObject.value.innerInnerItem.pid}`,
            groupType: 0
        }
        updateStandardLibApi(jsonData).then(async(res) => {
            if (res.code == 1) {
                message.success(res.message)
                // useMainStore.loadLeftMenuList('update')
                await useDataStandardStore.getLeftDataListFn()
                useDataStandardStore.changeGroupModalStatus('')
                useModalStore.changeAddStandardLibModalVisible()
            } else {
                message.error(res.message)
            }
        })
    }
}, 300, {
    leading: true,  // 延迟开始前调用
    trailing: false // 延迟结束后调用
})
</script>

<style scoped lang="less">
.groupModal {
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

    .modalBody {
        width: 100%;
        height: 100%;
        padding: 24px;
        font-family: 'PingFang SC';
        font-style: normal;
        .title {
            color: #000000CC;
            font-weight: 600;
        }
        .row {
            display: grid;
            grid-template-columns: 76px auto;

            .col1 {
                height: 52px;
                line-height: 52px;
                font-weight: 400;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.8);
            }

            .col2 {
                display: flex;
                align-items: center;
                height: 52px;

                .iconBtn {}

                .uploadBtn {}

                input {
                    width: 356px;
                }

                .iconImg {
                    background: linear-gradient(0deg, #334D80, #334D80), #192640;
                    border-radius: 8px;
                    width: 52px;
                    height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }

        .mt10mb16 {
            margin-top: 10px;
            margin-bottom: 16px;
            font-weight: 400;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.4);
        }
    }
}
</style>