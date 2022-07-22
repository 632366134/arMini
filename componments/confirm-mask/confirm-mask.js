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
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    exit() {
      this.triggerEvent("changeMask");
    },
    confirmAr() {
      publicFn.Loading();
      this.handleCamera()
        .then((res) => {
          wx.navigateTo({ url: "/packageA/canvasAr/canvasAr" });
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
