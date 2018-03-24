import 'custom-event-polyfill';
import {
  fetch,
  append,
  remove,
  getUniqId,
  addClass,
  triggerEvent
} from '../lib/util';

const assign = require('es6-object-assign').assign;
const Promise = require('es6-promise-polyfill').Promise;

const defaults = {
  classNames: {
    LookForward: 'lookforward',
    LookForwardBody: 'lookforward-body',
    LookForwardInner: 'lookforward-inner',
    LookForwardClose: 'lookforward-close',
    LookForwardCloseBtn: 'lookforward-close-btn',
    LookForwardHeader: 'lookforward-header',
    LookForwardFooter: 'lookforward-footer',
    LookForwardLoader: 'lookforward-loader',
    LookForwardLoaderWrap: 'lookforward-loader-wrap'
  },
  closeBtnClass: 'js-lookforward-close-btn',
  closeBtnPattern: 1,
  transitionEnter: '',
  transitionLeave: '',
  scrapedArea: 'body',
  useHistoryApi: true,
  execInnerScript: false
};

export default class LookForward {

  constructor(selector, options = {}) {
    this.options = assign({}, defaults, options);
    this.id = getUniqId();
    const eles = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
    const body = document.querySelector('body');
    this.currentUrl = location.href;
    this.selector = selector;
    this.historyLength = 0;
    if (!eles) {
      return;
    }
    [].forEach.call(eles, (ele) => {
      this.addClickEvent(ele);
    });
    append(body, `<div id="${this.id}"></div>`);
    if (window.history && this.options.useHistoryApi) {
      window.addEventListener('popstate', (event) => {
        const state = event.state;
        if (state && state.pushed) {
          const transitionEnter = state.transitionEnter;
          const transitionLeave = state.transitionLeave;
          const id = getUniqId();
          const build = this.buildHtml(state.html, id, transitionEnter, transitionLeave);
          if (this.historyLength >= state.historyLength) {
            this.removeModal();
          } else {
            const modal = this.addModal(build);
            if (this.options.execInnerScript) {
              this.execInnerScript(modal);
            }
          }
          this.historyLength = state.historyLength;
        } else {
          this.removeModal().then(() => {
            body.style.overflow = '';
            this._fireEvent('closeAll');
          });
        }
      });
    }
  }

  on(event, fn) {
    const modal = document.querySelector(`#${this.id}`);
    modal.addEventListener(event, (e) => {
      fn.call(this, e);
    });
  }

  addClickEvent(ele) {
    ele.addEventListener('click', (event) => {
      event.preventDefault();
      const href = ele.getAttribute('href');
      const transitionEnter = ele.dataset.transitionEnter || this.options.transitionEnter;
      const transitionLeave = ele.dataset.transitionLeave || this.options.transitionLeave;
      this.addLoader();
      fetch(href).then((doc) => {
        this.removeLoader();
        const target = doc.querySelector(this.options.scrapedArea);
        if (!target) {
          return;
        }
        const id = getUniqId();
        const html = this.buildHtml(target.innerHTML, id, transitionEnter, transitionLeave);
        const modal = this.addModal(html);
        if (this.options.execInnerScript) {
          this.execInnerScript(modal);
        }
        if (window.history && this.options.useHistoryApi) {
          const historyLength = this.historyLength;
          window.history.pushState({ pushed: true, html: target.innerHTML, id, transitionEnter, transitionLeave, historyLength }, '', href);
        }
      });
    });
  }

  execInnerScript(modal) {
    const scripts = modal.querySelectorAll('script');
    [].forEach.call(scripts, (element) => {
      const script = document.createElement('script');
      const attrs = element.attributes;
      for (let i = 0, len = attrs.length; i < len; i += 1) {
        const attr = attrs[i];
        script.setAttribute(attr.name, attr.value);
      }
      script.innerHTML = element.innerHTML;
      modal.appendChild(script);
    });
  }

  addLoader() {
    const id = this.id;
    const classNames = this.options.classNames;
    const target = document.querySelector(`#${id}`);
    const html = `<div class="${classNames.LookForwardLoaderWrap}" data-id="loader">
      <span class="${classNames.LookForwardLoader}"></span>
    </div>`;
    append(target, html);
  }

  removeLoader() {
    const id = this.id;
    const target = document.querySelector(`#${id}`);
    const loader = target.querySelector('[data-id="loader"]');
    remove(loader);
  }

  addModal(build) {
    const id = this.id;
    const selector = this.selector;
    const body = document.querySelector('body');
    const target = document.querySelector(`#${id}`);
    body.style.overflow = 'hidden';
    append(target, build);
    const modal = this.getModal();
    const closeBtns = modal.querySelectorAll(`.${this.options.closeBtnClass}`);
    this.historyLength += 1;

    [].forEach.call(closeBtns, (closeBtn) => {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.history && this.options.useHistoryApi) {
          window.history.back();
        } else {
          this.removeModal();
        }
      });
    });

    if (typeof selector === 'string') {
      const eles = modal.querySelectorAll(selector);
      [].forEach.call(eles, (ele) => {
        this.addClickEvent(ele);
      });
    }
    this._fireEvent('open');
    return modal;
  }

  getModals() {
    return document.querySelectorAll(`#${this.id} [data-root]`);
  }

  getModal(which = 'last') {
    return document.querySelector(`#${this.id} [data-root]:${which}-child`);
  }

  removeModal(which = 'last') {
    return new Promise((resolve) => {
      const classNames = this.options.classNames;
      const modal = document.querySelector(`#${this.id} [data-root]:${which}-child`);
      if (!modal) {
        resolve();
      }
      addClass(modal, classNames.LookForwardClose);
      this.historyLength -= 1;
      setTimeout(() => {
        remove(modal);
        this._fireEvent('close');
        resolve();
      }, 300);
    });
  }

  buildHtml(html, id, transitionEnter, transitionLeave) {
    const classNames = this.options.classNames;
    const pattern = this.options.closeBtnPattern;
    const closeBtnClass = this.options.closeBtnClass;
    return (`
      <div class="${classNames.LookForward}" data-root data-animation id="${id}">
        <button class="${classNames.LookForwardCloseBtn} _pattern${pattern} ${closeBtnClass}"></button>
        <div class="${classNames.LookForwardBody}" data-body>
          <div class="${classNames.LookForwardHeader}">     
          </div>
          <div class="${classNames.LookForwardInner} _enter-${transitionEnter} _leave-${transitionLeave}">
            ${html}
          </div>
          <div class="${classNames.LookForwardFooter}">
          </div>
        </div>
      </div>
    `);
  }

  _fireEvent(eventName) {
    const modal = document.querySelector(`#${this.id}`);
    triggerEvent(modal, eventName);
  }

}
