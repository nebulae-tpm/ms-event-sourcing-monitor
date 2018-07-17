'use strict'

const mongoDB = require('./MongoDB')();
const Rx = require('rxjs');
const CollectionName = "CollectionName";//please change
const { CustomError } = require('../tools/customError');


class HelloWorldDA {
  /**
   * get hello world data
   * @param {string} type
   */
  static getHelloWorld$(evt) {    
    return Rx.Observable.of( {sn:`Hello World ${Date.now()}`} );
  }
}

module.exports =  HelloWorldDA 