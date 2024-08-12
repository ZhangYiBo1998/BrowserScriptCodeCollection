// ==UserScript==
// @name         页面生命周期&路由监听
// @namespace    http://tampermonkey.net/
// @version      2024-08-08
// @description  try to take over the world!
// @author       zhangyibo
// @match        https://*/*
// @match        http://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
(function () {
  'use strict';

  // Your code here...
  const {navigation} = window;

  // 页面生命周期和路由监听类
  class PageLifecycle {
    #timeId = null;

    // 构造函数，初始化页面生命周期和路由监听
    constructor() {
      this.#init();
      this.#initNavigation();
    }

    //#region 初始化页面生命周期事件监听
    #init() {
      document.onfreeze = this.#onfreeze;
      document.onresume = this.#onresume;
      document.onvisibilitychange = this.#onvisibilitychange;
      window.onblur = this.#onblur;
      window.onfocus = this.#onfocus;
      window.onpagehide = this.#onpagehide;
      window.onpageshow = this.#onpageshow;
      window.onbeforeunload = this.#onbeforeunload;
    }

    // freeze事件回调
    onfreezeCallback = (event) => {
    }

    // freeze事件处理函数
    #onfreeze(event) {
      console.log('freeze事件在网页进入 Frozen 阶段时触发。');
      this.onfreezeCallback?.(event);
    }

    // resume事件回调
    onresumeCallback = (event) => {
    }

    // resume事件处理函数
    #onresume(event) {
      console.log('resume事件在网页离开 Frozen 阶段，变为 Active / Passive / Hidden 阶段时触发。');
      this.onresumeCallback?.(event);
    }

    // 网页可见状态发生变化时触发时的回调
    onvisibilitychangeCallback = (event) => {
    }
    // 页面彻底不可见时回调
    hiddenCallback = (event) => {
    }
    // 页面至少一部分可见时回调
    visibleCallback = (event) => {
    }
    // 页面即将或正在渲染，处于不可见状态时回调
    prerenderCallback = (event) => {
    }

    // visibilitychange事件处理函数
    #onvisibilitychange(event) {
      console.log('visibilitychange事件在网页可见状态发生变化时触发。', document.visibilityState);
      switch (document.visibilityState) {
        case 'hidden':
          // 页面彻底不可见。
          this.hiddenCallback?.(event)
          break;
        case "visible":
          // 页面至少一部分可见。
          this.#initNavigation();
          this.visibleCallback?.(event)
          break;
        case "prerender":
          // 页面即将或正在渲染，处于不可见状态。
          this.prerenderCallback?.(event)
          break;
        default:
          break;
      }
      this.onvisibilitychangeCallback?.(event, document.visibilityState)
    }

    // blur事件回调
    onblurCallback = (event) => {
    }

    // blur事件处理函数
    #onblur(event) {
      console.log('blur事件在网页失去焦点时触发。');
      this.onblurCallback?.(event);
    }

    // focus事件回调
    onfocusCallback = (event) => {
    }

    // focus事件处理函数
    #onfocus(event) {
      console.log('focus事件在网页获得焦点时触发。');
      this.onfocusCallback?.(event);
    }

    // pagehide事件回调
    onpagehideCallback = (event) => {
    }

    // pagehide事件处理函数
    #onpagehide(event) {
      console.log('pagehide事件在用户离开页面时触发。');
      this.onpagehideCallback?.(event);
    }

    // pageshow事件回调
    onpageshowCallback = (event) => {
    }

    // pageshow事件处理函数
    #onpageshow(event) {
      console.log('pageshow事件在用户访问页面时触发。');
      this.onpageshowCallback?.(event);
    }

    // beforeunload事件回调
    onbeforeunloadCallback = (event) => {
    }

    // beforeunload事件处理函数
    #onbeforeunload(event) {
      console.log('beforeunload事件在页面即将卸载时触发。');
      this.onbeforeunloadCallback?.(event);
    }

    //#endregion

    //#region 路由监听
    // 初始化路由监听
    #initNavigation() {
      // 监听路由变化
      // 如果浏览器支持navigation对象，则使用navigation.oncurrententrychange监听路由变化
      if (navigation) {
        navigation.oncurrententrychange = this.#oncurrententrychange;
      }
      // 否则使用定时器轮询监听路由变化。
      else{
        this.#pollingListenHref();
      }
    }

    #beforeCurrententrychangeHandler = async (urlInfo = {}, event = {}) => {
      try {
        await Promise.resolve(this.oncurrententrychangeCallback?.(urlInfo, event));
      } catch (error) {
        console.error('路由变化前置处理函数出错', error);
      }
    }
    // navigation.oncurrententrychange事件处理函数
    #oncurrententrychange = (event) => {
      console.log('路由发生变化', event);
      this.oncurrententrychangeCallback?.(event, 'oncurrententrychange');
    }
    // 轮询监听路由变化的间隔时间，单位：毫秒
    pollingListenTimeInterval = 500;
    #DEFAULT_TIME_INTERVAL = 500;
    // 轮询检查路由变化
    #pollingListenHref = () => {
      let currentHref = window.location.href;

      this.#clearPollingListenHref();
      this.#timeId = setInterval(() => {
        if (currentHref !== window.location.href) {
          console.log('路由发生变化:', window.location.href);
          this.#beforeCurrententrychangeHandler({
            oldURL: currentHref,
            newURL: window.location.href,
            type: 'polling'
          });

          currentHref = window.location.href;
        }
      }, this.pollingListenTimeInterval || this.#DEFAULT_TIME_INTERVAL); // 每秒检查一次
    }
    // 清除轮询检查路由变化
    #clearPollingListenHref = () => {
      if (this.#timeId) {
        clearInterval(this.#timeId);
      }
    }
    // 路由变化时的回调
    oncurrententrychangeCallback = (event, type) => {
    }
    //#endregion
  }

  // 创建PageLifecycle实例，将PageLifecycle实例挂载到window对象上
  window.pageLifecycle = new PageLifecycle();
})();