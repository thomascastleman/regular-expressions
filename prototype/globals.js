/*
  globals.js: Global constant definitions
*/

module.exports = {

  /*  Constants representing the "type" of each token--we
      use these to identify the token we're dealing with 
      instead of using instanceof */
  UNION : 0,
  SEQUENCE : 1,
  STAR : 2,
  PLUS : 3,
  QUESTION : 4,
  CHARSET_SEQUENCE : 5,
  RANGE : 6,
  CHARACTER : 7,
  DOT : 8,
  EMPTY : 9

}