import { fetch, append, remove, getUniqId, addClass, triggerEvent } from '../lib/util';

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
  transition: 'slideup',
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
          const transition = state.transition || this.options.transition;
          const build = this.buildHtml(state.html, transition);
          this.removeModal().then(() => {
            this.addModal(build);
          });
        } else {
          this.removeModal().then(() => {
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
      const transition = ele.dataset.transition || this.options.transition;
      fetch(href).then((doc) => {
        const target = doc.querySelector(this.options.scrapedArea);
        if (!target) {
          return;
        }
        const html = this.buildHtml(target.innerHTML, transition);
        this.removeModal().then(() => {
          this.addModal(html);
        });
        if (window.history && this.options.useHistoryApi) {
          window.history.pushState({ pushed: true, html: target.innerHTML, transition }, '', href);
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
    const closeBtn = document.querySelector(`#${id} .js-lookforward-close-btn`);
    closeBtn.addEventListener('click', () => {
      if (window.history && this.options.useHistoryApi) {
        window.history.back();
      } else {
        this.removeModal();
      }
    });
    if (typeof selector === 'string') {
      const eles = document.querySelectorAll(`#${id} ${selector}`);
      [].forEach.call(eles, (ele) => {
        this.addClickEvent(ele);
      });
    }
    this._fireEvent('open');
  }

  removeModal() {
    return new Promise((resolve) => {
      const classNames = this.options.classNames;
      const modal = document.querySelector(`#${this.id} [data-root]`);
      const body = document.querySelector('body');
      if (!modal) {
        resolve();
        return;
      }
      addClass(modal, classNames.LookForwardClose);
      setTimeout(() => {
        remove(modal);
        body.style.overflow = '';
        this._fireEvent('close');
        resolve();
      }, 300);
    });
  }

  buildHtml(html, transition) {
    const classNames = this.options.classNames;
    return (`
      <div class="${classNames.LookForward}" data-root>
        <div class="${classNames.LookForwardBody}">
          <div class="${classNames.LookForwardHeader}">
            <button class="${classNames.LookForwardCloseBtn} js-lookforward-close-btn"></button>
          </div>
          <div class="${classNames.LookForwardInner} _${transition}">
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
