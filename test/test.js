const Nightmare = require('nightmare');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test_url = "file:///"+path.resolve(__dirname,"../test/index.html");

const nightmare = Nightmare({
    webPreferences  : {
    partition : 'nopersist',
    preload: path.resolve(__dirname,'./preload.js')
  },
  show: true
});

describe('link clicked',() => {
  it('should fetch contents', (done) => {
    nightmare.goto(test_url)
      .click('.uc-card')
      .evaluate(() => {
        return document.querySelector('.js-test-title').innerText;
      })
      .then((result) => {
        assert.equal(result,'Sample Entry');
        done();
      })
      .catch((error) => {
        done(error);
      });
  });
});