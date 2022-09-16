// componments/confirm/confirm.js
import { goTo } from "../../utils/navigate";
const publicFn = require("../../utils/public");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    borchureDetail: {
      type: Object,
      default: {},
    },
    isShow: {
      type: Boolean,
      default: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */

  methods: {
    enter: function () {
      let list = wx.getStorageSync("historyList") || [];
      console.log(this.properties.borchureDetail, list);
      list.unshift(this.properties.borchureDetail);
      list.length = list.length >= 5 ? 5 : list.length;
      wx.setStorageSync("historyList", list);
      console.log(this.properties.borchureDetail);
    },
    exit() {
      this.triggerEvent("changeMask");
    },
    move() {
      console.log("1");
    },
    confirmAr() {
      publicFn.Loading();
      let url = `https://ar-test-0824.obs.cn-east-3.myhuaweicloud.com/${this.properties.borchureDetail.bookCoverObsPath}${this.properties.borchureDetail.bookCoverObsName}`
      this.handleCamera()
        .then((res) => {
        //   wx.downloadFile({
            // url: "https:" + this.properties.borchureDetail.bookCover,
            // url:"https://wallpaper-static.cheetahfun.com/wallpaper/sites/hits/pic2.png",
            // url:url,
            // success: (res) => {
            //   console.log(res);
            //   let imgUrl = res.tempFilePath;
              wx.setStorageSync("imgUrl", url);
            console.log(this.properties.borchureDetail.projectCode)
              wx.setStorageSync("projectCode",this.properties.borchureDetail.projectCode);
              goTo("canvasAr", {
                projectCode: this.properties.borchureDetail.projectCode,
              });
            // },
        //   });
        })
        .catch((err) => {
          reject(err);
        });
    },
    handleCamera() {
      return new Promise((resolve, reject) => {
        wx.getSetting({
          success: (scope) => {
            if (scope.authSetting["scope.camera"]) {
              resolve();
            } else {
              wx.authorize({
                scope: "scope.camera",
                success: () => {
                  resolve();
                },
                fail: () => {
                  wx.showModal({
                    title: "", // 提示的标题,
                    content: "检测到您已拒绝摄像头授权，请先授权！", // 提示的内容,
                    showCancel: true, // 是否显示取消按钮,
                    cancelText: "取消", // 取消按钮的文字，默认为取消，最多 4 个字符,
                    cancelColor: "#000000", // 取消按钮的文字颜色,
                    confirmText: "去授权", // 确定按钮的文字，默认为取消，最多 4 个字符,
                    confirmColor: "#3CC51F", // 确定按钮的文字颜色,
                    success: (res) => {
                      if (res.confirm) {
                        wx.openSetting({
                          success: (res) => {
                            if (res.authSetting["scope.camera"]) {
                              return resolve();
                            }
                            reject(res);
                          },
                        });
                      } else if (res.cancel) {
                        reject(res);
                      }
                    },
                  });
                },
              });
            }
          },
          fail: (err) => {
            reject(err);
          },
        });
      });
    },
  },
});
