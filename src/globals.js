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
  EMPTY : 9,
  DIGIT : 10,
  WORD : 11,
  WHITESPACE : 12,
  EXACT_QUANTIFIER : 13,
  RANGE_QUANTIFIER : 14,
  AT_LEAST_QUANTIFIER : 15,
  AT_MOST_QUANTIFIER : 16,

  set_union: set_union

}

// thank you https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function set_union(setA, setB) {
  let _union = new Set(setA)
  for (let elem of setB) {
      _union.add(elem)
  }
  return _union
}