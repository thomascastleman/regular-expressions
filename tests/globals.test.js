/*
  globals.test.js: Globals specifically for testing purposes
*/

const tokens = require('../src/tokens.js');

/*  Abbreviated constructors for tokens, which make creating
    test data for parsing/desugaring/NFA construction less verbose */
function union(l, r) { return new tokens.Union(l, r) }
function seq(l, r) { return new tokens.Sequence(l, r) }
function star(b) { return new tokens.Star(b) }
function plus(b) { return new tokens.Plus(b) }
function q(b) { return new tokens.Question(b) }
function charseq(l, r) { return new tokens.CharsetSequence(l, r) }
function range(f, l) { return new tokens.Range(f, l) }
function char(c) { return new tokens.Character(c) }
function dot() { return new tokens.Dot() }
function empty() { return new tokens.Empty() }
function digit() { return new tokens.Digit() }
function word() { return new tokens.Word() }
function whitespace() { return new tokens.Whitespace() }
function exact(b, c) { return new tokens.ExactQuantifier(b, c) }
function rangequant(b, mi, ma) { return new tokens.RangeQuantifier(b, mi, ma) }
function atleast(b, mi) { return new tokens.AtLeastQuantifier(b, mi) }
function atmost(b, ma) { return new tokens.AtMostQuantifier(b, ma) }

module.exports = {
  union,
  seq,
  star,
  plus,
  q,
  charseq,
  range,
  char,
  dot,
  empty,
  digit,
  word,
  whitespace,
  exact,
  rangequant,
  atleast,
  atmost
}