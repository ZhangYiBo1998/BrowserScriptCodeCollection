// ==UserScript==
// @name         净化掘金
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://juejin.cn/post/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=juejin.cn
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    function clearPage(){
        let selectorArr = [
            ".main-header-box",
            "#sidebar-container",
            ".article-suspended-panel.dynamic-data-ready",
            ".global-component-box",
            ".column-container",
            "#comment-box",
            ".main-area.recommended-area.entry-list-container",
        ];
        selectorArr.forEach(function(item){
            let dom = document.querySelectorAll(item)[0];
            console.log(dom)
            dom && (dom.remove())
        })

        document.querySelectorAll(".container.main-container")[0].style.maxWidth="85vw";
        document.querySelectorAll(".main-area.article-area")[0].style.width="100%"
    }
    // clearPage();
    setTimeout(function(){
        clearPage();
    },2000)
    // window.clearPage = clearPage;
})();