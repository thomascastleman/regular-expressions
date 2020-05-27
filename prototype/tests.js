/*
  tests.js: Unit testing
*/

const assert = require('assert')
const Parser = require('./parser.js');

const re1 = "a(b|c)d"
const re2 = "f*re(he|jd)*"
const re3 = "[A-Z0-4]*"
const re4 = "x+"
const re5 = "x?"
const re6 = "."
const re7 = ".*"
const re8 = "(ab*c+d?.[0-9][xyz]*(uv|w))+"

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

