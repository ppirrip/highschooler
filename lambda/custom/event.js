'use strict';
const constant = require('./constant');
const priorities = constant.priorities;
const challenges = constant.challenges;

const common = require('./common');
const rand = common.rand;

const WEEK_DAYS = Object.keys(constant.days);

const NORMAL_TIME_REQUIRED = 4;

const DESC = {
    'school' : {
        '_passing_test': [
            'mathmatics test'
        ],
        '_complete_project': [
            'history project deadline'
        ],
        '_practice_extracurricular': [
            'baseball practice'
        ]
    },
    'social': {
        '_someone_birthday': [
            'brithday party.'
        ],
        '_go_on_date': [
            'a date with a special someone'
        ],
        '_go_to_concert': [
            'taylor swift concert'
        ],
        '_go_to_movie': [
            'the last jedi'
        ]
    },
    'finance': {
        '_partime_job': [
            'work at the bubble tea place'
        ]
    }
};

// Note: pri.generateEvent(priorities.school, challenges[s].passing_test)
function _generateEvent(pri,challenge,maxTimeReqd = NORMAL_TIME_REQUIRED) {
    if (common.objectValues(priorities).includes(pri) == false ||
        common.objectValues(challenges[pri]).includes(challenge) == false) {
        return {
            'description':'invalid priority or challenge provided'
        };
    }
    const numItems = DESC[pri][challenge].length;
    const day = (pri == priorities.school ? WEEK_DAYS[rand(5)] : WEEK_DAYS[rand(7)])
    const desc = DESC[pri][challenge][rand(numItems)];
    const timeReqd = rand(maxTimeReqd)+1;
    // abstract out the distribution later
    const grade = [1.5,1.2,1,0.5,0].map(x => x * timeReqd).map(Math.ceil);

    const event = {
        'description': desc,
        'priority': pri,
        'challenge': challenge,
        'timeRequired': timeReqd,
        'timeAllocated': 0,
        'grade': grade
    };
    return event;
}

module.exports = {
    'generateEvent': _generateEvent
};
