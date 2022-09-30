// pages/searchList/searchList.js
const { API } = require("../../utils/request.js");
import { navigateBack } from "../../utils/navigate";
const publicFn = require("../../utils/public");
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    projectDetail: {},
    isMask:false,
    borchureDetail:{},
    isIPhoneX: app.isIPhoneX,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({ param }) {
    this.data.list = JSON.parse(param).list;
    this.setData({ list:this.data.list });
  },
  select({detail}) {
    this.setData({
        isMask: true,
        borchureDetail: detail,
      });
   
  },
  changeMask() {
    this.setData({
      isMask: false,
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    publicFn.LoadingOff();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
