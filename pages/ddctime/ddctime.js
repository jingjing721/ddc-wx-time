// pages/ddctime/ddctime.js
import * as http from '../../utils/http.js'
import * as utils from '../../utils/util.js'
const app = getApp();
app.http = http
app.utils = utils
Page({
  /**
   * 页面的初始数据
   */
  data: {
    height: wx.getSystemInfoSync().windowHeight,
    bottom: 450,
    otherOpenId:'',//分享携带的参数
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let w = wx.getSystemInfoSync().windowWidth;
    let h = wx.getSystemInfoSync().windowHeight
    let model = wx.getSystemInfoSync().model.substring(0, wx.getSystemInfoSync().model.indexOf("X")) + "X";
    if (model == 'iPhone X' || (w == 375 && h == 812) || (w == 414 && h == 896)){
      this.setData({
        bottom: 530
      })
    }
    wx.hideShareMenu();
    //判断微信基础库版本
    let version = wx.getSystemInfoSync().SDKVersion.replace(/\./g, "");
    let scene = decodeURIComponent(options.scene)
    if (scene != 'undefined'){
      this.data.otherOpenId = scene;
    }else{
      this.data.otherOpenId = options.uid ? options.uid:'';
    }
    this.setData({//样式-重新给页面高度
      height: wx.getSystemInfoSync().windowHeight
    })
    console.log('------otherOpenId------'+this.data.otherOpenId)
    if (parseInt(version) < 250 && app.utils.getCache('versionFlag') != true) {
      wx.showModal({
        title: '小贴士',
        content: '系统检测到您的微信版本过低，为了不影响体验，请尽快升级到最新版本',
        showCancel: false,
        confirmText: '我知道啦',
        success(res) {
          app.utils.setCache('versionFlag', true);
        }
      })
    }
    
  },

  //首页按钮
  bindNext(e){
    wx.showToast({
      title: '',
      icon: 'loading'
    })
    const openid = app.utils.getCache('openid');
    if (openid && e.detail.userInfo) {
      let userInfo = e.detail.userInfo
      let data = {
        pageName: '首页',
        nickName: userInfo.nickName,
        gender: userInfo.gender,
        language: userInfo.language,
        city: userInfo.city,
        province: userInfo.province,
        avatarUrl: userInfo.avatarUrl,
        otherOpenId: this.data.otherOpenId //options过来的uid
      }
      if (app.utils.getCache('hasReport') == true) {//若已经生产报告 则直接跳转到报告页面
        app.utils.navigateTo('../report/report');
      }else{
        app.http.$_post('putUserInfo', data).then((res) => { //生成uid 和小程序二维码qrCode
          wx.hideToast();
          app.utils.setCache('uid', res.data.uid);
          app.utils.setCache('qrCode', res.data.qrCode);
          app.utils.setCache('userInfo', e.detail.userInfo);
          app.utils.setCache('avatarUrl', e.detail.userInfo.avatarUrl);
          app.utils.navigateTo('../page2/page2');
        })
      }
    }  
  },
  //出发分享
  onShareAppMessage(options) {
    let that = this;
    let shareObj = {
      title: "日日煮味蕾时光机", // 默认是小程序的名称
      path: '/pages/ddctime/ddctime',  // 默认是当前页面，必须是以‘/’开头的完整路径
      imageUrl: '../../img/share.jpg',  //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，不传入则使用默认截图。显示图片长宽比是 5:4
    }
    return shareObj;
  },
  onShareAppMessage: function () {

  }
})