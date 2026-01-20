<template>
    <div class="background" v-if="isShow">
        <div class="back">
            <div class="backbox" @click="change(false)"><img src="@/assets/icons/return.png" alt="">{{ t('common.back')
                }}</div>
        </div>
        <div class="content">
            <div class="title">
                <div class="titleText">{{ source.name }}</div>
                <div  v-if="source.visible.includes('2')" class="iconText">{{ t('dataMarket.api') }}</div>
                <div  v-if="source.visible.includes('1')" class="iconText" >{{ t('dataMarket.download') }}</div>
                <IconButton v-if="!hasAuth" name="addOperate" title="申请使用" @click="applyHandle"/>
            </div> 
            <div class="tips">
                <div class="item">{{ source.description }}</div>
                <div class="item otherTips">
                    <div>{{ t('dataMarket.userName') }}:{{ source.userName }}</div>
                    <div class="line"></div>
                    <div>{{ t('dataMarket.numberOfView') }}:{{ source.views }}</div>
                    <div class="line"></div>
                    <div>{{ t('dataMarket.updateTime') }}:{{ source.updateTime ? formatTime(source.updateTime) : '-' }}</div>
                </div>
            </div>
            <div v-if="showDictionary" class="tabs">
                <div class="point" @click="activeNum = 0" :class="activeNum == 0 ? 'activeTab' : 'tab'">数据预览</div>
                <div class="point" @click="activeNum = 1" :class="activeNum == 1 ? 'activeTab' : 'tab'">数据字典</div>
            </div>
            <div class="table">
                <Table v-bind="$attrs" :tableColumns="tableColumns" :tableData="tableData"
                    :missingFields="missingFields" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { formatTime } from '@/utils/utils'
import { getimgType } from '@/utils/utils'
import { getColumns, getPreview, applySource } from '@/apis/dataMarket'
import { useI18n } from 'vue-i18n';
import Table from '@/components/table/index'
import { defineProps, toRefs, defineEmits, ref, onMounted, watch } from 'vue'
import IconButton from '@/components/buttons/iconButton.vue';
import { message } from 'ant-design-vue';
import { useOperateAuth } from '../../hook'

const prop = defineProps([
    'isShow',
    'id',
    'source',
    'showDict'
])
const { isShow, id,source } = toRefs(prop)
const emit = defineEmits(['update:isShow', 'refreshList', 'replyFn'])
const { t } = useI18n()
const change = (val) => {
    emit('update:isShow', val)
    emit('refreshList', 'reset')
}
const activeNum = ref('')
const tableColumns = ref([])
const tableData = ref([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
const getCol = ref([])
const getDate = ref([])
const missingFields = ref(false)
const hasAuth = useOperateAuth()

const showDictionary = computed(() => {
    return (prop.showDict === null || prop.showDict) ? true : prop.showDict
})

watch(() => isShow.value, async (val) => {
    if (val) {
        const res = await getPreview(id.value)
        if (res.code === 1) {
            getDate.value = res.data.records
        } else {
            missingFields.value = true
        }
        const res1 = await getColumns(id.value)
        if (res1.code === 1) {
            getCol.value = res1.data.map((item, index) => {
                return {
                    dataIndex: index,
                    imgType: getimgType(item.columnType),
                    ...item
                }
            }
            )
        } else {
            missingFields.value = true
        }
        activeNum.value = 0
    } else {
        activeNum.value = ''
    }

})

watch(() => activeNum.value, async (val) => {
    if (val == 0) {        
        tableColumns.value = getCol.value
        let arr = []
        for(let i = 0; i < getDate.value.length; i++) {
            let obj = []
            tableColumns.value.forEach((item) => {
                let key = item.columnName || item.columnAlias
                let index = item.dataIndex
                let o = getDate.value[i][key]
                obj[index] = o
            })
            arr.push(obj)
        }
        tableData.value = arr
    } else if (val == 1) {
        tableColumns.value = [{
            dataIndex: '0',
            imgType: 'noImg',
            columnAlias: t('dataMarket.index'),
        }, {
            dataIndex: '1',
            imgType: 'noImg',
            columnAlias: t('dataMarket.columnName'),
        }, {
            dataIndex: '2',
            imgType: 'noImg',
            columnAlias: t('dataMarket.columnAlias'),
        }, {
            dataIndex: '3',
            imgType: 'noImg',
            columnAlias: t('dataMarket.columnDesc'),
        }, {
            dataIndex: '4',
            imgType: 'noImg',
            columnAlias: t('dataMarket.columnType'),
        }, {
            dataIndex: '5',
            imgType: 'noImg',
            columnAlias: t('dataMarket.columnLength'),
        }, {
            dataIndex: '6',
            imgType: 'noImg',
            columnAlias: t('dataMarket.columnPrecision'),
        }, {
            dataIndex: '7',
            imgType: 'noImg',
            columnAlias: t('dataMarket.isPrimaryKey'),
        }]
        tableData.value = getCol.value.map((item, index) => {
            if (item.isDisplay) {
                return [index + 1, item.columnName, item.columnAlias, item.columnDesc, item.columnType, item.columnLength, item.columnPrecision, item.isPrimaryKey]
            }
        })
    }
},
    {
        immediate: true
    })


// 跳转表单申请页面
const applyHandle = () => {
    emit('replyFn', source.value)
}
</script>

<style lang="less" scoped>
.point {
    cursor: pointer;
}
.bi-button{
    display: flex;
    align-items: center;
    gap: 4px;
    color: #2b67ff;
    font-size: 14px;
    border: 1px solid #2b67ff;
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
    font-weight: normal;
    margin-left: auto;
    :deep(svg){
        width: 14px;
        height: 14px;
    }
}

.background {
    position: absolute;
    width: 100%;
    height: 100%;;
    background-color: #fff;

    .back {
        height: 36px;
        padding: 8px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.07);

        .backbox {
            width: 60px;
            height: 20px;
            display: flex;
            align-items: center;
            font-weight: 400;
            font-size: 14px;
            color: #3D82F2;
            cursor: pointer;

            span {
                display: flex;
                align-items: center;
            }

            img {
                width: 16px;
                margin-right: 4px;
            }
        }
    }

    .content {
        width: 100%;
        height: 100%;
        padding: 16px;
        display: flex;
        flex-direction: column;

        .title {
            width: 100%;
            height: 25px;
            font-family: PingFang SC;
            font-size: 24px;
            font-weight: bolder;
            display: flex;
            align-items: center;

            .titleText {
                font-size: 18px;
                color: #000000CC;
            }

            .iconText {
                margin-left: 10px;
                height: 20px;
                border-radius: 2px;
                background: #FFECD6;
                color: #FF8900;
                padding: 3px 4px;
                font-size: 11px;
                line-height: 16px;
            }
        }

        .tips {
            width: 100%;
            height: 38px;
            margin-top: 4px;
            font-family: PingFang SC;
            font-size: 12px;
            font-weight: bold;
            text-align: left;
            color: #00000066;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .item {
                height: 17px;
            }

            .otherTips {
                display: flex;

                .line {
                    width: 1px;
                    height: 12px;
                    background-color: #E9E9E9;
                    margin: 0 12px;
                }
            }

        }

        .tabs {
            width: fit-content;
            margin-top: 16px;
            background: #F3F3F3;
            height: 36px;
            border-radius: 8px;
            display: flex;
            padding: 3px;
            font-family: PingFang SC;
            font-size: 14px;
            font-weight: bold;
            text-align: left;

            .tab {
                height: 30px;
                padding: 5px 16px;
                line-height: 20px;
                color: #00000066;
            }

            .activeTab {
                height: 30px;
                padding: 5px 16px;
                line-height: 20px;
                border-radius: 6px;
                background-color: #fff;
                color: #000000CC;
                font-weight: bolder;
            }
        }

        .table {
            margin-top: 16px;
            max-height: calc(100% - 180px);
            overflow-y: auto;
        }
    }
}
</style>