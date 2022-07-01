// pages/searchList/searchList.js
const { API } = require("../../utils/request.js");
import { navigateBack } from "../../utils/navigate";
const publicFn = require("../../utils/public");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    listIndex: null,
    totalList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({ param }) {
    this.data.list = JSON.parse(param).list;
    this.setData({ list:this.data.list });
    this.data.totalList = wx.getStorageSync("list");
  },
  select({ detail }) {
    this.setData({
      listIndex: detail,
    });
  },
  goCollect() {
    if (!this.data.listIndex) {
      publicFn.Toast("请选择宣传册", "error");
      return;
    }
    let index = this.data.totalList.findIndex(
      (item) => item.id === this.data.listIndex
    );
    let a = this.data.totalList.splice(index, 1);
    this.data.totalList.unshift(a[0]);
    this.setData({
      totalList: this.data.totalList,
    });
    wx.setStorageSync("list", this.data.totalList);
    publicFn.Toast("收藏成功！", "success");
    navigateBack("index");
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
