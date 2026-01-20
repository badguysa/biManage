<template>
    <div class="ruleContainer">
        <table class="ruleTable">
            <thead>
                <tr>
                    <th>{{ t('dataStandard.fieldAlias') }}</th>
                    <th>{{ t('dataStandard.pyhFieldName') }}</th>
                    <th>{{ t('dataStandard.fieldType') }}</th>
                    <th>{{ t('dataStandard.fieldLength') }}</th>
                    <th>{{ t('dataStandard.allowEmpty') }}</th>
                    <th>{{ t('dataStandard.remark') }}</th>
                    <th>{{ t('dataStandard.verifyRule') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr class="list-item" v-for="(item,i) in dataList" :key="i">
                    <td class="input-td">
                        <input  class="ipt" ref="iptRef1" type="text" maxlength="50" disabled
                        v-model="item.name" placeholder="请输入" />
                    </td>
                    <td :class="{'input-td': true }">
                        <input  class="ipt" type="text" ref="iptRef2"  maxlength="255" disabled
                        v-model="item.fieldName" placeholder="请输入" />
                    </td>
                    <td class="select-td">
                        <a-select 
                            style="width: 100%"
                            v-model:value="item.dataType"
                            :showArrow="false"
                            disabled
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
                        <input class="ipt" type="text" maxlength="255" ref="iptRef3"  disabled
                        v-model="item.dataLength" placeholder="请输入" />
                    </td>
                    <td class="check-td" align="center">
                        <a-checkbox v-model:checked="item.required" disabled></a-checkbox>
                    </td>
                    <td class="input-td">
                        <input class="ipt" type="text" disabled
                        v-model="item.description" />
                    </td>
                    <td class="verify-td">
                        <!-- 含有校验规则 -->
                        <div class="verifyRuleText">
                            <div class="ruleTextContent">
                                <span v-for="rule in getRuleTextLoop(t, item)">
                                    <span class="rule-text">{{ rule.text }}</span>
                                    <span class="logic-opereate" v-if="rule.showLogic && !rule.isLast">{{ rule.logic }}</span>
                                    <span class="more-info" v-if="rule.hasMore && rule.isLast">...</span>
                                </span>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import { getRuleTextLoop } from '@/hooks/dataStandard/useGetRuleText.js'
import { fieldTypeList } from '@/constants/dataStandard.js'

const { t } = useI18n()
const props = defineProps({
    dataList:{
        type: Array,
    }
})


</script>
<style lang="less" scoped>
.ruleContainer {
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
            }
        }
        .list-item {
            height: 36px;
            td {
                height: 36px;
                padding: 4px 8px;
                border: 1px solid #E0EBFF;
            }
            .select-td {
                width: 150px;
                :deep(.ant-select .ant-select-selector){
                    width: 100%;
                    // border: 1px solid #E9E9E9;
                    border-radius: 4px;
                    color: rgba(0, 0, 0, 0.8);
                    cursor: default;
                    background-color: #fff !important;
                }
            }
            .oper-td {
                span {
                    color: #3d82f2;
                    cursor: pointer;
                    margin-right: 16px;
                }
            }
            .input-td{
                .ipt{
                    width: 100%;
                    // border: 1px solid #E9E9E9;
                    border-radius: 4px;
                    background-color: #fff;
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
                            color: #3d82f2;
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
                min-width: 65px;
            }
        }
    }
}
</style>