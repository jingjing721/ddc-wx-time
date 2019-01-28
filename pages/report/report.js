// pages/report/report.js
import * as utils from '../../utils/util.js'
const app = getApp();
let numCount = 5; //边个数  
let numSlot = 5; //网格个数
let mW = 375;
//x中心点
let mCenterX = mW / 2;   
let mCenterY = 475; //y中心点
//角度
let mAngle = Math.PI * 2 / numCount; 
let mRadius = mCenterX - 80; //半径(减去的值用于给绘制的文本留空间)
//获取Canvas
let ctx = wx.createCanvasContext("report-canvas");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    height:1150,  //页面高度
    backTop: 32, //返回按钮高度
    shareImg:'',   //长图路径
    resultData:[],//结果文案
    type:1,   //数据比拼分类 1=》两种情况都有  2=》两种都没有 3=》有饭搭子没有口味大比拼
    saveImgBtnHidden: true, // 保存相册
    openSettingBtnHidden: false, // 去授权
    toastShow: false, //是否显示 toast
    toastSrc: '',
    toastText: ''
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onLoad() {
    let model = wx.getSystemInfoSync().model.substring(0, wx.getSystemInfoSync().model.indexOf("X")) + "X";
    let w = wx.getSystemInfoSync().windowWidth;
    let h = wx.getSystemInfoSync().windowHeight
    if (model == 'iPhone X' || (w == 375 && h == 812) || (w == 414 && h == 896)) {
      this.setData({
        backTop: 54
      })
    }
    wx.showLoading({
      title: '',
    })
    this.getData();
  },
  //获取报告数据
  getData(){
    let data = {
      pageName:'生成报告'
    }
    app.http.$_post('getReport', data).then((res) => { //获取报告数据
      utils.setCache('hasReport', true);
      this.data.resultData =  res.data;
      let imageArray = [];   //头像
      console.log('-------pkAvatarUrl-------'+this.data.resultData.pkAvatarUrl)
      let myavatarUrl = utils.getCache('avatarUrl') || 'https://mcn-video.daydaycook.com.cn/4f4ea624af9e411f83d9ea155d8d9c87.png';
      imageArray.push(this.getImagePromiseArr(myavatarUrl));
      if (this.data.resultData.pkAvatarUrl){//PK对方头像 存在
        imageArray.push(this.getImagePromiseArr(this.data.resultData.pkAvatarUrl))
        if (this.data.resultData.users != null){// 饭搭子头像 存在
          this.data.resultData.users.map((item, index) => {
            if (item.avatarUrl !== null && item.avatarUrl !== '') {
              imageArray.push(this.getImagePromiseArr(item.avatarUrl))
            }
          })
          this.data.type = 1 //渲染类型  两种类型都存在
        }
      } else{ //PK对方头像不存在  
        if (this.data.resultData.users != null) {// 饭搭子头像 存在
          this.data.resultData.users.map((item, index) => {
            if (item.avatarUrl !== null || item.avatarUrl !== '') {
              imageArray.push(this.getImagePromiseArr(item.avatarUrl))
              this.data.type = 1 //渲染类型
            }
          })
          this.data.type = 3 //渲染类型  只有饭搭子类型存在
        }else{ //饭搭子头像  不存在
          this.data.type = 2 //渲染类型  两种类型都不存在
        }
      }
      imageArray.push(this.getImagePromiseArr(this.data.resultData.qrCode));
      Promise.all(imageArray).then((sucRes) => { 
        //背景图
        this.drawBg();
        //顶部
        this.drawTopCard(sucRes[0].tempFilePath);
        //中间 雷达图
        this.drawText();
        this.drawRadar();
        //PK 二维码
        if (this.data.type == 1) { //两种都有
          this.drawBottomBG(1);
          this.drawPK(sucRes[0].tempFilePath, sucRes[1].tempFilePath);
          this.drawFriend(0, sucRes.splice(2, sucRes.length - 3));
          this.drawCode(0, sucRes[sucRes.length - 1].tempFilePath);
        } else if (this.data.type == 2) { //两种都没有
          this.drawCode(282, sucRes[sucRes.length - 1].tempFilePath);
          this.data.height = 1150 - 282;
          this.setData({
            height: 1150 - 282
          })
        } else if (this.data.type == 3) {  //只有饭搭子
          this.drawBottomBG(3);
          this.drawFriend(120, sucRes.splice(1, sucRes.length-2));
          this.drawCode(120, sucRes[sucRes.length-1].tempFilePath);
          this.data.height = 1150 - 120;
          this.setData({
            height: 1150 - 120
          })
        }
        //开始绘制
        ctx.draw();
        wx.hideLoading();
        setTimeout(() => {
          this.saveImg();
        }, 500)
      }, () => {
        app.utils.showToast('图片资源获取失败, 请返回上一页重新拉取资源');
      })
    }).catch((res) => {
      app.utils.showToast(res);
    })
  },
  //绘背景图片
  drawBg(){ //纯色背景和背景图片叠加
    ctx.setFillStyle('#0E1A63')
    ctx.fillRect(0, 0, 375, 2000)
    ctx.drawImage('../../img/report_img_bg.jpg', 0, 0, 375, 667)
  },
  //绘制顶部
  drawTopCard(img){
    ctx.drawImage('../../img/report_img_card.png', 20, 95, 335, 124);
    this.drawCircular(img,163,70,50,50);
    ctx.setFillStyle("white")
    ctx.font = 'normal 25px Arial,PingFang SC,Hiragino Sans GB,Microsoft YaHei'  //设置字体
    ctx.fillText(this.data.resultData.summary, (375 - ctx.measureText(this.data.resultData.summary).width) / 2, 169)
  },
  //中间文案
  drawText(){
    ctx.drawImage('../../img/report_img_card2.png', 20, 219, 335, 385);
    ctx.setFillStyle("#474747")
    ctx.font = 'normal 14px Arial,PingFang SC,Hiragino Sans GB,Microsoft YaHei'  //设置字体
    ctx.fillText(this.data.resultData.nickName ||'', 40, 249)
    ctx.setFillStyle("#A5A4A4")
    ctx.fillText('可能是个',40, 277)
    ctx.fillText('总共吃了', 40, 297)
    ctx.fillText('最爱吃', 40, 317)
    ctx.setFillStyle("#FC477E")
    ctx.fillText(this.data.resultData.whereMan ||'', 96, 277)
    ctx.fillText(this.data.resultData.meatNum, 96, 297)
    let w = this.data.resultData.meatNum ? ctx.measureText(this.data.resultData.meatNum.toString()).width + 100 : 100;
    ctx.fillText('个菜', w, 297)
    ctx.fillText(this.data.resultData.favoriteFood, 82, 317)
  },
  // 雷达图
  drawRadar() {
    let sourceData = [['重口程度', this.data.resultData.mouthWeightScore], ['长肉程度', this.data.resultData.carnifyScore], ['丰富度', this.data.resultData.richScore], ['荤素搭配', this.data.resultData.meatVegetableScore], ['健康为先', this.data.resultData.healthScore]]
    //调用
    this.drawEdge() //画边
    this.drawLinePoint()
    //设置数据
    this.drawRegion(sourceData)
    //设置文本数据
    this.drawTextCans(sourceData)
    //设置节点
    this.drawCircle(sourceData, '#FC477E')
  },
  // 绘制边
  drawEdge() {
    ctx.setStrokeStyle("transparent")
    ctx.setLineWidth(0)  //设置线宽
    for (let i = 0; i < numSlot; i++) {
      //计算半径
      ctx.beginPath()
      let rdius = mRadius / numSlot * (i + 1)
      //画线段
      for (let j = 0; j < numCount; j++) {
        //坐标
        let x = mCenterX + rdius * Math.cos(mAngle * j + Math.PI / 3.3);
        let y = mCenterY + rdius * Math.sin(mAngle * j + Math.PI / 3.3);
        ctx.lineTo(x, y);
      }
      ctx.closePath()
      let grd = ctx.createLinearGradient(mCenterX - 100, mCenterY - 50, mCenterX - 100, mCenterY + 50)
      grd.addColorStop(0, 'rgba(167,167,167,0.13)')
      grd.addColorStop(1, 'rgba(216,216,216,0.13)')
      ctx.setFillStyle(grd)
      ctx.fill();
      ctx.setStrokeStyle('transparent')
      ctx.stroke();
    }
  },
  // 绘制连接点
  drawLinePoint() {
    ctx.beginPath();
    for (let k = 0; k < numCount; k++) {
      let x = mCenterX + mRadius * Math.cos(mAngle * k + Math.PI / 3.3);
      let y = mCenterY + mRadius * Math.sin(mAngle * k + Math.PI / 3.3);
      ctx.moveTo(mCenterX, mCenterY);
      ctx.lineTo(x, y);
    }
    ctx.closePath()
  },
  //绘制数据区域(数据和填充颜色)
  drawRegion(mData) {
    ctx.beginPath();
    for (let m = 0; m < numCount; m++) {
      let x = mCenterX + mRadius * Math.cos(mAngle * m + Math.PI / 3.3) * mData[m][1]/10 ;
      let y = mCenterY + mRadius * Math.sin(mAngle * m + Math.PI / 3.3) * mData[m][1]/10 ;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    let grd1 = ctx.createLinearGradient(mCenterX - 100, mCenterY - 50, mCenterX - 100, mCenterY + 50)
    grd1.addColorStop(0, 'rgba(252,71,126,1)')
    grd1.addColorStop(1, 'rgba(252,71,126,0.1)')
    ctx.setFillStyle(grd1)
    ctx.fill();
  },
  //绘制文字
  drawTextCans(mData) {
    ctx.setFillStyle("#A5A4A4")
    ctx.font = 'normal 12px Arial,PingFang SC,Hiragino Sans GB,Microsoft YaHei'  //设置字体
    for (var n = 0; n < numCount; n++) {
      var x = mCenterX + mRadius * Math.cos(mAngle * n + Math.PI / 3.3);
      var y = mCenterY + mRadius * Math.sin(mAngle * n + Math.PI / 3.3);
      //通过不同的位置，调整文本的显示位置
      if (mAngle * n >= 0 && mAngle * n <= Math.PI / 2) {
        ctx.fillText(mData[n][0], x - 10, y + 20);
      } else if (mAngle * n > Math.PI / 2 && mAngle * n <= Math.PI) {
        ctx.fillText(mData[n][0], x - ctx.measureText(mData[n][0]).width - 7, y + 5);
      } else if (mAngle * n > Math.PI && mAngle * n <= Math.PI * 3 / 2) {
        ctx.fillText(mData[n][0], x - ctx.measureText(mData[n][0]).width - 5, y - 8);
      } else {
        ctx.fillText(mData[n][0], x + 7, y + 2);
      }
    }
  },
  //画点
  drawCircle(mData, color) {
    let r = 2; //设置节点小圆点的半径
    for (let i = 0; i < numCount; i++) {
      let x = mCenterX + mRadius * Math.cos(mAngle * i + Math.PI / 3.3) * mData[i][1] / 10;
      let y = mCenterY + mRadius * Math.sin(mAngle * i + Math.PI / 3.3) * mData[i][1] / 10;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  },
  //底部背景图
  drawBottomBG(type){
    if(type==1){
      ctx.drawImage('../../img/report_img_card3.png', 20, 620, 335, 262);
    }else{
      ctx.drawImage('../../img/report_img_card5.png', 20, 620, 335, 134);
    }
  },
  //口味大比拼
  drawPK(img1,img2){
    ctx.drawImage('../../img/report_img_lc1.png', 20, 635, 335, 44);
    ctx.drawImage('../../img/report_img_kouweibg.png', 40, 688, 295, 39);
    this.drawCircular(img1, 42, 690, 35, 35);//最佳饭友头像
    this.drawCircular(img2, 300, 690, 35, 35);//口味不合头像
    ctx.setFillStyle("white")
    ctx.font = 'normal 14px Arial,PingFang SC,Hiragino Sans GB,Microsoft YaHei'
    ctx.fillText(this.data.resultData.myDescribe ||'', 80, 712);
    ctx.fillText(this.data.resultData.pkDescribe ||'', 212, 712);
  },
  //饭搭子
  drawFriend(h,arr){//饭搭子头像
    ctx.drawImage('../../img/report_img_lc2.png', 20, 755-h, 335, 44);
    arr.map((item,index)=>{
      this.drawCircular(item.tempFilePath, 41 + index*30, 815 - h, 35, 35);
    })
  },
  //绘制二维码
  drawCode(h,img){
    this.drawCircular(img, 143, 930-h, 90, 90);
    ctx.setFillStyle("#fff")
    ctx.fillText('扫码乘坐日日煮时光机', (375 - ctx.measureText('扫码乘坐日日煮时光机').width) / 2, 1040-h)
    ctx.drawImage('../../img/report_img_bottom.jpg', 0, 1066-h, 375, 88);
  },
  //绘制圆形头像
  drawCircular(url, x, y, w, h) {// url图片地址 xy两个参数确定了圆心 （x, y） 坐标  wh为图片宽高
    ctx.save();
    ctx.beginPath(); //开始绘制
    //先画个圆   
    ctx.arc(w / 2 + x, h / 2 + y, w / 2, 0, Math.PI * 2);
    ctx.clip();//画好了圆 剪切
    ctx.drawImage(url, x, y, w, h);  //网络图片需要先上传到微信服务器再进行渲染
    ctx.restore(); 
  },
  //对网络图片进行下载之后在绘制canvas imgSrc:图片路径地址
  getImagePromiseArr(imgSrc) {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: imgSrc,
        success: resolve,
        fail: function (res) {
          console.log(imgSrc+'---'+res)
          app.utils.showToast('图片资源获取失败, 请返回上一页重新拉取资源');
        }
      })
    })
  },
	//循环拉取微信服务端数据
  getImageInfo() {
    let promiseArr = []
    this.data.resultData.users.map((item) => {
      if (item.avatarUrl !== null) {
        promiseArr.push(this.getImagePromiseArr(item.avatarUrl))
      }
    })
    return promiseArr
  },
  //获取图片
  saveImg() {
    let that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 375,
      height: this.data.height,
      destWidth: 750,
      destHeight: this.data.height*2,
      fileType: 'jpg',
      canvasId: 'report-canvas',
      success: function (res) {
        // console.log(res.tempFilePath);
        that.setData({
          shareImg: res.tempFilePath
        })
        wx.hideToast();
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  //第一次保存相册
  canvasSave() {
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() { // 第一次 直接授权保存
              that.saveImageToPhotosAlbum();
            },
            fail() {
              that.setData({
                saveImgBtnHidden: false,
                openSettingBtnHidden: true
              })
            }
          })
        } else { // 拒绝授权之后 在授权执行保存
          that.saveImageToPhotosAlbum();
        }
      }
    })
  },
  //保存到相册  第二次
  saveImageToPhotosAlbum() {
    let that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.shareImg,
      success() {
        that.setData({
          toastSrc: '../../img/icon_sus.png',
          toastText: '保存成功，快去分享',
          toastShow: true
        })
        that.hideToast();
      },
      fail() {
        app.utils.showToast('保存失败')
      }
    })
  },
  //二次授权相册
  handleSetting(e) {
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '警告',
        content: '若不打开授权，则无法将图片保存在相册中！',
        showCancel: false
      })
      this.setData({
        saveImgBtnHidden: false,
        openSettingBtnHidden: true
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您已授权，赶紧将图片保存在相册中吧！',
        showCancel: false
      })
      this.setData({
        saveImgBtnHidden: true,
        openSettingBtnHidden: false
      })
    }
  },
  //隐藏Toast 提示
  hideToast() {
    setTimeout(() => {
      this.setData({
        toastShow: false
      })
    }, 1500)
  },
  //返回按钮
  backPage(){
    wx.navigateBack({ changed: true });//返回上一页
  },
  //触发分享
  onShareAppMessage(options){
    let that = this;
    let shareObj = {
      title: "邀请你来测口味", 
      path: '/pages/ddctime/ddctime?uid=' + utils.getCache('uid'),
      imageUrl: '',  //自定义图片路径
    }
    // 来自页面内的按钮的转发
  　if (options.from == 'button') {
      // var dataid = options.target.dataset; //data-id=shareBtn
    }
    return shareObj;
  },
  onReachBottom() {
  },
})