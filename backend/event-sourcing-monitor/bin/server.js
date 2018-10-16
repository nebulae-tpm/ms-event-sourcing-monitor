'use strict'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
    require('appmetrics-dash').monitor();
}

const eventSourcing = require('./tools/EventSourcing')();
const eventStoreService = require('./services/event-store/EventStoreService')();
const mongoDB = require('./data/MongoDB').singleton();
const minuteAccumulatorDA = require('./data/MinuteAccumulatorDA');
const hourAccumulatorDA = require('./data/HourAccumulatorDA');
const dayAccumulatorDA = require('./data/DayAccumulatorDA');
const monthAccumulatorDA = require('./data/MonthAccumulatorDA');
const yearAccumulatorDA = require('./data/YearAccumulatorDA');
const graphQlService = require('./services/gateway/GraphQlService')();
const Rx = require('rxjs');

const start = () => {
    Rx.Observable.concat(
        eventSourcing.eventStore.start$(),
        eventStoreService.start$(),
        Rx.Observable.forkJoin(
            minuteAccumulatorDA.start$(),
            hourAccumulatorDA.start$(),
            dayAccumulatorDA.start$(),
            monthAccumulatorDA.start$(),
            yearAccumulatorDA.start$()
        ),
        mongoDB.start$(),
        graphQlService.start$()
    ).subscribe(
        () => { },
        (error) => {
            console.error('Failed to start', error);
            process.exit(1);
        },
        () => console.log('event-sourcing-monitor started')
    );
};

start();



