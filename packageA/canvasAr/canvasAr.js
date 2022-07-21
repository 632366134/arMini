// packageA/canvasAr/canvasAr.js
import {
    loading,
    throttle
} from '../../utils/decorator'
import $axios from '../../request/request'
const t = throttle(100)
Page({

    /**
     * 页面的初始数据
     */
    data: {
        title: '识别',
        load: false,
        time: 3000, // 未监听到摄像头初始化成功 自动执行
        cameraLoad: false,
        fetching: false, // 是否正在请求
        hideCamera: false,
        showLoading: false,
        showConfirm: true,
        showChoose: false,
        loadOne: true, // 只请求一次
        isUnload: false,
        ctx: null,
        ctxR: null,
        src: '',
        scaneData: {},
        preSrc: '',
        chooseInfo: {},
        finish: false,
        finishTimer: null,
        finishTime: 60,
        isShowScan: false,
        canvasWidth: "",
        canvasHeight: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.handleCamera().then(() => {
                this.finishTimer = setInterval(() => {
                    this.finishTime--
                    if (this.finishTime < 0) {
                        this.handleFinish()
                    }
                }, 1000)
                console.log('camera ok')
                // this.load = true
                setTimeout(() => {
                    if (!this.cameraLoad) {
                        console.log('load')
                        this.takePhoto()
                    }
                }, this.time)
            })
            .catch(() => {
                wx.navigateBack({
                    delta: 1
                })
            })
    },
    bindinitdone() {
        this.setData({
            isShowScan: true
        })
    },
    handleCamera() {
        return new Promise((resolve, reject) => {
            wx.getSetting({
                success: scope => {
                    if (scope.authSetting['scope.camera']) {
                        resolve()
                    } else {
                        wx.authorize({
                            scope: 'scope.camera',
                            success: () => {
                                resolve()
                            },
                            fail: () => {
                                wx.showModal({
                                    title: '', // 提示的标题,
                                    content: '检测到您已拒绝摄像头授权，请先授权！', // 提示的内容,
                                    showCancel: true, // 是否显示取消按钮,
                                    cancelText: '取消', // 取消按钮的文字，默认为取消，最多 4 个字符,
                                    cancelColor: '#000000', // 取消按钮的文字颜色,
                                    confirmText: '去授权', // 确定按钮的文字，默认为取消，最多 4 个字符,
                                    confirmColor: '#3CC51F', // 确定按钮的文字颜色,
                                    success: res => {
                                        if (res.confirm) {
                                            wx.openSetting({
                                                success: res => {
                                                    if (res.authSetting['scope.camera']) {
                                                        return resolve()
                                                    }
                                                    reject(res)
                                                }
                                            })
                                        } else if (res.cancel) {
                                            reject(res)
                                        }
                                    }
                                })
                            }
                        })
                    }
                },
                fail: (err) => {
                    reject(err)
                }
            })
        })
    },
    handleFinish() {
        this.finish = true
        this.showConfirm = false
        this.handleChoose()
    },
    takePhoto() {
        this.fetching = false
        if (this.finish) {
            return
        }
        this.initCamera()
        try {
            this.ctxR =
                this.ctxR ||
                this.ctx.onCameraFrame((res) => {
                    this.ctxR.stop()
                    // setTimeout(async () => {
                    //     if (res.data) {
                    //         if (!this.fetching && this.loadOne) {
                    //             this.loadOne = false
                    //             console.log(res.width, 'width')
                    //             try {
                    //                 let base64 =
                    //                     await this.changeDataToBase64(res)
                    //                 this.handleLoad(base64)
                    //             } catch (error) {
                    //                 console.error(error)
                    //             }
                    //         }
                    //     }
                    // }, 3000)
                    t(async () => {
                        if (res.data) {
                            if (!this.fetching) {
                                console.log(res.width, 'width')
                                this.setData({
                                    canvasWidth: res.width,
                                    canvasHeight: res.height
                                })
                                try {
                                    let base64 =
                                        await this.changeDataToBase64(res)
                                    this.handleLoad(base64)
                                } catch (error) {
                                    console.error(error)
                                }
                            }
                        }
                    })
                })
            this.ctxR.start()
        } catch (error) {
            console.error(error)
            // setTimeout(() => {
            //     this.takePhoto()
            // }, 1000)
        }
    },
    initCamera() {
        this.ctx = this.ctx || wx.createCameraContext()
    },
    changeDataToBase64(frame) {
        return new Promise((resolve, reject) => {
            try {
                let data = new Uint8Array(frame.data)
                let clamped = new Uint8ClampedArray(data)
                let that = this
                wx.canvasPutImageData({
                    canvasId: 'myCanvas',
                    x: 0,
                    y: 0,
                    width: frame.width,
                    height: frame.height,
                    data: clamped,
                    success() {
                        console.log('绘制成功')
                        wx.canvasToTempFilePath({
                                x: 0,
                                y: 0,
                                width: frame.width,
                                height: frame.height,
                                canvasId: 'myCanvas',
                                fileType: 'jpg',
                                destWidth: frame.width,
                                destHeight: frame.height,
                                // 精度修改
                                quality: 0.8,
                                success(res) {
                                    // 临时文件转base64
                                    console.log(
                                        res.tempFilePath,
                                        '开始转换'
                                    )
                                    wx.getFileSystemManager().readFile({
                                        filePath: res.tempFilePath, // 选择图片返回的相对路径
                                        encoding: 'base64', // 编码格式
                                        success: (res) => {
                                            resolve(res.data)
                                        },
                                        fail(err) {
                                            reject(err)
                                        }
                                    })
                                },
                                fail(err) {
                                    reject(err)
                                }
                            },
                            that
                        )
                    },
                    fail(err) {
                        console.log('err', err)
                        reject(err)
                    }
                })
            } catch (error) {
                console.error(error)
            }
        })
    },
    handleLoad(base64) {
        console.log('handleload')
        this.fetching = true
        this.ctxR && this.ctxR.stop() // 停止监听
        // return this.handleRes({
        //     result: [{ score: 0.6, cont_sign: '1482636155,3438652507' }]
        // })
        setTimeout(() => {
            $axios({
                    url: 'bd/imageSearch',
                    ip: 'https://www.arsnowslide.com/arOpenWeb/',
                    noCode: true,
                    isShowToast: false,
                    data: {
                        queryContent: 'data:image/png;base64,' + base64
                    }
                })
                .then((res) => {
                    this.handleRes(res)
                })
                .catch((err) => {
                    console.log('err:', err)
                    this.takePhoto()
                    // this.showConfirm = false
                    // this.handleChoose()
                })
        }, 500)
    },
    handleRes(res) {
        console.log('res:', res)
        this.scaneData = {}
        if (this.isUnload) {
            // 由于定时器原因 可能销回之后还会走接口
            return
        }
        if (res.result) {
            res.result.sort((a, b) => b.score - a.score)
            console.log('本次识别精准度排序之后:', res)
            let data = res.result[0]
            if (data && data.score >= 0.6) {
                this.scaneData = data
                this.handleSuccess()
            } else if (data && data.score >= 0.4 && data.score < 0.6) {
                this.scaneData = data
                this.takePhoto()
                // this.showConfirm = true
                // this.handleChoose(data)
            } else {
                // this.showConfirm = false
                // this.handleChoose(data)
                this.takePhoto()
            }
        } else {
            this.takePhoto()
            // this.showConfirm = false
            // this.handleChoose()
        }
    },
    handleSuccess() {
        let data = this.scaneData
        this.ctxR && this.ctxR.stop()
        wx.vibrateShort({
            type: 'light'
        })
        loading(() => {
            return this.fetchInfo(data.cont_sign)
                .then(() => {
                    this.resetFinish()
                    wx.redirectTo({
                        url: '/pages/opencvWebview/index'
                        // url: '/three/pages/chooseType/index'
                    })
                })
                .catch(() => {
                    this.showConfirm = false
                    this.showChoose = true
                })
        })
    },
    fetchInfo(cloudTargetId) {
        return $axios({
            url: 'resource/selBasePicByCid',
            data: {
                cloudTargetId: cloudTargetId
            }
        }).then((res) => {
            console.log('图片信息res:', res)
            if (res.code === 1000 && res.data && res.data.basePic) {
                wx.setStorageSync('basePicInfo', res.data)
                return res.data
            }
            return Promise.reject(res)
        })
    },
    resetFinish() {
        clearInterval(this.finishTimer)
        this.finishTime = 60
        this.finish = false
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        console.log('onUnload')
        this.setData({
            isShowScan: false,
            canvasWidth: 0,
            canvasHeight: 0
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})