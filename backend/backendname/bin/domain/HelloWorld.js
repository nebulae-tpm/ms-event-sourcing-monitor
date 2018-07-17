"use strict";

const Rx = require("rxjs");
const HelloWorldDA = require("../data/HelloWorldDA");
const broker = require("../tools/broker/BrokerFactory.js")();

/**
 * Singleton instance
 */
let instance;

class HelloWorld {
  constructor() {

  }


  /**
   *  HelloWorld Query, please remove
   *  this is a queiry form GraphQL
   */
  getHelloWorld$(request) {
    return HelloWorldDA.getHelloWorld$();
  }

  /**
   * Handle HelloWorld Query, please remove
   * This in an Event HAndler for Event-Sourcing events
   */
  handleHelloWorld$(evt) {
    return Rx.Observable.of('Some process for HelloWorld event');
  }

}

module.exports = () => {
  if (!instance) {
    instance = new HelloWorld();
    console.log(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};
