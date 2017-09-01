'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../lib/util.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assign = require('es6-object-assign').assign;

var defaults = {
  classNames: {
    LookForward: 'lookforward',
    LookForwardBody: 'lookforward-body',
    LookForwardInner: 'lookforward-inner',
    LookForwardClose: 'lookforward-close',
    LookForwardCloseBtn: 'lookforward-close-btn',
    LookForwardHeader: 'lookforward-header'
  },
  scrapedArea: '.js-lookforward-target'
};

var LookForward = function () {
  function LookForward(selector) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, LookForward);

    this.options = assign({}, defaults, options);
    var id = (0, _util.getUniqId)();
    var ele = typeof selector === 'string' ? document.querySelector(selector) : selector;
    this.id = id;
    this.currentUrl = location.href;
    if (!ele) {
      return;
    }
    ele.addEventListener('click', function (event) {
      event.preventDefault();
      var href = ele.getAttribute('href');
      (0, _util.fetch)(href).then(function (doc) {
        var html = doc.querySelector(_this.options.scrapedArea);
        if (!html) {
          return;
        }
        var build = _this.buildHtml(html.innerHTML, id);
        var body = document.querySelector('body');
        body.style.overflow = 'hidden';
        (0, _util.append)(body, build);
        var closeBtn = document.querySelector('#' + id + ' .js-lookforward-close-btn');
        closeBtn.addEventListener('click', function () {
          _this.removeModal();
        });
        if (window.history) {
          window.history.replaceState({}, "", href);
        }
      });
    });
  }

  _createClass(LookForward, [{
    key: 'removeModal',
    value: function removeModal() {
      var _this2 = this;

      var classNames = this.options.classNames;
      var modal = document.querySelector('#' + this.id);
      var body = document.querySelector('body');
      (0, _util.addClass)(modal, classNames.LookForwardClose);
      setTimeout(function () {
        (0, _util.remove)(modal);
        body.style.overflow = 'hidden';
        if (window.history) {
          window.history.replaceState({}, "", _this2.currentUrl);
        }
      }, 300);
    }
  }, {
    key: 'buildHtml',
    value: function buildHtml(html, id) {
      var classNames = this.options.classNames;
      return '\n      <div class="' + classNames.LookForward + '" id="' + id + '">\n        <div class="' + classNames.LookForwardBody + '">\n          <div class="' + classNames.LookForwardHeader + '">\n            <button class="' + classNames.LookForwardCloseBtn + ' js-lookforward-close-btn"></button>\n          </div>\n          <div class="' + classNames.LookForwardInner + '">\n            ' + html + '\n          </div>\n        </div>\n      </div>\n    ';
    }
  }]);

  return LookForward;
}();

exports.default = LookForward;
module.exports = exports['default'];