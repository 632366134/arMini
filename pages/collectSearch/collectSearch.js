// pages/collect/collect.js
import { goTo } from "../../utils/navigate";
const publicFn = require("../../utils/public");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    compList: [],
    inputValue: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {},
  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.value,
    });
  },
  goSearch() {
    publicFn.Loading();
    let inputValue = this.data.inputValue;
    if(!inputValue)  {
        publicFn.Toast('请正确输入','error')
        return
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
  goSearch2({ currentTarget }) {
    publicFn.Loading();
    let inputValue = currentTarget?.dataset.value;
    this.filterProjectName(inputValue);
  },
  filterProjectName(inputValue) {
    let list = wx.getStorageSync("list");
    list = list.filter((item) => item.projectName.includes(inputValue));
    if(list.length ===0) {
        publicFn.Toast('没有符合的结果！','error')
        this.setData({
            inputValue:''
        })
        return
    }
    goTo("searchList", { list });
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
