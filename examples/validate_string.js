
const RegularExpression = require('../src/regex.js');

// regular expression describing common phone number formats
const phone = new RegularExpression('\\(?\\d{3}\\)?(-| )\\d{3}-?\\d{4}');

phone.recognize('(555)-555-5555');  // true
phone.recognize('8712653103');      // true
phone.recognize('(488) 279-6104');  // true

phone.recognize('not a phone');   // false
phone.recognize('417-889-40156'); // false