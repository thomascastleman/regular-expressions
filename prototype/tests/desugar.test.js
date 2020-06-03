/*
  desugar.test.js: Unit testing for parse tree desugarer
*/

const assert = require('assert');
const {
  union, seq, star, plus, q, charseq, range, char, dot, empty,
  digit, word, whitespace, exact, rangequant, atleast, atmost
} = require('./globals.test.js');