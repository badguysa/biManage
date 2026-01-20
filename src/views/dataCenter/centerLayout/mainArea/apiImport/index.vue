<template>
    <div class="api-import">
        <back @backFn="goBack" />
        <div class="api-header">
            <span class="api-title">{{ t('common.apiImport') }}</span>
            <div class="mainWrap">
                <div class="stepWrap">
                    <div class="progress-line">
                        <div v-for="(step, i) in stepInfo" :class="{ 'pro-box': true, active: activeKey === i }"
                            @click="stepClick(i)">
                            <div :class="[activeKey !== i ? 'cricle gray-bgc' : 'cricle blue-bgc']">{{ i + 1 }}</div>
                            <span :class="[activeKey !== i ? 'blue-text' : 'gray-text']">{{ step.label }}</span>
                        </div>
                    </div>
                    <div class="btn-group">
                        <myButton v-if="activeKey !== 0" class="fr" @click="onTest">{{ t('api.lastStep') }}</myButton>
                        <myButton class="fr mr25" @click="debounceOnOK" type="primary">{{ activeKey !== (stepInfo.length - 1) ? t('api.nextStep') :
            t('common.confirm') }}</myButton>
                    </div>
                </div>
            </div>
        </div>
        <div class="operateWrap">
            <!-- 基础配置 -->
            <div v-show="activeKey === 0" class="first-step">
                <!-- 建立API连接 -->
                <div class="basic-connect">
                    <a-form ref="formRef" :model="formState"
                        :label-col="{ style: { width: locale === 'lo' ? '110px' : '95px' } }" labelAlign="left">
                        <p class="p-text">{{ t('api.basicAuth') }}</p>
                        <a-form-item name="apiSourceName" :label="t('dataSource.sourceName')"
                            :rules="[{ required: true, message: t('common.pleaseEnter') }]">
                            <selectDataSource ref="dataSourceRef" style="width: 400px;"
                                v-model="formState.apiSourceName" dataSourceType="API" placeholder="请输入"
                                :disabled="comType=='input'"
                                @select="selectFn" />
                        </a-form-item>
                        <a-form-item v-if="sysDataSourceType == 0" name="connName" :label="t('api.tableName')"
                            :rules="[{ required: true, message: t('common.pleaseEnter') }]">
                            <input ref="connNameRef" style="width: 400px;" :placeholder="t('common.pleaseEnter')"
                                type="text" v-model.trim="formState.connName">
                        </a-form-item>
                        <a-form-item name="apiAddress" :label="t('api.apiAddress')"
                            :rules="[{ required: true, message: t('common.pleaseEnter') }]">
                            <input ref="addressRef" style="width: 400px;" :placeholder="t('common.pleaseEnter')"
                                type="text" v-model.trim="formState.apiAddress">
                        </a-form-item>
                        <a-form-item name="contentType" :label="t('api.contentType')">
                            <a-select :notFoundContent="t('common.noData')" v-model:value="formState.contentType">
                                <a-select-option v-for="item in typeOptions" :key="item.value" :value="item.value">
                                    {{ item.label }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item name="apiType" :label="t('api.type')">
                            <a-radio-group v-model:value="formState.apiType">
                                <a-radio value="get">GET</a-radio>
                                <a-radio value="post">POST</a-radio>
                            </a-radio-group>
                        </a-form-item>
                    </a-form>
                    <p class="p-text">{{ t('api.paramsSet') }}</p>
                    <div class="basic-tabs-pane">
                        <a-tabs v-model:activePane="activePane">
                            <a-tab-pane key="1">
                                <template #tab>
                                    <span>{{ `${t('api.basicParams')}` }}</span>
                                    <span class="tab-num" v-if="showBasciParamList.length">{{ showBasciParamList.length
            <= 99 ? `${showBasciParamList.length}` : '99' }}</span>
                                </template>
                                <table class="basic-table">
                                    <tr>
                                        <td style="width: 50px;">
                                            <img @click="selectAll(1, 'basicParams')" class="check-img"
                                                v-if="selectedNum[0] === 0" src="@/assets/icons/not_select.png" alt="">
                                            <img @click="selectAll(2, 'basicParams')" class="check-img"
                                                v-else-if="selectedNum[0] === basciParamList.length"
                                                src="@/assets/icons/is_select.png" alt="">
                                            <img @click="selectAll(3, 'basicParams')" class="check-img" v-else
                                                src="@/assets/icons/doing_select.png" alt="">
                                        </td>
                                        <td style="width: 150px;">{{ t('api.paramsName') }}</td>
                                        <td style="width: 150px;">{{ t('api.paramsValue') }}</td>
                                        <td style="width: 150px;">{{ t('common.operation') }}</td>
                                    </tr>
                                    <tr v-for="item in showBasciParamList" :key="item.uuid">
                                        <td style="width: 50px;">
                                            <img class="check-img" @click="item.isSelect = !item.isSelect"
                                                v-if="item.isSelect" src="@/assets/icons/is_select.png" alt="">
                                            <img class="check-img" @click="item.isSelect = !item.isSelect" v-else
                                                src="@/assets/icons/not_select.png" alt="">
                                        </td>
                                        <td style="width: 150px;">
                                            <a-tooltip>
                                                <template #title>
                                                    {{ item.name }}
                                                </template>
                                                <div style="width: 150px;">
                                                    {{ item.name }}
                                                </div>
                                            </a-tooltip>
                                        </td>
                                        <td style="width: 150px;">
                                            <a-tooltip>
                                                <template #title>
                                                    {{ item.value }}
                                                </template>
                                                <div style="width: 150px;">
                                                    {{ item.value }}
                                                </div>
                                            </a-tooltip>
                                        </td>
                                        <td style="width: 150px;">
                                            <span @click="changeParams('basicParamEdit', item)">{{ t('common.edit')
                                                }}</span>
                                            <span @click="handleDel('basicParamDel', item)">{{ t('common.delete')
                                                }}</span>
                                        </td>
                                    </tr>
                                </table>
                                <myButton class="add-btn" @click="changeParams('basicParamAdd')">
                                    <img src="@/assets/icons/plus.png" style="width: 16px;" alt="添加" />{{
            t('api.addParams') }}
                                </myButton>
                            </a-tab-pane>
                            <a-tab-pane key="2" tab="授权参数">
                                <a-form class="auth-form" :model="formState">
                                    <a-form-item name="authType" label="Auth Type">
                                        <a-select :notFoundContent="t('common.noData')" v-model:value="formState.authType">
                                            <a-select-option v-for="item in authOptions" :key="item.value" :value="item.value">
                                                {{ item.label }}
                                            </a-select-option>
                                        </a-select>
                                    </a-form-item> 
                                    <template v-if="formState.authType === 'basic auth'">
                                        <a-form-item name="username" label="账号">
                                            <input :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="formState.username">
                                        </a-form-item>
                                        <a-form-item name="pasword" label="密码">
                                            <input :placeholder="t('common.pleaseEnter')"  type="text" v-model.trim="formState.password">
                                        </a-form-item>
                                    </template>
                                    <a-form-item v-else-if="formState.authType === 'bearer token'" name="bearUuid" label="选择参数">
                                        <a-select :notFoundContent="t('common.noData')" v-model:value="formState.bearUuid">
                                            <a-select-option v-for="item in authParamList" :key="item.value" :value="item.value">
                                                {{ item.label }}
                                            </a-select-option>
                                        </a-select>
                                    </a-form-item> 
                                </a-form>
                            </a-tab-pane>
                            <a-tab-pane key="3" force-render>
                                <template #tab>
                                    <span>{{ `${t('api.headParams')}` }}</span>
                                    <span class="tab-num" v-if="showHeadParamList.length">{{ showHeadParamList.length <=
            99 ? `${showHeadParamList.length}` : '99' }}</span>
                                </template>
                                <table class="basic-table">
                                    <tr>
                                        <td style="width: 50px;">
                                            <img @click="selectAll(1, 'headParams')" class="check-img"
                                                v-if="selectedNum[1] === 0" src="@/assets/icons/not_select.png" alt="">
                                            <img @click="selectAll(2, 'headParams')" class="check-img"
                                                v-else-if="selectedNum[1] === headParamList.length"
                                                src="@/assets/icons/is_select.png" alt="">
                                            <img @click="selectAll(3, 'headParams')" class="check-img" v-else
                                                src="@/assets/icons/doing_select.png" alt="">
                                        </td>
                                        <td style="width: 150px;">{{ t('api.paramsName') }}</td>
                                        <td style="width: 150px;">{{ t('api.paramsValue') }}</td>
                                        <td style="width: 150px;">{{ t('common.operation') }}</td>
                                    </tr>
                                    <tr v-for="item in showHeadParamList" :key="item.uuid">
                                        <td style="width: 50px;">
                                            <img class="check-img" @click="item.isSelect = !item.isSelect"
                                                v-if="item.isSelect" src="@/assets/icons/is_select.png" alt="">
                                            <img class="check-img" @click="item.isSelect = !item.isSelect" v-else
                                                src="@/assets/icons/not_select.png" alt="">
                                        </td>
                                        <td style="width: 150px;">
                                            <a-tooltip>
                                                <template #title>
                                                    {{ item.name }}
                                                </template>
                                                <div style="width: 150px;">
                                                    {{ item.name }}
                                                </div>
                                            </a-tooltip>
                                        </td>
                                        <td style="width: 150px;">
                                            <a-tooltip>
                                                <template #title>
                                                    {{ item.value }}
                                                </template>
                                                <div style="width: 150px;">
                                                    {{ item.value }}
                                                </div>
                                            </a-tooltip>
                                        </td>
                                        <td style="width: 150px;">
                                            <span @click="changeParams('headParamEdit', item)">{{ t('common.edit')
                                                }}</span>
                                            <span @click="handleDel('headParamDel', item)">{{ t('common.delete')
                                                }}</span>
                                        </td>
                                    </tr>
                                </table>
                                <myButton class="add-btn" @click="changeParams('headParamAdd')">
                                    <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />{{
            t('api.addParams') }}
                                </myButton>
                            </a-tab-pane>
                            <a-tab-pane key="4" force-render>
                                <template #tab>
                                    <span>{{ `${t('api.bodyParams')}` }}</span>
                                    <span class="tab-num" v-if="showBodyParamList.length">{{ showBodyParamList.length <=
            99 ? `${showBodyParamList.length}` : '99' }}</span>
                                </template>
                                <table class="basic-table">
                                    <tr>
                                        <td style="width: 50px;">
                                            <img @click="selectAll(1, 'bodyParams')" class="check-img"
                                                v-if="selectedNum[2] === 0" src="@/assets/icons/not_select.png" alt="">
                                            <img @click="selectAll(2, 'bodyParams')" class="check-img"
                                                v-else-if="selectedNum[2] === bodyParamList.length"
                                                src="@/assets/icons/is_select.png" alt="">
                                            <img @click="selectAll(3, 'bodyParams')" class="check-img" v-else
                                                src="@/assets/icons/doing_select.png" alt="">
                                        </td>
                                        <td style="width: 110px">{{ t('api.paramsName') }}</td>
                                        <td style="width: 110px">{{ t('api.paramsValue') }}</td>
                                        <td style="width: 110px">{{ t('api.paramType') }}</td>
                                        <td style="width: 120px">{{ t('common.operation') }}</td>
                                    </tr>
                                    <tr v-for="item in showBodyParamList" :key="item.uuid">
                                        <td style="width: 50px;">
                                            <img class="check-img" @click="item.isSelect = !item.isSelect"
                                                v-if="item.isSelect" src="@/assets/icons/is_select.png" alt="">
                                            <img class="check-img" @click="item.isSelect = !item.isSelect" v-else
                                                src="@/assets/icons/not_select.png" alt="">
                                        </td>
                                        <td>
                                            <a-tooltip>
                                                <template #title>
                                                    {{ item.name }}
                                                </template>
                                                <div >
                                                    {{ item.name }}
                                                </div>
                                            </a-tooltip>
                                        </td>
                                        <td>
                                            <a-tooltip>
                                                <template #title>
                                                    {{ item.value }}
                                                </template>
                                                <div >
                                                    {{ item.value }}
                                                </div>
                                            </a-tooltip>
                                        </td>
                                        <td >
                                            <a-select v-model:value="item.dataType">
                                                <a-select-option v-for="item in codeTypeOption" :key="item.value"
                                                    :value="item.value">
                                                    {{ item.label }}
                                                </a-select-option>
                                            </a-select>
                                        </td>
                                        <td >
                                            <span @click="changeParams('bodyParamEdit', item)">{{ t('common.edit')
                                                }}</span>
                                            <span @click="handleDel('bodyParamDel', item)">{{ t('common.delete')
                                                }}</span>
                                        </td>
                                    </tr>
                                </table>
                                <myButton class="add-btn" @click="changeParams('bodyParamAdd')">
                                    <img src="@/assets/icons/plus.png" style="width: 16px;" alt="添加" />{{
            t('api.addParams') }}
                                </myButton>
                            </a-tab-pane>
                            <!-- 分页参数 -->
                            <a-tab-pane key="5" :tab="`${t('api.pageParams')}`" force-render>
                                <a-form ref="pageFormRef" :model="pageFormState"
                                    :label-col="{ style: { width: locale === 'lo' ? '172px' : '130px' } }"
                                    labelAlign="left">
                                    <a-form-item name="pageType" :label="t('api.pageType')">
                                        <a-select class="page-select" v-model:value="pageFormState.pageType" :options="pageTypeOptions"/>
                                    </a-form-item>
                                    <!-- 普通分页  -->
                                    <template v-if="pageFormState.pageType === 0">
                                        <a-form-item name="pageNumberName" :label="t('api.pageName')"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.pageNumberName" :disabled="fieldIsEnc">
                                        </a-form-item>
                                        <a-form-item name="pageNumberBegin" :label="t('api.pageNum')"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.pageNumberBegin">
                                        </a-form-item>
                                        <a-form-item name="pageSizeName" :label="t('api.pageSizeName')"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                :disabled="secondFieldEnc" v-model.trim="pageFormState.pageSizeName">
                                        </a-form-item>
                                        <div class="pageSize">
                                            <div class="pageSizeFlex"
                                                :style="{ width: locale === 'lo' ? '172px' : '130px' }">
                                                <span>{{ `${t('api.pageSize')}` }}</span>
                                                <tips tipsContent="最大支持单页获取1000条数据，请填写小于1000值" />:
                                            </div>
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.pageSize" style="width: 370px">
                                        </div>
                                    </template>
                                    <!-- 偏移分页 -->
                                    <template v-if="pageFormState.pageType === 1">
                                        <a-form-item name="fieldName" :label="t('api.fieldName')"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.fieldName" :disabled="fieldIsEnc">
                                        </a-form-item>
                                        <a-form-item name="paramName" :label="t('api.paramName')"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }"
                                            :rules="[{ required: isRequire1, message: t('common.pleaseEnter') }]">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.paramName">
                                        </a-form-item>
                                        <a-form-item name="lastValue"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }">
                                            <template #label>
                                                <div class="pageSize">
                                                    <div class="pageSizeFlex" :style="{ width: locale === 'lo' ? '172px' : '130px' }">
                                                        {{ t('api.lastValue') }}
                                                        <tips :tipsContent="t('api.lastTip')" />:
                                                    </div>
                                                </div>
                                            </template>
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.lastValue">
                                        </a-form-item>
                                        <a-form-item name="secondFieldName" :label="t('api.secondFieldName')"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.secondFieldName" :disabled="secondFieldEnc">
                                        </a-form-item>
                                        <a-form-item name="secondParamName" :label="t('api.secondOffsetParams')"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }"
                                            :rules="[{ required: isRequire2, message: t('common.pleaseEnter') }]">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.secondParamName">
                                        </a-form-item>
                                        <a-form-item name="lastAuxValue"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }">
                                            <template #label>
                                                <a-tooltip>
                                                    <template #title>{{ t('api.lastTip') }}</template>
                                                    {{ t('api.secondLastValue') }}<img
                                                        style="width: 12px; margin-left: 4px;"
                                                        src="@/assets/icons/tips-small-icon.png" />
                                                </a-tooltip>
                                            </template>
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.lastAuxValue">
                                        </a-form-item>
                                    </template>
                                    <!-- 循环分页 -->
                                    <template v-if="pageFormState.pageType === 2">
                                        <a-form-item :label="t('api.loopFieldName')"
                                            :class="{ 'width172': locale === 'lo', 'width130': locale === 'zh-CN' }">
                                            <div class="loopFieldName">
                                                <a-form-item name="leftName">
                                                    <input :placeholder="t('common.pleaseEnter')" type="text"
                                                        style="width: 170px;" v-model.trim="pageFormState.leftName">
                                                </a-form-item>
                                                <div class="driver"></div>
                                                <a-form-item name="rightName">
                                                    <input :placeholder="t('common.pleaseEnter')" type="text"
                                                        style="width: 170px;" v-model.trim="pageFormState.rightName">
                                                </a-form-item>
                                            </div>
                                        </a-form-item>
                                        <a-form-item name="dataFmtType" :label="t('api.dataFmtType')">
                                            <div @mousedown.stop="openSelect" @click.stop="" id="my_custom_selcet"
                                                style="position: relative;width: 370px;">
                                                <a-select v-model:value="pageFormState.dataFmtType"
                                                    :placeholder="t('common.pleaseSelect')" :open="selectOpen"
                                                    @select="handleSelect"
                                                    :getPopupContainer="triggerNode => triggerNode.parentNode"
                                                    :options="dataFmtTypeOption" style="width: 100%;">
                                                    <template #dropdownRender="{ menuNode: menu }">
                                                        <VNodes :vnodes="menu" />
                                                        <div class="my_select_overlap"
                                                            style="padding: 4px 8px; cursor: pointer"
                                                            @mousedown="e => e.preventDefault()">
                                                            <input :placeholder="t('api.custom')" type="text"
                                                                v-model.trim="pageFormState.dataFmtCustom"
                                                                style="width:100%" @click="e => e.target.focus()" />
                                                        </div>
                                                    </template>
                                                </a-select>
                                            </div>
                                        </a-form-item>
                                        <a-form-item name="beginValue" :label="t('api.loopBeginValue')">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.beginValue" style="width: 370px">
                                        </a-form-item>
                                        <a-form-item name="endValue" :label="t('api.loopEndValue')">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.endValue" style="width: 370px">
                                        </a-form-item>
                                        <a-form-item name="stepSize" :label="t('api.loopStepSize')">
                                            <div class="loopFieldName">
                                                <a-input-number v-model:value="pageFormState.stepSize" :min="1" :max="999"
                                                    style="width: 80px; height:32px" />
                                                <a-form-item-rest>
                                                    <a-select v-model:value="pageFormState.stepUnit"
                                                        style="width: 100px; margin-left: 12px; ">
                                                        <a-select-option v-for="item in loopPageTimeOption"
                                                            :key="item.value" :value="item.value">
                                                            {{ t(item.label) }}
                                                        </a-select-option>
                                                    </a-select>
                                                </a-form-item-rest>
                                            </div>
                                        </a-form-item>
                                    </template>
                                    <!-- OData协议分页 -->
                                    <template v-if="pageFormState.pageType === 3">
                                        <a-form-item name="pageNumberName" :label="t('api.pageName')"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.skipName" :disabled="fieldIsEnc">
                                        </a-form-item>
                                        <a-form-item name="pageNumberBegin" :label="t('api.pageNum')"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.beginSkip">
                                        </a-form-item>
                                        <a-form-item name="pageSizeName" :label="t('api.pageSizeName')"
                                            :class="{ 'lo-form-items': locale === 'lo', 'zh-form-items': locale === 'zh-CN' }">
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                :disabled="secondFieldEnc" v-model.trim="pageFormState.topName">
                                        </a-form-item>
                                        <div class="pageSize">
                                            <div class="pageSizeFlex"
                                                :style="{ width: locale === 'lo' ? '172px' : '130px' }">
                                                <span>{{ `${t('api.pageSize')}` }}</span>
                                            </div>
                                            <input :placeholder="t('common.pleaseEnter')" type="text"
                                                v-model.trim="pageFormState.top" style="width: 370px">
                                        </div>
                                    </template>
                                </a-form>
                            </a-tab-pane>
                        </a-tabs>
                    </div>
                </div>
            </div>
            <!-- 选择数据，为保留自助配置状态，使用vshow控制 -->
            <div v-show="activeKey === 1" class="second-step">
                <parseResult :tableName="formState.connName" />
            </div>
            <!-- 设置推送方式 -->
            <div v-if="activeKey === 2" class="third-step">
                <div class="center-container">
                    <div class="updatePolicyWrap">
                        <span class="title">更新策略</span>
                        <a-radio-group v-model:value="dataSetFormState.updatePolicy" @change="updatePolicyChange">
                            <a-radio :style="radioStyle" value="NONE">{{ t('common.noUpdate') }}</a-radio>
                            <a-radio :style="radioStyle" value="FULL_UPDATE">{{ t('common.fullUpdate') }}</a-radio>
                            <a-radio :style="radioStyle" value="API_UPDATE_PUSH">
                                <div class="policyRadio">
                                    <span>{{ t('common.apiIncrPush') }}</span>
                                    <span class="info-text" >
                                        <a-tooltip>
                                            <template #title>
                                                中台提供接口，接受业务系统推送给中台的增量数据，数据格式由中台提供标准文档
                                            </template>
                                            <img src="@/assets/icons/info-t.png" alt="">
                                        </a-tooltip>
                                        <span @click.prevent="incrDesc(1)">{{ t('common.apiDesc') }}</span>
                                    </span>
                                </div>
                            </a-radio>
                            <a-radio :style="radioStyle" value="API_UPDATE_PULL">
                                <div class="policyRadio">
                                    <span>{{ t('common.apiIncrPull') }}</span>
                                    <span class="info-text">
                                        <a-tooltip>
                                            <template #title>
                                                中台根据设定的增量更新频率，从业务系统的接口拉取增量数据，数据格式由中台提供标准文档
                                            </template>
                                            <img src="@/assets/icons/info-t.png" alt="">
                                        </a-tooltip>
                                        <span @click.prevent="incrDesc(2)">{{ t('common.apiDesc') }}</span>
                                    </span>
                                </div>
                            </a-radio>
                            <a-radio v-if="pageFormState.pageType === 2" :style="radioStyle" value="API_INCR_APPEND">{{ t('common.appendUpdate') }}</a-radio>
                        </a-radio-group>
                    </div>
                    <!-- 更新频率 -->
                    <regularUpdateInput ref="regularUpdateRef" :updatePolicy="dataSetFormState.updatePolicy" setType="apiRegularUpdate" />
                    <!-- API地址 -->
                    <template v-if="dataSetFormState.updatePolicy === 'API_UPDATE_PULL'">
                        <div class='row'>
                            <div class='col1'>{{ t('api.apiAddress') }}</div>
                            <div class="col2">
                                <input type="text" :placeholder="t('common.pleaseEnter')" v-model="dataSetFormState.url" style="width: 205px" />
                                &nbsp;&nbsp;&nbsp;
                            </div>
                        </div>  
                    </template>
                    <!-- 设置调用评率 -->
                    <div class='frequency-wrap' v-if="showFrequency">
                        <div class="rate-wrap">
                            <span>{{ t('api.callFrequency') }}</span>
                            <tips :tipsContent=" t('api.frequencyTips')" />
                        </div>
                        <div class="rate-container">
                            <a-select v-model:value="rateInfo.frequency" style="width: 205px;" @select="selectRate">
                                <a-select-option v-for="item in frequencyList" :key="item.value" :value="item.value">
                                    {{ item.label }}
                                </a-select-option>
                            </a-select>
                            <div class="rate-input" v-if="rateInfo.frequency == 2">
                                <span>每</span>
                                <a-input-number :controls="false" :min="1" style="width: 50px;" v-model:value="rateInfo.time"/>
                                <span>秒，执行</span>
                                <a-input-number :controls="false" :min="1" style="width: 50px;" v-model:value="rateInfo.num"/>
                                <span>次</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <decryptModal v-if="decryptModalVisible" @modalCancel="modalCancel" @modalConfirm="modalConfirm"></decryptModal>
    </div>
</template>

<script setup>
import { reactive, ref, computed, onUnmounted, toRaw, nextTick, onMounted } from 'vue';
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { apiManageStore } from '@/Stores/apiManageStore'
import parseResult from './secondStep.vue'
import decryptModal from './decryptModal.vue'
import { storeToRefs } from 'pinia'
import * as monaco from 'monaco-editor'
import { apiConnectTest, apiAnalysisResult, apiImportToBi } from '@/apis/apiImport';
import { getSourceInfo, editAPISource, sourceNameIsDuplicate, addAPISource } from '@/apis/dataSourceManage'
import { parseData, isJSON } from '@/utils/apiParse'
import myButton from '@/components/buttons/myButton'
import { message } from 'ant-design-vue';
import { v4 as uuidv4 } from 'uuid'
import { useI18n } from 'vue-i18n'
import { isUrl, getIconSrc } from '@/utils/utils';
import { cloneDeep, throttle, debounce } from 'lodash'
import createDialog from '@/utils/dialog'
import { useEchoApiParams } from '@/hooks/dataSource/useEchoApiParams'
import selectDataSource from '@/views/dataCenter/centerLayout/components/selectDataSource'
import tips from '@/components/tips'
import { createTableData } from '@/utils/apiParse'
import regularUpdateInput from '@/components/regularUpdateInput'
import back from '@/components/back'

const { t, locale } = useI18n()
const useModalStore = modalStore()
const useMainStore = mainStore()
const useApiManageStore = apiManageStore()
const { decryptModalVisible } = storeToRefs(useModalStore)
const { basciParamList, bodyParamList, headParamList, settingKeys, activeTabKey,
    indexTableDesc, addDataMode, fieldIsEnc, secondFieldEnc, checkedKeys,
    isCrossLevel, multiDataList, apiTableAddList, decrypts, isEmptyImport, systemConfig } = storeToRefs(useMainStore)

const hideModal = ref(false)
const modalRef = ref(null)
const connNameRef = ref(null)
const addressRef = ref(null)
const regularUpdateRef = ref(null)

const comType = ref('select')

const emits = defineEmits(['goBack'])

const sourceInfo = inject('dataSourceInfo', ref('default'))

const pageTypeOptions = [
    {value: 0, label: t('api.normalPage')},
    {value: 1, label: t('api.offsetPage')},
    {value: 2, label: t('api.loopPage')},
    {value: 3, label: t('api.oDataPage')},
]

const VNodes = (_, { attrs }) => {
    return attrs.vnodes;
};

const radioStyle = reactive({
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
});

const _dataFmtTypeOption = [{
    value: 'yyyyMMdd',
    label: 'yyyyMMdd'
}, {
    value: 'yyyy-MM-dd',
    label: 'yyyy-MM-dd'
}, {
    value: 'TS10',
    label: t('common.timeStamp10')
}, {
    value: 'TS13',
    label: t('common.timeStamp13')
}]
const dataFmtTypeOption = ref(cloneDeep(_dataFmtTypeOption))
const stepInfo = ref([
    { label: t('api.buildConnection') },
    { label: t('api.parseResult') },
    { label: t('api.realTimeDS') },
])
const loopPageTimeOption = [{
    value: 'year',
    label: 'common.year'
}, {
    value: 'month',
    label: 'common.month'
}, {
    value: 'day',
    label: 'common.day'
}, {
    value: 'hour',
    label: 'common.hour'
}, {
    value: 'minute',
    label: 'common.minute'
}]
const codeTypeOption = [
    { label: 'String', value: 'String' },
    { label: 'Integer', value: 'Integer' },
    { label: 'Long', value: 'Long' },
    { label: 'Double', value: 'Double' },
    { label: 'Boolean', value: 'Boolean' },
    { label: 'Object', value: 'Object' },
    { label: 'Array', value: 'Array' },
]
const typeOptions =[
    { label: 'JSON', value: 'JSON' },
    { label: 'XML', value: 'XML' },
]
const authOptions = [
    { label: 'No Auth', value: 'no auth' },
    { label: 'Basic Auth', value: 'basic auth' },
    { label: 'Bearer Token', value: 'bearer token' },
]
const sysDataSourceType = ref(0) // 系统管理-数据源管理-API导入类型 0数据中心api导入 、1系统管理-数据源管理-新建数据源-api、2系统管理-数据源管理-点击查看-api
const formRef = ref()
const pageFormRef = ref()
const dataSourceRef = ref()
const selectOpen = ref(false)
const tempDataFmtCustom = ref('') // 临时保存的自定义值
const isCustom = ref(true)
const canPass = ref(false) // 测试连接通过,可以进行下一步
const state = reactive({
    paramsData: {},
    queryBody: ''
})
const formState = reactive({
    apiSourceName: '',
    connName: '',
    apiAddress: '',
    apiType: 'get',
    contentType: 'JSON',
    // 授权类型
    authType: 'no auth',
    // basice auth参数
    username: '',
    password: '',
    // bear token选择字段
    bearUuid: ''

})
const pageFormState = reactive({
    pageType: 0,

    // 普通分页
    pageNumberName: '', //"页码字段名"
    pageNumberBegin: '', //"页码起始值"
    pageSizeName: '', //"页大小字段名"
    pageSize: '', //"页大小值"

    // 偏移分页
    fieldName: '', //"偏移字段名"
    paramName: '', //"偏移参数名
    lastValue: '', //"偏移字段值"
    secondFieldName: '', //"第二偏移字段名"
    secondParamName: '', //"第二偏移参数名"
    lastAuxValue: '', //"第二偏移字段值"

    // 循环分页
    leftName: "",
    rightName: "",
    dataFmtType: undefined,
    beginValue: "",
    endValue: "",
    stepSize: "",
    stepUnit: "day",
    dataFmtCustom: "",

    // OData协议分页
    skipName: '$skip', // 页码字段名, 默认$skip
    beginSkip: '',  // 页码起始值
    topName: '$top', // 页大小字段名, 默认$top
    top: '', // 页大小值
})

// 是否自动回显数据源信息
let isEcho = ref(false)
// 选择的数据源id
let selectSourceId = ref('')
// 数据源信息
let defaultInfoStr = ''

const isRequire1 = computed(() => {
    if (pageFormState.fieldName) return true
    return false
})

const isRequire2 = computed(() => {
    if (pageFormState.secondFieldName) return true
    return false
})

const dataSetFormState = reactive({
    updatePolicy: 'NONE',
    updateRate: 1,
    updateUnit: 1,
    updateType: 1,
    url: '',
    key: ''
})

const rateInfo = reactive({
    frequency: 1,
    time: 1,
    num: 1
})

const frequencyList = [
    {label: '默认按次调用', value: 1},
    {label: '按时间调用', value: 2}
]

const selectedNum = computed(() => {
    return [
        basciParamList.value.filter(i => i.isSelect).length,
        headParamList.value.filter(i => i.isSelect).length,
        bodyParamList.value.filter(i => i.isSelect).length,
    ]
})


// 不携带的动态参数 隐藏展示
const showBasciParamList = computed(() => {
    return basciParamList.value.filter(it =>
        it.type !== 'dynamic' ||
        (it.type === 'dynamic' && it.dynamicValue.carry)
    )
})
const showHeadParamList = computed(() => {
    return headParamList.value.filter(it =>
        it.type !== 'dynamic' ||
        (it.type === 'dynamic' && it.dynamicValue.carry)
    )
})
const showBodyParamList = computed(() => {
    return bodyParamList.value.filter(it =>
        it.type !== 'dynamic' ||
        (it.type === 'dynamic' && it.dynamicValue.carry)
    )
})

// 授权参数列表
const authParamList = computed(() => {
    let paramList = [
        ...basciParamList.value,
        ...headParamList.value,
        ...bodyParamList.value
    ]
    return paramList.map(it => ({
        ...it,
        label: it.name + '=' + it.value,
        value: it.uuid
    }))
})

// 显示调用频率
const showFrequency  = computed(() => {
    return systemConfig.value.limitImport && ['FULL_UPDATE'].includes(dataSetFormState.updatePolicy)
})

const activeKey = ref(0)
const activePane = ref('1')

let clickHandle = null
const openSelect = (e) => {
    e.preventDefault()
    //默认为true
    isCustom.value = true
    // 自定义
    if (tempDataFmtCustom.value) {
        // pageFormState.dataFmtType = ''
        pageFormState.dataFmtCustom = tempDataFmtCustom.value
        dataFmtTypeOption.value = cloneDeep(_dataFmtTypeOption)
    }
    selectOpen.value = true
}
onMounted(() => {
    clickHandle = (e) => {
        if (e.target && 'className' in e.target && selectOpen.value) {
            const className = e.target.className;
            if (className.indexOf('my_select_overlap') === -1) {
                selectOpen.value = false
                let timeID = setTimeout(() => {
                    if (isCustom.value) {
                        // 已有的已存在
                        if (_dataFmtTypeOption.some(i => i.value === pageFormState.dataFmtCustom)) {
                            pageFormState.dataFmtType = pageFormState.dataFmtCustom
                            pageFormState.dataFmtCustom = ''
                            tempDataFmtCustom.value = ''
                            isCustom.value = false
                        } else {
                            if (pageFormState.dataFmtCustom) {
                                dataFmtTypeOption.value.push({ value: pageFormState.dataFmtCustom, label: pageFormState.dataFmtCustom })
                                pageFormState.dataFmtType = pageFormState.dataFmtCustom
                                tempDataFmtCustom.value = pageFormState.dataFmtCustom
                            }
                            pageFormState.dataFmtCustom = ''
                        }
                    }
                    clearTimeout(timeID)
                }, 50)

            }
        } else {
            selectOpen.value = false
        }
    }
    initSysDataSource()
    document.body.addEventListener('click', clickHandle)
})

// 增量更新说明
const incrDesc = (type) => {
    useMainStore.setApiDescType(type)
    useModalStore.changeApiDescModalVisible()
}

const modalCancel = ()=>{
    useModalStore.changeDecryptModalVisible()
}

const modalConfirm = ()=> {
    testLink()
    useMainStore.changeSettingKeys([], 'clear')
    useMainStore.setCheckedKeys([])
    useMainStore.setMultiDataList()
    useModalStore.changeDecryptModalVisible()
}

const handleSelect = (value) => {
    pageFormState.dataFmtCustom = ''
    tempDataFmtCustom.value = ''
    isCustom.value = false
    if (value) {
        selectOpen.value = false
    }
}

// 检测是否由系统管理-数据源管理-API导入进入并初始化
const initSysDataSource = ()=>{
    if(sourceInfo?.value !== 'default'){
        // 注入的sourceInfo不为默认值,则为系统管理-数据源管理-API导入
        comType.value = 'input'
        sysDataSourceType.value = 1
        stepInfo.value = [
            { label: t('api.buildConnection') },
            { label: t('api.parseResult') }
        ]
        // 存在默认apiId,则为系统管理-数据源管理-点击查看-api
        if(sourceInfo?.value?.apiId){
            sysDataSourceType.value = 2
            dataSourceRef.value.select({id:sourceInfo.value.apiId,sourceName:sourceInfo.value.sourceName})
        }
    }
}

const goBack = () => {
    if(sysDataSourceType.value != 0){
        emits('goBack')
    }else{
        useMainStore.setPageId('pageTable')
    }
}
const stepClick = (i) => {
    switch (i) {
        case 0:
            return oneStepClick()
        case 1:
            return secondStepClick()
        case 2:
            return debounceOnOK()
    }
}

const oneStepClick = () => {
    if (activeKey.value === 1) {
        onTest()
    } else if (activeKey.value === 2) {
        activeKey.value--
        onTest()
    }
}

const secondStepClick = () => {
    if (activeKey.value === 0) {
        debounceOnOK()
    } else if (activeKey.value === 2) {
        onTest()
    }
}

// 上一步
const onTest = () => {
    if (activeKey.value !== 0) {
        activeKey.value--
    }
    nextTick(() => {
        if (activeKey.value === 0) {
            checkedKeys.value = []
            isCrossLevel.value = false
            useMainStore.setDecrypts([])
            useMainStore.setDecryptDisabled(true)
            useMainStore.setApiTableDataList([])
            useMainStore.setApiTableAddList([])
        }
    })
}

const hasRepeat = (arr)=> {
    let errorObj = undefined
    const obj = arr.reduce((result, item) => {
        const key = item.flagNum
        if (!result[key]) {
            result[key] = []
        }
        result[key].push(item)
        return result
    }, {})
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const groupArr = obj[key];
            const nameCount = {};
            for (let i = 0; i < groupArr.length; i++) {
                const newOriginalName = groupArr[i].newOriginalName;
                if (nameCount[newOriginalName]) {
                    // 如果 newOriginalName已经存在于nameCount中，表示重复
                    errorObj = {
                        name: 'newOriginalName',
                        key: key,
                        index: i
                    }
                    useMainStore.setErrorObj(errorObj)
                    return true;
                } else {
                    // 否则将 newOriginalName加入nameCount中，并计数为1
                    nameCount[newOriginalName] = 1;
                }
            }
        }
    }
    // 所有数组都没有发现重复
    useMainStore.setErrorObj(errorObj)
    return false;
}

const hasEmpty = (arr)=>{
    let errorObj = undefined
    const obj = arr.reduce((result, item) => {
        const key = item.flagNum
        if (!result[key]) {
            result[key] = []
        }
        result[key].push(item)
        return result
    }, {})
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const groupArr = obj[key];
            for (let i = 0; i < groupArr.length; i++) {
                if (!groupArr[i].newOriginalName) {
                    errorObj = {
                        name: 'newOriginalName',
                        key: key,
                        index: i
                    }
                    useMainStore.setErrorObj(errorObj)
                    message.error('物理字段名不能为空');
                    return true; // 立即停止遍历
                }
                if (!groupArr[i].originName) {
                    errorObj = {
                        name: 'originName',
                        key: key,
                        index: i
                    }
                    useMainStore.setErrorObj(errorObj)
                    message.error('字段名不能为空');
                    return true; // 立即停止遍历
                }
            }
        }
    }
    // 所有数组都没有发现空
    useMainStore.setErrorObj(errorObj)
    return false;
}
const validateSecondStep = ()=>{
    let tableList = []
    if(apiTableAddList.value.length){
        tableList = settingKeys.value.concat(apiTableAddList.value)
        tableList = tableList.filter((item) => item.title !== '' || item.originName !=='')
    } else {
        tableList = settingKeys.value
    }
    // 判断是否存在表的物理字段名重复
    if(hasRepeat(tableList)){
        message.error('物理字段名重复')
        return false
    }
    // 判断物理字段名或字段名为空
    if(hasEmpty(tableList)){
        return false
    }
    return true
}

const onOK = async () => {
    if (activeKey.value === 0) {
        if (!isEcho.value) {
            let namevalidateRes = await validateSourceName()
            if (!namevalidateRes) return
        }
        pageFormRef.value.validateFields().then(res => {
            if (res) {
                testLink()
            }
        }).catch(e => {
            console.log('e', e)
        })
    } else if (activeKey.value === 1) {
        if(sysDataSourceType.value == 0){
            if (settingKeys.value.length) {
                const jsonData = {
                    "groupId": activeTabKey.value,
                    ...state.paramsData,
                    "multiDataList": multiDataList.value,
                    "contentType": formState.contentType,
                    "isComingEmptyImport": isEmptyImport.value,
                }
                if (pageFormState.pageType == 1) {
                    const { fieldName, secondFieldName } = state.paramsData.params.pageSetting.offsetParams
                    if (fieldName || secondFieldName) {
                        const arr1 = [fieldName, secondFieldName]
                        let fieldNum = fieldName && secondFieldName ? 2 : 1
                        let flag = false // 偏移字段是否被勾选
                        let flag1 = false // 偏移字段是否被设置为关联字段
                        let fieldNameFlag = false
                        let fieldNameFlag1 = false
                        let secondFieldNameFlag = false
                        let secondFieldNameFlag1 = false
                        if (fieldNum === 1) {
                            if (multiDataList.value.length > 1) {
                                settingKeys.value.forEach(i => {
                                    if (arr1.includes(i.title)) {
                                        flag = true
                                    }
                                    if (arr1.includes(i.title) && i.isRelation) {
                                        flag1 = true
                                    }
                                })
                            } else {
                                settingKeys.value.forEach(i => {
                                    if (arr1.includes(i.title)) {
                                        flag = true
                                    }
                                })
                            }
                            if (!flag) return message.warn(t('api.selectOffestField'))
                            if (multiDataList.value.length > 1) {
                                if (!flag1) return message.warn(t('api.offestFieldBeRelation'))
                            }
                        }
                        if (fieldNum === 2) {
                            if (multiDataList.value.length > 1) {
                                settingKeys.value.forEach(i => {
                                    if (arr1[0] === i.title) {
                                        fieldNameFlag = true
                                    }
                                    if (arr1[0] === i.title && i.isRelation) {
                                        fieldNameFlag1 = true
                                    }
                                    if (arr1[1] === i.title) {
                                        secondFieldNameFlag = true
                                    }
                                    if (arr1[1] === i.title && i.isRelation) {
                                        secondFieldNameFlag1 = true
                                    }
                                })
                            } else {
                                settingKeys.value.forEach(i => {
                                    if (arr1[0] === i.title) {
                                        fieldNameFlag = true
                                    }
                                    if (arr1[1] === i.title) {
                                        secondFieldNameFlag = true
                                    }
                                })
                            }
                            if (!(fieldNameFlag && secondFieldNameFlag)) return message.warn(t('api.selectOffestField'))
                            if (multiDataList.value.length > 1) {
                                if (!(fieldNameFlag1 && secondFieldNameFlag1)) return message.warn(t('api.offestFieldBeRelation'))
                            }
                        }
                        // 多层级 偏移字段 被必须设置成关联字段 且被关联
                        if (multiDataList.value.length > 1) {
                            let isRelationed = false
                            const binds = multiDataList.value.map(i => i.bind)
                            if (binds.length) {
                                let fields = []
                                binds.forEach(item => {
                                    if (item && item.fields) {
                                        fields = [...fields, ...item.fields]
                                    }
                                })
                                const originNames = fields.map(i => i.originalName)
                                originNames.forEach(item => {
                                    if (arr1.includes(item)) {
                                        isRelationed = true
                                    }
                                })
                            }
                            if (!isRelationed) {
                                return message.warn(t('api.relationFieldTip'))
                            }
                        }
                    }
                }
                if(!validateSecondStep()) return
                apiAnalysisResult(jsonData).then(res => {
                    if (res.code == 1) {
                        activeKey.value = 2
                    } else {
                        message.error(res.message)
                    }
                })
            } else {
                message.warn(t('otherConfig.selectCode'))
            }
        }else{
            const jsonData = {
                apiName: formState.apiSourceName,
                ...state.paramsData,
            }
            if (pageFormState.pageType == 1) {
                const { fieldName, secondFieldName } = state.paramsData.params.pageSetting.offsetParams
                if (fieldName || secondFieldName) {
                    const arr1 = [fieldName, secondFieldName]
                    let fieldNum = fieldName && secondFieldName ? 2 : 1
                    let flag = false // 偏移字段是否被勾选
                    let flag1 = false // 偏移字段是否被设置为关联字段
                    let fieldNameFlag = false
                    let fieldNameFlag1 = false
                    let secondFieldNameFlag = false
                    let secondFieldNameFlag1 = false
                    if (fieldNum === 1) {
                        if (multiDataList.value.length > 1) {
                            settingKeys.value.forEach(i => {
                                if (arr1.includes(i.title)) {
                                    flag = true
                                }
                                if (arr1.includes(i.title) && i.isRelation) {
                                    flag1 = true
                                }
                            })
                        } else {
                            settingKeys.value.forEach(i => {
                                if (arr1.includes(i.title)) {
                                    flag = true
                                }
                            })
                        }
                        if (!flag) return message.warn(t('api.selectOffestField'))
                        if (multiDataList.value.length > 1) {
                            if (!flag1) return message.warn(t('api.offestFieldBeRelation'))
                        }
                    }
                    if (fieldNum === 2) {
                        if (multiDataList.value.length > 1) {
                            settingKeys.value.forEach(i => {
                                if (arr1[0] === i.title) {
                                    fieldNameFlag = true
                                }
                                if (arr1[0] === i.title && i.isRelation) {
                                    fieldNameFlag1 = true
                                }
                                if (arr1[1] === i.title) {
                                    secondFieldNameFlag = true
                                }
                                if (arr1[1] === i.title && i.isRelation) {
                                    secondFieldNameFlag1 = true
                                }
                            })
                        } else {
                            settingKeys.value.forEach(i => {
                                if (arr1[0] === i.title) {
                                    fieldNameFlag = true
                                }
                                if (arr1[1] === i.title) {
                                    secondFieldNameFlag = true
                                }
                            })
                        }
                        if (!(fieldNameFlag && secondFieldNameFlag)) return message.warn(t('api.selectOffestField'))
                        if (multiDataList.value.length > 1) {
                            if (!(fieldNameFlag1 && secondFieldNameFlag1)) return message.warn(t('api.offestFieldBeRelation'))
                        }
                    }
                    // 多层级 偏移字段 被必须设置成关联字段 且被关联
                    if (multiDataList.value.length > 1) {
                        let isRelationed = false
                        const binds = multiDataList.value.map(i => i.bind)
                        if (binds.length) {
                            let fields = []
                            binds.forEach(item => {
                                if (item && item.fields) {
                                    fields = [...fields, ...item.fields]
                                }
                            })
                            const originNames = fields.map(i => i.originalName)
                            originNames.forEach(item => {
                                if (arr1.includes(item)) {
                                    isRelationed = true
                                }
                            })
                        }
                        if (!isRelationed) {
                            return message.warn(t('api.relationFieldTip'))
                        }
                    }
                }
            }

            let handle = sysDataSourceType.value == 2 ?  editAPISource : addAPISource

            if(sysDataSourceType.value == 2) {
                jsonData.sourceId = sourceInfo.value.id
            }

            handle(jsonData).then((res) => {
                if(res.code === 1) {
                    message.success(res.message)
                    goBack()
                } else {
                    message.error(res.message)
                }
            })
        }
    } else if (activeKey.value === 2) {
        if (!validateUpdateData()) return
        if (dataSetFormState.updatePolicy === "API_UPDATE_PULL") {
            if (!dataSetFormState.url || !isUrl(dataSetFormState.url)) return message.warn(t('api.apiAddressErrorTip'))
        }
        const jsonData = {
            "groupId": activeTabKey.value,
            apiName: formState.apiSourceName,
            "decrypts": decrypts.value.length > 0 ? decrypts.value : undefined ,
            ...state.paramsData,
            "multiDataList": multiDataList.value,
            "updateSetting": {
                "updatePolicy": dataSetFormState.updatePolicy,
                "updateParams": { ...handleUpdateData() }
            },
            "contentType": formState.contentType,
        }
        if (addDataMode.value === 'import') {
            jsonData.realTableId = indexTableDesc.value.id
        }
        // api调用频率设置了按次调用
        if(showFrequency.value && rateInfo.frequency === 2) {
            jsonData.limitRate = Math.ceil(rateInfo.time / rateInfo.num) 
        }
        const hide = message.loading(t('api.addApiTip'), 0)
        apiImportToBi(jsonData).then(res => {
            if (res.code == 1) {
                useMainStore.setIndexTableActiveId('', activeTabKey.value, 'del')
                useMainStore.selectTabs({
                    id: activeTabKey.value
                }, 'import')
                message.success(res.message)
                goBack()
                // 接受推送 定时拉取 导入后下载文档
                if (['API_UPDATE_PUSH', 'API_UPDATE_PULL'].includes(dataSetFormState.updatePolicy)) {
                    useMainStore.setDeleteData({
                        id: res.data,
                        apiTableType: dataSetFormState.updatePolicy
                    })
                    useModalStore.changeDownloadDoscModalVisible()
                }
                hide()
                useApiManageStore.initRedDot()
            } else {
                message.error(res.message)
                hide()
            }
        })
    }
}

const debounceOnOK = debounce( onOK, 200, {
  leading: true,
})

// 选择数据源
const selectFn = (id) => {
    isEcho.value = true
    getSourceInfo({ id }).then(async(res) => {
        if (res.code === 1) {
            await echoSourceInfo(res.data)
            formRef.value.clearValidate()
        } else {
            message.error(res.message)
        }
    })
}

// 回显数据源信息
const echoSourceInfo = async (editInfo) => {
    selectSourceId.value = editInfo.id
    useEchoApiParams(formState, editInfo, pageFormState, authParamList)
    defaultInfoStr = getFormInfoStr()
}

const changeParams = (type, data = {}) => {
    useMainStore.setParamSettingType(type)
    useMainStore.setDeleteData(data)
    let arr = []
    if (pageFormState.pageType === 0) {
        if (pageFormState.pageNumberName && pageFormState.pageNumberBegin) {
            arr.push({
                uuid: '123', // 给固定后面需判断
                from: 'pageSetting',
                name: pageFormState.pageNumberName,
                value: pageFormState.pageNumberBegin
            })
        }
        if (pageFormState.pageSizeName && pageFormState.pageSize) {
            arr.push({
                uuid: '456', // 给固定后面需判断
                from: 'pageSetting',
                name: pageFormState.pageSizeName,
                value: pageFormState.pageSize
            })
        }
    } else if (pageFormState.pageType === 1) {
        if (pageFormState.fieldName && pageFormState.paramName) {
            arr.push({
                uuid: '123', // 给固定后面需判断
                from: 'pageSetting',
                name: pageFormState.fieldName,
                value: pageFormState.paramName
            })
        }
        if (pageFormState.secondFieldName && pageFormState.secondParamName) {
            arr.push({
                uuid: '456', // 给固定后面需判断
                from: 'pageSetting',
                name: pageFormState.secondFieldName,
                value: pageFormState.secondParamName
            })
        }
    } else if (pageFormState.pageType === 2) {
        if (pageFormState.leftName && pageFormState.beginValue) {
            arr.push({
                uuid: '123', // 给固定后面需判断
                from: 'pageSetting',
                name: pageFormState.leftName,
                value: pageFormState.beginValue
            })
        }
        if (pageFormState.rightName && pageFormState.endValue) {
            arr.push({
                uuid: '456', // 给固定后面需判断
                from: 'pageSetting',
                name: pageFormState.rightName,
                value: pageFormState.endValue
            })
        }
    }
    useMainStore.setPageFieldList(arr)
    useModalStore.changeApiParamsModalVisible()
}

const selectAll = (num, type) => {
    if (type === 'basicParams') {
        if (num === 1) {
            basciParamList.value.forEach(item => item.isSelect = true)
        } else {
            basciParamList.value.forEach(item => item.isSelect = false)
        }
    } else if (type === 'headParams') {
        if (num === 1) {
            headParamList.value.forEach(item => item.isSelect = true)
        } else {
            headParamList.value.forEach(item => item.isSelect = false)
        }
    } else if (type === 'bodyParams') {
        if (num === 1) {
            bodyParamList.value.forEach(item => item.isSelect = true)
        } else {
            bodyParamList.value.forEach(item => item.isSelect = false)
        }
    }
}

// 校验数据源名称是否重复
const validateSourceName = async () => {
    let res = await sourceNameIsDuplicate({
        sourceName: formState.apiSourceName,
        sourceTypeName: 'API'
    })
    if (res.code !== 1) {
        message.error('数据源名称重复')
        return false
    }
    return true
}

// 序列化api数据源信息
const getFormInfoStr = () => {
    let info = {
        name: formState.apiSourceName,
        apiAddress: formState.apiAddress,
        apiType: formState.apiType,
        baiceParams: basciParamList.value,
        headParams: headParamList.value,
        bodyParams: bodyParamList.value,
        pageParams: pageFormState
    }
    return JSON.stringify(info)
}

const replaceDoubleHashes = (str)=> {  
    // 替换第一个##为$  
    str = str.replace('##', '$.');  
    // 替换剩余的所有##为.  
    str = str.replace(/##/g, '.');  
    return str;  
}

// 获取授权参数
const getBearParams = () => {
    let authenticationVo = {
        type: formState.authType,
        authentication: {}
    }

    switch(formState.authType) {
        case 'no auth':
            break
        case 'basic auth':
            authenticationVo.authentication.username = formState.username
            authenticationVo.authentication.password = formState.password
            break
        case 'bearer token':
            let target = authParamList.value.find(it => it.uuid === formState.bearUuid)
            authenticationVo.authentication.values = [{
                paramType: target.from,
                paramName: target.name
            }]
            break
        default:
            break
    }
    return authenticationVo
}

// 测试连接
const testLink = () => {
    const { connName, apiAddress, apiType } = formState
    const { pageType, pageNumberName, pageNumberBegin, pageSizeName, pageSize, 
        fieldName, paramName, lastValue, secondFieldName, secondParamName, 
        lastAuxValue, leftName, rightName, dataFmtType, beginValue, endValue, 
        stepSize, stepUnit, skipName, beginSkip, topName, top } = pageFormState
    
    let normalParams = {}, offsetParams = {}
    let foreachParams = {}, oDataParams = {}
    let _pageSetting = {}

    if (pageFormState.pageType === 0) {
        normalParams = {
            "pageNumberName": pageNumberName, //"页码字段名",
            "pageNumberBegin": pageNumberBegin, //"页码起始值",
            "pageSizeName": pageSizeName, //"页大小字段名",
            "pageSize": pageSize, //"页大小值"
        }
        _pageSetting = {
            "type": pageType,
            "normalParams": normalParams
        }
        tempDataFmtCustom.value = ''
    } else if (pageFormState.pageType === 1) {
        offsetParams = {
            "fieldName": fieldName, //"偏移字段名",
            "lastValue": lastValue, //"偏移字段值",
            "paramName": paramName,
            "secondFieldName": secondFieldName, //"第二偏移字段名",
            "secondParamName": secondParamName,
            "lastAuxValue": lastAuxValue, //"第二偏移字段值"
        }
        _pageSetting = {
            "type": pageType,
            "offsetParams": offsetParams
        }
        tempDataFmtCustom.value = ''
    }  else if (pageFormState.pageType === 2)  {
        foreachParams = {
            "leftName": leftName,
            "rightName": rightName,
            "dataFmtType": tempDataFmtCustom.value ? 'custom' : dataFmtType || '',
            "beginValue": beginValue,
            "endValue": endValue,
            "stepSize": stepSize ?? '',
            "stepUnit": stepUnit,
            "dataFmtCustom": tempDataFmtCustom.value || ''
        }
        _pageSetting = {
            "type": pageType,
            "foreachParams": foreachParams
        }
    } else if (pageFormState.pageType ===3) {
        // OData协议分页
        oDataParams = {
            "skipName": skipName, //"页码字段名",
            "beginSkip": beginSkip, //"页码起始值",
            "topName": topName, //"页大小字段名",
            "top": top, //"页大小值"
        }
        _pageSetting = {
            "type": pageType,
            "oDataParams": oDataParams
        }
        tempDataFmtCustom.value = ''
    }

    // 给 decrypts 添加jsonPath
    const dataJsonPath = []
    settingKeys.value.forEach((item)=>{
        let path = replaceDoubleHashes(item.key)
        dataJsonPath.push(path)
    })
    let decryptsClone  = cloneDeep(decrypts.value)
    if(decryptsClone.length > 0 && dataJsonPath.length > 0){
        decryptsClone = decryptsClone.map((item,index)=>{
            if(index === decryptsClone.length - 1){
                item = {
                    ...item,
                    jsonPaths: dataJsonPath
                }
                return item
            }
            return item
        })
        useMainStore.setDecrypts(decryptsClone)
    }

    const jsonData = {
        "groupId": activeTabKey.value,
        "name": connName,
        "url": apiAddress,
        "method": apiType,
        "decrypts": decrypts.value.length > 0 ? decrypts.value : undefined ,
        "params": {
            "normal": basciParamList.value,
            "body": formState.apiType === 'post' ? bodyParamList.value : [],
            "header": headParamList.value,
            "pageSetting": _pageSetting,
            "queryBody": state.queryBody ? JSON.parse(state.queryBody) : ""
        },
        "contentType": formState.contentType,
    }

    jsonData.params.authenticationVo = getBearParams()
    
    state.paramsData = jsonData
    formRef.value.validateFields().then(res => {
        if (res) {
            if(sysDataSourceType.value == 0){
                let updated = formInfoUpdated()
                if (updated) {
                    hideModal.value = true
                    showConfirmModal(jsonData)
                } else {
                    connectionTest(jsonData)
                }
            }else{
                const jsonData = {
                    "name": connName,
                    "url": apiAddress,
                    "method": apiType,
                    "params": {
                        "normal": basciParamList.value,
                        "body": formState.apiType === 'post' ? bodyParamList.value: [],
                        "header": headParamList.value.filter(i => i.isSelect),
                        "pageSetting": _pageSetting,
                        "queryBody": state.queryBody ? JSON.parse(state.queryBody) : ""
                    }
                }
                connectionTest(jsonData)
            }
            
        }
    }).catch(e => {
        locateErrorField(e)
    })
}

// 定位校验失败字段
const locateErrorField = (errorInfo) => {
    let fieldArr = Object.keys(errorInfo.values)
    let targetField = fieldArr?.find(key => !errorInfo.values[key])
    switch (targetField) {
        case 'apiSourceName':
            dataSourceRef.value.focus()
            break
        case 'connName':
            connNameRef.value.focus()
            break
        case 'apiAddress':
            addressRef.value.focus()
            break
    }

    if (modalRef.value) {
        modalRef.value.scrollTop = 0
    }
}

// 判断数据源信息是否被修改
const formInfoUpdated = () => {
    if (!isEcho.value) return false
    let newInfoStr = getFormInfoStr()
    return newInfoStr !== defaultInfoStr
}


const showConfirmModal = (jsonData) => {
    createDialog({
        title: '提示',
        content: '数据源信息已修改，请选择覆盖当前数据源信息或另存为新数据源？',
        okText: '另存为新数据源',
        cancelText: '覆盖当前数据源',

    }).then(() => {    // 新建
        formState.apiSourceName = ''
        hideModal.value = false
        isEcho.value = false
        dataSourceRef.value.resetKeyword()
    }).catch((type) => {    // 覆盖
        if (type === 'cancel') {
            let requestParams = {
                apiName: formState.apiSourceName,
                method: jsonData.method,
                params: jsonData.params,
                sourceId: selectSourceId.value,
                url: jsonData.url
            }
            // 修改选中数据源
            editAPISource(requestParams).then((res) => {
                if (res.code !== 1) {
                    message.error(res.message)
                }
                connectionTest(jsonData)
                hideModal.value = false
            })
        } else if (type === 'close') {
            hideModal.value = false
        }
    })
}

// 连接测试
const connectionTest = (jsonData) => {
    apiConnectTest(jsonData).then(res => {
        if (res.code == 1) {
            const resData = JSON.parse(res.message)
            canPass.value = true
            useMainStore.setRequestData(parseData(resData))
            useMainStore.setParentKeys('')
            useMainStore.changeSettingKeys([], 'clear')
            useMainStore.setApiPreviewColumns([])
            useMainStore.setApiPreviewData([])
            message.success(t('api.apiConnectTip'))
            activeKey.value = 1
        } else {
            canPass.value = false
            message.error(res.message)
        }
    })
}

// 对更新策略数据进行校验
const validateUpdateData = () => {
    if (dataSetFormState.updatePolicy === "FULL_UPDATE" || dataSetFormState.updatePolicy === "API_UPDATE_PULL" || dataSetFormState.updatePolicy === 'API_INCR_APPEND') {
        if (!dataSetFormState.updateRate) {
            message.warn(t('api.validateRate'))
            return false
        }
        if (dataSetFormState.updatePolicy === "API_UPDATE_PULL" && !dataSetFormState.url) {
            message.warn(t('api.validateApiAddress'))
            return false
        }
        return true
    } else {
        return true
    }
}

// 处理更新策略数据
const handleUpdateData = () => {
    let uuid = regularUpdateRef.value.uuid
    let regularUpdateInfo = useMainStore.getRegularUpdateInfo(uuid)
    if (dataSetFormState.updatePolicy === "FULL_UPDATE" || dataSetFormState.updatePolicy === 'API_INCR_APPEND') {
        return {
            updatePolicy: dataSetFormState.updatePolicy,
            updateRate: dataSetFormState.updateRate,
            updateUnit: dataSetFormState.updateUnit,
            updateType: dataSetFormState.updateType,
            timeExpression: regularUpdateInfo.cronStr
        }
    } else if (dataSetFormState.updatePolicy === "API_UPDATE_PULL") {
        // if (!dataSetFormState.url || !isUrl(dataSetFormState.url)) return message.warn(t('api.apiAddressErrorTip'))
        return {
            updatePolicy: dataSetFormState.updatePolicy,
            updateRate: dataSetFormState.updateRate,
            updateUnit: dataSetFormState.updateUnit,
            updateType: dataSetFormState.updateType,
            timeExpression: regularUpdateInfo.cronStr,
            url: dataSetFormState.url
        }
    } else if (dataSetFormState.updatePolicy === "API_UPDATE_PUSH") {
        return {
            updatePolicy: dataSetFormState.updatePolicy,
            key: dataSetFormState.key
        }
    }
}

const updatePolicyChange = (ev) => {
    const v = ev.target.value
    if (v === "API_UPDATE_PUSH") {
        dataSetFormState.key = uuidv4().split('-')[0]
    }
}

const handleDel = (type, data) => {
    if (data.isEnc) return message.warn(t('api.apiDeleteTip'))
    useMainStore.setParamSettingType(type)
    useMainStore.setDeleteData(data)
    useModalStore.changeApiParamsDelModalVisible()
}

// 清空重置
onUnmounted(() => {
    useMainStore.setParamSettingType('')
    useMainStore.setBasciParamList([], 'clear')
    useMainStore.setBodyParamList([], 'clear')
    useMainStore.setHeadParamList([], 'clear')
    useMainStore.changeSettingKeys([], 'clear')
    useMainStore.setRequestData([])
    useMainStore.setParentKeys('')
    useMainStore.setApiPreviewColumns([])
    useMainStore.setApiPreviewData([])
    useMainStore.setApiTableDataList([])
    useMainStore.setApiTableAddList([])
    useMainStore.setDecrypts([])
    useMainStore.setIsCrossLevel(false)
    useMainStore.setDecryptDisabled(true)
    useMainStore.setIsApiCallFrequency(false)
    fieldIsEnc.value = false
    secondFieldEnc.value = false
    checkedKeys.value = []
    if (clickHandle) {
        document.body.removeEventListener('click', clickHandle)
        clickHandle = null
    }
})

const selectRate = () => {
    let isSetByTime = rateInfo.frequency === 2
    // 选择按时间请求 定时更新频率隐藏每分和每小时
    useMainStore.setIsApiCallFrequency(isSetByTime)
    isSetByTime && regularUpdateRef.value?.reset()
}
</script>

<style scoped lang="less">
.api-import {
    height: calc(100% - 36px);
    background-color: #fff;
    display: flex;
    flex-direction: column;

    .delete-icon {
        width: 16px;
        height: 16px;
        cursor: pointer;
        margin-left: 8px;
    }

    .api-header {
        height: 60px;
        display: flex;
        align-items: center;

        .api-title {
            font-weight: 600;
            font-size: 18px;
            line-height: 25px;
            color: rgba(0, 0, 0, 0.8);
            padding: 12px 10px;
        }

        .mainWrap {
            margin: 0 auto;
            display: flex;
            flex-direction: column;

            .stepWrap {
                display: flex;
                align-items: center;
                padding: 12px 0;

                .progress-line {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;

                    .pro-box {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 170px;
                        height: 36px;
                        margin-left: -15px;
                        background-size: contain;
                        background-repeat: no-repeat;
                        cursor: pointer;

                        &:first-of-type {
                            margin-left: 0;
                            background-image: url(@/assets/images/first_step_gray.png);

                            &.active {
                                background-image: url(@/assets/images/first_step_blue.png);
                            }
                        }

                        &:nth-of-type(2) {
                            background-image: url(@/assets/images/center-step-gray.png);

                            &.active {
                                background-image: url(@/assets/images/center-step-blue.png);
                            }
                        }

                        &:last-of-type {
                            background-image: url(@/assets/images/second_step_gray.png);

                            &.active {
                                background-image: url(@/assets/images/second_step_blue.png);
                            }
                        }
                    }

                    .blue-text {
                        font-size: 14px;
                        color: #8A8B99;
                    }

                    .gray-text {
                        color: #1E6FFA;
                        font-size: 14px;
                    }

                    .blue-bgc {
                        background: rgba(30, 111, 250, 0.7)
                    }

                    .gray-bgc {
                        background: #ACB4BF;
                    }

                    .cricle {
                        border-radius: 18px;
                        width: 16px;
                        height: 16px;
                        line-height: 16px;
                        color: #fff;
                        font-weight: 600;
                        font-size: 12px;
                        margin-right: 8px;
                        text-align: center;
                    }
                }

                .btn-group {
                    width: 170px;
                    display: flex;
                    height: 32px;
                    align-items: center;
                    gap: 20px;
                    margin-left: 40px;
                }
            }


        }
    }

    .operateWrap {
        overflow: hidden;
        height: 100%;
        .first-step {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            overflow-y: auto;

            .basic-connect {
                margin-top: 10px;
                width: 620px;
                .p-text {
                    margin-top: 10px;
                    font-weight: 600;
                    font-size: 15px;
                    color: rgba(0, 0, 0, 0.8);
                }

                .sub-p-text {
                    margin-top: 10px;
                    font-weight: 500;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.8);
                }

                .basic-tabs {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    padding: 3px;
                    width: 500px;
                    height: 36px;
                    background: #F3F3F3;
                    border-radius: 8px;

                    &>div {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;
                        padding: 0px 16px;
                        isolation: isolate;
                        width: 123.5px;
                        height: 30px;
                        border-radius: 6px;
                        flex: none;
                        order: 1;
                        flex-grow: 1;
                        cursor: pointer;
                        color: rgba(0, 0, 0, 0.4);
                    }

                    .tab-is-active {
                        background: #FFFFFF;
                        box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
                        border-radius: 6px;
                        color: rgba(0, 0, 0, 0.8);
                        font-weight: 600;
                    }
                }

                .basic-tabs-pane {
                    margin-top: 19px;
                    width: 500px;

                    :deep(.ant-tabs-nav-list){
                        width: 100%;
                        justify-content: space-between;
                        .ant-tabs-tab + .ant-tabs-tab{
                            margin: 0;
                        }
                    }
                    .tab-num {
                        padding: 0 5px;
                        margin-left: 3px;
                        background-color: #D9E7FF;
                        color: #4177FF;
                        border-radius: 50%;
                    }

                    .basic-table {

                        th,
                        td {
                            border: 1px solid #e0ebff;
                            padding: 10px;
                        }

                        th {
                            color: rgba(0, 0, 0, 0.6);
                            font-size: 14px;
                            text-align: left;
                        }

                        td {
                            height: 40px;
                            max-height: 56px;
                            color: rgba(0, 0, 0, 0.8);
                            font-size: 13px;

                            &>span {
                                color: #3d82f2;
                                cursor: pointer;
                                margin-right: 16px;
                            }

                            &>div {
                                word-break: break-all;
                                width: 100%;
                                max-height: 56px;
                                display: -webkit-box;
                                -webkit-line-clamp: 2;
                                -webkit-box-orient: vertical;
                                overflow: hidden;
                            }
                        }

                        tr {
                            &:nth-of-type(odd) {
                                background-color: #f7faff;
                            }

                            &:first-of-type {
                                background-color: #ecf3ff;
                            }
                        }

                        .check-img {
                            width: 16px;
                            height: 16px;
                            margin-right: 6px;
                            cursor: pointer;
                        }
                    }

                    .pageSize {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        margin-bottom: 24px;

                        .width130 {
                            width: 130px;
                        }

                        .width110 {
                            width: 110px;
                        }

                        .pageSizeFlex {
                            display: flex;
                            align-items: center;
                        }
                    }

                    .add-btn {
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;
                        gap: 2px;
                        height: 28px;
                        margin-top: 16px;
                        margin-bottom: 15px;
                    }

                    .textarea-style {
                        width: 490px;
                        height: 250px;
                        overflow: scroll;
                        overflow-y: hidden;

                        :deep(.scrollbar) {
                            display: none !important;
                        }

                        :deep(.margin) {
                            display: none !important;
                        }

                        :deep(.monaco-scrollable-element) {
                            margin-left: -45px;
                            width: 462px;
                        }
                    }

                    .sub-text {
                        font-weight: 400;
                        font-size: 12px;
                        color: rgba(0, 0, 0, 0.4);
                        margin-left: 10px;
                        text-align: right;
                        margin-bottom: 8px;
                    }
                    .loopFieldName {
                        display:flex;
                        height: 32px;
                        .driver{
                            width: 16px;
                            height: 1px;
                            background: rgba(0, 0, 0, 0.40);
                            margin: 16px 7px 0;
                        }
                        :deep(.ant-select-selector){
                            height:30px
                        }
                    }

                    .lo-form-items {
                        :deep(.ant-form-item-label) {
                            label {
                                text-align: left;
                                width: 245px;
                                display: -webkit-box;
                                -webkit-line-clamp: 2;
                                -webkit-box-orient: vertical;
                                overflow: hidden;
                            }
                        }
                        input {
                            width: 330px;
                        }
                    }

                    .zh-form-items {
                        :deep(.ant-form-item-label) {
                            label {
                                text-align: left;
                                width: 155px;
                                display: -webkit-box;
                                -webkit-line-clamp: 2;
                                -webkit-box-orient: vertical;
                                overflow: hidden;
                            }
                        }
                        input {
                            width: 370px;
                        }
                    }

                    .auth-form {
                        .ant-select{
                            width: 100%;
                        }
                        .ant-form-item-control-input input{
                            width: 100%;
                        }
                        .ant-form-item{
                            gap: 27px;
                        }
                    }
                }

                :deep(.ant-form-item .ant-select) {
                    width: 400px;
                }

                :deep(.ant-form-item .ant-select.page-select) {
                    width: 100%;
                }

                :deep(.ant-form-item-label){
                    width: 67px;
                    text-align: left;
                    &>label::after{
                        content: '';
                    }
                }
            }
        }

        .second-step {
            height: 100%;
        }

        .third-step {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow-y: scroll;
            .center-container{
                margin-top: 10px;
                width: 620px;
                .updatePolicyWrap{
                    display: flex;
                    gap: 20px;
                    margin-bottom: 16px;
                    .title{
                        line-height: 30px;
                        width: 75px;
                    }
                    .policyRadio{
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        font-size: 14px;
                    }
                }
                
                .info-text {
                    color: #2B67FF;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    img{
                        cursor: pointer;
                        width: 16px;
                        height: 16px;
                    }
                    span{
                        cursor: pointer;
                    }
                } 
                :deep(.updateWrap) {
                    .label{
                        width: 75px;
                    }
                }
                .row {
                    height: 32px;
                    display: flex;
                    gap: 20px;
                    align-items: center;
                    margin: 16px 0;
                    .rateWrap{
                        width: 75px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                    .col1{
                        width: 75px;
                        position: relative;
                        &::before{
                            content: '*';
                            position: absolute;
                            top: -2px;
                            left: -8px;
                            color: #ff4d4f;
                        }
                    }

                    .col2 {
                        height: 32px;
                        display: flex;
                        align-items: center;
                        flex-wrap: wrap;

                        .ml8mr20 {
                            margin-left: 8px;
                            margin-right: 20px;
                        }

                        .wid276 {
                            width: 276px;
                        }

                        .col3 {
                            height: 60px;
                            display: flex;
                            align-items: center;
                        }
                        
                    }
                }
                .frequency-wrap {
                    margin-top: 16px;
                    display: flex;
                    gap: 20px;
                    .rate-wrap{
                        padding-top: 4px;
                        width: 75px;
                        display: flex;
                        gap: 4px;
                        .tips-wrap{
                            position: relative;
                            top: 4px;    
                        }
                    }
                    .rate-container {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        .rate-input {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }

                    }
                }
            }
        }
    }
}
</style>