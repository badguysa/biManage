self.addEventListener('message', (e) => {
    const { data } = e
    const serachList = JSON.parse(data[0])
    const treeList = JSON.parse(data[1])
    const searchValue = data[2]
    let height = 1
    serachList.forEach(item => {
        treeList.forEach(treeItem => {
            if (treeItem.id === item.groupId) {
                item.tableAlias = item.tableAlias.replaceAll(searchValue, `<span style="color: #2B67FF;">${searchValue}</span>`)
                treeItem.chlidren = [...treeItem.chlidren, item]
                height = height + 43
            }
            if (treeItem.subList.length) {
                treeItem.subList.forEach(subItem => {
                    if (subItem.id === item.groupId) {
                        subItem.chlidren = [...subItem.chlidren, item]
                        item.tableAlias = item.tableAlias.replaceAll(searchValue, `<span style="color: #2B67FF;">${searchValue}</span>`)
                    }
                })
            }
        })
    })
    let tempArray = []
    treeList.forEach(item => {
        item.newSubList = []
        if (item.subList.length) {
            item.subList.forEach(citem => {
                if (citem.chlidren.length) {
                    height = height + 43
                    item.newSubList = [...item.newSubList, citem]
                }
            })
        }
        if (item.newSubList.length || item.chlidren.length) {
            tempArray.push(item)
        }
    })
    self.postMessage({
        list: tempArray,
        height: height
    })
})