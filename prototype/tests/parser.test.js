/*
  parser.test.js: Unit testing for regular expressions parser
*/

const assert = require('assert');
const Parser = require('../parser.js');
const tokens = require('../tokens.js');

/*  Abbreviated constructors for tokens, which make 
    test data for parsing less tedious */
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

  it('peek() returns char of the regex at current index', () => {
    const p = new Parser(re1);
    assert.equal(p.peek(), 'a');
    const p2 = new Parser(re3);
    assert.equal(p2.peek(), '[');
  });

  it('eat() increments the index up 1', () => {
    const p = new Parser(re4);
    p.eat('x')
    assert.equal(p.index, 1);
    p.eat('+')
    assert.equal(p.index, 2);
  });

  it('eat() errors if given a char that doesn\'t match the next', () => {
    const p = new Parser(re1);
    assert.throws(() => { p.eat('F') });

    const p2 = new Parser(re2);
    assert.throws(() => { p.eat('X') });
  });

  it('next() eats a character and returns it (increments index)', () => {
    const p = new Parser(re2);
    assert.equal(p.next(), 'f');
    assert.equal(p.index, 1);

    assert.equal(p.next(), '*');
    assert.equal(p.index, 2);

    assert.equal(p.next(), 'r');
    assert.equal(p.index, 3);
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
    assert.equal(p.is_special_char('{'), true);
    assert.equal(p.is_special_char('}'), true);
    assert.equal(p.is_special_char('*'), true);
    assert.equal(p.is_special_char('+'), true);
    assert.equal(p.is_special_char('?'), true);
    assert.equal(p.is_special_char('|'), true);
    assert.equal(p.is_special_char('.'), true);

    assert.equal(p.is_special_char('a'), false);
    assert.equal(p.is_special_char('#'), false);
    assert.equal(p.is_special_char('G'), false);
  });

  it('is_digit() recognizes digits correctly', () => {
    const p = new Parser(re1);
    assert.equal(p.is_digit('0'), true);
    assert.equal(p.is_digit('1'), true);
    assert.equal(p.is_digit('2'), true);
    assert.equal(p.is_digit('3'), true);
    assert.equal(p.is_digit('4'), true);
    assert.equal(p.is_digit('5'), true);
    assert.equal(p.is_digit('6'), true);
    assert.equal(p.is_digit('7'), true);
    assert.equal(p.is_digit('8'), true);
    assert.equal(p.is_digit('9'), true);

    assert.equal(p.is_digit('a'), false);
    assert.equal(p.is_digit('&'), false);
    assert.equal(p.is_digit('{'), false);
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

const basic_11 = "(a)";
const basic_parsed_11 = char('a');

const basic_12 = "\\*";
const basic_parsed_12 = char('*');

const basic_13 = "\\d";
const basic_parsed_13 = digit();

const basic_14 = "\\w";
const basic_parsed_14 = word();

const basic_15 = "\\s";
const basic_parsed_15 = whitespace();

const basic_16 = "a{7}";
const basic_parsed_16 = exact(char('a'), 7);

const basic_17 = "a{2,20}";
const basic_parsed_17 = rangequant(char('a'), 2, 20);

const basic_18 = "a{3,}";
const basic_parsed_18 = atleast(char('a'), 3);

const basic_19 = "a{,15}";
const basic_parsed_19 = atmost(char('a'), 15);

describe('unit testing of parsing each token', () => {

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

  it('expression in parentheses parsed correctly', () => {
    const p = new Parser(basic_11);
    assert.deepEqual(p.parse(), basic_parsed_11);
  });

  it('escaped special character parses as literal', () => {
    const p = new Parser(basic_12);
    assert.deepEqual(p.parse(), basic_parsed_12);
  });

  it('\\d parses as digit character class', () => {
    const p = new Parser(basic_13);
    assert.deepEqual(p.parse(), basic_parsed_13);
  });

  it('\\w parses as word character class', () => {
    const p = new Parser(basic_14);
    assert.deepEqual(p.parse(), basic_parsed_14);
  });

  it('\\s parses as whitespace character class', () => {
    const p = new Parser(basic_15);
    assert.deepEqual(p.parse(), basic_parsed_15);
  });

  it('{n} exact count parses correctly', () => {
    const p = new Parser(basic_16);
    assert.deepEqual(p.parse(), basic_parsed_16);
  });

  it('{min,max} range count parses correctly', () => {
    const p = new Parser(basic_17);
    assert.deepEqual(p.parse(), basic_parsed_17);
  });

  it('{min,} \'at least\' parses correctly', () => {
    const p = new Parser(basic_18);
    assert.deepEqual(p.parse(), basic_parsed_18);
  });

  it('{,max} \'at most\' parses correctly', () => {
    const p = new Parser(basic_19);
    assert.deepEqual(p.parse(), basic_parsed_19);
  });

});


/*  #######################################################################
    #------------------ Parsing more complex expressions -----------------#
    ####################################################################### */

/*  More complex examples, with their parse trees. */
const complex_1 = "abcd";
const complex_parsed_1 = 
  seq(
    seq(
      seq(
        char('a'), 
        char('b')), 
      char('c')), 
    char('d'));

const complex_2 = "xy|z";
const complex_parsed_2 = 
  union(
    seq(
      char('x'),
      char('y')),
    char('z'));

const complex_3 = "x*y+z?.*";
const complex_parsed_3 = 
  seq(
    seq(
      seq(
        star(char('x')),
        plus(char('y'))),
      q(char('z'))),
    star(dot()));

const complex_4 = "[A-Zxy]";
const complex_parsed_4 = 
  charseq(
    charseq(
      range('A', 'Z'),
      char('x')),
    char('y'));

const complex_5 = "((a|b|cd)*[x0-9y]?)+";
const complex_parsed_5 = 
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

const complex_6 = "x(|y)z";
const complex_parsed_6 = 
  seq(
    seq(
      char('x'),
      union(
        empty(),
        char('y'))),
    char('z'));

const complex_7 = "[ac](\\d|\\w)\\s*";
const complex_parsed_7 =
  seq(
    seq(
      charseq(
        char('a'), 
        char('c')),
      union(
        digit(), 
        word())),
    star(whitespace()));

const complex_8 = "v{30}x{2,5}y{6,}z{,100}";
const complex_parsed_8 =
  seq(
    seq(
      seq(
        exact(char('v'), 30),
        rangequant(char('x'), 2, 5)),
      atleast(char('y'), 6)),
    atmost(char('z'), 100));

describe('parsing more complicated expressions', () => {

  it('abcd parsed correctly', () => {
    const p = new Parser(complex_1);
    assert.deepEqual(p.parse(), complex_parsed_1);
  });

  it('xy|z parsed correctly', () => {
    const p = new Parser(complex_2);
    assert.deepEqual(p.parse(), complex_parsed_2);
  });

  it('x*y+z?.* parsed correctly', () => {
    const p = new Parser(complex_3);
    assert.deepEqual(p.parse(), complex_parsed_3);
  });

  it('[A-Zxy] parsed correctly', () => {
    const p = new Parser(complex_4);
    assert.deepEqual(p.parse(), complex_parsed_4);
  });

  it('((a|b|cd)*[x0-9y]?)+ parsed correctly', () => {
    const p = new Parser(complex_5);
    assert.deepEqual(p.parse(), complex_parsed_5);
  });

  it('x(|y)z parsed correctly (union with empty)', () => {
    const p = new Parser(complex_6);
    assert.deepEqual(p.parse(), complex_parsed_6);
  });

  it('[ac](\\d|\\w)\\s* parsed correctly', () => {
    const p = new Parser(complex_7);
    assert.deepEqual(p.parse(), complex_parsed_7);
  });

  it('v{30}x{2,5}y{6,}z{,100} parsed correctly', () => {
    const p = new Parser(complex_8);
    assert.deepEqual(p.parse(), complex_parsed_8);
  });

});


/*  #######################################################################
    #---------------------- Interesting edge cases -----------------------#
    ####################################################################### */

const edge_1 = "((((AbCd))))";
const edge_parsed_1 = seq(seq(seq(char('A'), char('b')), char('C')), char('d'));

const edge_2 = "((()))";
const edge_parsed_2 = empty();

const edge_3 = "[*?+.}(]";
const edge_parsed_3 =
  charseq(
    charseq(
      charseq(
        charseq(
          charseq(
            char('*'),
            char('?')),
          char('+')),
        char('.')),
      char('}')),
    char('('));

const edge_4 = "[\\s\\d\\w]";
const edge_parsed_4 = 
  charseq(
    charseq(
      whitespace(),
      digit()),
    word());

const edge_5 = "(ab*c){4,10}";
const edge_parsed_5 = 
  rangequant(
    seq(
      seq(
        char('a'),
        star(char('b'))),
      char('c')),
    4,
    10);

describe('interesting edge cases', () => {

  it('arbitrarily nested expression parses normally', () => {
    const p = new Parser(edge_1);
    assert.deepEqual(p.parse(), edge_parsed_1);
  });

  it('deeply-nested empty expression parses as empty', () => {
    const p = new Parser(edge_2);
    assert.deepEqual(p.parse(), edge_parsed_2);
  });

  it('special characters treated as literals within a charset', () => {
    const p = new Parser(edge_3);
    assert.deepEqual(p.parse(), edge_parsed_3);
  });

  it('character classes \\d, \\w, and \\s recognized within charset', () => {
    const p = new Parser(edge_4);
    assert.deepEqual(p.parse(), edge_parsed_4);
  });

  it('counting works with a sub-expression as base', () => {
    const p = new Parser(edge_5);
    assert.deepEqual(p.parse(), edge_parsed_5);
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
const err_13 = "(((((()))))"; // this one is just fun
const err_14 = "{2}";         // lone count expression
const err_15 = "{5,100}";     // lone range
const err_16 = "{3,}";        // lone at least
const err_17 = "{,18}";       // lone at most
const err_18 = "ab{10c";      // unclosed counting expr
const err_19 = "xy{2.5}z";    // non-integer quantifier
const err_20 = "z{4, 5}";     // whitespace in quantifier

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

  it('lone counting expressions fail to parse without a base', () => {
    const p1 = new Parser(err_14);
    const p2 = new Parser(err_15);
    const p3 = new Parser(err_16);
    const p4 = new Parser(err_17);

    assert.throws(() => { p1.parse() });
    assert.throws(() => { p2.parse() });
    assert.throws(() => { p3.parse() });
    assert.throws(() => { p4.parse() });
  });

  it('unclosed counting expression fails to parse', () => {
    const p1 = new Parser(err_18);
    assert.throws(() => { p1.parse() });
  });

  it('quantifier with non-integer value fails to parse', () => {
    const p1 = new Parser(err_19);
    assert.throws(() => { p1.parse() });
  });

  it('whitespace in quantifier fails to parse', () => {
    const p1 = new Parser(err_20);
    assert.throws(() => { p1.parse() });
  });
});