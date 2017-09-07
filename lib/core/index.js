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
    if (window.history) {
      this.historyLength = 0;
    }
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
          if (_this.historyLength > state.historyLength) {
            _this.addModal(build, 'prepend', false).then(function () {
              var modals = _this.getModals();
              if (modals && modals.length > 1) {
                _this.removeModal('last');
              }
            });
          } else {
            _this.addModal(build, 'append', true).then(function () {
              var modals = _this.getModals();
              if (modals && modals.length > 1) {
                _this.removeModal('first');
              }
            });
          }
          _this.historyLength = state.historyLength;
        } else {
          _this.removeModal('first', true).then(function () {
            body.style.overflow = '';
            _this._fireEvent('closeAll');
            _this.historyLength = 0;
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
          var id = (0, _util.getUniqId)();
          var html = _this3.buildHtml(target.innerHTML, id, transitionEnter, transitionLeave);
          _this3.addModal(html, 'append', true).then(function () {
            var modals = _this3.getModals();
            if (modals && modals.length > 1) {
              _this3.removeModal('first');
            }
          });
          if (window.history && _this3.options.useHistoryApi) {
            var historyLength = _this3.historyLength;
            window.history.pushState({ pushed: true, html: target.innerHTML, id: id, transitionEnter: transitionEnter, transitionLeave: transitionLeave, historyLength: historyLength }, '', href);
            _this3.historyLength += 1;
          }
        });
      });
    }
  }, {
    key: 'addModal',
    value: function addModal(build) {
      var _this4 = this;

      var which = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'append';
      var animation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      return new Promise(function (resolve) {
        var id = _this4.id;
        var selector = _this4.selector;
        var body = document.querySelector('body');
        var target = document.querySelector('#' + id);
        body.style.overflow = 'hidden';
        if (!animation) {
          build = build.replace('data-animation', 'data-no-animation');
        }
        if (which === 'append') {
          (0, _util.append)(target, build);
        } else if (which === 'prepend') {
          (0, _util.prepend)(target, build);
        }
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
        _this4._fireEvent('open');
        if (animation) {
          setTimeout(function () {
            resolve();
          }, 300);
        } else {
          resolve();
        }
      });
    }
  }, {
    key: 'getModals',
    value: function getModals() {
      return document.querySelectorAll('#' + this.id + ' [data-root]');
    }
  }, {
    key: 'removeModal',
    value: function removeModal(which) {
      var _this5 = this;

      var last = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      return new Promise(function (resolve) {
        var classNames = _this5.options.classNames;
        var modal = document.querySelector('#' + _this5.id + ' [data-root]:' + which + '-child');
        if (!modal) {
          resolve();
        }
        (0, _util.addClass)(modal, classNames.LookForwardClose);
        if (last) {
          setTimeout(function () {
            modal.setAttribute('data-close-animation', 'true');
          }, 10);
        }
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
      return '\n      <div class="' + classNames.LookForward + '" data-root data-animation id="' + id + '">\n        <div class="' + classNames.LookForwardBody + '">\n          <div class="' + classNames.LookForwardHeader + '">\n            <button class="' + classNames.LookForwardCloseBtn + ' js-lookforward-close-btn"></button>\n          </div>\n          <div class="' + classNames.LookForwardInner + ' _enter-' + transitionEnter + ' _leave-' + transitionLeave + '">\n            ' + html + '\n          </div>\n          <div class="' + classNames.LookForwardFooter + '">\n          </div>\n        </div>\n      </div>\n    ';
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