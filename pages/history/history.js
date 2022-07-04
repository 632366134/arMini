// pages/history/history.js
const publicFn = require("../../utils/public");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    title:'历史记录',
    isMask:false,
    borchureDetail:{}
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    publicFn.LoadingOff();
    let list = wx.getStorageSync("list");
    this.setData({
      list,
    });
  },
  gopriview({ currentTarget }) {
      console.log(currentTarget)
    this.setData({
      isMask: true,
      borchureDetail: currentTarget.dataset.item,
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
