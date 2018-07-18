'use strict'

const Rx = require('rxjs');
const CollectionName = "CollectionName";//please change
const { CustomError } = require('../tools/customError');


class HourAccumulatorDA{
  /**
   * get hello world data
   * @param {string} type
   */
  static getHelloWorld$(evt) {    
    return Rx.Observable.of( {sn:`Hello World ${Date.now()}`} );
  }
}

module.exports =  HourAccumulatorDA 