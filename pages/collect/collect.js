// pages/collect/collect.js
import { navigateBack, goTo } from "../../utils/navigate";
const publicFn  = require('../../utils/public')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    compList: [],
    listIndex: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.data.list = wx.getStorageSync("list");
    // let collect = wx.getStorageSync("collect");
    // let compList = this.data.list.unshift(collect)
    this.setData({
      compList:this.data.list,
    });
    publicFn.LoadingOff()

  },
  select(e) {
    let listIndex = e.detail;
    this.setData({
      listIndex,
    });
  },
  goCollect() {
    publicFn.Loading()
      if(!this.data.listIndex) {
        publicFn.Toast('请选择宣传册','error')
        return
      }
    let index = this.data.list.findIndex(
      (item) => item.id === this.data.listIndex
    );
    wx.setStorageSync('collect', this.data.list[index])
    // let a = this.data.list.splice(index, 1);
    // this.data.list.unshift(a[0]);
    // this.setData({
    //   compList:this.data.list,
    // });
    // wx.setStorageSync("list", this.data.list);
    publicFn.Toast('收藏成功！','success')
    navigateBack("index");
  },
  goCollectSearch() {
    publicFn.Loading()
    goTo("collectSearch");
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

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
