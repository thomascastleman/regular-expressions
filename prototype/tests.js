/*
  tests.js: Unit testing
*/

const assert = require('assert');
const Parser = require('./parser.js');
const tokens = require('./tokens.js');

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


/*  #######################################################################
    #------------------ Test control of the input stream -----------------#
    ####################################################################### */

/*  Example regular expression strings */
const re1 = "a(b|c)d"
const re2 = "f*re(he|jd)*"
const re3 = "[A-Z0-4]*"
const re4 = "x+"
const re5 = "x?"

describe('parser auxiliary functions', () => {

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

  it('eat() errors if given a char that doesn\'t match the next', () => {
    const p = new Parser(re1);
    assert.throws(() => {
      p.eat('F');
    });

    const p2 = new Parser(re2);
    assert.throws(() => {
      p.eat('X');
    });
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
    const p = new Parser(re5);
    assert.equal(p.more(), true);
    p.next();
    assert.equal(p.more(), true);
    p.next();
    assert.equal(p.more(), false);
  });

  it('is_special_char() recognizes special characters correctly', () => {
    const p = new Parser(re1);
    assert.equal(p.is_special_char('('), true);
    assert.equal(p.is_special_char(')'), true);
    assert.equal(p.is_special_char('['), true);
    assert.equal(p.is_special_char(']'), true);
    assert.equal(p.is_special_char('*'), true);
    assert.equal(p.is_special_char('+'), true);
    assert.equal(p.is_special_char('?'), true);
    assert.equal(p.is_special_char('|'), true);
    assert.equal(p.is_special_char('.'), true);

    assert.equal(p.is_special_char('a'), false);
    assert.equal(p.is_special_char('#'), false);
    assert.equal(p.is_special_char('G'), false);
  });

});

/*  #######################################################################
    #--------------------- Parsing basic expressions ---------------------# 
    ####################################################################### */

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

const basic_11 = "((((AbCd))))";
const basic_parsed_11 = seq(seq(seq(char('A'), char('b')), char('C')), char('d'));

const basic_12 = "\\*";
const basic_parsed_12 = char('*');

const basic_13 = "((()))";
const basic_parsed_13 = empty();

describe('basic parsing', () => {

  it('empty regex parsed correctly', () => {
    const p = new Parser(basic_1);
    assert.deepEqual(p.parse(), basic_parsed_1);
  });
  
  it('literal character parsed correctly', () => {
    const p = new Parser(basic_2);
    assert.deepEqual(p.parse(), basic_parsed_2);
  });
  
  it('. (dot) token parsed correctly', () => {
    const p = new Parser(basic_3);
    assert.deepEqual(p.parse(), basic_parsed_3);
  });
  
  it('simple union parsed correctly', () => {
    const p = new Parser(basic_4);
    assert.deepEqual(p.parse(), basic_parsed_4);
  });
  
  it('Kleene star parsed correctly', () => {
    const p = new Parser(basic_5);
    assert.deepEqual(p.parse(), basic_parsed_5);
  });
  
  it('+ parsed correctly', () => {
    const p = new Parser(basic_6);
    assert.deepEqual(p.parse(), basic_parsed_6);
  });
  
  it('? parsed correctly', () => {
    const p = new Parser(basic_7);
    assert.deepEqual(p.parse(), basic_parsed_7);
  });
  
  it('simple sequence parsed correctly', () => {
    const p = new Parser(basic_8);
    assert.deepEqual(p.parse(), basic_parsed_8);
  });
  
  it('simple character range parsed correctly', () => {
    const p = new Parser(basic_9);
    assert.deepEqual(p.parse(), basic_parsed_9);
  });
  
  it('character set parsed correctly', () => {
    const p = new Parser(basic_10);
    assert.deepEqual(p.parse(), basic_parsed_10);
  });

  it('heavily nested expression parses correctly', () => {
    const p = new Parser(basic_11);
    assert.deepEqual(p.parse(), basic_parsed_11);
  });

  it('escaped special character parses as literal', () => {
    const p = new Parser(basic_12);
    assert.deepEqual(p.parse(), basic_parsed_12);
  });

  it('nested empty parentheses parses as empty token', () => {
    const p = new Parser(basic_13);
    assert.deepEqual(p.parse(), basic_parsed_13);
  });

});


/*  #######################################################################
    #------------------ Parsing more complex expressions -----------------#
    ####################################################################### */

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

const pre_parse_6 = "x(|y)z";
const sugar_parse_6 = 
  seq(
    seq(
      char('x'),
      union(
        empty(),
        char('y'))),
    char('z'));

describe('parsing more complicated expressions', () => {

  it('abcd parsed correctly', () => {
    const p = new Parser(pre_parse_1);
    assert.deepEqual(p.parse(), sugar_parse_1);
  });

  it('xy|z parsed correctly', () => {
    const p = new Parser(pre_parse_2);
    assert.deepEqual(p.parse(), sugar_parse_2);
  });

  it('x*y+z?.* parsed correctly', () => {
    const p = new Parser(pre_parse_3);
    assert.deepEqual(p.parse(), sugar_parse_3);
  });

  it('[A-Zxy] parsed correctly', () => {
    const p = new Parser(pre_parse_4);
    assert.deepEqual(p.parse(), sugar_parse_4);
  });

  it('((a|b|cd)*[x0-9y]?)+ parsed correctly', () => {
    const p = new Parser(pre_parse_5);
    assert.deepEqual(p.parse(), sugar_parse_5);
  });

  it('x(|y)z parsed correctly (union with empty)', () => {
    const p = new Parser(pre_parse_6);
    assert.deepEqual(p.parse(), sugar_parse_6);
  });

});


/*  #######################################################################
    #------------------------ Erroring expressions -----------------------#
    ####################################################################### */

const err_1 = "*";
const err_2 = "+";
const err_3 = "?";
const err_4 = "((a|b)";     // unmatched left paren
const err_5 = "x*y(z|v))";  // unmatched right paren
const err_6 = ")";
const err_7 = "(";
const err_8 = "[A-Za-z]]";    // bracket out of place
const err_9 = "a]b+c";        // bracket out of place
const err_10 = "xyz*+";       // + out of place
const err_11 = "abc(";        // paren out of place
const err_12 = "+*?";         // unary operators applied to nothing
const err_13 = "(((((()))))"  // this one is just fun

describe('erroring expressions', () => {
  it('lone unary operator fails to parse', () => {
    const p1 = new Parser(err_1);
    const p2 = new Parser(err_2);
    const p3 = new Parser(err_3);

    assert.throws(() => { p1.parse() });
    assert.throws(() => { p2.parse() });
    assert.throws(() => { p3.parse() });
  });

  it('mismatched parentheses fail to parse', () => {
    const p1 = new Parser(err_4);
    const p2 = new Parser(err_5);
    const p3 = new Parser(err_6);
    const p4 = new Parser(err_7);
    const p5 = new Parser(err_13);

    assert.throws(() => { p1.parse() });
    assert.throws(() => { p2.parse() });
    assert.throws(() => { p3.parse() });
    assert.throws(() => { p4.parse() });
    assert.throws(() => { p5.parse() });
  });

  it('out-of-place special character fails to parse', () => {
    const p1 = new Parser(err_8);
    const p2 = new Parser(err_9);
    const p3 = new Parser(err_10);
    const p4 = new Parser(err_11);
    const p5 = new Parser(err_12);

    assert.throws(() => { p1.parse() });
    assert.throws(() => { p2.parse() });
    assert.throws(() => { p3.parse() });
    assert.throws(() => { p4.parse() });
    assert.throws(() => { p5.parse() });
  });
});