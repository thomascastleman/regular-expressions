
// recognize() can perform non-trivial string validation

const RegularExpression = require('../src/regex.js');

/*  ----------------- Phone Numbers ----------------- */
const phone = new RegularExpression('\\(?\\d{3}\\)?(-| )\\d{3}-?\\d{4}');

phone.recognize('(555)-555-5555');  // true
phone.recognize('8712653103');      // true
phone.recognize('(488) 279-6104');  // true

phone.recognize('not a phone');     // false
phone.recognize('417-889-4071156'); // false


/*  ----------------- Zip Codes ----------------- */
const zip = new RegularExpression('\\d{5}(-\\d{4})?');

zip.recognize('88475');       // true
zip.recognize('57004-4635');  // true

zip.recognize('(827)-446-8773');  // false


/*  ----------------- Emails ----------------- */
// addresses from gmail & comcast only
const email = new RegularExpression('[A-Za-z0-9_]+@(gmail\\.com|comcast\\.net)');

email.recognize('thomas@gmail.com'); // true
email.recognize('someone@comcast.net'); // true
email.recognize('aDdRess_0981@comcast.net'); // true

email.recognize('name@gmail.net');  // false (domain mismatch)
email.recognize('not-valid!@gmail.com');  // false (invalid chars)