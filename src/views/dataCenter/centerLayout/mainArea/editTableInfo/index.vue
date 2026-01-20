<template>
    <!-- <a-spin :spinning="state.importLoading"> -->
        <div class="editPage">
            <div class="editHead">
                <div class="back">
                    <div class="backbox" @click="goBack"><img src="@/assets/icons/return.png" alt="">{{ t('common.back') }}</div>
                </div>
                <div class="headBox">
                    <div class="add">
                        <div class="text">{{ t('indexPage.editTable') }}</div>
                        <!-- 表名 描述 -->
                        <div style="display: flex; gap: 30px;">
                            <div class="iptGroup des-wrap">
                                <span class="textColor text1">{{ t('common.tableName') }}</span>
                                <input class="ipt1" v-model="state.tableName" type="text" :placeholder="t('common.enterTableName')" />
                            </div>
                            <div class="iptGroup">
                                <span class="textColor text1" style="width: auto;">{{ t('common.desc') }}</span>
                                <input class="ipt2" v-model="state.tableDesc" type="text" :placeholder="t('common.tableDesc')">
                            </div>
                        </div>
                        <!-- 操作 -->
                        <div class="iptGroup">
                            <span class="textColor text1">{{ t('common.operation') }}</span>
                            <a-radio-group @change="changeTypes" v-model:value="state.operType" >
                                <a-radio :value="0">{{ t('selfConfig.codeSet') }}</a-radio>
                                <!-- <a-radio :value="1">
                                    <a-tooltip>
                                        <template #title>
                                            {{ t('indexPage.rowSwitchDesc') }}
                                        </template>
                                        {{ t('indexPage.rowSwitch') }}
                                    </a-tooltip>
                                </a-radio> -->
                                <a-radio :value="2">
                                    {{ t('indexPage.fieldDesensitization') }}
                                </a-radio>
                            </a-radio-group>
                        </div>
                        <!-- 导出数据脱敏 -->
                        <div class="iptGroup" v-if="state.operType === 2">
                            <span class="textColor">{{ t('indexPage.exportDesensitization') }}</span>
                            <a-radio-group v-model:value="state.exportDst" >
                                <a-radio :value="1">{{ t('indexPage.yes') }}</a-radio>
                                <a-radio :value="0">{{ t('indexPage.no') }}</a-radio>
                            </a-radio-group>
                        </div>
                        <!-- 数据源 -->
                        <div class="iptGroup data-source" v-if="dataSourceName">
                            <span class="textColor text1">{{ t('indexPage.dataSourceTip') }}</span>
                            <div class="source-wrap" @click="viewSource">
                                <span>{{ dataSourceName }}</span>
                                <BiIcon name="jump" class="jumpIcon"/>
                            </div>
                        </div>
                        <!-- 更新策略 -->
                        <div class="formItemBody" v-if="state.operType === 0 && showUPDATE">
                            <a-form ref="formRef" :model="updateConfig">
                                <a-form-item name="updatePolicy" :label="t('common.updatePolicy')">
                                    <a-radio-group id="updatePolicy" v-model:value="updateConfig.updatePolicy" name="checkboxgroup" :disabled="isDisabledRadio" @change="updatePolicyChange" @mouseenter="showPolicyToolitp" @mouseleave="hidePolicyToolitp">
                                        <a-radio v-if="showNONE" :disabled="noneDisable" value="NONE">{{ t('common.noUpdate') }}</a-radio>
                                        <a-radio v-if="showFULL" value="FULL_UPDATE">{{ t('common.fullUpdate') }}</a-radio>
                                        <a-radio v-if="showREAL" value="REALTIME_UPDATE" :disabled="realtimeDisalbed">
                                            <div class="incrUpdateWrap">
                                                <span>{{ t('common.realTimeUpdate') }}</span>
                                                <a-tooltip v-if="tooltipContent" :title="tooltipContent">
                                                    <img src="@/assets/icons/tips-small-icon.png" />
                                                </a-tooltip>
                                            </div>
                                        </a-radio>
                                        <a-radio v-if="editTableType.value === 3" value="INCR_UPDATE">
                                            <!-- {{ t('common.incrUpdate') }} -->
                                            <div class="incrUpdateWrap">
                                                <span>{{ t('common.incrUpdate') }}</span>
                                                <a-tooltip>
                                                    <template #title>
                                                        <span>数据库增量更新只支持新增数据，如需实现增删改，请
                                                            <a @click="downloadDBDoc">下载文档</a>，
                                                        通过接口补充增删改数据</span>
                                                    </template>
                                                    <img src="@/assets/icons/tips-small-icon.png" alt="" />
                                                </a-tooltip>
                                            </div>
                                        </a-radio>
                                        <a-radio v-if="editTableType.value === 7" value="API_UPDATE_PUSH">
                                            <div class="policyRadio">
                                                <span>{{ t('common.apiIncrPush') }}</span>
                                                <span class="info-text">
                                                    <a-tooltip>
                                                        <template #title>
                                                            中台提供接口，接受业务系统推送给中台的增量数据，数据格式由中台提供标准文档
                                                        </template>
                                                        <img src="@/assets/icons/info-t.png" alt="">
                                                    </a-tooltip>
                                                    <span :class="{disabledDownload: firstTimeUpdatePolicy !== 'API_UPDATE_PUSH'}" @click.prevent="downloadApiNote('API_UPDATE_PUSH')">{{ t('common.downloadDoc') }}</span>
                                                </span>
                                            </div>
                                        </a-radio>
                                        <a-radio v-if="editTableType.value === 7" value="API_UPDATE_PULL">
                                            <div class="policyRadio">
                                                <span>{{ t('common.apiIncrPull') }}</span>
                                                <span class="info-text">
                                                    <a-tooltip>
                                                        <template #title>
                                                            中台根据设定的增量更新频率，从业务系统的接口拉取增量数据，数据格式由中台提供标准文档
                                                        </template>
                                                        <img src="@/assets/icons/info-t.png" alt="">
                                                    </a-tooltip>
                                                    <span :class="{disabledDownload: firstTimeUpdatePolicy !== 'API_UPDATE_PULL'}" @click.prevent="downloadApiNote('API_UPDATE_PULL')">{{ t('common.downloadDoc') }}</span>
                                                </span>
                                            </div>
                                        </a-radio>
                                        <a-radio v-if="showAppendUpdate" value="API_INCR_APPEND">
                                            {{ t('common.appendUpdate') }}
                                        </a-radio>
                                    </a-radio-group>
                                </a-form-item>
                                <!-- 定时更新 -->
                                <regularUpdateInput ref="regularUpdateRef" :updatePolicy="updateConfig.updatePolicy"/>
                                <div v-if="updateConfig.updatePolicy === 'INCR_UPDATE'">
                                    <a-form-item 
                                        name="dependColumn" 
                                        :label="t('common.updateDepend')" 
                                        :rules="[{ required: true, message: t('common.selectUpdateDepend') }]"
                                    >
                                        <a-select 
                                            :notFoundContent="t('common.noData')" 
                                            showSearch
                                            style="width: 256px" 
                                            v-model:value="updateConfig.dependColumn" 
                                        >
                                            <a-select-option 
                                                v-for="item in state.previewColumns"
                                                :key="item.columnName" 
                                                :value="item.columnName"
                                            >
                                                <span role="img">
                                                    <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                                                </span>
                                                {{ item.columnAlias || item.columnName }}
                                            </a-select-option>
                                        </a-select>
                                    </a-form-item>
                                </div>
                                <template v-if="updateConfig.updatePolicy === 'API_UPDATE_PULL'">
                                    <div class='row'>
                                        <div>{{ t('api.apiAddress') }}</div>
                                        <div class="col2">
                                            <input type="text" v-model.trim="updateConfig.url" style="width: 244px" />
                                            <!-- &nbsp;&nbsp;&nbsp;
                                            <span class="info-text" @click="e => incrDesc(e, 3)">
                                                <img style="width: 16px; margin-top: -2px;" src="@/assets/icons/info-t.png" alt="">
                                                {{ t('api.apiStructureDesc') }}
                                            </span> -->
                                        </div>
                                    </div>  
                                </template>

                                <!-- 隐藏更新密钥 -->
                                <!-- <template v-if="updateConfig.updatePolicy === 'API_UPDATE_PUSH'">
                                    <a-form-item name="key" :label="t('common.updateKey')" style="margin-top: 8px;">
                                        <input disabled type="text" v-model="updateConfig.key" style="width: 160px" />
                                    </a-form-item>
                                </template> -->

                                <!-- 仅db表 全量更新展示部分更新 -->
                                <div class="iptGroup" v-if="showpartUpdate">
                                    <div class="part_update">
                                        <span>部分更新</span>
                                        <tips tipsContent="设置部分更新后，会根据更新依据设置的条件范围，仅更新部分数据，不再更新全部数据"/>
                                    </div>
                                    <a-radio-group v-model:value="updateConfig.partUpdate" >
                                        <a-radio :value="false">关</a-radio>
                                        <a-radio :value="true">开</a-radio>
                                    </a-radio-group>

                                    <!-- 部分更新支持设置筛选条件 -->
                                    <div class="set-filter-info" v-if="updateConfig.partUpdate" @click="showDrawer">
                                        <BiIcon name="filter" color="#2B67FF" />
                                        <span>设置筛选条件</span>
                                    </div>

                                    <!-- 更新依据 -->
                                    <!-- <updateDependency v-if="updateConfig.partUpdate" ref="dependencyRef" :codeList="state.editCodeList"/> -->
                                </div>
                            </a-form>
                        </div>
                    </div>
                    <div class="leftConfig">
                        <div>
                            <myButton @click="importFile" type="primary" :disabled="isClick">{{ t('common.confirm') }}</myButton>
                        </div>
                    </div>
                </div>
            </div>
            <div class="codeSet" v-if="state.operType === 0" >
                <div class="codeSelectWrap">
                    <div class="top-wrap">
                        <span>{{ t('selfConfig.selectCode') }}</span>
                        <span v-if="editTableType.value === 3" :class="{'sync-wrap': true, disabled: hasSync}" @click="syncHandle">
                            <BiIcon name="refresh"/>
                            同步数据源字段
                        </span>
                    </div>
                    <div class="search">
                        <input type="text" v-model="state.searchText" :placeholder="t('common.search')">
                        <img class="sear" src="@/assets/icons/search.png" alt="">
                    </div>
                    <div class="myTable" ref="tableWrapRef">
                        <table ref="tableRef">
                            <colgroup>
                                <col :width="colWidths[0]" style="min-width: 50px;"/>
                                <col :width="colWidths[1]" />
                                <col :width="colWidths[2]" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>
                                        <div class="th-flex">
                                            <a-tooltip v-if="isFormTable">
                                                <template #title>该字段为表单实时更新依赖字段，不可删除</template>
                                                <img class="check-img" src="@/assets/icons/disabled_select.png" alt="">
                                            </a-tooltip>
                                            <img @click="selectAll(1)" class="check-img" v-else-if="selectedNum === 0" src="@/assets/icons/not_select.png" alt="">
                                            <img @click="selectAll(2)" class="check-img" v-else-if="selectedNum === indexBackTableColumns.length" src="@/assets/icons/is_select.png" alt="">
                                            <img @click="selectAll(1)" class="check-img" v-else src="@/assets/icons/doing_select.png" alt="">
                                            <!-- <img class="check-img" v-show="element.isSelect" src="@/assets/icons/is_select.png" alt=""> -->
                                            {{ t('common.codeName') }}
                                        </div>
                                        <div class="resizerWrap">
                                            <span class="resizer"></span>
                                        </div>
                                    </th>
                                    <th>
                                        {{ t('api.codeType') }}
                                        <div class="resizerWrap">
                                            <span class="resizer"></span>
                                        </div>
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                                <draggable 
                                    :list="indexTableColumns" 
                                    tag="tbody"
                                    handle=".handle" 
                                    item-key="id"
                                    @end="dragEnd"
                                    drag-class="chosenClass"
                                >
                                    <template #item="{ element, index }">
                                        <tr class="list-group-item">
                                            <template v-if="element.isPrimaryKey === 1">
                                                <td>
                                                    <div class='name'>
                                                        <a-tooltip v-if="isFormField(element)">
                                                            <template #title>该字段为表单实时更新依赖字段，不可删除</template>
                                                            <img class="check-img" src="@/assets/icons/disabled_select.png" alt="">
                                                        </a-tooltip>
                                                        <img v-else class="check-img" src="@/assets/icons/disabled_select.png" alt="">
                                                        <a-tooltip>
                                                            <template #title>
                                                                {{ t('indexPage.mainCodeTip') }}
                                                            </template>
                                                            <div class="code-icon">{{ t('indexPage.main') }}</div>
                                                        </a-tooltip>
                                                        <input
                                                            ref="inputRef"
                                                            v-if="element.isRename"
                                                            @blur="onIptBlur(element)" 
                                                            class="ipt" 
                                                            type="text"
                                                            v-model="element.columnAlias"
                                                            placeholder="请输入"
                                                            style="width: 60px"
                                                        />
                                                        <span :title="element.columnAlias || element.columnName" @click="rename(element)" v-else>
                                                            {{ element.columnAlias || element.columnName }}
                                                        </span>
                                                        <img class="edit" src="@/assets/icons/edit1.png" alt="" @click="rename(element)">
                                                    </div>
                                                </td>
                                            </template>
                                            <template v-if="!element.isPrimaryKey">
                                                <td>
                                                    <div class="name">
                                                        <a-tooltip v-if="isFormField(element)">
                                                            <template #title>该字段为表单实时更新依赖字段，不可删除</template>
                                                            <img class="check-img" src="@/assets/icons/disabled_select.png" alt="">
                                                        </a-tooltip>
                                                        <img v-else-if="!element.isSelect" @click="codeSelect(element)" class="check-img" src="@/assets/icons/not_select.png" alt="">
                                                        <img v-else-if="element.isSelect" @click="codeSelect(element)" class="check-img" src="@/assets/icons/is_select.png" alt="">
                                                        <!-- 数据源字段被删除 -->
                                                        <a-tooltip v-if="element.isDelColum">
                                                            <template #title>
                                                                {{ t('indexPage.delCodeTip') }}
                                                            </template>
                                                            <div class="code-icon del-code">{{ t('indexPage.del') }}</div>
                                                        </a-tooltip>
                                                        <!-- 新增同步字段 -->
                                                        <a-tooltip v-if="element.isAddColumn">
                                                            <template #title>
                                                                {{ t('indexPage.addCodeTip') }}
                                                            </template>
                                                            <div class="code-icon add-code">增</div>
                                                        </a-tooltip>
                                                        <input
                                                            ref="inputRef"
                                                            @blur="onIptBlur(element)" 
                                                            class="ipt" 
                                                            v-if="element.isRename"
                                                            type="text" 
                                                            v-model="element.columnAlias"
                                                            placeholder="请输入"
                                                        />
                                                        <span :title="element.columnAlias || element.columnName" @click="rename(element)" v-else>
                                                            {{ element.columnAlias || element.columnName }}
                                                        </span>
                                                        <img class="edit" src="@/assets/icons/edit1.png" alt="" @click="rename(element)">
                                                    </div>
                                                </td>
                                            </template>
                                            <td class="type">
                                                <a-select 
                                                    :notFoundContent="t('common.noData')" 
                                                    style="width: 88px;;" 
                                                    v-model:value="element.type"
                                                    :showArrow="false"
                                                    disabled
                                                    @select="(value,options) => onSelect(options, element, index)"
                                                >
                                                    <a-select-option 
                                                        v-for="item in typeList" :key="item.key"
                                                        :value="item.text" 
                                                        :title="t(item.text)" 
                                                        :disabled="optionDisabled(element, item) || !element.isSelect"
                                                    >
                                                        <span role="img">
                                                            <img style="width: 16px" :src="item.imgSrc" alt="">
                                                        </span>
                                                        {{ t(item.text) }}
                                                    </a-select-option>
                                                </a-select>
                                            </td>
                                            <td class="handle"><img src="@/assets/icons/eightDot.png" /></td>
                                        </tr>
                                    </template>
                                </draggable>
                        </table>
                    </div>
                </div>
                <preview-table
                    :tableLoading="state.tableLoading" 
                    :tableColumns="state.previewColumns" 
                    :tableData="state.previewData" 
                />
            </div>
            <div class="switch-container" v-if="state.operType === 1">
                <div class="oper-header">
                    <div class="row-code">
                        <div class="text">{{ t('indexPage.lineBasisField') }}</div>
                        <div>
                            <a-select 
                                :notFoundContent="t('common.noData')" 
                                v-model:value="formState.rowCode" 
                                style="width: 240px; margin-left: 18px"
                                @select="onSwitchSelect(1)"
                            >
                                <a-select-option v-for="item in state.editCodeList" :value="item.columnName">
                                    <span role="img">
                                        <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                                    </span>
                                    {{ item.columnAlias || item.columnName }}
                                </a-select-option>
                            </a-select>
                        </div>
                        <div class="text" style="margin-left: 32px">{{ t('indexPage.columnBasisField') }}</div>
                        <div>
                            <a-select 
                                :notFoundContent="t('common.noData')" 
                                v-model:value="formState.colCode" 
                                style="width: 240px; margin-left: 18px"
                                @select="onSwitchSelect(1)"
                            >
                                <a-select-option v-for="item in state.editCodeList" :value="item.columnName">
                                    <span role="img">
                                        <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                                    </span>
                                    {{ item.columnAlias || item.columnName }}
                                </a-select-option>
                            </a-select>
                        </div>
                    </div>
                    <div class="grid-box">
                        <div class="text">{{ t('indexPage.indexField') }}</div>
                        <div class="second-box">
                            <!-- <template v-for="item in formState.accordList" :key="item.id"> -->
                                <div class="select-item">
                                    <a-select 
                                    :notFoundContent="t('common.noData')" 
                                        v-model:value="formState.accordCode" 
                                        style="width: 240px; margin-left: 18px"
                                        @select="onSwitchSelect(2)"
                                    >
                                        <a-select-option v-for="item in state.editCodeList" :value="item.columnName">
                                            <span role="img">
                                                <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                                            </span>
                                            {{ item.columnAlias || item.columnName }}
                                        </a-select-option>
                                    </a-select>
                                </div>
                        </div>
                    </div>
                </div>
                <preview-table
                    :tableLoading="state.tableLoading" 
                    :tableColumns="state.previewColumns" 
                    :tableData="state.previewData" 
                />
            </div>
            <div class="field-desensitization" v-if="state.operType === 2">
                <preview-table
                    flag="desensitize"
                     @desensitize="showModal" 
                    :tableLoading="state.tableLoading" 
                    :tableColumns="state.previewColumns" 
                    :tableData="state.previewData" 
                />
            </div>
        </div>
        <desensitizationModal v-if="state.modalVisible" :setItem="setItem" @modalCancel="modalCancel" @modalConfirm="modalConfirm"></desensitizationModal>
    <!-- </a-spin> -->

    <!-- 字段筛选抽屉组件 -->
    <drawerFilter
        ref="drawerFilterRef"
        :drawerVisible="drawerVisible"
        @closeDrawer="cancelFn"
    >
        <template #footer>
            <BiButton @click="cancelFn">取消</BiButton>
            <a-tooltip placement="topLeft">
                <template #title>
                    <span>该操作会先删除当前表数据，再按新条件导入数据，请谨慎操作</span>
                </template>
                <BiButton :class="{'clear-all-btn': true, disabled: !fullDeleteInfo.hasConfirm}" @click="clearAllFn">全量清除后导入<span v-if="!fullDeleteInfo.hasConfirm">({{ fullDeleteInfo.num }}s)</span></BiButton>
            </a-tooltip>
            <a-tooltip placement="topLeft">
                <template #title>
                    <span>仅更新条件范围内数据，不更新全部数据</span>
                </template>
                <BiButton type="primary" @click="submitFn">部分更新</BiButton>
            </a-tooltip>
        </template>
    </drawerFilter>
</template>

<script setup>
import { reactive, computed, onMounted, watch, ref, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import * as _ from 'loadsh'
import draggable from 'vuedraggable'
import { getimgType, getCodeType, getIconSrc, isUrl, downloadBlobUtil } from '@/utils/utils'
import { previewSensitive } from '@/apis/group'
import { getPreviewData, updateColumns, importFlie } from '@/apis/config'
import { mainStore } from '@/Stores/mainStore'
import { modalStore } from '@/Stores/modalStore'
import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import myButton from '@/components/buttons/myButton.vue'
import desensitizationModal from './desensitizationModal'
import { useI18n } from 'vue-i18n'
import previewTable from '@/components/selfconfig/previewTable'
import tips from '@/components/tips'
import regularUpdateInput from '@/components/regularUpdateInput'
import { updateDoc, downloadPullNote } from '@/apis/apiImport'
import { FORM_FIELDS } from '@/constants/form'
import useChangeColWidth from '@/hooks/dataCenter/useChangeColWidth'
import { typeList } from '@/constants/dataCenterMenu.js'
import drawerFilter from '@/components/filterColumn/drawerFilter.vue';
import { syncDbColumn } from '@/apis/config'

const { t } = useI18n()
const useMainStore = mainStore()
const useModalStore = modalStore()
const { indexTableColumns, indexTableDesc, indexBackTableColumns, activeTabKey, editTableType } = storeToRefs(useMainStore)
const state = reactive({
    tableName: '',
    tableDesc: '',
    operType: 0, // 操作类型： 0 字段设置 1 行列转换
    searchText: '',
    tableLoading: false,
    editCodeList: [],
    previewColumns: [],
    previewData: [],
    paramsOptions: [], // 获取预览数据参数
    importLoading: false,
    modalVisible: false,
    exportDst: 1, 
})
const regularUpdateRef = ref(null)
const setItem = ref({})
const inputRef = ref()
const tableWrapRef = shallowRef()
const tableRef = ref()
const formState = reactive({
    rowCode: '',
    colCode: '',
    accordCode: ''
})

const updateConfig = reactive({
    updatePolicy: 'NONE',
    updateRate: 1,
    updateUnit: 1,
    dependColumn: '',
    updateType: 1,
    url: '',
    key: '',
    partUpdate: false, // 部分更新
    partUpdateColumn: undefined,
    partUpdateStartValue: '',
    partUpdateEndValue: '',
    selfConfigWhere: '', // 更新依据信息
    fullDelete: false, // 部分更新 全量清除后导入
})
const firstTimeUpdatePolicy = ref()
const colWidths = ref(['116','90','12'])

// 同步字段数据
const syncColumns = reactive({
    addColumns: [],
    delColumns: []
})

// 是否同步过数据源字段
const hasSync = ref(false)

const drawerVisible = ref(false)

const drawerFilterRef = shallowRef()

const filterInfo = ref()

const router = useRouter()

// 同步字段名
const syncAddColumns = ref([])

// 筛选组件字段
const filterColumns = reactive({
    allColumns: []
})

const currentFilterOption = ref([])

const fullDeleteInfo = reactive({
    hasConfirm: false,
    num: 5,
    timer: null
})

// 字段筛选组件使用
provide('FILTER_COLUMNS', filterColumns)
// 字段筛选组件配置项
provide('FILTER_OPTIONS', currentFilterOption)

const showNONE = computed(() => {
    // 表单、db、自助配置、API、kafka显示->不更新
    return [1, 3, 4, 6, 7, 8].includes(editTableType.value.value)
})
const showFULL = computed(() => {
    const v = editTableType.value.value
    if (v === 3 || v === 7 || v === 4) { // db、api、自助配置显示->全量更新
        return true
    }
    return false
})
const showREAL = computed(() => {
    const v = editTableType.value.value
    if (v === 1 || v === 3 || v === 6 || v === 8) { // 表单|DB|kafka显示->实时更新
        return true
    }
    return false
})
// 是否显示更新策略
const showUPDATE = computed(() => {
    const v = editTableType.value.value
    if (v === 0 || v === 5 || v === 2) { // 空表、sql、excel不显示更新策略
        return false
    }
    return true
})
// 是否显示增量追加
const showAppendUpdate = computed(()=>{
    try {
       const tableSource = JSON.parse(indexTableDesc.value.tableSource)
       return tableSource?.params?.pageSetting?.type == 2 && editTableType.value.value === 7
    } catch (error) {
        return false
    }
})

// 数据源是否被禁用
const dataSourceIsDisabled = computed(() => {
    return indexTableDesc.value?.tableStatus?.value === 5
})

// 数据源是否被删除
const dataSourceIsDeleted = computed(() => {
    return indexTableDesc.value?.tableStatus?.value === 6
})

// 是否禁用
const isDisabledRadio = computed(()=>{
    if(
        (getUpdatePolicy() === 'API_INCR_APPEND' && editTableType.value.value === 7) || // api导入并且默认值为增量追加
        (dataSourceIsDisabled.value || dataSourceIsDeleted.value) || // 数据源删除/禁用
        (indexTableDesc.value?.tableStatus?.value === 7)  // 移入过回收站
    ){
        return true
    }else{
        return false
    }
})
const isClick = computed(() => {
    if ((state.tableName && state.paramsOptions.length > 1) || (state.operType === 0 && state.tableName) || (state.operType === 2 && state.tableName) ) return false
    return true
})
const selectedNum = computed(() => {
    return indexBackTableColumns.value.filter(i => i.isSelect).length
})
watch(() => state.searchText, val => {
    if (!val.trim()) {
        indexTableColumns.value = indexBackTableColumns.value
    } else {
        indexTableColumns.value = indexBackTableColumns.value.filter(item => 
            item.columnAlias ? item.columnAlias.indexOf(val.trim()) > -1 : item.columnName.indexOf(val.trim()) > -1
        )
    }
})

// 更新字段列表
watch(syncColumns, async () => {
    // console.log('synccolumns', syncColumns)
    // 同步新增字段
    indexTableColumns.value.push(...(_.cloneDeep(syncColumns.addColumns)))

    // 同步删除字段
    syncColumns.delColumns.forEach(i => {
        let target = indexTableColumns.value.find(j => j.id === i.id)
        if(target) {
            target.isDelColum = true
        }
    })

    await nextTick()
    
    // 有新增字段 滚动到底部
    syncColumns.addColumns.length > 0 && 
    tableWrapRef.value?.scroll({
        top: tableWrapRef.value.scrollHeight - tableWrapRef.value.clientHeight,
        behavior: 'smooth'
    })
    // codeSelect()
})

// 同步数据源字段
const syncHandle = _.debounce(async () => {
    // 仅允许同步一次
    if(editTableType.value?.value !== 3 || hasSync.value) {
        return
    }
    hasSync.value = true
    try {
        let res = await syncDbColumn({
            columns: indexTableColumns.value,
            jsonObject: JSON.parse(indexTableDesc.value.tableSource)
        })
        if(res.code !== 1) {
            return message.error(res.message)
        }

        syncAddColumns.value = []
        
        syncColumns.addColumns = res.data.addColumns?.map(item => {
            syncAddColumns.value.push(item.columnName)
            return {
                ...item,
                isSelect: false,
                dataIndex: item.columnName,
                imgType: getimgType(item.columnType),
                type: getCodeType(item.columnType),
                // 新增同步字段标识
                isAddColumn: true,
            }
        }) || []

        syncColumns.delColumns = res.data.delColumns

        if(res.data?.addColumns?.length || res.data?.delColumns?.length) {
            message.success('表结构已更新')
        } else {
            message.success('表结构已更新，无变化')
        }
        // return message.success(res.message)
    } catch(e) {
        console.error('sync handle error', e)
    }
}, 500, {
    leading: true,
    trailing: false
})

const submitFn = () => {
    // TODO: 去除operationList
    filterInfo.value = [{
        action: 'where',
        contents: drawerFilterRef.value.getFilterData()
    }]
    drawerVisible.value = false
    updateConfig.fullDelete = false
}

// 全量清除
const clearAllFn = () => {
    if(!fullDeleteInfo.hasConfirm) {
        return
    }
    filterInfo.value = [{
        action: 'where',
        contents: drawerFilterRef.value.getFilterData()
    }]
    drawerVisible.value = false
    updateConfig.fullDelete = true
}


// 对字段设置类型进行限制
const optionDisabled = (record, item) => {
    // 目前的类型转换逻辑是 字符串可以转日期和数字 数字可以转字符 日期可以转字符
    if ((record.type === 'selfConfig.numeric' || record.type === 'selfConfig.bigint') && (item.text === 'selfConfig.time'|| item.text === 'selfConfig.date' || item.text === 'selfConfig.datetime')) {
        return true
    } else if ((record.type === 'selfConfig.time' || record.type === 'selfConfig.date' || record.type === 'selfConfig.datetime') && (item.text === 'selfConfig.numeric' || item.text === 'selfConfig.bigint')) {
        return true
    }
    return false
}
const getUpdatePolicy = () => {
    const v = indexTableDesc.value?.updatePolicy?.value
    switch (v) {
        case 0: 
            return 'NONE'
        case 1: 
            return 'FULL_UPDATE'
        case 2:
            return 'INCR_UPDATE'
        case 3: 
            return 'REALTIME_UPDATE'
        case 4: 
            return 'API_UPDATE_PUSH'
        case 5:
            return 'API_UPDATE_PULL'
        case 7:
            return 'API_INCR_APPEND'
    }
}

// 拖拽列宽逻辑处理
useChangeColWidth(tableRef)

onMounted(async () => {
    // 初始化更新策略
    updateConfig.updatePolicy = getUpdatePolicy()
    firstTimeUpdatePolicy.value = getUpdatePolicy()
    if (indexTableDesc.value.parseUpdateParams) {
        updateConfig.updateRate = indexTableDesc.value.parseUpdateParams.updateRate || 1
        if (indexTableDesc.value.parseUpdateParams.updateUnit == 0) {
            updateConfig.updateUnit = indexTableDesc.value.parseUpdateParams.updateUnit
        } else {
            updateConfig.updateUnit = indexTableDesc.value.parseUpdateParams.updateUnit || 1
        }
        updateConfig.dependColumn = indexTableDesc.value.parseUpdateParams.dependColumn
        updateConfig.url = indexTableDesc.value.parseUpdateParams.url
        updateConfig.key = indexTableDesc.value.parseUpdateParams.key

        // 更新策略为全量更新且开启部分更新 回显部分更新数据
        if(updateConfig.updatePolicy === 'FULL_UPDATE' && indexTableDesc.value.parseUpdateParams.partUpdate) {
            updateConfig.partUpdate = indexTableDesc.value.parseUpdateParams.partUpdate
            updateConfig.partUpdateColumn = indexTableDesc.value.parseUpdateParams.partUpdateColumn
            await nextTick()
            // 设置更新依据信息
            // dependencyRef.value.setDependencyInfo(indexTableDesc.value.parseUpdateParams)
            currentFilterOption.value = indexTableDesc.value.parseUpdateParams.selfConfigWhere
            updateConfig.partUpdateStartValue = indexTableDesc.value.parseUpdateParams.partUpdateStartValue
            updateConfig.partUpdateEndValue = indexTableDesc.value.parseUpdateParams.partUpdateEndValue
        }
    }

    state.editCodeList = _.cloneDeep(indexTableColumns.value)
    filterColumns.allColumns = _.cloneDeep(indexTableColumns.value)
    state.tableName = indexTableDesc.value.tableAlias
    state.tableDesc = indexTableDesc.value.description

    // state.columns = indexTableColumns.value
    // // 设置主键
    // let targetColumn = indexTableColumns.value.find(it => it.isPrimaryKey === 1)
    // updateConfig.primaryKey = targetColumn?.columnName ?? ''
    
    let columns = []
    if (indexTableColumns.value.length) {
        indexTableColumns.value.forEach(item => {
            item.isSelect = true
            columns.push(item.columnName)
        })
    }
    const data = {
        action: "select",
        contents: {
            tableId: indexTableDesc.value.id,
            columns
        }
    }
    setParamsOptions(data, 1)
    state.exportDst = indexTableDesc.value.exportDst ?? 1
})
const changeTypes = (val) => {
    const value = val.target.value
    if (value == 1) { // 行列转换
        setParamsOptions({}, 3)
    } else if (value === 2) {
        setParamsOptions({}, 'sensitive')
    } else { // 字段设置
        formState.accordCode = ''
        formState.colCode = ''
        formState.rowCode = ''
        dragEnd()
    }
}

// 增量更新说明
const incrDesc = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    useMainStore.setApiDescType(type)
    useModalStore.changeApiDescModalVisible()
}
const updatePolicyChange = (ev) => {
    const v = ev.target.value
    if (v === "API_UPDATE_PUSH") {
        updateConfig.key = updateConfig.key || uuidv4().split('-')[0]
    }
}
const setParamsOptions = (data, type) => {
    if (type === 1) {
        state.paramsOptions.push(data)
    } else if (type === 2) {
        state.paramsOptions[1] = data
    } else if (type === 3 || type === 'sensitive') {
        let columns = []
        state.editCodeList.forEach(item => {
            columns.push(item.columnName)
        })
        state.paramsOptions = [{
            action: "select",
            contents: {
                tableId: indexTableDesc.value.id,
                columns
            }
        }]
    } else if (type === 4) {
        state.paramsOptions[0] = data
        if (state.codeTypeList && state.codeTypeList.length > 0) {
            state.paramsOptions[1] = {
                realTableId: indexTableDesc.value.id,
                tableAlias: state.tableName,
                description: state.tableDesc,
                action: "setting",
                contents: (state.codeTypeList && state.codeTypeList.length > 0) ? state.codeTypeList.filter(item => item.isSelect) : ''
            }
        }
    }

    // 通过字段名判断是否含有同步字段 
    let hasAsyncColumn = !!state.codeTypeList?.some(it => 
        it.isSelect && syncAddColumns.value.includes(it.column)
    )

    // 有新增字段不调用预览接口
    if(hasAsyncColumn)  return

    // let columns = state.paramsOptions[0].contents?.columns
    // let contents = state.paramsOptions[1]?.contents

    // // 过滤新增同步字段
    // if(Array.isArray(columns)) {
    //     state.paramsOptions[0].contents.columns = columns.filter(column => !syncAddColumns.value.includes(column))
    // }
    // if(Array.isArray(contents)) {
    //     state.paramsOptions[1].contents = contents.filter(item => !syncAddColumns.value.includes(item.column))
    // }



    state.tableLoading = true
    getPreviewData(state.paramsOptions).then(res => {
        if (res.code == 1) {
            state.previewColumns = []
            state.previewData = []
            const columns = res.data.targetTableColumns
            const sortArr = res.data.columnNames
            for (let val in sortArr) {
                for (let key in columns) {
                    if (sortArr[val] == columns[key].columnName) {
                        columns[key].dataIndex = key
                        columns[key].imgType = getimgType(columns[key].columnType)
                        state.previewColumns.push(columns[key])
                    }
                }
            }
            state.previewData = res.data.queryResult || []
            state.tableLoading = false
        } else {
            state.previewColumns = []
            state.previewData = []
            state.tableLoading = false
            // message.error(t('otherConfig.getPreivewDataError'))
            message.error(res.message)
        }
        if (type === 'sensitive') {
            getPreviewSensitive()
        }
    })
}
// 返回
const goBack = () => {
    useMainStore.setPageId('pageTable')
}

// 改名
const rename = async (record) => {
    record.isRename = !record.isRename
    await nextTick()
    inputRef && inputRef.value.focus()
}

// 字段设置改变字段类型
const onSelect = (value, item, index) => {
    state.codeTypeList = []
    let obj = {}
    // if ((item.imgType == 'numImg' && (value.key == 'numeric' || value.key == 'bigint' )) || (item.imgType == 'textImg' && value.key == 'string') || (item.imgType == 'timeImg' && (value.key == 'date' || value.key == 'time' || value.key == 'datetime'))) {
    if (item.imgType == 'textImg' && value.key == 'string') {
        obj = {
            column: item.columnName,
            columnAlias: item.columnAlias,
            isSelect: item.isSelect
        }
    } else {
        obj = {
            column: item.columnName,
            columnAlias: item.columnAlias,
            targetFormat: value.key,
            isSelect: item.isSelect
        }
    }
    item.codeSetting = obj
    const targetIndex = state.codeTypeList.findIndex(i => i.column === item.columnName)
    if (targetIndex >= 0) {
        state.codeTypeList[targetIndex] = obj
    }
    indexBackTableColumns.value.forEach((info, i) => {
        if (info.codeSetting && i !== index) {
            state.codeTypeList.push(info.codeSetting)
        } else if (!info.codeSetting && i !== index){
            let o = {
                column: info.columnName,
                columnAlias: info.columnAlias,
                isSelect: info.isSelect
            }
            state.codeTypeList.push(o)
        }
        if (i === index) {
            state.codeTypeList.push(obj)
        }
    })
    let data = {
        realTableId: indexTableDesc.value.id,
        tableAlias: state.tableName,
        description: state.tableDesc,
        action: "setting",
        contents: (state.codeTypeList && state.codeTypeList.length > 0) ? state.codeTypeList.filter(item => item.isSelect) : ''
    }
    setParamsOptions(data, 2)
}

const selectAll = (type) => {
    state.codeTypeList = []
    let selectConfig = {}
    if (type === 1) {
        let columns = []
        indexBackTableColumns.value.forEach(item => {
            item.isSelect = true
            columns.push(item.columnName)
        })
        selectConfig = {
            action: "select",
            contents: {
                tableId: indexTableDesc.value.id,
                columns
            }
        }
    } else {
        let columns = []
        indexBackTableColumns.value.forEach(item => {
            if (!item.isPrimaryKey) {
                item.isSelect = false
            } else {
                item.isSelect = true
                columns.push(item.columnName)
            }
        })
        selectConfig = {
            action: "select",
            contents: {
                tableId: indexTableDesc.value.id,
                columns
            }
        }
    }
    indexBackTableColumns.value.forEach((info) => {
        if (info.codeSetting) {
            state.codeTypeList.push(info.codeSetting)
        } else if (!info.codeSetting){
            let o = {
                column: info.columnName,
                columnAlias: info.columnAlias,
                isSelect: info.isSelect
            }
            state.codeTypeList.push(o)
        }
    })
    setParamsOptions(selectConfig, 4)
}

const codeSelect = record => {
    record.isSelect = !record.isSelect
    state.codeTypeList = []
    let columns = []
    indexBackTableColumns.value.filter(item => {
        if (item.isSelect) {
            columns.push(item.columnName)
            return item
        }
    })
    indexBackTableColumns.value.forEach((info) => {
        if (info.codeSetting) {
            state.codeTypeList.push(info.codeSetting)
        } else if (!info.codeSetting){
            let o = {
                column: info.columnName,
                columnAlias: info.columnAlias,
                isSelect: info.isSelect
            }
            state.codeTypeList.push(o)
        }
    })
    const selectConfig = {
        action: "select",
        contents: {
            tableId: indexTableDesc.value.id, //表ID
            columns//用户选择的列名
        }
    }
    setParamsOptions(selectConfig, 4)
}

// 表单或审批
const isFormTable = computed(() => {
    return [1, 6].includes(editTableType?.value?.value)
})
// 是否为表单默认字段
const isFormField = (item) => {
    return isFormTable.value && FORM_FIELDS.includes(item.columnName)
}

const onSwitchSelect = (type) => {
    if (type === 2) {
        if (!formState.colCode || !formState.rowCode) return message.warn(t('indexPage.rowSwitchTip'))
    } else if (type === 1) {
        if (formState.accordCode) {
            if (!formState.colCode || !formState.rowCode) return message.warn(t('indexPage.rowSwitchTip'))
        } else {
            return
        }
    }
    const params = {
        action: 'transfer',
        contents: {
            tableId: indexTableDesc.value.id,//表ID
            colName: formState.colCode, // 列名称
            rowName: formState.rowCode,// 行名称
            valueName: formState.accordCode// 指标名称
        }
    }
    setParamsOptions(params, 2)
}

// 字段设置输入框失去焦点
const onIptBlur = record => {
    record.isRename = false
    state.codeTypeList = []
    indexBackTableColumns.value.forEach((info) => {
        if (info.codeSetting) {
            // 这有问题，导致进行格式转换的数据，无法再修改名称
            info.codeSetting.columnAlias = info.columnAlias
            state.codeTypeList.push(info.codeSetting)
        } else if (!info.codeSetting){
            let o = {
                column: info.columnName,
                columnAlias: info.columnAlias,
                isSelect: info.isSelect
            }
            state.codeTypeList.push(o)
        }
    })
    let data = {
        realTableId: indexTableDesc.value.id,
        tableAlias: state.tableName,
        description: state.tableDesc,
        action: "setting",
        contents: (state.codeTypeList && state.codeTypeList.length > 0) ? state.codeTypeList.filter(item => item.isSelect) : ''
    }
    setParamsOptions(data, 2)
}
// 字段设置排序
const dragEnd = (event) => {
    state.codeTypeList = []
    indexBackTableColumns.value.forEach((info) => {
        if (info.codeSetting) {
            state.codeTypeList.push(info.codeSetting)
        } else if (!info.codeSetting){
            let o = {
                column: info.columnName,
                columnAlias: info.columnAlias,
                isSelect: info.isSelect
            }
            state.codeTypeList.push(o)
        }
    })
    let data = {
        action: "setting",
        realTableId: indexTableDesc.value.id,
        tableAlias: state.tableName,
        description: state.tableDesc,
        contents: (state.codeTypeList && state.codeTypeList.length > 0) ? state.codeTypeList.filter(item => item.isSelect) : ''
    }
    setParamsOptions(data, 2)
}
// 对更新策略数据进行校验
const validateUpdateData = () => {
    if (updateConfig.updatePolicy === "FULL_UPDATE" || updateConfig.updatePolicy === "API_UPDATE_PULL" || updateConfig.updatePolicy === "API_INCR_APPEND") {
        if (!updateConfig.updateRate) {
             message.warn(t('api.validateRate'))
             return false
        }
        if (updateConfig.updatePolicy === "API_UPDATE_PULL" && !updateConfig.url) {
             message.warn(t('api.validateApiAddress'))
             return false
        }
        return true
    } else {
        return true
    }
}

const showModal = (record) => {
    setItem.value = record
    state.modalVisible = true
}

const modalCancel = () => {
    state.modalVisible = false
}

const modalConfirm = (data) => {
    const findIndex = state.previewColumns.findIndex(item => item.id === setItem.value.id)
    state.previewColumns[findIndex].sensitiveConfig = data.rule === 'none' ? { rule: 'none' } : data
    state.modalVisible = false
    getPreviewSensitive()
}

const getPreviewSensitive = () => {
    const jsonData = {
        columns: state.previewColumns.map(item => ({
            columnName: item.columnName,
            columnAlias: item.columnAlias,
            sensitiveConfig: item.sensitiveConfig || null
        })),
        table: {
            id: indexTableDesc.value.id
        }
    }
    previewSensitive(jsonData).then(res => {
        if (res.code === 1) {
            state.previewData = res.data || []
        }
    })
}

// 获取选中的同步字段
const getSyncColumns = () => {
    if(!Array.isArray(indexBackTableColumns.value)) return
    let addColumns = [], delColumns = []
    addColumns = syncColumns.addColumns.filter(item => 
        indexBackTableColumns.value.some(i => i.isSelect && i.columnName === item.columnName)
    )
    delColumns = syncColumns.delColumns.filter(item => 
        indexBackTableColumns.value.some(i => i.isSelect && i.columnName === item.columnName)
    )
    return {
        addColumns,
        delColumns
    }
}
const importFile = () => {
    if (state.operType === 0) {
        let params = {}
        if (state.paramsOptions.length > 1) {
            state.paramsOptions[1].updateSetting = {
                updatePolicy: updateConfig.updatePolicy,
                updateParams: updateConfig
            }
            params = state.paramsOptions[1]
        } else {
            params = {
                realTableId: indexTableDesc.value.id,
                tableAlias: state.tableName,
                description: state.tableDesc,
                action: "setting",
                contents: (state.codeTypeList && state.codeTypeList.length > 0) ? state.codeTypeList.filter(item => item.isSelect) : '',
                updateSetting: {
                    updatePolicy: updateConfig.updatePolicy
                }
            }
            // 会显示更新策略才传递updateParams
            if(showUPDATE.value){
                let updateParams = {
                    ...updateConfig,
                    selfConfigWhere: filterInfo.value
                }
                // 存在ref才会获取定时更新信息
                if(regularUpdateRef.value){
                    let uuid = regularUpdateRef.value.uuid
                    let regularUpdateInfo = useMainStore.getRegularUpdateInfo(uuid)
                    updateParams.timeExpression = regularUpdateInfo.cronStr
                }
                // 未开启部分更新
                if(!updateParams.partUpdate) {
                    updateParams.selfConfigWhere = undefined
                    updateParams.partUpdateStartValue = undefined
                    updateParams.partUpdateEndValue = undefined
                    updateParams.partUpdateColumn = undefined
                }
                params.updateSetting.updateParams = updateParams
            }
        }
        if (editTableType.value.value === 7) {
            if (!validateUpdateData()) return
            if (updateConfig.url && !isUrl(updateConfig.url)) return message.warn(t('api.apiAddressErrorTip'))
        }

        params = {
            ...params,
            ...getSyncColumns()
        }

        state.importLoading = true
        
        updateColumns(params).then(res => {
            if (res.code == 1) {
                // 同步了新字段 需要延迟加载
                params.addColumns?.length && useMainStore.setNeedTimeOut(true)
                useMainStore.setPageId('pageTable')
                const tabs = {
                    id: activeTabKey.value
                }
                message.success(res.message)
                if (editTableType.value.value === 7 && updateConfig.updatePolicy === 'API_UPDATE_PUSH') {
                    useMainStore.setDeleteData({
                        id: indexTableDesc.value.id
                    })
                    useModalStore.changeDownloadDoscModalVisible()
                }
                useMainStore.selectTabs(tabs)
            } else {
                message.error(res.message)
            }
            state.importLoading = false
        })
    } else if (state.operType === 1) {
        const tableProperties = {
            description: state.tableDesc,
            groupId: activeTabKey.value,
            tableAlias: state.tableName,
        }
        const data = {
            tableProperties,
            selfConfig: state.paramsOptions
        }
        state.importLoading = true
        importFlie(data).then(res => {
            if (res.code == 1) {
                useMainStore.setIndexTableActiveId('', activeTabKey.value, 'del')
                useMainStore.setPageId('pageTable')
                const tabs = {
                    id: activeTabKey.value
                }
                useMainStore.selectTabs(tabs, 'import')
                message.success(res.message)
            } else {
                message.error(t('otherConfig.operError'))
            }
            state.importLoading = false
        })
    } else if (state.operType === 2) {
        const params = {
            realTableId: indexTableDesc.value.id,
            tableAlias: state.tableName,
            description: state.tableDesc,
            exportDst: state.exportDst,
            action: "setting",
            contents: state.previewColumns.map(item => ({
                column: item.columnName,
                columnAlias: item.columnAlias,
                sensitiveConfig: item.sensitiveConfig || null
            }))
        }
        state.importLoading = true
        updateColumns(params).then(res => {
            if (res.code == 1) {
                useMainStore.setPageId('pageTable')
                const tabs = {
                    id: activeTabKey.value
                }
                message.success(res.message)
                useMainStore.selectTabs(tabs)
            } else {
                message.warn(res.message)
            }
            state.importLoading = false
        })
    }
}

const showPolicyToolitp = () => {
    if(!dataSourceIsDisabled.value && !dataSourceIsDeleted.value) return

    // 获取目标radio 无选中radio 默认选中第一个
    let checkedItem = document.querySelector('#updatePolicy .ant-radio-checked+span') || document.querySelector('#updatePolicy .ant-radio+span')
    let posInfo = checkedItem.getBoundingClientRect()

    if(document.querySelector('.popOverElm')) return

    let popOverElm = document.createElement('div')
    document.body.appendChild(popOverElm)
    popOverElm.classList.add('popoverWrap')
    popOverElm.classList.add('top')

    if(dataSourceIsDisabled.value) {
        popOverElm.innerText = '数据源已禁止'
    } else if(dataSourceIsDeleted.value) {
        popOverElm.innerText = '数据源已删除'
    }

    let offsetLeft = (checkedItem.clientWidth - popOverElm.clientWidth) / 2

    // 气泡箭头位置偏移量
    let popoverArrowOffset = {
        leftOffset: popOverElm.clientWidth / 2 - 4,
        topOffset: popOverElm.clientHeight / 2 - 4
    }

    popOverElm.style.left = posInfo.left + offsetLeft + 'px'
    popOverElm.style.top = posInfo.top - 45 + 'px'
    popOverElm.style.setProperty('--left-offset', popoverArrowOffset.leftOffset + 'px')
}

const hidePolicyToolitp = () => {
    let popOverElms = document.querySelectorAll('.popoverWrap')
    if(!popOverElms.length) return
    popOverElms.forEach(item => item.remove())
}

const showpartUpdate = computed(() => 
    {
        let showTypeArr = [3, 7]
        let tableType = indexTableDesc?.value?.tableType?.value
        let result =showTypeArr.includes(tableType)  && 
        updateConfig?.updatePolicy === 'FULL_UPDATE'
        return result
    }
)

// DB 增量更新文档下载
const downloadDBDoc = () => {
    updateDoc({
        newKey: uuidv4().split('-')[0], 
        tableName: indexTableDesc.value.tableName
    }).then((res) => {
        const link = document.createElement('a')
        let blob = new Blob([res], { type: 'text/plain' })
        link.href = URL.createObjectURL(blob)
        link.download = t('api.dbDOCName')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    })
}

// API 下载笔记
const downloadApiNote = async (type) => {
    if(updateConfig.updatePolicy !== type) return

    let downloadRes = null, downloadName = ''

    if(type === 'API_UPDATE_PUSH') {
        downloadRes = await updateDoc({
            id: indexTableDesc.value.id
        })
        downloadName = t('api.pushDocName')
    } else if(type === 'API_UPDATE_PULL') {
        downloadRes = await downloadPullNote({
            id: indexTableDesc.value.id,
        })
        downloadName = t('api.pullDocName')
    }
    
    if(!downloadRes) return message.error('下载失败')

    downloadBlobUtil(downloadRes, downloadName)
}

// db kafka 禁用实时更新
const realtimeDisalbed = computed(() => {
    return [3, 8].includes(editTableType.value.value)
})

// kafka 禁用不更新
const noneDisable = computed(() => {
    return [8].includes(editTableType.value.value)
})

const tooltipContent = computed(() => {
    let tableType = editTableType.value.value
    if(tableType === 3) {   // DB
        return '实时更新为日志流数据，只支持首次导入时选择'
    } else if (tableType === 8) {   // kafka
        return 'Kafka数据源默认为实时更新，不可修改'
    }
    return ''
})

// 数据源名称
const dataSourceName = computed(() => {
    let tableType = editTableType.value.value
    // db api 显示数据源
    if(![3, 7].includes(tableType)) return
    let sourceName = ''
    try{
        // db
        if(tableType === 3) {
            sourceName = JSON.parse(indexTableDesc.value.tableSource)?.dbInfo?.sourceName
        } else if(tableType === 7) {
            sourceName = JSON.parse(indexTableDesc.value.tableSource).apiName
        }
    } catch(e) {
        console.log('e', e)
    } finally {
        return sourceName
    }
})

// 查看数据源
const viewSource = () => {
    router.push({
        path: '/system/dataSourceManage',
        query: {
            sourceName: dataSourceName.value
        }
    })
}

const showDrawer = () => {
    drawerVisible.value = true
    fullDeleteInfo.timer = setInterval(() => {
        fullDeleteInfo.num -= 1
        if(fullDeleteInfo.num === 0) {
            fullDeleteInfo.hasConfirm = true
            clearTimeout(fullDeleteInfo.timer)
        }
    }, 1000)
}

const cancelFn = () => {
    drawerVisible.value = false
    fullDeleteInfo.hasConfirm = false
    fullDeleteInfo.num = 5
    clearInterval(fullDeleteInfo.timer)
    fullDeleteInfo.timer = null
}
</script>

<style lang="less" scoped>
.editPage {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    .editHead {
        width: 100%;
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

        .headBox {
            width: 100%;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;

            .add {
                .text {
                    height: 25px;
                    font-weight: 600;
                    font-size: 18px;
                    color: rgba(0, 0, 0, 0.8);
                    margin-bottom: 16px;
                }

                .iptGroup {
                    height: 32px;
                    display: flex;
                    align-items: center;
                    margin-bottom: 4px;
                    gap: 20px;

                    .textColor {
                        font-weight: 400;
                        font-size: 14px;
                        color: rgba(0, 0, 0, 0.8);
                    }

                    .text1 {
                        width: 52px;
                    }
                    .ipt1 {
                        width: 15.7vw;
                    }

                    .ipt2 {
                        width: 26.1vw;
                    }
                    .part_update, .update_reason{
                        display: flex;
                        align-items: center;
                        margin-right: 20px;
                        &>div{
                            position: relative;
                            bottom: 1px;
                            left: 2px;
                        }
                    }
                    .primarykeyWrap{
                        display: flex;
                        align-items: center;
                        margin-right: 20px;
                        &>div{
                            position: relative;
                            bottom: 1px;
                            left: 2px;
                        }
                    }
                    .selectPrimaryKey{
                        width: 240px;
                    }
                    .source-wrap{
                        color: #2b67ff;
                        background-color: #E8F2FF;
                        padding: 4px 8px;
                        display: flex;
                        align-items: center;
                        border-radius: 4px;
                        gap: 4px;
                        cursor: pointer;
                    }
                    .jumpIcon{
                        width: 13px;
                        height: 13px;
                        stroke: #2B67FF;
                    }
                }
                .formItemBody {
                    .iptGroup {
                        margin-top: 8px;
                        margin-bottom: 0px;
                    }
                    .policyRadio{
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        font-size: 14px;
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
                        .disabledDownload{
                            opacity: .5;
                            cursor: not-allowed;
                        }
                    } 

                    .ant-form-item {
                        margin-bottom: 0;
                    }

                    .row {
                        display: flex;
                        align-items: center;
                        .col2 {
                            height: 32px;
                            display: flex;
                            align-items: center;
                            margin-left: 20px;

                            .ml8mr20 {
                                margin-left: 8px;
                                margin-right: 20px;
                            }

                            .wid276 {
                                width: 276px;
                            }

                            .col3 {
                                display: flex;
                                align-items: center;
                                &>span{
                                    margin-right: 8px;
                                }
                            }

                            .editRate{
                                color: #2B67FF;
                                margin-left: 20px;
                                cursor: pointer;
                                display: inline-flex;
                                align-items: center;
                                gap: 2px;
                                &::before{
                                    content: '';
                                    display: inline-block;
                                    width: 14px;
                                    height: 14px;
                                    background: url(@/assets/icons/edit1.png) center/cover;
                                }
                            }
                        }
                    }

                    :deep(.ant-form-item-label>label) {
                        width: 78px;
                        &::after{
                            content: '';
                        }
                    }

                    .set-filter-info{
                        color: #2B67FF;
                        display: flex;
                        align-items: center;
                        gap: 2px;
                        margin-left: 20px;
                        cursor: pointer;
                        svg{
                            width: 14px;
                            height: 14px;
                        }
                    }
                }
            }

            .leftConfig {
                margin-top: 16px;
                margin-right: 16px;

                .update {
                    height: 20px;
                    display: flex;
                    align-items: center;
                    margin-top: 16px;
                    justify-content: flex end;

                    .text3 {
                        margin-left: 4px;
                    }
                }
            }
        }
        .incrUpdateWrap{
            display: flex;
            align-items: center;
            img{
                width: 15px;
                height: 15px;
                position: relative;
                top: 1px;
                right: -2px;
            }
        }
    }

    .codeSet {
        width: 100%;
        display: flex;
        gap: 12px;
        overflow: hidden;
        flex-grow: 1;

        .codeSelectWrap {
            background: #fff;
            padding: 12px 0;
            .chosenClass {
                border-bottom: 3px solid #3D82F2;;
            }

            .top-wrap {
                height: 20px;
                font-weight: 400;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.8);
                padding: 0 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .sync-wrap{
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    color: #2b67ff;
                    gap: 2px;
                    cursor: pointer;
                    svg{
                        width: 15px;
                        height: 15px;
                    }
                    &.disabled{
                        pointer-events: none;
                        opacity: .3;
                    }
                }
            }

            .search {
                width: 240PX;
                height: 46px;
                padding: 8px 12px;
                position: relative;

                input {
                    width: 216px;
                    height: 30px;
                }

                .sear {
                    width: 16px;
                    position: absolute;
                    top: 16px;
                    right: 22.6px;
                    cursor: pointer;
                }

                .clear {
                    position: absolute;
                    top: 15.5px;
                    right: 46.6px;
                    width: 16px;
                    cursor: pointer;
                }
            }

            .myTable {
                width: 100%;
                height: calc(100% - 76px);
                background-color: #fff;
                padding: 10px 8px 16px 12px;
                overflow-y: scroll;
                overflow-x: hidden;
                -ms-overflow-style: none;
                overflow: -moz-scrollbars-none;
                scrollbar-width: none;
                .check-img {
                    width: 16px;
                    height: 16px;
                    margin-right: 6px;
                    cursor: pointer;
                }
                table {
                    border-collapse: collapse;
                    border-spacing: 0;
                    width: fit-content;
                    table-layout: fixed;
                }

                thead tr {
                    td {
                        border: 1px solid #E0EBFF;
                        background: #ECF3FF;
                        height: 36px;
                        padding: 0px 8px;
                        line-height: 1;
                    }
                    th {
                        text-align: left;
                        border: 1px solid #E0EBFF;
                        background: #ECF3FF;
                        height: 36px;
                        padding: 0px 10px;
                        line-height: 1;
                        position: relative;
                        .th-flex{
                            display: flex;
                            align-items: center;
                        }
                        .resizerWrap {
                            position: absolute;
                            width: 4px;
                            height: 100%;
                            right: 0;
                            top: 0px;
                            .resizer{
                                display: none;
                                width: 100%;
                                height: 100%;
                                background-color: #2B67FF;
                            }
                            &:hover{
                                .resizer{
                                    display: inline-block;
                                    cursor: ew-resize;
                                }
                            }
                        }
                    }
                    :nth-child(3) {
                        border: none;
                        background: #fff;
                    }
                }

                .list-group-item {
                    height: 36px;

                    td {
                        height: 36px;
                        padding: 0px 8px;  
                        border: 1px solid #E0EBFF;

                        .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                            background-color: #fff !important;
                        }
                    }

                    :nth-child(3) {
                        border: none;
                        background: #fff;
                        padding: 0px 8px;
                    }

                    .code-icon {
                        width: 16px;
                        display: inline-block;
                        height: 16px;
                        line-height: 16px;
                        margin-right: 6px;
                        background: #FFECD6;
                        border-radius: 2px;
                        font-weight: 600;
                        color: #FF8900;
                        font-size: 11px;
                        text-align: center;
                        flex-shrink: 0;
                        &.del-code{
                            background-color: #FFE5E5;
                            color: #F53F3F;
                        }
                        &.add-code{
                            background-color: #E9F7E9;
                            color: #00A643;
                        }
                    }

                    .name {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        padding: 0 18px 0 0px;
                        position: relative;
                        &:hover{
                            .edit{
                                display: block;
                            }
                        }

                        span {
                            display: inline-block;
                            padding: 0;
                            font-size: 12px;
                            height: 28px;
                            line-height: 28px;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            cursor: pointer;
                            width: 100%;
                        }
                        .ipt {
                            height: 28px;
                            width: 75px;
                            background-color: #F3F3F3;
                            &:focus{
                                + .edit{
                                    display: none;
                                }
                            }
                        }
                        .edit{
                            width: 12px;
                            height: 12px;
                            cursor: pointer;
                            display: none;
                            position: absolute;
                            right: 8px;
                        }
                    }

                    .type {
                        padding: 0;
                        .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                            background-color: #fff !important;
                        }
                        :deep(.ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector){
                            color: rgba(0, 0, 0, 1);
                            cursor: default;
                        }
                    }

                    .handle {
                        img {
                            width: 8px;
                            height: 20px;
                        }

                        cursor: pointer;
                    }
                }
            }
            .myTable::-webkit-scrollbar {
                width: 0 !important;
            }
        }
        :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
            background-color: #fff !important;
            border: none;
        }
    }

    .switch-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex-grow: 1;
        overflow: hidden;
        .oper-header {
            height: 110px;
            overflow-y: scroll;
            background-color: #fff;
            padding: 12px 16px;
            flex-shrink: 0;
            .row-code {
                display: flex;
                align-items: center;
                .text {
                    color: rgba(0, 0, 0, 0.8);
                    font-weight: 400;
                    font-size: 14px;
                    width: 70px;
                }
            }
            .grid-box {
                display: grid;
                grid-template-columns: 70px auto;
                margin-top: 10px;
                .text {
                    color: rgba(0, 0, 0, 0.8);
                    font-weight: 400;
                    font-size: 14px;
                    width: 70px;
                }
                .plus {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    width: 102px;
                    height: 32px;
                    font-weight: 400;
                    font-size: 14px;
                    color: #3D82F2;
                    cursor: pointer;
                    margin-left: 18px;
                    img {
                        width: 14px;
                    }
                }
                .del {
                    width: 16px;
                    margin-left: 12px;
                    cursor: pointer;
                }
                .second-box {
                    display: flex;
                    flex-direction: column;
                    .select-item {
                        margin-bottom: 10px;
                    }
                }
            }
        }
    }

    .field-desensitization {
        width: 100%;
        display: flex;
        flex-grow: 1;
        overflow: hidden;
    }
}
</style>

<style lang="less">
.filter-drawer .ant-drawer-footer .bi-button.clear-all-btn {
    width: auto;
    margin-right: 24px;
    &.disabled{
        opacity: .3;
        pointer-events: none;
    }
}
</style>
