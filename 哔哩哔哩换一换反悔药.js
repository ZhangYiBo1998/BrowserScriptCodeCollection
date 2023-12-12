// ==UserScript==
// @name         哔哩哔哩换一换反悔药
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        none
// @require https://update.greasyfork.org/scripts/479598/1293363/MyJSCodeLibrary.js
// ==/UserScript==

(async function () {
    'use strict';

    // Your code here...
    let myJSCodeLibrary = new MyJSCodeLibrary();

    let videoDomList = [];
    const recommendedSwipe = await myJSCodeLibrary.getDomByTimeoutAsyncFuc('.recommended-swipe');
    const recommendContainer2 = document.querySelectorAll('.recommend-container__2-line')[0];
    const sectionBox = document.querySelectorAll('.bili-layout .bili-grid.short-margin.grid-anchor')[0];

    console.log(videoDomList);
    let styleText = `
      .houHuiBtn {
        top: 90px;
      }
    `;
    myJSCodeLibrary.createStyleFuc(styleText);

    const button = document.createElement("div");
    button.setAttribute("class", "roll-btn-wrap houHuiBtn");
    button.innerHTML = `
        <button class="primary-btn roll-btn">
        <span>后悔了</span>
        </button>
    `;
    button.onclick = () => {
        if (!videoDomList.length) {
            return;
        }
        recommendContainer2.innerHTML = "";
        recommendContainer2.appendChild(recommendedSwipe);
        for (let item of videoDomList) {
            recommendContainer2.appendChild(item);
        }
    };
    sectionBox.appendChild(button);

    const changeVideoBtn = await myJSCodeLibrary.getDomByTimeoutAsyncFuc(".roll-btn-wrap .primary-btn.roll-btn");
    changeVideoBtn.addEventListener("click", async function () {
        videoDomList = Array.from(await myJSCodeLibrary.getDomListByTimeoutAsyncFuc(".bili-video-card.is-rcmd", 100));
        console.log(videoDomList);
    })
})();