class CellError {
    constructor (data) {
        this.data = data;
        this.next = null;
    }
}

class SameTypeErrors {
    constructor () {
        this.head = null;
        this.tail = null;
    }

    insertError (error) {
        const cell = new CellError(error);
        if (!this.head) {
            this.head = cell;
            this.tail = cell;
        } else {
            this.tail.next = cell;
            this.tail = cell;
        }
    }
}

// test:

const errors = {
    dataTest11: {
        0: {
            type: 'FE',
            detail: 'Format mismatch. Supported format: ^(0[1-9]|[1-2][0-9]|3[01])$.'
        }
    },
    dateTest1: {
        1: {
            type: 'FE',
            detail: 'Format mismatch. Supported format: ^(?:(?:19|20)\\d{2})-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2]\\d|3[0-1])$.'
        }
    },
    dateTest10: {},
    dateTest12: {},
    dateTest13: {},
    dateTest14: {},
    dateTest15: {},
    dateTest16: {
        0: {
            type: 'FE',
            detail: 'Format mismatch. Supported format: (0[1-9]|[12][0-9]|3[01])\\/(0[1-9]|1[0,2])\\/(19|20)\\d{2}$.'
        }
    },
    dateTest17: {
        0: {
            type: 'FE',
            detail: 'Format mismatch. Supported format: ^(0[1-9]|[12][0-9]|3[01])\\/(0[1-9]|1[0-2])\\\\d{2}$.'
        },
        1: {
            type: 'FE',
            detail: 'Format mismatch. Supported format: ^(0[1-9]|[12][0-9]|3[01])\\/(0[1-9]|1[0-2])\\\\d{2}$.'
        }
    },
    dateTest18: {
        0: {
            type: 'FE',
            detail: 'Format mismatch. Supported format: ^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/(19|20)\\d{2}$.'
        },
        1: {
            type: 'FE',
            detail: 'Format mismatch. Supported format: ^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/(19|20)\\d{2}$.'
        }
    },
    dateTest19: {},
    dateTest2: {},
    dateTest20: {},
    dateTest21: {},
    dateTest22: {},
    dateTest3: {},
    dateTest4: {},
    dateTest5: {},
    dateTest6: {
        1: {
            type: 'FE',
            detail: 'Format mismatch. Supported format: ^(?:(?:19|20)\\d{2})-(?:0[1-9]|[1-2]\\d{2}|3[0-5]\\d|36[0-6])$.'
        }
    },
    dateTest8: {
        1: {
            type: 'FE',
            detail: 'Format mismatch. Supported format: ^(?:(?:19|20)\\d{2})(?:0[1-9]|[1-2]\\d{2}|3[0-5]\\d|36[0-6])$.'
        }
    },
    dateTest9: {}
};

const rowsWithErrors = {};

// iterate for key , value in errors object.
for (const [key, value] of Object.entries(errors)) {
    if (Object.keys(value).length === 0) {
        continue;
    } else {
        const index = Object.keys(value);
        for (const idx in index) {
            if (idx in rowsWithErrors) {
                rowsWithErrors[idx].push(key);
            } else {
                rowsWithErrors[idx] = [key];
            }
        }
    }
}

const errorObject = new SameTypeErrors();
for (const col in rowsWithErrors[0]) {
    errorObject.insertError(rowsWithErrors[0][col]);
}
// console.log(rowsWithErrors);
console.log(errorObject);
