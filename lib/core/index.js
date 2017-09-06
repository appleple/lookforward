'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../lib/util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assign = require('es6-object-assign').assign;

var defaults = {
  classNames: {
    LookForward: 'lookforward',
    LookForwardBody: 'lookforward-body',
    LookForwardInner: 'lookforward-inner',
    LookForwardClose: 'lookforward-close',
    LookForwardCloseBtn: 'lookforward-close-btn',
    LookForwardHeader: 'lookforward-header',
    LookForwardFooter: 'lookforward-footer'
  },
  transitionEnter: '',
  transitionLeave: '',
  scrapedArea: 'body',
  useHistoryApi: true
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
          var build = _this.buildHtml(state.html, transitionEnter, transitionLeave);
          _this.removeModal(true).then(function () {
            _this.addModal(build);
          });
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
        (0, _util.fetch)(href).then(function (doc) {
          var target = doc.querySelector(_this3.options.scrapedArea);
          if (!target) {
            return;
          }
          var html = _this3.buildHtml(target.innerHTML, transitionEnter, transitionLeave);
          _this3.removeModal(true).then(function () {
            _this3.addModal(html);
          });
          if (window.history && _this3.options.useHistoryApi) {
            window.history.pushState({ pushed: true, html: target.innerHTML, transitionEnter: transitionEnter, transitionLeave: transitionLeave }, '', href);
          }
        });
      });
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
      var closeBtns = document.querySelectorAll('#' + id + ' .js-lookforward-close-btn');
      [].forEach.call(closeBtns, function (closeBtn) {
        closeBtn.addEventListener('click', function () {
          if (window.history && _this4.options.useHistoryApi) {
            window.history.back();
          } else {
            _this4.removeModal();
          }
        });
      });
      if (typeof selector === 'string') {
        var eles = document.querySelectorAll('#' + id + ' ' + selector);
        [].forEach.call(eles, function (ele) {
          _this4.addClickEvent(ele);
        });
      }
      this._fireEvent('open');
    }
  }, {
    key: 'removeModal',
    value: function removeModal(immediate) {
      var _this5 = this;

      return new Promise(function (resolve) {
        var classNames = _this5.options.classNames;
        var modal = document.querySelector('#' + _this5.id + ' [data-root]');
        if (!modal) {
          resolve();
          return;
        }
        if (immediate) {
          resolve();
          setTimeout(function () {
            (0, _util.remove)(modal);
            _this5._fireEvent('close');
          }, 300);
          return;
        }
        (0, _util.addClass)(modal, classNames.LookForwardClose);
        setTimeout(function () {
          (0, _util.remove)(modal);
          _this5._fireEvent('close');
          resolve();
        }, 300);
      });
    }
  }, {
    key: 'buildHtml',
    value: function buildHtml(html, transitionEnter, transitionLeave) {
      var classNames = this.options.classNames;
      return '\n      <div class="' + classNames.LookForward + '" data-root>\n        <div class="' + classNames.LookForwardBody + '">\n          <div class="' + classNames.LookForwardHeader + '">\n            <button class="' + classNames.LookForwardCloseBtn + ' js-lookforward-close-btn"></button>\n          </div>\n          <div class="' + classNames.LookForwardInner + ' _enter-' + transitionEnter + ' _leave-' + transitionLeave + '">\n            ' + html + '\n          </div>\n          <div class="' + classNames.LookForwardFooter + '">\n          </div>\n        </div>\n      </div>\n    ';
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