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
  },
  transitionEnter: '',
  transitionLeave: '',
  scrapedArea: 'body',
  useHistoryApi: true
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
            this.addModal(build);
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

      fetch(href).then((doc) => {
        const target = doc.querySelector(this.options.scrapedArea);
        if (!target) {
          return;
        }
        const id = getUniqId();
        const html = this.buildHtml(target.innerHTML, id, transitionEnter, transitionLeave);
        this.addModal(html);
        if (window.history && this.options.useHistoryApi) {
          const historyLength = this.historyLength;
          window.history.pushState({ pushed: true, html: target.innerHTML, id, transitionEnter, transitionLeave, historyLength }, '', href);
        }
      });
    });
  }

  addModal(build) {
    const id = this.id;
    const selector = this.selector;
    const body = document.querySelector('body');
    const target = document.querySelector(`#${id}`);
    body.style.overflow = 'hidden';
    append(target, build);
    const modal = this.getModal();
    const closeBtn = modal.querySelector('.js-lookforward-close-btn');
    this.historyLength += 1;
    closeBtn.addEventListener('click', () => {
      if (window.history && this.options.useHistoryApi) {
        window.history.back();
      } else {
        this.removeModal();
      }
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
    return (`
      <div class="${classNames.LookForward}" data-root data-animation id="${id}">
        <button class="${classNames.LookForwardCloseBtn} js-lookforward-close-btn"></button>
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
