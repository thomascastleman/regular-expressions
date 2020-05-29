/*
  tests.js: Unit testing
*/

const assert = require('assert');
const globals = require('./globals.js');
const Parser = require('./parser.js');
const tokens = require('./tokens.js');


/*  Example regular expression strings */
const re1 = "a(b|c)d"
const re2 = "f*re(he|jd)*"
const re3 = "[A-Z0-4]*"
const re4 = "x+"
const re5 = "x?"
const re6 = "."
const re7 = ".*"
const re8 = "(ab*c+d?.[0-9][xyz]*(uv|w))+"

/*  Abbreviated constructors for tokens, which make 
    test data for parsing less tedious */
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

/*  Example basic regular expressions, to unit test each 
    token individually as best we can. */

const basic_1 = "";
const basic_parsed_1 = empty();

const basic_2 = "a";
const basic_parsed_2 = char('a');

const basic_3 = ".";
const basic_parsed_3 = dot();

const basic_4 = "a|b";
const basic_parsed_4 = union(char('a'), char('b'));

const basic_5 = "a*";
const basic_parsed_5 = star(char('a'));

const basic_6 = "a+";
const basic_parsed_6 = plus(char('a'));

const basic_7 = "a?";
const basic_parsed_7 = q(char('a'));

const basic_8 = "ab";
const basic_parsed_8 = seq(char('a'), char('b'));

const basic_9 = "[f-m]";
const basic_parsed_9 = range('f', 'm');

const basic_10 = "[xyz]";
const basic_parsed_10 = charseq(charseq(char('x'), char('y')), char('z'));


/*  More complex examples, with their parse trees,
    and desugared parse trees. For testing parsing in full. */
const pre_parse_1 = "abcd";
const sugar_parse_1 = 
  seq(
    seq(
      seq(
        char('a'), 
        char('b')), 
      char('c')), 
    char('d'));

const pre_parse_2 = "xy|z";
const sugar_parse_2 = 
  union(
    seq(
      char('x'),
      char('y')),
    char('z'));

const pre_parse_3 = "x*y+z?.*";
const sugar_parse_3 = 
  seq(
    seq(
      seq(
        star(char('x')),
        plus(char('y'))),
      q(char('z'))),
    star(dot()));

const pre_parse_4 = "[A-Zxy]";
const sugar_parse_4 = 
  charseq(
    charseq(
      range('A', 'Z'),
      char('x')),
    char('y'));

const pre_parse_5 = "((a|b|cd)*[x0-9y]?)+";
const sugar_parse_5 = 
  plus(
    seq(
      star(
        union(
          char('a'),
          union(
            char('b'),
            seq(
              char('c'),
              char('d'))))),
      q(
        charseq(
          charseq(
            char('x'),
            range('0', '9')),
          char('y')))));
    

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