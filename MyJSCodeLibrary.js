// ==UserScript==
// @name         我的常用js代码库
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  我常用的js代码库
// @author       zyb
// @match        http://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

class MyJSCodeLibrary {
    constructor() {

    }
    /**
     * 创建css样式
     * @param {string} styleStr css样式
     */
    createStyleFuc(styleStr = "") {
        // 创建style节点
        const style = document.createElement("style");
        style.setAttribute("type", "text/css");
        style.appendChild(document.createTextNode(styleStr));
        document.head.appendChild(style);
    }

    /**
     * 异步获取dom节点
     * @param {string} selector dom节点的选择器文本
     * @param {number} time 间隔时间
     * @returns
     */
    getDomByIntervalAsyncFuc(selector, time = 100) {
        let dom = document.querySelectorAll(selector)[0];
        let timeId = null;
        let times = 0;
        return new Promise((res) => {
            timeId = setInterval(() => {
                times++;
                if (dom || times > 10) {
                    res(dom);
                    clearInterval(timeId);
                } else {
                    dom = document.querySelectorAll(selector)[0];
                }
            }, time)
        })
    }

    /**
     * 异步获取dom节点
     * @param {string} selector dom节点的选择器文本
     * @param {number} time 间隔时间
     * @returns
     */
    getDomListByIntervalAsyncFuc(selector, time = 100) {
        let dom = document.querySelectorAll(selector)[0];
        let timeId = null;
        let times = 0;
        return new Promise((res) => {
            timeId = setInterval(() => {
                times++;
                if (dom.length || times > 10) {
                    res(dom);
                    clearInterval(timeId);
                } else {
                    dom = document.querySelectorAll(selector);
                }
            }, time)
        })
    }

    /**
     * 异步获取dom节点
     * @param {string} selector dom节点的选择器文本
     * @param {number} time 间隔时间
     * @returns
     */
    getDomByTimeoutAsyncFuc(selector = "", time = 2000) {
        return new Promise((res) => {
            setTimeout(() => {
                let dom = document.querySelectorAll(selector)[0];
                res(dom);
            }, time)
        })
    }

    /**
     * 异步获取dom节点
     * @param {string} selector dom节点的选择器文本
     * @param {number} time 间隔时间
     * @returns
     */
    getDomListByTimeoutAsyncFuc(selector = "", time = 2000) {
        return new Promise((res) => {
            setTimeout(() => {
                let dom = document.querySelectorAll(selector);
                res(dom);
            }, time)
        })
    }
}