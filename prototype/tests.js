/*
  tests.js: Unit testing
*/

const assert = require('assert');
const globals = require('./globals.js');
const Parser = require('./parser.js');
const tokens = require('./tokens.js');

const re1 = "a(b|c)d"
const re2 = "f*re(he|jd)*"
const re3 = "[A-Z0-4]*"
const re4 = "x+"
const re5 = "x?"
const re6 = "."
const re7 = ".*"
const re8 = "(ab*c+d?.[0-9][xyz]*(uv|w))+"

/*  Abbreviated constructors, which make test data less tedious */
function union(l, r) { return new tokens.Union(l, r); }
function seq(l, r) { return new tokens.Sequence(l, r); }
function star(b) { return new tokens.Star(b); }
function plus(b) { return new tokens.Plus(b); }
function q(b) { return new tokens.Question(b); }
function charseq(l, r) { return new tokens.CharsetSequence(l, r); }
function range(f, l) { return new tokens.Range(f, l); }
function char(c) { return new tokens.Character(c); }
function dot() { return new tokens.Dot(); }
function empty() { return new tokens.Empty(); }

// ab*c+[A-Za-z]
let re = seq(
          char('a'), 
          seq(
            star(char('b')), 
            seq(
              q(char('c')), 
              charseq(
                range(char('A'), char('Z'), 
                range(char('a'), char('z')))))));

console.log(re);

it('peek() returns 0th char of regex', () => {
  const p = new Parser(re1);
  assert.equal(p.peek(), 'a');
  const p2 = new Parser(re3);
  assert.equal(p2.peek(), '[');
});

it('eat() shortens re by a char off the front', () => {
  const p = new Parser(re4);
  p.eat('x')
  assert.equal(p.re, '+');
  p.eat('+')
  assert.equal(p.re, '');
});

it('next() eats a character and returns it', () => {
  const p = new Parser(re2);
  assert.equal(p.next(), 'f');
  assert.equal(p.re, '*re(he|jd)*');

  assert.equal(p.next(), '*');
  assert.equal(p.re, 're(he|jd)*');

  assert.equal(p.next(), 'r');
  assert.equal(p.re, 'e(he|jd)*');
});

it('more() determines if there is any input left to process', () => {
  const p = new Parser(re7);
  assert.equal(p.more(), true);
  p.next();
  assert.equal(p.more(), true);
  p.next();
  assert.equal(p.more(), false);
});