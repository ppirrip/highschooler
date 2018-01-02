'use strict';

const constant = require('./constant');

const helpDialog = [
    'you can say what\'s up this week, put five hours in school, tell me activities on Monday etc.', 
];

const welcomeDialog = [
    'Welcome to highschooler.', 
    'This game challenges you on how to manage your free time as a high school student.'
];

const instructionGameDialog = [
    'You can just say put five hours into school etc., or say tell me activities on Monday.',
];

const instructionAllocateDialog = [
    'Just say start the week or put hours into school, fun, work etc.',
];

const instructionDialog = [
    ` Every week you have ${constant.timeAvailable} free hours for school, work and fun activities.`,
    'You will get a status report every week based on how you spent those hours.',
    'When you are ready, just say highschooler start.'
];

const startGamePrompt = [
    'When you are ready, just said highschooler start.'
];

const eventSummaryDialog = [

];

const welcomeMsg = helpDialog[0];

module.exports = {
    welcome: welcomeDialog,
    help: helpDialog,
    instruction: instructionDialog,
    eventSummary: eventSummaryDialog,
    startGamePrompt: startGamePrompt,
    instructionGameDialog: instructionGameDialog,
    instructionAllocateDialog: instructionAllocateDialog
};