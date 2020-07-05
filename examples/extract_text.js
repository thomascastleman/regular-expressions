
// matches() can extract matched text from a document

const RegularExpression = require('../src/regex.js');
const fs = require('fs');

/*  ----------------- Phone Numbers ----------------- */
const phone = new RegularExpression('\\(?\\d{3}\\)?(-| )\\d{3}-?\\d{4}');

phone.matches("My work number is: (775)-284-5551, and my cell is 288-305-4182");
// = [  Match { begin: 19, end: 33, content: '(775)-284-5551' },
//      Match { begin: 50, end: 62, content: '288-305-4182' } ]


/*  ----------------- Poetry ----------------- */
const capitalWords = new RegularExpression('[A-Z]\\w*');

// extract capital words from Marianne Moore's "A Jelly-Fish"
fs.readFile('./data/a_jelly_fish.txt', 'utf8', (err, poem) => {
  if (err) throw err;

  capitalWords.matches(poem);
  // = 
  // [ Match { begin: 1, end: 2, content: 'A' },
  //   Match { begin: 3, end: 8, content: 'Jelly' },
  //   Match { begin: 9, end: 13, content: 'Fish' },
  //   Match { begin: 14, end: 22, content: 'Marianne' },
  //   Match { begin: 23, end: 28, content: 'Moore' },
  //   Match { begin: 30, end: 37, content: 'Visible' },
  //   Match { begin: 50, end: 51, content: 'A' },
  //   Match { begin: 71, end: 73, content: 'An' },
  //   Match { begin: 97, end: 105, content: 'Inhabits' },
  //   Match { begin: 119, end: 129, content: 'Approaches' },
  //   Match { begin: 135, end: 137, content: 'It' },
  //   Match { begin: 148, end: 150, content: 'It' },
  //   Match { begin: 159, end: 162, content: 'You' },
  //   Match { begin: 174, end: 176, content: 'To' },
  //   Match { begin: 187, end: 190, content: 'And' },
  //   Match { begin: 204, end: 207, content: 'You' },
  //   Match { begin: 216, end: 220, content: 'Your' },
  //   Match { begin: 229, end: 231, content: 'It' },
  //   Match { begin: 246, end: 252, content: 'Closes' },
  //   Match { begin: 261, end: 266, content: 'Reach' },
  //   Match { begin: 275, end: 278, content: 'The' },
  //   Match { begin: 284, end: 295, content: 'Surrounding' },
  //   Match { begin: 299, end: 304, content: 'Grows' },
  //   Match { begin: 317, end: 319, content: 'It' },
  //   Match { begin: 332, end: 336, content: 'From' } ]
});