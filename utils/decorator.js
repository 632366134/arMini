/**
 * loading
 * @param {*} fun
 * @returns
 */
export const loading = async (fun) => {
    try {
        wx.showLoading({
            title: '',
            mask: true
        })
        let result = await fun()
        wx.hideLoading()
        return result
    } catch (error) {
        wx.hideLoading()
        console.log(error)
    }
}

/**
 * 节流
 * time时间内只执行一次
 * @param {*} fun
 */
export const throttle = (time = 30) => {
    let nowTime
    return (fun) => {
        let currentTime = new Date().getTime()
        if (!nowTime || currentTime - nowTime >= time) {
            nowTime = currentTime
            return fun()
        }
    }
}

/**
 * 防抖
 * time时间过后只执行一次 如果期间重复执行 将延长时间
 * @param {}} time
 * @returns
 */
export const debounce = (time = 30) => {
    let timer
    return (fun) => {
        if (timer) {
            clearTimeout(timer)
        }
        return new Promise((resolve) => {
            timer = setTimeout(() => {
                resolve(fun())
            }, time)
        })
    }
}

/**
 * 防抖加节流
 * time1时间之后会立即执行 time2时间只执行一次
 * 可以用于带有输入框的提交功能 防止失焦时没有拿全数据
 * time1 + 1000内 连续点击只执行一次
 * @param {*} time1
 * @param {*} time2
 */
export const deAndT = (time1 = 30, time2 = 100) => {
    let timer, t = throttle(time2), d = debounce(time1 + 1000)
    return (fun) => {
        return new Promise((resolve, reject) => {
            try {
                if (!timer) {
                    timer = setTimeout(() => {
                        resolve(t(fun))
                    }, time1)
                }
                d(() => {
                    clearTimeout(timer)
                    timer = null
                })
            } catch (error) {
                console.log(error)
                reject(error)
            }
        })
    }
}

// eslint-disable-next-line no-use-before-define
const dt = dt || deAndT(100, 1000)
/**
 * 防抖节流加loading
 * @param {*} fun
 */
export const dtl = (fun) => {
    dt(() => {
        loading(fun)
    })
}
