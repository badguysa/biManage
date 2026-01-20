import { BiRequest as request } from '@/utils/http'

// 获取血缘关系
// tableType 固定传 0
export const getBloodRelation = (tableId, tableType) => {
    const jsonData = {
        url: `/biapi/relation/${tableType}/${tableId}`,
    }
    return request(jsonData)
}

// 获取目标表字段关系列
export const getTargetRelctionCol = (tableId) => {
    const jsonData = {
        url: `/biapi/relation/refs/target/${tableId}`,
    }
    return request(jsonData)
}