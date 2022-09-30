/**
 *
 * 权限判断
 * @param {*} url 请求地址
 */
function getSessionStr(url) {
    return url
}

export default function ({
    data,
    ip = 'https://wxminiapp.arsnowslide.com/wxMiniAppWeb/',
    type = 'POST',
    url,
    header = {
        'content-type': 'application/json;charset=UTF-8'
    },
    dataType = 'json',
    responseType = 'text',
    isShowToast = true,
    noCode = false
}) {
    return new Promise((resolve, reject) => {
        url = getSessionStr(url)
        wx.request({
            url: ip + url, // 开发者服务器接口地址",
            data: data, // 请求的参数",
            method: type,
            header,
            dataType, // 如果设为json，会尝试对返回的数据做一次 JSON.parse
            responseType,
            success: res => {
                if (res.statusCode === 200) {
                    if (res.data.code === 1000 || noCode) {
                        resolve(res.data)
                    } else if (res.data.code === 1006) {
                        if (isShowToast) {
                            wx.showToast({
                                title: res.data.message,
                                icon: 'none',
                                duration: 2000,
                                mask: true
                            })
                        }
                        reject(res.data)
                    } else {
                        reject(res.data)
                    }
                } else {
                    if (isShowToast) {
                        wx.showToast({
                            title: '请求失败', // 提示的内容,
                            icon: 'none', // 图标,
                            duration: 1000, // 延迟时间,
                            mask: true
                        })
                    }
                    reject(res)
                }
            },
            fail: (error) => {
                if (isShowToast) {
                    wx.showToast({
                        title: '请求失败', // 提示的内容,
                        icon: 'none', // 图标,
                        duration: 1000, // 延迟时间,
                        mask: true
                    })
                }
                reject(error)
            }
        })
    })
}
