import { BiRequest as request } from '@/utils/http'

const getTemplateList = params => {
    const jsonData = {
        url: '/biapi/restemplate/list',
        params
    }
    return request(jsonData)
}

const getDetailTemplate = params => {
    const jsonData = {
        url: '/biapi/restemplate',
        params
    }
    return request(jsonData)
}

const getTempReviewRes = id => {
    return request({
        url: `/biapi/restemplate/${id}/preview`,
        method: 'post',
        data: {}
    })
}

const createTemplate = data => {
    const jsonData = {
        url: '/biapi/restemplate',
        method: 'post',
        data
    }
    return request(jsonData)
}

const editTemplate = data => {
    const jsonData = {
        url: '/biapi/restemplate',
        method: 'put',
        data
    }
    return request(jsonData)
}

const deleteTemplate = params => {
    const jsonData = {
        url: '/biapi/restemplate',
        method: 'delete',
        params
    }
    return request(jsonData)
}

const getTmplGroup = (params) => {
    const jsonData = {
        url: '/biapi/template-group/list',
        params
    }
    return request(jsonData)
}

const getTmplInfoById = (params) => {
    const jsonData = {
        url: '/biapi/template-group',
        params
    }
    return request(jsonData)
}

const createTmplGroup = (data) => {
    const jsonData = {
        url: '/biapi/template-group',
        data,
        method: 'post'
    }
    return request(jsonData)
}

const editTmplGroup = (data) => {
    const jsonData = {
        url: '/biapi/template-group',
        data,
        method: 'put'
    }
    return request(jsonData)
}


const deleteTmplGroup = (params) => {
    const jsonData = {
        url: '/biapi/template-group',
        params,
        method: 'delete'
    }
    return request(jsonData)
}

export {
    getTemplateList,
    getDetailTemplate,
    getTempReviewRes,
    createTemplate,
    editTemplate,
    deleteTemplate,
    getTmplGroup,
    getTmplInfoById,
    createTmplGroup,
    editTmplGroup,
    deleteTmplGroup
}