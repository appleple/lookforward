'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('custom-event-polyfill');

var _util = require('../lib/util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assign = require('es6-object-assign').assign;
var Promise = require('es6-promise-polyfill').Promise;

var defaults = {
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

var LookForward = function () {
  function LookForward(selector) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, LookForward);

    this.options = assign({}, defaults, options);
    this.id = (0, _util.getUniqId)();
    var eles = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
    var body = document.querySelector('body');
    this.currentUrl = location.href;
    this.selector = selector;
    this.historyLength = 0;
    if (!eles) {
      return;
    }
    [].forEach.call(eles, function (ele) {
      _this.addClickEvent(ele);
    });
    (0, _util.append)(body, '<div id="' + this.id + '"></div>');
    if (window.history && this.options.useHistoryApi) {
      window.addEventListener('popstate', function (event) {
        var state = event.state;
        if (state && state.pushed) {
          var transitionEnter = state.transitionEnter;
          var transitionLeave = state.transitionLeave;
          var id = (0, _util.getUniqId)();
          var build = _this.buildHtml(state.html, id, transitionEnter, transitionLeave);
          if (_this.historyLength >= state.historyLength) {
            _this.removeModal();
          } else {
            var modal = _this.addModal(build);
            if (_this.options.execInnerScript) {
              _this.execInnerScript(modal);
            }
          }
          _this.historyLength = state.historyLength;
        } else {
          _this.removeModal().then(function () {
            body.style.overflow = '';
            _this._fireEvent('closeAll');
          });
        }
      });
    }
  }

  _createClass(LookForward, [{
    key: 'on',
    value: function on(event, fn) {
      var _this2 = this;

      var modal = document.querySelector('#' + this.id);
      modal.addEventListener(event, function (e) {
        fn.call(_this2, e);
      });
    }
  }, {
    key: 'addClickEvent',
    value: function addClickEvent(ele) {
      var _this3 = this;

      ele.addEventListener('click', function (event) {
        event.preventDefault();
        var href = ele.getAttribute('href');
        var transitionEnter = ele.dataset.transitionEnter || _this3.options.transitionEnter;
        var transitionLeave = ele.dataset.transitionLeave || _this3.options.transitionLeave;
        _this3.addLoader();
        (0, _util.fetch)(href).then(function (doc) {
          _this3.removeLoader();
          var target = doc.querySelector(_this3.options.scrapedArea);
          if (!target) {
            return;
          }
          var id = (0, _util.getUniqId)();
          var html = _this3.buildHtml(target.innerHTML, id, transitionEnter, transitionLeave);
          var modal = _this3.addModal(html);
          if (_this3.options.execInnerScript) {
            _this3.execInnerScript(modal);
          }
          if (window.history && _this3.options.useHistoryApi) {
            var historyLength = _this3.historyLength;
            window.history.pushState({ pushed: true, html: target.innerHTML, id: id, transitionEnter: transitionEnter, transitionLeave: transitionLeave, historyLength: historyLength }, '', href);
          }
        });
      });
    }
  }, {
    key: 'execInnerScript',
    value: function execInnerScript(modal) {
      var scripts = modal.querySelectorAll('script');
      [].forEach.call(scripts, function (element) {
        var script = document.createElement('script');
        var attrs = element.attributes;
        for (var i = 0, len = attrs.length; i < len; i += 1) {
          var attr = attrs[i];
          script.setAttribute(attr.name, attr.value);
        }
        script.innerHTML = element.innerHTML;
        modal.appendChild(script);
      });
    }
  }, {
    key: 'addLoader',
    value: function addLoader() {
      var id = this.id;
      var classNames = this.options.classNames;
      var target = document.querySelector('#' + id);
      var html = '<div class="' + classNames.LookForwardLoaderWrap + '" data-id="loader">\n      <span class="' + classNames.LookForwardLoader + '"></span>\n    </div>';
      (0, _util.append)(target, html);
    }
  }, {
    key: 'removeLoader',
    value: function removeLoader() {
      var id = this.id;
      var target = document.querySelector('#' + id);
      var loader = target.querySelector('[data-id="loader"]');
      (0, _util.remove)(loader);
    }
  }, {
    key: 'addModal',
    value: function addModal(build) {
      var _this4 = this;

      var id = this.id;
      var selector = this.selector;
      var body = document.querySelector('body');
      var target = document.querySelector('#' + id);
      body.style.overflow = 'hidden';
      (0, _util.append)(target, build);
      var modal = this.getModal();
      var closeBtns = modal.querySelectorAll('.' + this.options.closeBtnClass);
      this.historyLength += 1;

      [].forEach.call(closeBtns, function (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.history && _this4.options.useHistoryApi) {
            window.history.back();
          } else {
            _this4.removeModal();
          }
        });
      });

      if (typeof selector === 'string') {
        var eles = modal.querySelectorAll(selector);
        [].forEach.call(eles, function (ele) {
          _this4.addClickEvent(ele);
        });
      }
      this._fireEvent('open');
      return modal;
    }
  }, {
    key: 'getModals',
    value: function getModals() {
      return document.querySelectorAll('#' + this.id + ' [data-root]');
    }
  }, {
    key: 'getModal',
    value: function getModal() {
      var which = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'last';

      return document.querySelector('#' + this.id + ' [data-root]:' + which + '-child');
    }
  }, {
    key: 'removeModal',
    value: function removeModal() {
      var _this5 = this;

      var which = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'last';

      return new Promise(function (resolve) {
        var classNames = _this5.options.classNames;
        var modal = document.querySelector('#' + _this5.id + ' [data-root]:' + which + '-child');
        if (!modal) {
          resolve();
        }
        (0, _util.addClass)(modal, classNames.LookForwardClose);
        _this5.historyLength -= 1;
        setTimeout(function () {
          (0, _util.remove)(modal);
          _this5._fireEvent('close');
          resolve();
        }, 300);
      });
    }
  }, {
    key: 'buildHtml',
    value: function buildHtml(html, id, transitionEnter, transitionLeave) {
      var classNames = this.options.classNames;
      var pattern = this.options.closeBtnPattern;
      var closeBtnClass = this.options.closeBtnClass;
      return '\n      <div class="' + classNames.LookForward + '" data-root data-animation id="' + id + '">\n        <button class="' + classNames.LookForwardCloseBtn + ' _pattern' + pattern + ' ' + closeBtnClass + '"></button>\n        <div class="' + classNames.LookForwardBody + '" data-body>\n          <div class="' + classNames.LookForwardHeader + '">     \n          </div>\n          <div class="' + classNames.LookForwardInner + ' _enter-' + transitionEnter + ' _leave-' + transitionLeave + '">\n            ' + html + '\n          </div>\n          <div class="' + classNames.LookForwardFooter + '">\n          </div>\n        </div>\n      </div>\n    ';
    }
  }, {
    key: '_fireEvent',
    value: function _fireEvent(eventName) {
      var modal = document.querySelector('#' + this.id);
      (0, _util.triggerEvent)(modal, eventName);
    }
  }]);

  return LookForward;
}();

exports.default = LookForward;
module.exports = exports['default'];