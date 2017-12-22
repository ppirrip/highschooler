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
            `${numFinanceEvents} work related, and`,
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
        this.emit('SayHello'); // just a place holder
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
        this.emit('SayHello'); // just a place holder
    },
    'RestartGameIntent': function () {
        console.log('RestartGameIntent');
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
