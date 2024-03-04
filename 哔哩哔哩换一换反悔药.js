// ==UserScript==
// @name         哔哩哔哩换一换反悔药
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       zyb
// @match        https://www.bilibili.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        none
// @license      MIT
// ==/UserScript==

(async function () {
    'use strict';

    // Your code here...
    // let myJSCodeLibrary = new MyJSCodeLibrary();

    // 视频卡片选择器
    const CARD_CLASSNAME = '.recommended-container_floor-aside .feed-card';
    const CARD_IMAGE_CLASSNAME = '.bili-video-card__image--link';
    const CARD_INFO_CLASSNAME = '.bili-video-card__info--right';
    // 换一换按钮选择器
    const BTNBOX_CLASSNAME = '.recommended-container_floor-aside .feed-roll-btn';

    /**
     * 异步获取页面dom节点
     * @param {HTMLElement} btnBox 
     * @returns 
     */
    function getBtnBoxAsync(btnBox) {
        return new Promise((resolve) => {
            let timeId = setInterval(() => {
                if (!btnBox) {
                    btnBox = document.querySelectorAll(BTNBOX_CLASSNAME)[0];
                } else {
                    resolve(btnBox)
                    clearInterval(timeId)
                }
            }, 100)
        })
    }

    /**
     * 创建后悔按钮
     */
    async function createHouHuiBtn(btnBox) {
        createStyleFuc(`
            .houHuiBtn {
                height: auto;
                width: 40px;
                padding: 9px;
                background-color: #ffffff;
                color: #18191c;
                font-size: 12px;
                border: 1px solid #e3e5e7;
                border-radius: 8px;
                margin-left: 0;
                margin-top: 10px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                transform-origin: center;
                transition: .2s;
                cursor: pointer;
            }
        `);

        const button = document.createElement("button");
        button.setAttribute("class", "houHuiBtn");
        button.innerHTML = `
            <span>后悔了</span>
        `;
        button.onclick = async (e) => {
            console.log(history);
            if (!clickFlag) {
                return;
            }

            videoList.forEach((item, index) => {
                const { cardDom } = item;
                console.log(cardDom);
                const wrap = cardDom.querySelectorAll('.bili-video-card__wrap')[0];
                const other = wrap.querySelectorAll('.bili-video-card__no-interest')[0];
                wrap.innerHTML = '';
                wrap.appendChild(other);
                wrap.appendChild(history[index].imageDom);
                wrap.appendChild(history[index].infoDom);
            })

            // 将之前后悔前刷新的页面设置为历史数据
            history = [...videoList];
            // 获取最新dom数据列表
            videoList = await getCardListAsync();

        };
        btnBox.appendChild(button);
    }


    // 初始化
    let videoList = [];
    let history = [];
    let clickFlag = false;
    let btnBox = await getBtnBoxAsync(document.querySelectorAll(BTNBOX_CLASSNAME)[0]);
    const rollBtn = btnBox.querySelectorAll('.roll-btn')[0];
    rollBtn.onclick = async (e) => {
        videoList = await getCardListAsync();
    }

    createHouHuiBtn(btnBox);
    videoList = await getCardListAsync();


    /**
     * 获取当前推荐数据
     */
    function getCardListAsync() {
        clickFlag = false;
        // 保存历史数据
        history = [...videoList];

        return new Promise((resolve) => {
            setTimeout(async () => {
                const cardList = await getBtnBoxAsync(document.querySelectorAll(CARD_CLASSNAME));
                const list = Array.from(cardList).map((dom) => {
                    const imageDom = dom.querySelectorAll(CARD_IMAGE_CLASSNAME)[0];
                    const infoDom = dom.querySelectorAll(CARD_INFO_CLASSNAME)[0];
                    return {
                        cardDom: dom,
                        imageDom,
                        infoDom
                    }
                });
                clickFlag = true;
                resolve(list);
            }, 500)
        })
    }

    /**
     * 创建css样式
     * @param {string} styleStr css样式
     */
    function createStyleFuc(styleStr = "") {
        // 创建style节点
        const style = document.createElement("style");
        style.setAttribute("type", "text/css");
        style.appendChild(document.createTextNode(styleStr));
        document.head.appendChild(style);
    }
})();