'use strict';
const appId = 'amzn1.ask.skill.71b78638-8a09-451f-81ef-291d0ebdcbee';

var Alexa = require("alexa-sdk");

// project specific packages
const constant = require('./constant');
const common = require('./common');
const sch = require('./schedule');
const dialog = require('./dialog');

// helpers
function setSessionVar() {
    if(Object.keys(this.attributes).length === 0) {
        this.attributes['weekSchedule'] = sch.generateWeekSchedule();
        this.attributes['weekCount'] = 0;
        this.attributes['freeHours'] = constant.timeAvailable;
        this.attributes['allocatedHours'] = {
            'school' : 0,
            'fun': 0,
            'work': 0
        };
    }
}

function gradeEval(grade) {
    switch(grade) {
        case 'A':
            return 'you have done very well ';
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

const states = {
    DEFAULT: '',
    GAME_STARTED: '_GAME_STARTED'
};

exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'NewSession': function () {
        // this launch when user utter ask, tell etc. that open a new session
        console.log('NewSession');
        setSessionVar.call(this);
        
        //this.emit('AMAZON.HelpIntent');
        this.emit('SayIntro');
    },
    'LaunchRequest': function () {
        // this launch when user utter something like 'open XXX'
        console.log('LaunchRequest');
        setSessionVar.call(this);

        //this.emit('AMAZON.HelpIntent');
        this.emit('SayIntro');
    },
    'HelloWorldIntent': function () {
        // TODO: remove this
        this.emit('SayHello');
    },
    'MyNameIsIntent': function () {
        // TODO: remove this
        this.emit('SayHelloName');
    },
    'SayIntro': function () {
        const helpMsg = common.arrayToSpeech(dialog.help) +
            common.addLongPause(0.5) +
            common.arrayToSpeech(dialog.instruction);

        common.emitResponse.call(this,
            'Ready Play One',
            common.removeSSML(helpMsg),
            helpMsg,
            'when you are ready, just said start game. Ready Player One?'
        );
    },
    'SayHello': function () {
        // TODO: remove this
        this.response.speak('Hello World!')
                     .cardRenderer('hello world', 'hello world');
        this.emit(':responseReady');
    },
    'SayHelloName': function () {
        // TODO: remove this
        var name = this.event.request.intent.slots.name.value;
        this.response.speak('Hello ' + name)
            .cardRenderer('hello world', 'hello ' + name);
        this.emit(':responseReady');
    },
    'StartGameIntent' : function () {
        console.log('StartGameIntent');
        
        this.handler.state = ''; //states.GAME_STARTED;
        const weekSchedule = this.attributes['weekSchedule'];

        const numSchoolEvents = sch.getNumEvents(weekSchedule,constant.priorities.school);
        const numSocialEvents = sch.getNumEvents(weekSchedule,constant.priorities.social);
        const numFinanceEvents = sch.getNumEvents(weekSchedule,constant.priorities.finance);
        const numEvents = numSchoolEvents + numSocialEvents + numFinanceEvents;

        const weekSummaryMsg = common.arrayToSpeech([
            `This week you have ${numEvents} events.`, 
            `${numSchoolEvents} school related,`,
            `${numFinanceEvents} work related and`,
            `${numSocialEvents} events are for fun.`,
            `how do you want to spent the ${this.attributes.freeHours} hours?`,
            dialog.instructionGameDialog
        ]);

        //this.emit('SayHello'); // just a place holder
        common.emitResponse.call(this,
            'Ready to start a new week?',
            common.removeSSML(weekSummaryMsg),
            weekSummaryMsg,
            dialog.instructionGameDialog
        );

    },
    'AllocateTimeIntent': function () {
        console.log('AllocateTimeIntent');

        if (this.event.request.dialogState === "STARTED") {
            console.log('AllocateTimeIntent dialog STARTED');
            this.emit(':delegate', this.event.request.intent);
        } else if (this.event.request.dialogState !== 'COMPLETED') {
            console.log('AllocateTimeIntent dialog IN_PROGRESS');
            this.emit(':delegate');
        } else {
            // All the slots are filled (And confirmed if you choose to confirm slot/intent
            // confirm doesn't make the slots valid!
            const intent = this.event.request.intent;
            const pri = intent.slots.priority.value;
            const hr = parseInt(intent.slots.hour.value);

            let allocateHrsMsg = [];
            let allocateRepromptMsg = []

            if (intent.confirmationStatus !== 'CONFIRMED') {
                if (intent.confirmationStatus !== 'DENIED') {
                    // not confirmed
                    allocateHrsMsg = ['have you done planning your upcoming week?'];
                    allocateHrsMsg += ` ${dialog.instructionAllocateDialog}`;
                    allocateRepromptMsg = dialog.instructionAllocateDialog;
                } else {
                    // denied
                    allocateHrsMsg += ` ${dialog.instructionGameDialog}`;
                    allocateRepromptMsg = dialog.instructionGameDialog;
                }
            } else {
                // all confirmed
                switch (pri) {
                    case 'school':
                        this.attributes.allocatedHours.school = isNaN(hr) ? 0 : hr; 
                        break;
                    case 'work':
                        this.attributes.allocatedHours.work = isNaN(hr) ? 0 : hr;
                        break;
                    case 'fun':
                        this.attributes.allocatedHours.fun = isNaN(hr) ? 0 : hr;
                        break;
                    default:
                        this.attributes.allocatedHours.school = isNaN(hr) ? 0 : hr; 
                }
                const allocatedHours = this.attributes.allocatedHours;
                const totalHrs = allocatedHours.school + allocatedHours.work + allocatedHours.fun;
                if (totalHrs > constant.timeAvailable) {
                    allocateHrsMsg = [
                        `you have planned ${totalHrs} hours for a ${constant.timeAvailable} hours week`,
                        ` are you sure?`,
                        ` you have put ${allocatedHours.school} hours for school activities`,
                        ` ${allocatedHours.work} hours for part time work and`,
                        ` ${allocatedHours.fun} hours for fun.`,
                    ];
                } else {
                    allocateHrsMsg = [
                        `you have put ${allocatedHours.school} hours for school activities`,
                        ` ${allocatedHours.work} hours for part time work and`,
                        ` ${allocatedHours.fun} hours for fun.`,
                        ' are you ready to start the week?'
                    ];
                    
                }
                this.attributes.freeHours = constant.timeAvailable - totalHrs;
            }
            
            allocateHrsMsg += ` ${dialog.instructionAllocateDialog}`;
            allocateRepromptMsg = dialog.instructionAllocateDialog;
            common.emitResponse.call(this,
                `Schedule for ${pri}`,
                common.removeSSML(allocateHrsMsg),
                allocateHrsMsg,
                allocateRepromptMsg
            );

            console.log('AllocateTimeIntent Pri:${pri} Hr:${hr}');
            console.log(JSON.stringify(interaction));
        }
    },
    'AskScheduleEvent': function () {
        console.log('AskScheduleIntent');
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
            // ready to delegate it back to the Dialog (Dialog.Delegate)
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": this.attributes
            });
        } else {
            // here you have all the slots
            if(this.event.request.intent.slots.day != null ) {
                if(this.event.request.intent.slots.day.value != undefined ) {
                    const slotValues = ['monday','tuesday','wednesday','thrusday','friday','saturday','sunday','fun','work','school'];

                    let msg = '';
                    const slot = this.event.request.intent.slots.day.value.toLowerCase();

                    if (slotValues.find (x => x == slot) == undefined) {
                        common.emitResponse.call(this,
                            'I am sorry I missed that',
                            'I am sorry I missed that. would you mind to repeat',
                            'I am sorry I missed that. would you mind to repeat',
                            dialog.instructionGameDialog
                        );
                        return; // just to be safe
                    }

                    if (slot == 'work' || slot == 'school' || slot == 'fun') {
                        // player asked schedule for priorities
                        let pri = '';
                        switch(slot) {
                            // this is stupid
                            case 'school':
                                pri = constant.priorities.school;
                                break;
                            case 'work':
                                pri = constant.priorities.finance;
                                break;
                            case 'fun':
                                pri = constant.priorities.social;
                                break;
                            default:
                            pri = constant.priorities.school;
                        }
                        const priEvents = sch.getEventsByPriority(this.attributes['weekSchedule'],pri);
                        msg = priEvents.length !== 0 ? 
                            common.arrayToSpeech([`for ${slot} you have`].concat(priEvents.map(x => x.description))) :
                            `for ${slot} you have nothing.`;

                    } else {
                        // player asked schedule for a specific day
                        const daySchedule = sch.getEventsByDay(this.attributes['weekSchedule'],slot);
                        msg = daySchedule.length !== 0 ? 
                            common.arrayToSpeech([`on ${slot} you have`].concat(daySchedule.map(x => x.description))) :
                            `on ${slot} you have nothing`;
                    }
                    msg += ` ${dialog.instructionGameDialog}`;
                    common.emitResponse.call(this,
                        `Schedule for ${slot}`,
                        common.removeSSML(msg),
                        msg,
                        dialog.instructionGameDialog
                    );
                    console.log(JSON.stringify(interaction));
                }
            }
            common.emitResponse.call(this,
                'I am sorry I missed that',
                'I am sorry I missed that. would you mind to repeat',
                'I am sorry I missed that. would you mind to repeat',
                dialog.instructionGameDialog
            );
        }
    },
    'JudgementIntent': function () {
        console.log('JudegementIntent');

        const weekSchedule = this.attributes['weekSchedule'];
        
        const f = (p) => sch.getEventsByPriority(this.attributes['weekSchedule'],p);
        const schoolEvents = f(constant.priorities.school);
        const funEvents = f(constant.priorities.social);
        const workEvents = f(constant.priorities.finance);

        const numSchoolEvents = schoolEvents.length;
        const numFunEvents = funEvents.length;
        const numWorkEvents = workEvents.length;
        const numEvents = numSchoolEvents + numFunEvents + numWorkEvents;

        const penalty = this.attributes.freeHours < 0 ? (Math.random() - 0.5)*Math.abs(this.attributes.freeHours) : 0;

        const hrsForSchool = this.attributes.allocatedHours.school + penalty;
        const hrsForFun = this.attributes.allocatedHours.fun + penalty;
        const hrsForWork = this.attributes.allocatedHours.work + penalty;

        for (const n of schoolEvents) {
            n.timeAllocated = hrsForSchool / numSchoolEvents;
        }

        for (const n of funEvents) {
            n.timeAllocated = hrsForFun / numFunEvents;
        }

        for (const n of workEvents) {
            n.timeAllocated = hrsForWork / numWorkEvents;
        }

        const weeklyGrades = sch.weeklyReport(this.attributes.weekSchedule);
        const reprompt = 'do you want to play again? Just say go to next week or another game'
        const judgementMsg = common.arrayToSpeech([
            `This week you have ${numEvents} events`, 
            `you have put ${this.attributes.allocatedHours.school} hours on ${numSchoolEvents} school activities and ${gradeEval(weeklyGrades.school)}`,
            `you have put ${this.attributes.allocatedHours.work} hours on ${numWorkEvents} work and ${gradeEval(weeklyGrades.finance)}, and`,
            `you have put ${this.attributes.allocatedHours.fun} hours on ${numFunEvents} fun stuff and ${gradeEval(weeklyGrades.social)}.`,
            reprompt
        ]);

        this.attributes.weekCount += 1;
        common.emitResponse.call(this,
            `Status report for week ${this.attributes.weekCount}`,
            common.removeSSML(judgementMsg),
            judgementMsg,
            reprompt
        );
    },
    'RestartGameIntent': function () {
        console.log('RestartGameIntent');

        // reset states
        this.attributes['weekSchedule'] = sch.generateWeekSchedule();
        this.attributes['freeHours'] = constant.timeAvailable;
        this.attributes['allocatedHours'] = {
            'school' : 0,
            'fun': 0,
            'work': 0
        };
        this.emit('NewSession');
    },
    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        // TODO: might need a stateful help.
        const helpMsg = common.arrayToSpeech(dialog.startGamePrompt);

        common.emitResponse.call(this,
            'Help',
            common.removeSSML(helpMsg),
            helpMsg,
            helpMsg);
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. You can try: 'alexa, hello world'" +
            " or 'alexa, ask hello world my name is awesome Aaron'");
    }
};
