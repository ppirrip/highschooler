'use strict';


// use bind, apply or call ...
// e.g. emitResponse.call(this,'SayGreeting', textCard, speechOutput, reprompt);
function emitResponse(titleCard, textCard, speak, reprompt) {
    this.response.cardRenderer(titleCard,textCard);
    if (reprompt == undefined) {
        this.response.speak(speak);
    } else {
        this.response.speak(speak).listen(reprompt);
    }

    // might as well log to Cloud Watch here
    console.log(titleCard + ' : ' + textCard);

    // added return just in case
    // seems like for :elicitSlot and :confirmSlot return is explicitly required
    return this.emit(':responseReady'); // added return just in case
}

//function 

function rand(n) {
    return Math.floor(Math.random() * n);
}

function removeSSML (s) {
    return s.replace(/<\/?[^>]+(>|$)/g, "");
}

function addPTag(msg) {
    return '<p>' + msg + '</p>';
}

function addEmphsis(msg) {
    return '<emphasis level="strong">' + msg + '</emphasis>';
}

function arrayToSpeech(msgArr)
{
    return msgArr.map(addPTag).join(' ');
}

function addLongPause(seconds) {
    return `<break time="${seconds}s"/>`;
}

function removeSSML (s) {
    return s.replace(/<\/?[^>]+(>|$)/g, "");
}

// use when Object.values not supported
function objectValues(obj) {
    return Object.keys(obj).map(key => obj[key]);
}

module.exports = {
    objectValues: objectValues,
    emitResponse: emitResponse,
    rand : rand,
    addPTag: addPTag,
    addEmphsis: addEmphsis,
    addLongPause: addLongPause,
    arrayToSpeech: arrayToSpeech,
    removeSSML: removeSSML
};