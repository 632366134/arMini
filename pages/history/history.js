// pages/history/history.js
const publicFn = require("../../utils/public");
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    title: "历史记录",
    isMask: false,
    borchureDetail: {},
    animationSelected: {},
    animationNoSelected: {},
    currentBannerIndex:0,
    isIPhoneX: app.isIPhoneX,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    publicFn.LoadingOff();

  },

  handleChangeBanner(e) {
    this.setData({
      currentBannerIndex: e.detail.current,
    });
    console.log(this.data.currentBannerIndex)
    this.enlarge();
    this.shrink();
  },
  enlarge() {
    console.log('enlarge')

    let animationSelected = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
    });
    animationSelected.scale(1, 1).step();
    this.setData({
      animationSelected: animationSelected.export(),
    });
  },
  shrink() {
      console.log('shrink')
    let animationNoSelected = wx.createAnimation({
        duration: 500,
      timingFunction: "ease",
    });
    animationNoSelected.scale(0.95,0.95).step();
    this.setData({
      animationNoSelected: animationNoSelected.export(),
    });
  },

  gopriview({ currentTarget }) {
    console.log(currentTarget);
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
  onShow() {
    let list = wx.getStorageSync('historyList')
    console.log(list)
    this.setData({
      list,
    });
        this.enlarge();
        this.shrink();
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
