"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Promise = require('es6-promise-polyfill').Promise;

var fetch = exports.fetch = function fetch(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject();
    };
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
  });
};

var append = exports.append = function append(element, string) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(string, 'text/html');
  element.appendChild(doc.querySelector('body').childNodes[0]);
};

var prepend = exports.prepend = function prepend(element, string) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(string, 'text/html');
  element.insertBefore(doc.querySelector('body').childNodes[0], element.firstChild);
};

var getUniqId = exports.getUniqId = function getUniqId() {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
};

var remove = exports.remove = function remove(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
};

var addClass = exports.addClass = function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    element.className += " " + className;
  }
};

var triggerEvent = exports.triggerEvent = function triggerEvent(el, eventName, options) {
  var event = void 0;
  if (window.CustomEvent) {
    event = new CustomEvent(eventName, { cancelable: true });
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, false, false, options);
  }
  el.dispatchEvent(event);
};