'use strict';
// to put events into a schedule

const event = require('./event');

const constant = require('./constant');
const priorities = constant.priorities;
const challenges = constant.challenges;
const sumGrades = constant.sumGrades;
const priorityList = Object.keys(priorities);

const common = require('./common');
const rand = common.rand;

const MAX_EVENTS = 2; // per day

function _randomEvtTags(day) {
    // remember no school on weekends
    const _pri = (d => 
        (d == constant.days.saturday) || (d == constant.days.sunday) ? 
        priorityList.filter(x => x !== 'school')[rand(priorityList.length-1)] : 
        priorityList[rand(priorityList.length)]
    )(day); 

    const cList = Object.keys(challenges[priorities[_pri]]);
    return {
        pri: priorities[_pri],
        c: challenges[priorities[_pri]][cList[rand(cList.length)]]
    };
}

function _generateDaySchedule(day, num = MAX_EVENTS) {
    const numOfEvents = rand(num) + 1;
    const events = [...Array(numOfEvents)].map(
        x => (
        t => event.generateEvent(t.pri, t.c)
        )(_randomEvtTags(day))
    );
    return events;
}

function _generateWeekSchedule() {
    // should be able to reduce this to one line (maybe 2)
    return {
        monday: _generateDaySchedule(constant.days.monday),
        tuesday: _generateDaySchedule(constant.days.tuesday),
        wednesday: _generateDaySchedule(constant.days.wednesday),
        thrusday: _generateDaySchedule(constant.days.thrusday),
        friday: _generateDaySchedule(constant.days.friday),
        saturday: _generateDaySchedule(constant.days.saturday),
        sunday: _generateDaySchedule(constant.days.sunday)
    };
}

function _assignTime(time,evt) {
    if (evt !== undefined) {
        evt.timeAllocated = time;
        return evt.timeAllocated;
    } else {
        return undefined;
    }
}

function _getEventGrade(event) {
    return constant.grade[event.grade.findIndex(x => x <= event.timeAllocated)];
}

function _getDayGrades(daySchedule) {
    return daySchedule.map(_getEventGrade);
}

function _getWeekGrades(weekSchedule) {
    return common.objectValues(weekSchedule).map( d => d.map(_getEventGrade) );
}

// w[constant.days.monday].filter( x => x.priority == constant.priorities.social)
function _stat(daySchedule) {
    // can use map later if I really want to be fancy
    const schoolEvents = daySchedule.filter( x => x.priority == priorities.school);
    const socialEvents = daySchedule.filter( x => x.priority == priorities.social);
    const financeEvents = daySchedule.filter( x => x.priority == priorities.finance);

    return {
        'school' : sumGrades(_getDayGrades(schoolEvents)),
        'social' : sumGrades(_getDayGrades(socialEvents)),
        'finance': sumGrades(_getDayGrades(financeEvents))
    };
}

function _dailyReport(weekSchedule) {
    // same as Object.values(weekSchedule).map(x => _stat(x)) with no labels
    return {
        monday: _stat(weekSchedule['monday']),
        tuesday: _stat(weekSchedule['tuesday']),
        wednesday: _stat(weekSchedule['wednesday']),
        thrusday: _stat(weekSchedule['thrusday']),
        friday: _stat(weekSchedule['friday']),
        saturday: _stat(weekSchedule['saturday']),
        sunday: _stat(weekSchedule['sunday'])
    };
}

function _weeklyReport(weekSchedule) {
    return _stat(common.objectValues(weekSchedule).reduce((a,v) => a.concat(v)));
}

function getNumEvents(weekSchedule, priority) {
    const l = common.objectValues(weekSchedule).reduce((a,v) => a.concat(v));
    if (priority == undefined) {
        return l.length;
    } else {
        return l.filter(x => x.priority == priority).length;
    }
}

function _getEventsByDay(weekSchedule,day) {
    return weekSchedule[day];
}

function _getEventsByPriority(weekSchedule,pri) {
    const allEvent = common.objectValues(weekSchedule).reduce((a,v) => a.concat(v));
    return allEvent.filter( x => x.priority == pri);
}

module.exports = {
    generateDaySchedule: _generateDaySchedule,
    generateWeekSchedule: _generateWeekSchedule,
    getEvent: function (day,evtNum,weekSchedule) {
        return weekSchedule[day][evtNum];
    },
    assignTime: _assignTime,
    getEventGrade: _getEventGrade,
    getDayGrades: _getDayGrades,
    getWeekGrades: _getWeekGrades,
    dailyReport: _dailyReport,
    weeklyReport: _weeklyReport,
    getNumEvents: getNumEvents,
    getEventsByDay: _getEventsByDay,
    getEventsByPriority: _getEventsByPriority
};