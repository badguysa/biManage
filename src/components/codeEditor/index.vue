<template>
    <Codemirror
        v-model:value="code"
        :placeholder="placeholder"
        :options="cmOptions"
        :height="100"
        @ready="onReady"
        @blur="onBlur"
        @change="onChange"
    />
</template>

<script>
import { ref, watch, h, onMounted, computed, nextTick } from 'vue'
import Codemirror from 'codemirror-editor-vue3'

import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/lib/codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/search'
import 'codemirror/addon/display/placeholder'
import 'codemirror/addon/hint/javascript-hint'
import 'codemirror/addon/hint/anyword-hint'
import { message } from 'ant-design-vue'

export default {
    components: { Codemirror },
    props: {
        placeholder: {
            default: ''
        },
        fromFlag: {
            type: String,
            default: ''
        },
        contentConfig: {    // 回显内容
            type: Array,
            default: []
        },
        codeList: { // 回显字段列表
            type: Array,
            default: []
        }
    },
    setup(props, context) {
        // 自定义函数相关内容
        const customFunc = ref(null)
        // 不是自定义函数
        const isNotCustom = ref(null)
        // 编辑器内容
        const code = ref('')
        // 编辑器实例
        const cminstance = ref('')

        // 存储字段信息
        let fieldItems = ref([])

        let codeContent = ref('')

        onMounted(async () => {
            await nextTick()
            // 是否需要回显内容
            if(isEdit.value){
                let config = props.contentConfig[0]
                if(config.customData){                   
                    customFunc.value = config.customData
                    isNotCustom.value = false
                }else{
                    isNotCustom.value = true
                }
                echoContent(config)
            }
        })

        // 是否为编辑状态
        const isEdit = computed(() => {
            return !!props.contentConfig.length
        })

        // 回显表达式
        const echoContent = (config) => {
            let { expression, params } = config
            let doc = cminstance.value.doc

            let columnReg = /\${.*?}/g
            let methodReg = /[a-zA-Z_]{2,}/g
            
            let filedIndex = 0

            doc.setValue(expression)

            // 支持回显多行公式
            doc.getValue().split('\n').forEach((line, lineIndex) => {
                line.replace(columnReg, (match, index) => {
                    let startPos = {line: lineIndex, ch: index}
                    let endPos = {line: lineIndex, ch: index + match.length}
                    let spanEl = document.createElement('span')
                    let columnName = params[filedIndex++].content
                    let val = props.codeList.find(it => it.columnName === columnName)?.columnAlias
                    spanEl.innerText = val || columnName
                    spanEl.className = 'cm-filedname'
                    spanEl.setAttribute('columnName', columnName)
                    // 插入字符标记
                    doc.markText(startPos, endPos, {
                        handleMouseEvents: true, // 响应鼠标事件
                        atomic: true, // 将标记文本视为一个整体
                        replacedWith: spanEl,
                    })
                })
                line.replace(methodReg, (match, index) => {
                    let startPos = {line: lineIndex, ch: index}
                    let endPos = {line: lineIndex, ch: index + match.length}
                    let spanEl = document.createElement('span')
                    spanEl.innerText = match
                    spanEl.className = 'cm-methodname'
                    // 插入字符标记
                    doc.markText(startPos, endPos, {
                        handleMouseEvents: true, // 响应鼠标事件
                        atomic: true, // 将标记文本视为一个整体
                        replacedWith: spanEl,
                    })
                })
            })

            doc.setCursor(expression.length)
        }

        const onReady = (cm) => {
            // 获取编辑器实例对象
            cminstance.value = cm
            // 聚焦光标
            cminstance.value?.focus()

            // 点击时 展示待选项
            // cminstance.value.on('keypress', () => {
            //     cminstance.value.showHint({ completeSingle: false })
            // })
        }
        const onBlur = () => {
            if (props.fromFlag === 'apiParams') {
                context.emit('getEditorText', document.querySelector('.CodeMirror-code').children[0]?.childNodes[0]?.childNodes)
            }
        }
        const onChange = (value, cm) => {
            // 手动更新code
            code.value = value
            // 聚焦光标
            cminstance.value?.focus()
            // 定位光标至行尾
            // cminstance.value.setCursor(cminstance.value.lineCount(), 0)
            if (props.fromFlag === 'apiParams') {
                resolveApiEditorData()
                context.emit('getEditorParams', fieldItems.value)
            }
            // context.emit('getEditorRule', value)
        }

        // 判断光标是否在行尾
        const judgeCursorInLineEnd = (doc) => {
            let cursor = doc.getCursor()
            // 当前光标位置
            let posCh = cursor.ch
            // 当前函数
            let lineNum = cursor.line
            // 当前行字符数
            let currentLineCh = doc.getLine(lineNum).length

            return posCh === currentLineCh
        }

        // 解析表达式数据
        const resolveExpressionData = () => {
            let lineEls = document.querySelectorAll('.CodeMirror-code>.CodeMirror-line')
            let goalText = ''
            // 避免与api筛选占位符索引冲突 暂定从300开始
            let pIndex = 300
            lineEls.forEach((lineEl, index) => {
                // 克隆编辑器dom元素
                let copyEl = lineEl.cloneNode(1)
                let copyWidgetEls = copyEl.querySelectorAll('.cm-filedname')
                let copyWidgetEls1 = copyEl.querySelectorAll('.cm-tablename')

                codeContent.value += copyEl.innerText
                // 修改每个字段dom元素的innerText
                ;[...copyWidgetEls].forEach((item) => {
                    pIndex++
                    item.innerText = '${p' + pIndex + '}'
                })

                ;[...copyWidgetEls1].forEach((item, index) => {
                    item.innerText = item.getAttribute('tableName')
                })
                // 去除零宽字符
                copyEl.innerText = copyEl.innerText.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s/g, ' ')
                // 多行公式 行尾拼接换行符
                if(index !== lineEls.length - 1) {
                    goalText+=copyEl.innerText.trim() + ' \n '
                } else {
                    goalText+=copyEl.innerText.trim()
                }
            })
            // 返回目标格式数据 CONCAT(${p1},${p2})
            return goalText
        }

        // 解析编辑器数据
        const resolveEditorData = () => {
            // 获取编辑器所有子节点
            let widgetEls = document.querySelectorAll('.CodeMirror-widget>span')

            // 解析字段格式
            let columnItems = [...widgetEls]
                .filter((item) => item.className === 'cm-filedname')
                .map((item) => {
                    // 通过字段名称columnName 匹配目标字段
                    let targetItem = fieldItems.value.find((target) => target.columnName === item.getAttribute('columnName'))

                    if(!targetItem) {
                        targetItem = props.codeList.find((target) => target.columnName === item.getAttribute('columnName'))
                    }

                    return {
                        type: 'column',
                        content: targetItem?.columnName || '',
                    }
                })

            // 解析表达式
            let expression = resolveExpressionData()

            let result = {
                expression,
                params: columnItems,
            }

            if(customFunc.value){
                result.customData = customFunc.value
            }

            return result

        }

        // 解析API编辑器数据
        const resolveApiEditorData = () => {
            // 获取编辑器所有子节点
            let widgetEls = document.querySelectorAll('.CodeMirror-widget>span')
            // 解析字段格式
            let columnItems = [...widgetEls]
                .filter((item) => item.className === 'cm-filedname')
                .map((item) => {
                    let targetItem = fieldItems.value.find((target) => target.uuid === item.getAttribute('apiUid'))
                    return targetItem
                })
            fieldItems.value = columnItems.filter(i => i)
        }

        // 删除编辑器中的节点
        const removeEditorNode = (uuid) => {
            let widgetEls = document.querySelectorAll('.CodeMirror-widget>span')
            let columnItems
            [...widgetEls]
            .filter((item) => item.className === 'cm-filedname')
            .forEach((item) => {
                if (item.getAttribute('apiUid') === uuid) {
                    columnItems = item
                }
            })
            fieldItems.value = fieldItems.value.filter(i => i.uuid !== uuid)
            columnItems.parentNode.remove()
            columnItems.remove()
        }

        // 更新编辑器内容
        const updateEditorText = (type, info,dataRef = null) => {           
            let value = ''
            if (type === 'field') {
                value = info.columnAlias || info.columnName
                fieldItems.value.push(info)
            } else if (type === 'apifield') {
                value = info.value
                const uuids = fieldItems.value.map(i => i.uuid)
                if (uuids.includes(info.uuid)) return
                fieldItems.value.push(info)
            } else if (type === 'table') {
                value = info.tableAlias
            } else {
                value = info
            }

            // 获取codemirror文档对象
            let doc = cminstance.value.doc

            let cursor = doc.getCursor()

            // 获取光标起始位置
            let startPos = { line: cursor.line, ch: cursor.ch }
            // 计算光标结束位置
            let endPos = { line: startPos.line, ch: startPos.ch + String(value).length }
            // 已经有自定义函数的情况下不允许输入其他函数
            let methodList = ['ROW_NUMBER() OVER(ORDER BY )','orderBy','caseWhen','method']
            if(customFunc.value && methodList.includes(type)){
                message.warning('正则函数只能单独使用')
                return;
            }
            // 已经有其他函数的情况下不允许输入自定义函数
            if(isNotCustom.value && type === 'CUSTOM'){
                message.warning('正则函数只能单独使用')
                return;
            }
            // 光标当前位置插入字符
            doc.replaceRange(String(value), startPos, startPos)

            // 创建dom元素
            let spanEl = document.createElement('span')

            // 插入内容为字段 高亮显示
            if (type === 'field' || type === 'apifield') {
                spanEl.className = 'cm-filedname'
            }

            spanEl.innerText = value

            // 设置字段名称
            spanEl.setAttribute('columnName', info.columnName)

            if (type === 'apifield') {
                spanEl.setAttribute('apiUid', info.uuid)
            }

            
            if (type === 'CUSTOM') {
                spanEl.className = 'cm-methodname'
                // 插入内容为方法 单独添加括号
                doc.replaceSelection('()')
                // 将光标移入括号中间
                cursor = doc.getCursor()
                cminstance.value.setCursor(cursor.line, cursor.ch - 1)
                cminstance.value.focus()
                customFunc.value = dataRef
                isNotCustom.value = true
            }

            if (type === 'method') {
                spanEl.className = 'cm-methodname'
                // 插入内容为方法 单独添加括号
                doc.replaceSelection('()')
                // 将光标移入括号中间
                cursor = doc.getCursor()
                cminstance.value.setCursor(cursor.line, cursor.ch - 1)
                cminstance.value.focus()
                isNotCustom.value = true
            }
            if (type === 'orderBy') {
                spanEl.className = 'cm-methodname'
                if (value ==' )') {
                    // 将光标移入括号中间
                    cursor = doc.getCursor()
                    cminstance.value.setCursor(cursor.line, cursor.ch - 2)
                    cminstance.value.focus()
                }
                isNotCustom.value = true
            }
            if (type === 'caseWhen') {
                spanEl.className = 'cm-methodname'
                isNotCustom.value = true
            }

            if (type === 'table') {
                spanEl.className = 'cm-tablename'
                spanEl.setAttribute('tableName', info.tableName)
                isNotCustom.value = true
            }

            // 插入字符标记
            doc.markText(startPos, endPos, {
                handleMouseEvents: true, // 响应鼠标事件
                atomic: true, // 将标记文本视为一个整体
                replacedWith: spanEl,
            })
        }

        /**
        1. 第一个入参cmInstance指的是codeMirror实例，第二个是配置中的的hintOptions值。
        2. 从cmInstance中getCursor指的是获取光标实例，光标实例里有行数、列数。
        3. 可以从cmInstance的getLine方法里传入一个行数，从而获取行中的字符串。
        4. token对象是cmInstance对光标所在字符串进行提取处理，从对应语言的类库中判断光标所在字符串的类型，方便hint提示。token中包含start、end、string、type等属性，start和end指的是光标所在字符串在这一行的起始位置和结束位置，string是提取的字符串，type表示该字符串是什么类型（keyword/operator/string等等不定）
        5. 下面方法中返回的结果体意思是：下拉列表中展示hello和world两行提示，from和to表示当用户选择了提示内容后，这些提示内容要替换编辑区域的哪个字符串。方法中的代码含义是替换token全部字符串。
        */
        const handleShowHint = (cmInstance, hintOptions) => {
            let cursor = cmInstance.getCursor()
            let cursorLine = cmInstance.getLine(cursor.line)
            let end = cursor.ch
            let start = end

            let token = cmInstance.getTokenAt(cursor)
            // return hintOptions.tables;
            return {
                list: ['hello', 'world'],
                from: { ch: token.start, line: cursor.line },
                to: { ch: token.end, line: cursor.line },
            }
        }

        return {
            code,
            codeContent,
            cmOptions: {
                // mode: 'text/javascript',
                theme: 'default', // 主题
                lineNumbers: false, // 显示行号
                lineWrapping: true, // 是否换行
                smartIndent: true, // 智能缩进
                indentUnit: 2, // 智能缩进单位为4个空格长度
                foldGutter: true, // 启用行槽中的代码折叠
                styleActiveLine: true, // 显示选中行的样式
                viewportMargin: Infinity, // 尝试让尽可能多的行可见
                // readOnly: true, // 是否只读
                // hintOptions: {
                //     completeSingle: false,
                //     hint: handleShowHint,
                // },
            },
            onChange,
            onReady,
            updateEditorText,
            resolveEditorData,
            removeEditorNode,
            onBlur,
        }
    },
}
</script>

<style lang="less">
.CodeMirror {
    background-color: #f3f3f3;
    border-radius: 4px;
    padding: 8px 12px;
}
.codemirror-container:not(.original-style) .CodeMirror-lines .CodeMirror-placeholder.CodeMirror-line-like {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.2);
}
// .CodeMirror-widget{
//     color: #3685f2;
// }
.cm-methodname {
    color: #ff00c7;
    margin: 0 2px;
}
.cm-filedname {
    color: #2400ff;
    margin: 0 2px;
}
.cm-tablename {
    color: #2aac50;
    margin: 0 2px;
}
.CodeMirror-scroll {
    padding-bottom: 15px;
}
</style>
