/**
 * example:
 * 
 * // 创建实例
 * const pageLifecycle = new PageLifecycle();
 * // 获取监听器键的映射类型，有效避免入参类型错误。只读不可修改。
 * const LISTENER_KEYS_MAP = pageLifecycle.LISTENER_KEYS_MAP;
 * 
 * // 注册监听器，监听页面是否可见
 * const listenerId = pageLifecycle.listener(LISTENER_KEYS_MAP.visible, () => {
 *  console.log('页面可见');
 * });
 * 
 * // 移除监听器
 * pageLifecycle.removeListener(listenerId);
 * // 移除所有visible监听
 * pageLifecycle.clearListener(LISTENER_KEYS_MAP.visible);
 * 
 */


// 定义监听器键的映射类型
export const LISTENER_KEYS_MAP = Object.freeze({
  freeze: 'freeze',
  resume: 'resume',
  visibilitychange: 'visibilitychange',
  hidden: 'hidden',
  visible: 'visible',
  prerender: 'prerender',
  blur: 'blur',
  focus: 'focus',
  pagehide: 'pagehide',
  pageshow: 'pageshow',
  beforeunload: 'beforeunload',
});

// 定义监听器键的类型，基于 LISTENER_KEYS_MAP 的键
type IListenerKey = typeof LISTENER_KEYS_MAP[keyof typeof LISTENER_KEYS_MAP];

// 定义监听器对象的结构
interface IListener {
  id: string;
  key: IListenerKey;
  callback: (...args: any[]) => void;
}

// 页面生命周期事件监听 ID 映射表
interface IListenerIdMap {
  [id: string]: IListener;
}

// 页面生命周期事件监听队列
interface IQueueMap {
  [key: string]: IListener[];
}

class PageLifecycle {
  // 单例实例类型
  private static instance: PageLifecycle | null = null;
  // 页面生命周期事件监听队列
  #queueMap: IQueueMap = {};
  // 页面生命周期事件监听 ID 映射表
  #listenerIdMap: IListenerIdMap = {};
  // 监听器键的映射类型
  get LISTENER_KEYS_MAP() {
    return LISTENER_KEYS_MAP;
  }

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('Requires browser env');
    }
    if (PageLifecycle.instance) {
      return PageLifecycle.instance;
    }
    PageLifecycle.instance = this;
    this.#init();
  }

  // 初始化方法，绑定事件监听器
  #init() {
    // 使用 bind(this) 确保 this 正确
    document.addEventListener('freeze', this.#onfreeze.bind(this));
    document.addEventListener('resume', this.#onresume.bind(this));
    document.addEventListener('visibilitychange', this.#onvisibilitychange.bind(this));
    window.addEventListener('blur', this.#onblur.bind(this));
    window.addEventListener('focus', this.#onfocus.bind(this));
    window.addEventListener('pagehide', this.#onpagehide.bind(this));
    window.addEventListener('pageshow', this.#onpageshow.bind(this));
    window.addEventListener('beforeunload', this.#onbeforeunload.bind(this));
  }

  /**
   * 注册页面生命周期事件监听
   * @param key 事件类型
   * @param callback 回调函数
   * @returns 监听 ID
   */
  listener(key: IListenerKey, callback: IListener['callback']) {
    if (!LISTENER_KEYS_MAP[key]) {
      console.error('未知的事件类型');
      return;
    }

    const id = `${key}-${crypto.randomUUID()}`;
    this.#listenerIdMap[id] = {
      id,
      key,
      callback,
    };
    if (!Array.isArray(this.#queueMap[key])) {
      this.#queueMap[key] = [];
    }
    this.#queueMap[key].push(this.#listenerIdMap[id]);

    return id
  }

  /**
   * 移除页面生命周期事件监听
   * @param id 监听 ID
   */
  removeListener(id: string) {
    if (!id) {
      return
    }
    const { key } = this.#listenerIdMap[id] || {};
    this.#queueMap[key] = (this.#queueMap[key] || []).filter((task) => {
      return task.id !== id;
    })

    if (this.#queueMap[key].length === 0) {
      delete this.#queueMap[key];
    }

    delete this.#listenerIdMap[id];

    console.log('移除页面生命周期事件监听', id);
  }


  /**
   * 清空页面生命周期事件监听
   * 如果传入 key，则清空指定 key 的监听；否则清空所有监听
   * @param key 事件类型（可选）
   */
  clearListener(key?: IListenerKey) {
    if (key) {
      this.#queueMap[key] = [];
      // 额外遍历 listenerIdMap key 的记录
      for (const id in this.#listenerIdMap) {
        if (this.#listenerIdMap[id]?.key === key) {
          delete this.#listenerIdMap[id];
        }
      }
    } else {
      this.#queueMap = {};
      this.#listenerIdMap = {};
    }
  };

  /**
   * 执行任务队列
   * @param key 事件类型
   * @param args 传递给回调函数的参数
   */
  #processQueue(key: IListenerKey, ...args: any[]) {
    (this.#queueMap[key] || []).forEach((task) => {
      const {
        callback,
      } = task || {};
      if (typeof callback === 'function') {
        callback(...args);
      }
    })
  }

  /**
   * freeze事件处理函数
   * @param args 传递给回调函数的参数
   */
  #onfreeze(...args: any[]) {
    // freeze事件在网页进入 Frozen 阶段时触发。
    this.#processQueue(LISTENER_KEYS_MAP.freeze, ...args)
  }

  /**
   * resume事件处理函数
   * @param args 传递给回调函数的参数
   */
  #onresume(...args: any[]) {
    // resume事件在网页离开 Frozen 阶段，变为 Active / Passive / Hidden 阶段时触发。
    this.#processQueue(LISTENER_KEYS_MAP.resume, ...args)
  }

  /**
   * visibilitychange事件处理函数
   * @param args 传递给回调函数的参数
   */
  #onvisibilitychange(...args: any[]) {
    // visibilitychange事件在网页可见状态发生变化时触发。
    // console.log('visibilitychange事件在网页可见状态发生变化时触发。', window.document.visibilityState);
    const visibilityStateMap = {
      // 页面彻底不可见时回调
      hidden: () => {
        this.#processQueue(LISTENER_KEYS_MAP.hidden, ...args)
      },
      // 页面至少一部分可见时回调
      visible: () => {
        this.#processQueue(LISTENER_KEYS_MAP.visible, ...args)
      },
      // 页面即将或正在渲染，处于不可见状态。
      prerender: () => {
        this.#processQueue(LISTENER_KEYS_MAP.prerender, ...args)
      },
    }

    const fuc = visibilityStateMap[window.document.visibilityState];
    fuc && fuc();
    // 网页可见状态发生变化时触发时的回调
    this.#processQueue(LISTENER_KEYS_MAP.visibilitychange, window.document.visibilityState, ...args)
  }

  /**
   * blur事件处理函数
   * @param args 传递给回调函数的参数
   */
  #onblur(...args: any[]) {
    // blur事件在网页失去焦点时触发。
    this.#processQueue(LISTENER_KEYS_MAP.blur, ...args)
  }

  /**
   * focus事件处理函数
   * @param args 传递给回调函数的参数
   */
  #onfocus(...args: any[]) {
    // focus事件在网页获得焦点时触发。
    this.#processQueue(LISTENER_KEYS_MAP.focus, ...args)
  }

  /**
   * pagehide事件处理函数
   * @param args 传递给回调函数的参数
   */
  #onpagehide(...args: any[]) {
    // pagehide事件在用户离开页面时触发。
    this.#processQueue(LISTENER_KEYS_MAP.pagehide, ...args)
  }

  /**
   * pageshow事件处理函数
   * @param args 传递给回调函数的参数
   */
  #onpageshow(...args: any[]) {
    // pageshow事件在用户访问页面时触发。
    this.#processQueue(LISTENER_KEYS_MAP.pageshow, ...args)
  }

  /**
   * beforeunload事件处理函数
   * @param args 传递给回调函数的参数
   */
  #onbeforeunload(...args: any[]) {
    // beforeunload事件在页面即将卸载时触发。
    this.#processQueue(LISTENER_KEYS_MAP.beforeunload, ...args)
  }
}

export default PageLifecycle;