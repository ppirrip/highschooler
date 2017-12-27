'use strict';

const constant = require('./constant');

const helpDialog = [
    'welcome to highschooler challenge.', 
    //'as a typical high school student', 
    //'you juggles many conflicting priorities.',
    'this game challenges you on how to manage your free time as a high school student.'
];

const instructionGameDialog = [
    'you can just say put five hours into school etc., or say tell me events on Monday.',
];

const instructionAllocateDialog = [
    'just say start the week or put more or less hours into school, fun, work etc.',
];

const instructionDialog = [
    `every week you have ${constant.timeAvailable} hours`,
    'to spent on school, work and fun activities.',
    'you can said I want to put 5 extra hours in school etc.',
    'you will get a status report every week.',
    'when you are ready, just say game start.', 
    '<break time="0.5s"/>',
    'ready player one?'
];

const startGamePrompt = [
    'when you are ready, just said start game.<break time="0.2s"/> ready player one?'
];

const eventSummaryDialog = [

];

const welcomeMsg = helpDialog[0];

module.exports = {
    welcome: [welcomeMsg],
    help: helpDialog,
    instruction: instructionDialog,
    eventSummary: eventSummaryDialog,
    startGamePrompt: startGamePrompt,
    instructionGameDialog: instructionGameDialog,
    instructionAllocateDialog: instructionAllocateDialog
};