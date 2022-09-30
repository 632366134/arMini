// pages/collect/collect.js
import { goTo } from "../../utils/navigate";
const publicFn = require("../../utils/public");
const { API } = require('../../utils/request.js')
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    compList: [],
    inputValue: "",
    list:[],
    isIPhoneX: app.isIPhoneX,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    let list;
    list = wx.getStorageSync("list");
    if (list.length == 0) {
      let data = {
        pagination: "1",
        pageNum: "5",
        page: "1",
        projectName: "",
        userCode: "",
      };
      list = await API.selProjects(data);
      await wx.setStorageSync("list", list);
    }
    this.setData({list})
  },
  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.detail.value,
    });
  },
  goSearch() {
    publicFn.Loading();
    let inputValue = this.data.inputValue;
    if (!inputValue) {
      publicFn.Toast("请正确输入", "error");
      return;
    }
    let compList = this.data.compList;
    compList.unshift(inputValue);
    if (compList.length > 5) {
      compList.pop();
    }
    this.setData({
      compList,
    });
    wx.setStorageSync("compList", compList);
    this.filterProjectName(inputValue);
  },
  goSearch2(e) {
    publicFn.Loading();
    let inputValue = e.detail.currentTarget?.dataset.value;
    this.filterProjectName(inputValue);
  },
  filterProjectName(inputValue) {
    let list = this.data.list.filter((item) => item.projectName.includes(inputValue));
    if (list.length === 0) {
      publicFn.Toast("没有符合的结果！", "error");
      this.setData({
        inputValue: "",
      });
      return;
    }
    goTo("compSearchList", { list });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      compList: wx.getStorageSync("compList") || [],
    });
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
