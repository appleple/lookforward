import { fetch, append, getUniqId } from '../lib/util.js';

const assign = require('es6-object-assign').assign;

const defaults = {
  classNames: {
    LookForward: 'lookforward',
    LookForwardBody: 'lookforward-body',
    LookForwardModalDismiss: 'lookforward-dismiss'
  },
  scrapedArea: '.js-lookforward-target'
}

export default class LookForward {

  constructor(selector, options = {}) {
    this.options = assign({}, defaults, options);
    this.id = getUniqId();
    const ele = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!ele) {
      return;
    }
    ele.addEventListener('click', (event) => {
      event.preventDefault();
      const href = ele.getAttribute('href');
      fetch(href).then((doc) => {
        const html = doc.querySelector(this.options.scrapedArea);
        if (!html) {
          return;
        }
        const build = this.buildHtml(html.innerHTML);
        const body = document.querySelector('body');
        append(body, build);
      })
    });
  }

  buildHtml(html) {
    const classNames = this.options.classNames;
    return (`
      <div class="${classNames.LookForward}">
        <div class="${classNames.LookForwardBody}">
          ${html}
        </div>
      </div>
    `);
  }
}