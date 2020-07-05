
// replace() can replace all matches with a given string

const RegularExpression = require('../src/regex.js');

/*  ----------------- Dollar amounts ----------------- */
const money = new RegularExpression('$([0-9,]+)?[.][0-9]+');

money.replace(
  `The bread was $3.49, the ticket will be $240.89, and the soup is $.45.`,
  "____")
// = "The bread was ____, the ticket will be ____, and the soup is ____."


/*  ----------------- Dates ----------------- */
const dates = new RegularExpression('\\d{1,2}[-/]\\d{1,2}[-/](\\d{2}|\\d{4})');

dates.replace(
  `Previous meeting: 11/8/16. The next meeting will be on 6/04/2021, ` + 
  `and the follow-up will occur on 08/30/2022.`,
  "<DATE REDACTED>")
// =  "Previous meeting: <DATE REDACTED>. The next meeting will be " +
//    "on <DATE REDACTED>, and the follow-up will occur on <DATE REDACTED>."