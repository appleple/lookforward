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
    LookForwardModalDismiss: 'lookforward-dismiss'
  },
  scrapedArea: '.js-lookforward-target'
};

var LookForward = function () {
  function LookForward(selector) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, LookForward);

    this.options = assign({}, defaults, options);
    this.id = (0, _util.getUniqId)();
    var ele = typeof selector === 'string' ? document.querySelector(selector) : selector;
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
        var build = _this.buildHtml(html.innerHTML);
        var body = document.querySelector('body');
        (0, _util.append)(body, build);
      });
    });
  }

  _createClass(LookForward, [{
    key: 'buildHtml',
    value: function buildHtml(html) {
      var classNames = this.options.classNames;
      return '\n      <div class="' + classNames.LookForward + '">\n        <div class="' + classNames.LookForwardBody + '">\n          ' + html + '\n        </div>\n      </div>\n    ';
    }
  }]);

  return LookForward;
}();

exports.default = LookForward;
module.exports = exports['default'];