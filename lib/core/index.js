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
  animation: 'slideup',
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
    this.currentUrl = location.href;
    if (!eles) {
      return;
    }
    [].forEach.call(eles, function (ele) {
      _this.addClickEvent(ele);
    });
    if (window.history && this.options.useHistoryApi) {
      window.addEventListener('popstate', function (event) {
        if (event.state && event.state.pushed) {
          _this.addModal(event.state.html);
        } else {
          _this.removeModal();
        }
      });
    }
  }

  _createClass(LookForward, [{
    key: 'addClickEvent',
    value: function addClickEvent(ele) {
      var _this2 = this;

      var id = this.id;
      ele.addEventListener('click', function (event) {
        event.preventDefault();
        var href = ele.getAttribute('href');
        var transition = ele.dataset.transition;
        (0, _util.fetch)(href).then(function (doc) {
          var target = doc.querySelector(_this2.options.scrapedArea);
          if (!target) {
            return;
          }
          var html = _this2.buildHtml(target.innerHTML, id, transition);
          _this2.addModal(html);
          if (window.history && _this2.options.useHistoryApi) {
            window.history.pushState({ pushed: true, html: html }, '', href);
          }
        });
      });
    }
  }, {
    key: 'addModal',
    value: function addModal(build) {
      var _this3 = this;

      var id = this.id;
      var body = document.querySelector('body');
      body.style.overflow = 'hidden';
      (0, _util.append)(body, build);
      var closeBtn = document.querySelector('#' + id + ' .js-lookforward-close-btn');
      closeBtn.addEventListener('click', function () {
        if (window.history && _this3.options.useHistoryApi) {
          window.history.back();
        }
        _this3.removeModal();
      });
    }
  }, {
    key: 'removeModal',
    value: function removeModal() {
      var classNames = this.options.classNames;
      var modal = document.querySelector('#' + this.id);
      var body = document.querySelector('body');
      if (!modal) {
        return;
      }
      (0, _util.addClass)(modal, classNames.LookForwardClose);
      setTimeout(function () {
        (0, _util.remove)(modal);
        body.style.overflow = '';
      }, 300);
    }
  }, {
    key: 'buildHtml',
    value: function buildHtml(html, id, transition) {
      var classNames = this.options.classNames;
      return '\n      <div class="' + classNames.LookForward + '" id="' + id + '">\n        <div class="' + classNames.LookForwardBody + '">\n          <div class="' + classNames.LookForwardHeader + '">\n            <button class="' + classNames.LookForwardCloseBtn + ' js-lookforward-close-btn"></button>\n          </div>\n          <div class="' + classNames.LookForwardInner + ' _' + transition + '">\n            ' + html + '\n          </div>\n          <div class="' + classNames.LookForwardFooter + '">\n          </div>\n        </div>\n      </div>\n    ';
    }
  }]);

  return LookForward;
}();

exports.default = LookForward;
module.exports = exports['default'];