```js
// tableColumns列表里需提供dataIndex以匹配tableData里的字段结构； eg：
const tableColumns = [{
    id: '001',
    columnAlias: '课程名称',
    dataIndex: 'course'
},{
    id: '002',
    columnAlias: '教师',
    dataIndex: 'teacher'
}]
const tableData = [{
    course: "道德的力量",
    teacher: '王涛',
    yuanxi: '工商管理学院',
    time: '2022-02-05',
    pv: '20%',
    fangwenliang: 4512,
    ziyuanshu: 4265,
    charater: 6561,
    sport: '412adasdadad'
}]
```