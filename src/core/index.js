import { fetch, append, remove, getUniqId, addClass } from '../lib/util';

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
    this.currentUrl = location.href;
    this.selector = selector;
    if (!eles) {
      return;
    }
    [].forEach.call(eles, (ele) => {
      this.addClickEvent(ele);
    });
    if (window.history && this.options.useHistoryApi) {
      window.addEventListener('popstate', (event) => {
        const state = event.state;
        if (state && state.pushed) {
          const transition = state.transition || this.options.transition;
          const build = this.buildHtml(state.html, this.id, transition);
          this.removeModal().then(() => {
            this.addModal(build);
          });
        } else {
          this.removeModal();
        }
      });
    }
  }

  addClickEvent(ele) {
    const id = this.id;
    ele.addEventListener('click', (event) => {
      event.preventDefault();
      const href = ele.getAttribute('href');
      const transition = ele.dataset.transition || this.options.transition;
      fetch(href).then((doc) => {
        const target = doc.querySelector(this.options.scrapedArea);
        if (!target) {
          return;
        }
        const html = this.buildHtml(target.innerHTML, id, transition);
        this.removeModal().then(() => {
          this.addModal(html);
        })
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
    body.style.overflow = 'hidden';
    append(body, build);
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
  }

  removeModal() {
    return new Promise ((resolve, reject) => {
      const classNames = this.options.classNames;
      const modal = document.querySelector(`#${this.id}`);
      const body = document.querySelector('body');
      if (!modal) {
        resolve();
        return;
      }
      addClass(modal, classNames.LookForwardClose);
      setTimeout(() => {
        remove(modal);
        body.style.overflow = '';
        resolve();
      }, 300);
    });
  }

  buildHtml(html, id, transition) {
    const classNames = this.options.classNames;
    return (`
      <div class="${classNames.LookForward}" id="${id}">
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
}
