// 定义常量
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
/**
 * 自定义promise函数
 *
 * @class MyPromise
 */
class MyPromise {
    // #+变量名定义私有属性
    #state = PENDING;
    #result = undefined;
    // 存储 then 函数中的参数
    #handlers = [];

    /**
     * Creates an instance of MyPromise.
     * @param {function} fuc
     * @memberof MyPromise
     */
    constructor(fuc) {
        /**
         * 为什么将 resolve 和 reject 定义为新的函数再传入？
         * 因为在new一个新的MyPromise函数时，调用 resolve 和 reject 函数时是在MyPromise类的外部，
         * 这会导致在定义 resolve 和 reject 的函数内部使用this时，指针指向的是类外部环境，而非类本身，
         * 而在构造器内定义为一个新的箭头函数时，箭头函数内的指针指向构造器环境，即类本身。
         */
        const resolve = (data) => {
            // 改变state值
            this.#changeState(FULFILLED, data)
        };
        const reject = (error) => {
            // 改变state值
            this.#changeState(REJECTED, error)
        };
        try {
            /**
             * 使用 try catch 捕获 MyPromise 类调用时产生的错误，并调用 reject 函数
             * 只能捕获同步代码产生的错误，如果是异步的，如在setTimeout中，则无法捕获
             */
            fuc(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }
    /**
     * 私有函数，判断是否改变state值，并返回结果
     */
    #changeState = (state, result) => {
        // state值只允许改变一次
        if (this.#state !== PENDING) return;

        this.#state = state;
        this.#result = result;

        this.#run();
    }

    /**
     * 将函数放到浏览器的微队列进程中
     * @param {function} fuc 
     */
    #addMicroTask(fuc) {
        // 判断是否是node环境
        if (typeof process === 'object' && typeof process.nextTick === 'function') {
            process.nextTick(fuc);
        }
        // 判断是浏览器环境
        else if (typeof MutationObserver === 'function') {
            // 观察器观察某个元素发生变化时，会将传入的函数放入微队列中运行
            const ob = new MutationObserver(fuc);
            const textNode = document.createTextNode('1');
            ob.observe(textNode, {
                characterData: true
            })
            // 更改文本节点，触发观察器
            textNode.data = '2';
        }
        // 都无法满足时，则使用定时器将函数放入延时队列中
        else {
            setTimeout(fuc, 0);
        }
    }

    /**
     * 判断是否是类Promise函数
     * @param {*} data 需要被判断的参数
     * @returns {Boolean}
     */
    #isPromiseLike(data) {
        if (data && (typeof data === 'function' || typeof data === 'object')) {
            return typeof data.then === 'function';
        }
        return false
    }

    /**
     * 
     * @param {function} callback 
     * @param {*} resolve 
     * @param {*} reject 
     */
    #runNext(callback, resolve, reject) {
        // 将函数放到浏览器的微队列进程中
        this.#addMicroTask(() => {
            // 如果 callback 参数是函数，则执行函数
            if (typeof callback === 'function') {
                // try catch 捕获代码报错
                try {
                    // 将 callback 函数的返回结果传递下去
                    const data = callback(this.#result);
                    if (this.#isPromiseLike(data)) {
                        data.then(resolve, reject);
                        return;
                    }
                    resolve(data)
                } catch (error) {
                    reject(error);
                }
            }
            // 否则将上一个链式调用的结果传递下去
            else {
                // 判断当前状态是成功或失败，并调用对应的函数
                const settled = this.#state === FULFILLED ? resolve : reject;
                settled(this.#result);
            }
        })
    }

    #run() {
        // 如果当前状态还是挂起时，停止执行后续操作
        if (this.#state === PENDING) return;

        while (this.#handlers.length) {
            // 移除数组第一个参数，并返回移除的值
            const { onFulfilled, onRejected, resolve, reject } = this.#handlers.shift();

            // MyPromise状态为成功，则执行o nFulfilled 判断
            if (this.#state === FULFILLED) {
                // 执行 runNext 函数，将返回结果传递到下一个链式调用
                this.#runNext(onFulfilled, resolve, reject)
            }
            // MyPromise状态为失败，则执行 onRejected 判断
            else if (this.#state === REJECTED) {
                // 执行 runNext 函数，将返回结果传递到下一个链式调用
                this.#runNext(onRejected, resolve, reject)
            }
        }
    }

    /**
     * MyPromise 最重要的 then 函数
     * @param {function} onFulfilled 
     * @param {function} onRejected 
     * @returns {MyPromise}
     */
    then(onFulfilled, onRejected) {
        return new MyPromise((resolve, reject) => {
            this.#handlers.push({
                onFulfilled,
                onRejected,
                resolve,
                reject,
            })
            this.#run()
        })
    }
}






setTimeout(() => {
    console.log(1);
}, 0)


new MyPromise((res, rej) => {
    console.log(2);
    res(3)
}).then(
    (data) => {
        console.log(data);
        return new Promise((res, rej) => {
            res(4)
        });
    }
).then((data) => {
    console.log(data);
})

console.log(5);