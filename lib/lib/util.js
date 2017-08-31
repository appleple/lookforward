"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Promise = require('es6-promise-polyfill').Promise;

var fetch = exports.fetch = function fetch(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      console.log(xhr.response);
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

var getUniqId = exports.getUniqId = function getUniqId() {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
};