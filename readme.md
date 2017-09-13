# lookforward
[![npm version](https://badge.fury.io/js/lookforward.svg)](https://badge.fury.io/js/lookforward)
[![CircleCI](https://circleci.com/gh/appleple/lookforward/tree/master.svg?style=shield)](https://circleci.com/gh/appleple/lookforward/tree/master)
[![npm download](http://img.shields.io/npm/dm/lookforward.svg)](https://www.npmjs.com/package/lookforward)
[![GitHub license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://raw.githubusercontent.com/appleple/lookforward/master/LICENSE)

It supports simple page transitions using HistoryAPI

See [https://appleple.github.io/lookforward/](https://appleple.github.io/lookforward/) for complete docs and demos<br/>

## Feature


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
    new LookForward(".js-lookforward");
});
```

jquery-lookforward.js
```js
$(function(){
    $(".js-lookforward").lookforward();
});
```

```html
<a href="./a.html" class="js-lookforward" data-transition-enter="slideup" data-transition-leave="slidedown">Open</a>
```

### Option

```js
{
  classNames: {
    LookForward: 'lookforward',
    LookForwardBody: 'lookforward-body',
    LookForwardInner: 'lookforward-inner',
    LookForwardClose: 'lookforward-close',
    LookForwardCloseBtn: 'lookforward-close-btn',
    LookForwardHeader: 'lookforward-header',
    LookForwardFooter: 'lookforward-footer'
  },
  scrapedArea: 'body', // Area to be scraped
  useHistoryApi: true // Rewrite URL on page transitions using HistoryAPI
}
```

### Event

```js
// when the modal is opened
lookforward.on('open',function(e){
  console.log('open');
});

// when the modal is closed
lookforward.on('close',function(e){
  console.log('close');
});

// when all modals are closed
lookforward.on('closeAll',function(e){
  console.log('closeAll');
});
```

### Tips

If you want to execute JavaScript on each pages, I recommend you specifying scraped area so to exclude common JavaScript such as jQuery and include local JavaScript.
The following is the example how

```html
<body>
  <div class="js-lookforward-body">
    <!-- contents here -->
    <script src="/path/to/local.js"></script>
  </div>
  <script src="/path/to/lookforward.js"></script>
  <script>
  new LookForward('.js-lookforward', {
    scrapedArea: '.js-lookforward-body',
    execInnerScript: true
  });
  </script>
</body>
```


## Download
[Download ZIP](https://github.com/appleple/lookforward/archive/master.zip)

## Github
[https://github.com/appleple/lookforward](https://github.com/appleple/lookforward)

## Contributor
[@steelydylan](https://github.com/steelydylan)

## License
Code and documentation copyright 2017 by appleple, Inc. Code released under the [MIT License](https://github.com/appleple/lookforward/blob/master/LICENSE).
