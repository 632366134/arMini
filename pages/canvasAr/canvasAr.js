// packageA/canvasAr/canvasAr.js
import { throttle } from "../../utils/decorator";
const t = throttle(500);
import getBehavior from "../../pages/canvasAr/behavior";
import yuvBehavior from "../../pages/canvasAr/yuvBehavior";
const { API } = require("../../utils/request");
// import getWebgl from "../../pages/canvasAr/webgl";
const app = getApp();

const NEAR = 0.001;
const FAR = 1000;
// const jpeg = require("jpeg-js");

Component({
  behaviors: [getBehavior(), yuvBehavior],
  data: {
    isIPhoneX: app.isIPhoneX,
    isShowScan: false,
    theme: "light",
    imgUrl: "",
    percentLine: 50,
    projectCode: "",
  },
  lifetimes: {
    /**
     * 生命周期函数--监听页面加载
     */
    detached() {
      console.log("页面detached");
      if (wx.offThemeChange) {
        wx.offThemeChange();
      }
    },
    async ready() {
      let projectCode = wx.getStorageSync("projectCode");
      let data = { projectCode };
      let mediaList = await API.selMediaApps(data);
      let obsUrl, mediaUrl;
      mediaList.mediaList.forEach((value, index) => {
        switch (value.mediaType) {
          case 1:
            obsUrl = value.mediaUrl;
            break;
          case 3:
            mediaUrl = value.mediaUrl;
            break;
          case 4:
            mediaUrl = value.mediaUrl;
            break;
          case 5:
            mediaUrl = value.mediaUrl;
            break;
          case 6:
            mediaUrl = value.mediaUrl;
            break;
          case 7:
            mediaUrl = value.mediaUrl;
            break;
          case 9:
            mediaUrl = value.mediaUrl;
            break;
          default:
            break;
        }
      });
      if (!obsUrl) return;
      wx.downloadFile({
        url: "https:" + obsUrl,
        // url: "https://ar-test-0824.obs.cn-east-3.myhuaweicloud.com/animal.png",
        success: (res) => {
          let imgUrl = res.tempFilePath;
          let type;
          if (
            mediaUrl.slice(mediaUrl.lastIndexOf(".") + 1) === "jpg" ||
            mediaUrl.slice(mediaUrl.lastIndexOf(".") + 1) === "png"
          ) {
            type = "png";
          } else {
            type = mediaUrl.slice(mediaUrl.lastIndexOf(".") + 1);
          }
          this.setData({
            theme: wx.getSystemInfoSync().theme || "light",
            imgUrl,
            mediaUrl: "https:" + mediaUrl,
            type,
          });
          console.log(imgUrl,this.data.type, this.data.mediaUrl);
          this.onReady2();
          if (wx.onThemeChange) {
            wx.onThemeChange(({ theme }) => {
              this.setData({ theme });
            });
          }
        },
      });
    },
  },
  methods: {
    init() {
      this.initGL();
    },

    render(frame) {
      this.renderGL(frame);
      const camera = frame.camera;

      //   相机
      if (camera) {
        this.camera.matrixAutoUpdate = false;
        this.camera.matrixWorldInverse.fromArray(camera.viewMatrix);
        // this.camera.matrixWorld.getInverse(this.camera.matrixWorldInverse);
        this.camera.matrixWorld.copy(this.camera.matrixWorldInverse).invert();
        const projectionMatrix = camera.getProjectionMatrix(NEAR, FAR);
        this.camera.projectionMatrix.fromArray(projectionMatrix);
        // this.camera.projectionMatrixInverse.getInverse(
        //   this.camera.projectionMatrix
        // );
        this.camera.projectionMatrixInverse
          .copy(this.camera.projectionMatrix)
          .invert();
      }

      // 更新动画
      this.updateAnimation();
      this.renderer.autoClearColor = false;
      this.renderer.render(this.scene, this.camera);
      this.renderer.state.setCullFace(this.THREE.CullFaceNone);
    },
    addMarker() {
      if (this.markerId) return;
      const fs = wx.getFileSystemManager();
      // 此处如果为jpeg,则后缀名也需要改成对应后缀
      // const filePath = `${wx.env.USER_DATA_PATH}/marker-ar.map`
      const filePath = `${wx.env.USER_DATA_PATH}/marker-ar.jpeg`;
      //   const download = (callback) =>
      //     wx.downloadFile({
      //       // 此处设置为识别的3d对象的map地址
      //       // url: 'http://dldir1.qq.com/weixin/checkresupdate/coco_bad_autov2_41add464411f40279704b6cffe660a1c.map',
      //       // url: 'http://dldir1.qq.com/weixin/checkresupdate/marker1_7d97094792854249a860640e985a743c.jpeg',
      //       url: this.data.imgUrl,
      //       success(res) {
      //         fs.saveFile({
      //           filePath,
      //           tempFilePath: res.tempFilePath,
      //           success: callback,
      //         });
      //         // console.log("[addMarker] --> ", this.data.imgUrl);
      //         console.log("[addMarker] --> ", res.tempFilePath);
      //       },
      //     });

      const download = (callback) => {
        fs.saveFile({
          filePath,
          tempFilePath: this.data.imgUrl,
          success: callback,
          fail: (res) => {
            console.error(res);
          },
        });
      };
      const add = () => {
        console.log("[addMarker] --> ", filePath);
        this.markerId = this.session.addMarker(filePath);
        this.setData({
          filePathNow: filePath,
        });
      };

      const getFilePathNow = () => {
        return this.data.filePathNow;
      };
      fs.stat({
        path: filePath,
        success(res) {
          let path = getFilePathNow();
          if (path != filePath) {
            if (res.stats.isFile() && path) {
              fs.unlinkSync(path);
            }
            download(add);
          } else {
            add();
          }
        },
        fail: (res) => {
          console.error(res);
          download(add);
        },
      });
    },
  },
});
