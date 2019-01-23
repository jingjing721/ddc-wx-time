/*
 * Description: 对象转可拼接参数。 url: 跳转的URL；params: 对象形式的参数
 * Types：url -> String; params -> Object
 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
 * Date: 2019/1/8
 */
export function navigateTo(url, params) {
	url += (url.indexOf("?") != -1) ? "" : "?";
	for(var i in params) {
		url += ((url.indexOf("=") != -1) ? "&" : "") + i + "=" + params[i];
	}
	wx.navigateTo({
		url
	})
}

/*
 * Description: showToast提醒。 title: 提醒的文字；timer: 可选设置时间
 * Types：title -> String; timer -> number
 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
 * Date: 2019/1/8
 */
export function showToast(title, timer) {
	wx.showToast({
		title: title || '请添加提示',
		icon: 'none',
		duration: timer || 2000
	})
}

/*
 * Description: 深度拷贝。data: 拷贝的对象
 * Types：data -> Object
 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
 * Date: 2019/1/8
 */
export function deepCopy(data) {
	if (typeof data === 'object') {
		return JSON.parse(JSON.stringify(data))
	}
}

/*
 * Description: 设置缓存 key: 设置key值; data: 设置value值
 * Types： key -> String, data -> String || Object
 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
 * Date: 2019/1/10
 */
export function setCache(key, data) {
	wx.setStorageSync(key, data);
}

/*
 * Description: 读取缓存 key: 读取key值
 * Types：key -> String
 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
 * Date: 2019/1/10
 */
export function getCache(key) {
	return wx.getStorageSync(key)
}

//截取参数
export function getQueryString(_url, name){
  var search = '?' + _url;
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = search == "" ? null : decodeURIComponent(search).substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}
export default {
	navigateTo,
	showToast,
	deepCopy,
	setCache,
	getCache,
  getQueryString
}