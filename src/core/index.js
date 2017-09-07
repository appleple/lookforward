import {
  fetch,
  append,
  prepend,
  remove,
  getUniqId,
  addClass,
  triggerEvent
} from '../lib/util';

const assign = require('es6-object-assign').assign;

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
    if (window.history) {
      this.historyLength = 0;
    }
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
          if (this.historyLength > state.historyLength) {
            this.addModal(build, 'prepend', false).then(() => {
              const modals = this.getModals();
              if (modals && modals.length > 1) {
                this.removeModal('last');
              }
            });
          } else {
            this.addModal(build, 'append', true).then(() => {
              const modals = this.getModals();
              if (modals && modals.length > 1) {
                this.removeModal('first');
              }
            });
          }
          this.historyLength = state.historyLength;
        } else {
          this.removeModal('first', true).then(() => {
            body.style.overflow = '';
            this._fireEvent('closeAll');
            this.historyLength = 0;
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
        this.addModal(html, 'append', true).then(() => {
          const modals = this.getModals();
          if (modals && modals.length > 1) {
            this.removeModal('first');
          }
        });
        if (window.history && this.options.useHistoryApi) {
          const historyLength = this.historyLength;
          window.history.pushState({ pushed: true, html: target.innerHTML, id, transitionEnter, transitionLeave, historyLength }, '', href);
          this.historyLength += 1;
        }
      });
    });
  }

  addModal(build, which = 'append', animation = true) {
    return new Promise((resolve) => {
      const id = this.id;
      const selector = this.selector;
      const body = document.querySelector('body');
      const target = document.querySelector(`#${id}`);
      body.style.overflow = 'hidden';
      if (!animation) {
        build = build.replace('data-animation', 'data-no-animation');
      }
      if (which === 'append') {
        append(target, build);
      } else if (which === 'prepend') {
        prepend(target, build);
      }
      const closeBtns = document.querySelectorAll(`#${id} .js-lookforward-close-btn`);
      [].forEach.call(closeBtns, (closeBtn) => {
        closeBtn.addEventListener('click', () => {
          if (window.history && this.options.useHistoryApi) {
            window.history.back();
          } else {
            this.removeModal();
          }
        });
      });
      if (typeof selector === 'string') {
        const eles = document.querySelectorAll(`#${id} ${selector}`);
        [].forEach.call(eles, (ele) => {
          this.addClickEvent(ele);
        });
      }
      this._fireEvent('open');
      if (animation) {
        setTimeout(() => {
          resolve();
        }, 300);
      } else {
        resolve();
      }
    });
  }

  getModals() {
    return document.querySelectorAll(`#${this.id} [data-root]`);
  }

  removeModal(which, last = false) {
    return new Promise((resolve) => {
      const classNames = this.options.classNames;
      const modal = document.querySelector(`#${this.id} [data-root]:${which}-child`);
      if (!modal) {
        resolve();
      }
      addClass(modal, classNames.LookForwardClose);
      if (last) {
        setTimeout(() => {
          modal.setAttribute('data-close-animation', 'true');
        }, 10);
      }
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
        <div class="${classNames.LookForwardBody}">
          <div class="${classNames.LookForwardHeader}">
            <button class="${classNames.LookForwardCloseBtn} js-lookforward-close-btn"></button>
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
