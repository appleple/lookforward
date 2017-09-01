const Promise = require('es6-promise-polyfill').Promise;

export const fetch = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      resolve(xhr.response);
    }
    xhr.onerror = () => {
      reject();
    }
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
  });
}

export const append = (element,string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(string, 'text/html');
  element.appendChild(doc.querySelector('body').childNodes[0]);
}

export const getUniqId = () => {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
}

export const remove = (element) => {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

export const addClass = (element,className) => {
  if (element.classList) {
    element.classList.add(className);
  } else {
    element.className += ` ${className}`;
  }
}