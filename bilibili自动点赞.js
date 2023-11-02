// ==UserScript==
// @name         bilibili自动点赞
// @namespace    http://tampermonkey.net/
// @version      0.31
// @description  bilibili自动点赞，免费的赞，温暖up的心!
// @author       zyb
// @match        https://www.bilibili.com/video/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    let pathname = location.pathname;
    setInterval(function(){
        let newPathname = location.pathname;
        if(newPathname !== pathname){
            pathname = newPathname;
            //防止误点视频
            setTimeout(function(){
                dianzan();
            },10000)
        }

    },5000)

    //防止误点视频
    setTimeout(function(){
        dianzan();
    },10000)

    function dianzan(){
        let button = document.querySelectorAll(".video-toolbar-left .toolbar-left-item-wrap [title=点赞（Q）]")[0];
        if(!button.className.includes("on")){
            button.click();
        }
    }
})();
