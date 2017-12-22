'use strict';

const PRIORITY = {
    school:'school',
    social:'social',
    finance:'finance',
}

const SCHOOL = {
    passing_test:'_passing_test',
    complete_project:'_complete_project',
    practice_extracurricular:'_practice_extracurricular'
};

const FINANCE = {
    partime_job: '_partime_job'
};

const SOCIAL = {
    someone_birthday:'_someone_birthday',
    go_on_date:'_go_on_date',
    go_to_concert:'_go_to_concert',
    go_to_movie:'_go_to_movie'
};

const GRADE = {
    'A':0.9,
    'B':0.7,
    'C':0.5,
    'D':0.3,
    'E':0.0
};

const WEEK_DAYS = {
    'monday':'monday',
    'tuesday':'tuesday',
    'wednesday':'wednesday',
    'thrusday':'thrusday',
    'friday':'friday',
    'saturday':'saturday',
    'sunday':'sunday'
};

const TIME_AVAILABLE = 40; // hours

module.exports = {
    timeAvailable: TIME_AVAILABLE,
    grade: Object.keys(GRADE),
    addGrades: function (g1,g2) {
        const s = (GRADE[g1] + GRADE[g2]) / 2;
        return this.grade[common.objectValues(GRADE).findIndex(x => x <= s)];
    },
    sumGrades: function(gradeArr) {
        const n = gradeArr.length;
        if (n == 0) {
            return 'C';
        } else {
            const gradeVal = gradeArr.map(x => GRADE[x]);
            const avg = gradeVal.reduce((a,v) => a + v) / n;
            return Object.keys(GRADE)[common.objectValues(GRADE).findIndex(x => x <= avg)];
        }
    },
    days: WEEK_DAYS,
    priorities: {
        'school':'school',
        'social':'social',
        'finance':'finance'
    },
    challenges: {
        'school':SCHOOL,
        'finance':FINANCE,
        'social':SOCIAL
    }
};