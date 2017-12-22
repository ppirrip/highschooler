'use strict';
const sch = require('./schedule');
const constant = require('./constant');
const dialog = require('./dialog');
const common = require('./common');

const states = {
    DEFAULT: '',
    GAME_STARTED: '_GAME_STARTED'
};

function gradeEval(grade) {
    switch(grade) {
        case 'A':
            return 'you have very done well ';
        case 'B':
            return 'you have done well ';
        case 'C':
            return 'you did okay ';
        case 'D':
            return 'you did poorly ';
        case 'E':
            return 'you did very pooly ';
        default:
            return undefined;
    }
}

var _main = function() {
    // put this in the session variable
    const weekSchedule = sch.generateWeekSchedule();
    this.attributes['weekSchedule'] = weekSchedule;
    this.attributes['weekCount'] = 0;
    this.attributes['freeHours'] = constant.timeAvailable;
    this.attributes['allocatedHours'] = {
        'school' : 0,
        'fun': 0,
        'work': 0
    };

    //const numEvents = sch.getNumEvents(weekSchedule)

    // help / welcome message
    console.log('===');
    console.log('========== HELP INTENT ==========');
    console.log('===');
    //console.log(common.arrayToSpeech(dialog.help));
    //console.log(common.addLongPause(1));
    //console.log(common.arrayToSpeech(dialog.instruction));
    //console.log(common.addLongPause(0.5));
    //console.log(common.arrayToSpeech(dialog.startGamePrompt));
    const helpMsg = common.arrayToSpeech(dialog.help) +
        common.addLongPause(1) +
        common.arrayToSpeech(dialog.instruction);
    console.log(helpMsg);
    console.log(common.removeSSML(helpMsg))


    console.log('========== HELP INTENT ==========');

    // start game
    console.log('===');
    console.log('========== START GAME INTENT ==========');
    console.log('===');
    this.handler.state = states.GAME_STARTED; // for the StartGameIntent

    const numSchoolEvents = sch.getNumEvents(weekSchedule,constant.priorities.school);
    const numSocialEvents = sch.getNumEvents(weekSchedule,constant.priorities.social);
    const numFinanceEvents = sch.getNumEvents(weekSchedule,constant.priorities.finance);
    const numEvents = numSchoolEvents + numSocialEvents + numFinanceEvents;

    const weekSummaryMsg = [
        `This week you have ${numEvents} events.`, 
        `${numSchoolEvents} school related,`,
        `${numFinanceEvents} work related, and`,
        `${numSocialEvents} events are for fun.`,
        `how do you want to spent the ${this.attributes.freeHours} hours?`,
        dialog.instructionGameDialog
    ];
    console.log(common.arrayToSpeech(weekSummaryMsg));
    console.log('===');
    console.log('========== START GAME INTENT ==========');
    console.log('===');
    
    console.log('===');
    console.log('========== ALLOCATE TIME INTENT ==========');
    console.log('===');

    // do those delegate dialog thing here
    this.attributes.allocatedHours.school = 15;
    this.attributes.allocatedHours.work = 15;
    this.attributes.allocatedHours.fun = 10;

    // prompt after the player provided updates
    const allocateHrsMsg = [
        `you have put ${this.attributes.allocatedHours.school} hours aside for school related events`,
        `${this.attributes.allocatedHours.work} hours aside for part time work and`,
        `${this.attributes.allocatedHours.fun} hours aside for fun.`,
        'are you ready to start the week?'
    ];

    // TODO:
    // need to actually put the hours in the event via sch.assignTime()
    // see code from ASK SCHEDULE INTENT for updating the time allocated
    // need to keep track of remaining time unallocated

    console.log(common.arrayToSpeech(allocateHrsMsg));

    console.log('===');
    console.log('========== ALLOCATE TIME INTENT ==========');
    console.log('===');

    console.log('===');
    console.log('========== ASK SCHEDULE INTENT ==========');
    console.log('===');

    // just do a few cases here
    const w = this.attributes['weekSchedule'];

    const dayAsked = constant.days.monday;
    //const daySchedule = w[dayAsked];
    const daySchedule = sch.getEventsByDay(w,dayAsked); //
    console.log(`schedule for ${dayAsked}:`)
    //console.log(daySchedule);

    // test if no event on that day
    const dayScheduleMsg = common.arrayToSpeech([`on ${dayAsked} you have`].concat(daySchedule.map(x => x.description)));
    console.log(dayScheduleMsg)

    const priAsked = constant.priorities.school;
    //const allEvent = Object.values(w).reduce((a,v) => a.concat(v));
    //const priEvents = allEvent.filter( x => x.priority == priAsked);
    const priEvents = sch.getEventsByPriority(w,priAsked);

    console.log(`schedule for ${priAsked} this week you have`)
    
    const priEventsMsg = common.arrayToSpeech([`for ${priAsked} you have`].concat(priEvents.map(x => x.description)));
    //console.log(priEvents)
    console.log(priEventsMsg)

    //for (const n of priEvents) {
    //    n.timeAllocated = 10;
    //}
    
    // note that the attribute actually updated. JS sucks, sucks good.
    //console.log(this.attributes.weekSchedule);

    console.log('===');
    console.log('========== ASK SCHEDULE INTENT ==========');
    console.log('===');


    console.log('===');
    console.log('========== Judgement INTENT ==========');
    console.log('===');
    
    const weeklyGrades = sch.weeklyReport(this.attributes.weekSchedule);

    const judgementMsg = [
        `This week you have ${numEvents} events`, 
        `you have put ${this.attributes.allocatedHours.school} hours on ${numSchoolEvents} school activities and ${gradeEval(weeklyGrades.school)}`,
        `you have put ${this.attributes.allocatedHours.work} hours on ${numFinanceEvents} work and ${gradeEval(weeklyGrades.finance)}, and`,
        `you have put ${this.attributes.allocatedHours.fun} hours on ${numSocialEvents} fun stuff and ${gradeEval(weeklyGrades.social)}.`,
        'do you want to play again? Just say start game'
    ];
    console.log(common.arrayToSpeech(judgementMsg));

    console.log('===');
    console.log('========== Judgement INTENT ==========');
    console.log('===');

};

// game flow
// present help / instruction
// start game (I might not need different state ... let's see)
// present the high level summary of the week ahead
// ask user for time allocation, or player can ask for more details by day
// plays out the week
// end of week summary
// ask player for another game
function main() {
    var obj = new Object();
    obj['attributes'] = {};
    obj['handler'] = {};
    obj['handlers'] = _main;

    obj.handlers();
}

if (require.main === module) {
    main();
}