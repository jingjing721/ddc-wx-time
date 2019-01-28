// pages/page2/page2.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: 0, //页面高度
    scrollTop:0, //初始滚动条
    backTop:32, //返回按钮高度
    btnFlag:false, //按钮flag
    inpValue:'', //输入框value
    tabFlag:false, //tab吸顶
    scrollFlag:false, //滚动开关
    currentTab:0,//tab切换索引
    windowWidth:0,
    itemHeight:92, // 每个选项的高度
    list:[],//原始菜谱数据
    classiy: [], //菜谱分类数据
    length: [], //每个分类的高度
    select: [], //选择的菜品
    toastShow: false, //是否显示 toast
    toastSrc:'',
    toastText:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showToast({
      title: '',
      icon: 'loading'
    })
    wx.hideShareMenu();
    this.data.windowWidth = wx.getSystemInfoSync().windowWidth;
    let model = wx.getSystemInfoSync().model.substring(0, wx.getSystemInfoSync().model.indexOf("X")) + "X";
    let w = wx.getSystemInfoSync().windowWidth;
    let h = wx.getSystemInfoSync().windowHeight
    if (model == 'iPhone X' || (w == 375 && h == 812) || (w == 414 && h == 896)) {
      this.setData({
        backTop: 54
      })
    }
    this.setData({
      height: wx.getSystemInfoSync().windowHeight    // 获取当前窗口的高度
    })
    this.getData();
  },
  //获取菜谱数据
  getData(){
    let data = {
      pageName: '年度总结菜谱'
    }
    app.http.$_post('getCookBook', data).then((res) => { 
      wx.hideToast();
      this.data.list = res.data;
      let list = res.data;
      list.map((item, index) => {
        if (index == 0) {  //增加标识，滑动改变样式
          item.actFlag = true;
        } else {
          item.actFlag = false;
        }
        this.data.classiy.push(item);
        let l = item.dishes.length;
        let itemH = Math.ceil(l / 3) * this.data.itemHeight + 138;//计算每一个类型对应的高度
        this.data.length.push(itemH)
        let classiyIndex = index;
        item.dishes.map((item, index) => {
          item.flag = false;
          item.index = classiyIndex;
        })
      })
      this.setData({
        classiy: this.data.classiy,
        list: this.data.list
      })
    })
  },
  //tab切换
  clickTap(e){
    let index = e.target.dataset.index; //当前索引值
    let scrollTop = 262;//初始顶部的高度
    for(let i=0;i<index;i++){//计算应该滚动的高度
      if(index==0){
        return 
      }else{
        scrollTop += this.data.length[i]
      } 
    }
    // console.log(scrollTop)
    this.setData({
      currentTab: index,
      scrollTop: scrollTop
    })
  },
  //菜品选择
  selectDish(e){
    let i = e.currentTarget.dataset.classiy;
    let j = e.currentTarget.dataset.index
    if (this.data.list[i].dishes[j].flag){//使用flag标志判断是否选中
      this.data.list[i].dishes[j].flag = false;
    }else{
      this.data.list[i].dishes[j].flag = true
    }
    let list = this.data.list;
    this.data.select = [];  //选中的数据
    list.map((item, index) => {
      item.dishes.map((item, index) => {
        if (item.flag){
          this.data.select.push(item.id);
        }
      })
    })
    this.setData({
      list: this.data.list,
    })
    this.setBtnClass()
  },
  //监听滚动 
  scroll(e) {
    let scrollTop = (750 * e.detail.scrollTop) / this.data.windowWidth + 300; //滚动高度
    if (scrollTop >= 530 ){//滚动距离高于顶部的高度时出现吸顶tab
      this.setData({
        tabFlag: true
      })
    }else{
      this.setData({
        tabFlag: false
      })
    }
    // console.log(scrollTop)
    if (scrollTop >= 0 && scrollTop <= this.countH(0)){//根据滚动距离改变tab状态
      this.setData({
        currentTab: 0
      })
    } else if (scrollTop > this.countH(0) && scrollTop <= this.countH(1)){
      this.setData({
        currentTab: 1
      })
    } else if (scrollTop >= this.countH(1) && scrollTop < this.countH(2)) {
      this.setData({
        currentTab: 2
      })
    } else if (scrollTop >= this.countH(2) && scrollTop < this.countH(3)) {
      this.setData({
        currentTab: 3
      })
    } else if (scrollTop >= this.countH(3) && scrollTop < this.countH(4)) {
      this.setData({
        currentTab: 4
      })
    } else if (scrollTop >= this.countH(4) && scrollTop < this.countH(5)) {
      this.setData({
        currentTab: 5
      })
    }
  },
  //计算高度
  countH(n){
    if(n==0){
      return 540 + this.data.length[n]
    }
    return this.countH(n - 1) + this.data.length[n]
  },
  //输入框失去焦点
  bindinput(e){
    this.data.inpValue = e.detail.value;
    this.setBtnClass()
  },
  //提交
  submit(e){
    let formId = e.detail.formId || '';
    if (app.utils.getCache('hasReport') == true) {//若已经生产报告 则直接跳转到报告页面
      app.utils.navigateTo('../report/report');
    }else{
      if (!this.data.btnFlag) {//用户没有选择菜品 也没有填写菜品  不能提交
        this.setData({
          toastSrc: '../../img/zt_icon_notice.png',
          toastText: '千挑万选，总有一款你吃过',
          toastShow: true
        })
        this.hideToast();
      } else {//可提交数据
        if (this.data.select.length == 0 && this.data.inpValue) {
          this.setData({
            toastSrc: '',
            toastText: '品味真独特',
            toastShow: true
          })
        } else {
          this.setData({
            toastSrc: '',
            toastText: '今年吃得不错嘛，明年继续哦',
            toastShow: true
          })
        }
        this.hideToast();
        setTimeout(() => {
          let data = {
            pageName: '年度总结菜谱',
            ids: this.data.select.join(','),
            ownerFood: this.data.inpValue,
            formId: formId
          }
          app.http.$_post('clickNext', data).then((res) => {
            app.utils.navigateTo('../report/report');
          }).catch((res)=>{
            app.utils.showToast(res);
          })
        }, 1000)
      }
    }
  },
  //隐藏Toast 提示
  hideToast() {
    setTimeout(() => {
      this.setData({
        toastShow: false
      })
    },1500)
  },
  //监听按钮
  setBtnClass(){
    if (this.data.select.length || this.data.inpValue) { //选中有数据 并且 输入框有值 时按钮可提交
      this.data.btnFlag = true;
    } else {
      this.data.btnFlag = false
    }
    this.setData({
      btnFlag: this.data.btnFlag
    })
  },
  //返回上一页
  backPage(){
    wx.navigateBack({ changed: true });//返回上一页
  }
})