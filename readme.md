# lookforward
[![npm version](https://badge.fury.io/js/lookforward.svg)](https://badge.fury.io/js/lookforward)
[![CircleCI](https://circleci.com/gh/appleple/lookforward/tree/master.svg?style=shield)](https://circleci.com/gh/appleple/lookforward/tree/master)
[![npm download](http://img.shields.io/npm/dm/lookforward.svg)](https://www.npmjs.com/package/lookforward)
[![GitHub license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://raw.githubusercontent.com/appleple/lookforward/master/LICENSE)

The most easy to use responsive image viwer especially for mobile devices

See [https://appleple.github.io/lookforward/](https://appleple.github.io/lookforward/) for complete docs and demos<br/>
If you are Japasese, See here [https://www.appleple.com/blog/javascript/lookforward-js.html](https://www.appleple.com/blog/javascript/lookforward-js.html) instead.

## Feature
- Intuitive gestures such as pinch-in/pinch-out/drag/swipe
- Use Accelerometer to move images
- Accessible from keyboards and screen-readers
- Show pictures via URL hash
- Can make photo groups

## Installation
- [npm](https://www.npmjs.com/package/lookforward)
- [standalone](https://raw.githubusercontent.com/appleple/smart-photo/master/js/lookforward.js)

via npm
```shell
npm install lookforward --save
```

or yarn

```shell
yarn add lookforward
```

## Usage
require
```js
const lookforward = require('lookforward');
```

lookforward.js
```js
window.addEventListener('DOMContentLoaded',function(){
    new lookforward(".js-lookforward");
});
```

jquery-lookforward.js
```js
$(function(){
    $(".js-lookforward").lookforward();
});
```

### Basic Standalone Usage


### Option

### Event


### SCSS


## Download
[Download ZIP](https://github.com/appleple/lookforward/archive/master.zip)

## Github
[https://github.com/appleple/lookforward](https://github.com/appleple/lookforward)

## Contributor
[@steelydylan](https://github.com/steelydylan)

## License
Code and documentation copyright 2017 by appleple, Inc. Code released under the [MIT License](https://github.com/appleple/lookforward/blob/master/LICENSE).
