
const RegularExpression = require('../src/regex.js');

// regular expression describing common phone number formats
const phone = new RegularExpression('\\(?\\d{3}\\)?(-| )\\d{3}-?\\d{4}');

phone.matches("My work number is: (775)-284-5551, and my cell is 288-305-4182");
// = [  Match { begin: 19, end: 33, content: '(775)-284-5551' },
//      Match { begin: 50, end: 62, content: '288-305-4182' } ]