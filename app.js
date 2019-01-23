//app.js
import * as http from 'utils/http.js'
import * as utils from 'utils/util.js'
App({
  onLaunch: function () {
    // 登录
    wx.login({
      success: res => {
        http.$_post('getOpenId', { jsCode: res.code }).then(({ data }) => {
          utils.setCache('openid', data.openid)
          utils.setCache('sessionKey', data.session_key)
        })
      }
    })
    //判断是否过期
    wx.checkSession({
      success() {
        // 操作分享过来数据
        // console.log('session_key 未过期');
      },
      fail() {
        wx.login() // 重新登录
      }
    })
  }
})