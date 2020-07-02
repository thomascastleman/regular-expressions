/*
  regex.test.js: Testing for functions provided by the regular expression class
*/

const assert = require('assert');
const RE = require('../src/regex.js');

// convenience for constructing output from RegularExpression.matches
function match(begin, end, content) {
  return { begin, end, content };
}

describe('recognize: unit tests for each token', () => {

  it('recognizes character literals', () => {
    const re1 = new RE('x');
    assert.equal(re1.recognize('x'), true);
    assert.equal(re1.recognize('y'), false);
    assert.equal(re1.recognize('X'), false);
    assert.equal(re1.recognize(''), false);

    const re2 = new RE('9');
    assert.equal(re2.recognize('9'), true);
    assert.equal(re2.recognize('A'), false);
    assert.equal(re2.recognize('/'), false);
    assert.equal(re2.recognize(''), false);

    const re3 = new RE('Z');
    assert.equal(re3.recognize('Z'), true);
    assert.equal(re3.recognize('7'), false);
    assert.equal(re3.recognize('z'), false);
    assert.equal(re3.recognize(''), false);

    // doesn't *recognize* longer than just the literal
    const re4 = new RE('j');
    assert.equal(re4.recognize('jack'), false);
    assert.equal(re4.recognize('jennifer'), false);
  });

  it('recognizes escaped chars as literals', () => {
    const re1 = new RE('\\*');
    assert.equal(re1.recognize('*'), true);
    assert.equal(re1.recognize('H'), false);
    assert.equal(re1.recognize('v'), false);
    assert.equal(re1.recognize(''), false);

    const re2 = new RE('\\)');
    assert.equal(re2.recognize(')'), true);
    assert.equal(re2.recognize('('), false);
    assert.equal(re2.recognize(''), false);
    assert.equal(re2.recognize(''), false);

    const re3 = new RE('\\.');
    assert.equal(re3.recognize('.'), true);
    assert.equal(re3.recognize('i'), false);
    assert.equal(re3.recognize('D'), false);
    assert.equal(re3.recognize(''), false);
  });

  it('recognizes empty strings', () => {
    const re = new RE('');

    assert.equal(re.recognize(''), true);
    assert.equal(re.recognize('1'), false);
    assert.equal(re.recognize('a'), false);
    assert.equal(re.recognize('Test'), false);
  });

  it('recognizes any (!= \\n) char with .', () => {
    const re = new RE('.');

    assert.equal(re.recognize('\n'), false);
    assert.equal(re.recognize('A'), true);
    assert.equal(re.recognize('g'), true);
    assert.equal(re.recognize('2'), true);
    assert.equal(re.recognize('&'), true);
    assert.equal(re.recognize('~'), true);
    assert.equal(re.recognize('"'), true);
    assert.equal(re.recognize(']'), true);
    assert.equal(re.recognize('('), true);
  });

  it('recognizes \\d as digit', () => {
    // [0-9]
    const re = new RE('\\d');

    assert.equal(re.recognize('0'), true);
    assert.equal(re.recognize('1'), true);
    assert.equal(re.recognize('2'), true);
    assert.equal(re.recognize('3'), true);
    assert.equal(re.recognize('4'), true);
    assert.equal(re.recognize('5'), true);
    assert.equal(re.recognize('6'), true);
    assert.equal(re.recognize('7'), true);
    assert.equal(re.recognize('8'), true);
    assert.equal(re.recognize('9'), true);

    assert.equal(re.recognize('zero'), false);
    assert.equal(re.recognize('1400'), false);  // not single digit
    assert.equal(re.recognize('X'), false);
  });

  it('recognizes \\w as word char', () => {
    // [A-Za-z0-9_]
    const re = new RE('\\w');

    assert.equal(re.recognize('a'), true);
    assert.equal(re.recognize('h'), true);
    assert.equal(re.recognize('z'), true);
    assert.equal(re.recognize('A'), true);
    assert.equal(re.recognize('J'), true);
    assert.equal(re.recognize('Z'), true);
    assert.equal(re.recognize('0'), true);
    assert.equal(re.recognize('4'), true);
    assert.equal(re.recognize('9'), true);
    assert.equal(re.recognize('_'), true);

    assert.equal(re.recognize('('), false);
    assert.equal(re.recognize('^'), false);
    assert.equal(re.recognize('$'), false);
    assert.equal(re.recognize('.'), false);
    assert.equal(re.recognize(','), false);
    assert.equal(re.recognize('>'), false);
    assert.equal(re.recognize('aa'), false);
  });

  it('recognizes \\s as whitespace', () => {
    // [ \t\r\n\v\f]
    const re = new RE('\\s');

    assert.equal(re.recognize(' '), true);
    assert.equal(re.recognize('\t'), true);
    assert.equal(re.recognize('\r'), true);
    assert.equal(re.recognize('\n'), true);
    assert.equal(re.recognize('\v'), true);
    assert.equal(re.recognize('\f'), true);

    assert.equal(re.recognize('a'), false);
    assert.equal(re.recognize('X'), false);
    assert.equal(re.recognize('\n\n'), false);
  });

  it('recognizes unions', () => {
    const re1 = new RE('a|b');

    assert.equal(re1.recognize('a'), true);
    assert.equal(re1.recognize('b'), true);
    assert.equal(re1.recognize('c'), false);
    assert.equal(re1.recognize('ab'), false);

    const re2 = new RE('5|H');

    assert.equal(re2.recognize('5'), true);
    assert.equal(re2.recognize('H'), true);
    assert.equal(re2.recognize('a'), false);
    assert.equal(re2.recognize('0'), false);

    const re3 = new RE('$|;');

    assert.equal(re3.recognize('$'), true);
    assert.equal(re3.recognize(';'), true);
    assert.equal(re3.recognize('G'), false);
    assert.equal(re3.recognize('$;'), false);

    const re4 = new RE('a|b|c|x|y|z');

    assert.equal(re4.recognize('a'), true);
    assert.equal(re4.recognize('b'), true);
    assert.equal(re4.recognize('c'), true);
    assert.equal(re4.recognize('x'), true);
    assert.equal(re4.recognize('y'), true);
    assert.equal(re4.recognize('z'), true);
    assert.equal(re4.recognize('A'), false);
    assert.equal(re4.recognize('Y'), false);
    assert.equal(re4.recognize('abcxyz'), false);
  });

  it('recognizes sequences', () => {
    const re1 = new RE('xY');

    assert.equal(re1.recognize('xY'), true);
    assert.equal(re1.recognize('x'), false);
    assert.equal(re1.recognize('Y'), false);

    const re2 = new RE('38');

    assert.equal(re2.recognize('38'), true);
    assert.equal(re2.recognize('3'), false);
    assert.equal(re2.recognize('8'), false);

    const re3 = new RE('abcdef');

    assert.equal(re3.recognize('abcdef'), true);
    assert.equal(re3.recognize('abcde'), false);
    assert.equal(re3.recognize('bcdef'), false);
    assert.equal(re3.recognize('acdef'), false);

    const re4 = new RE('test sequence');

    assert.equal(re4.recognize('test sequence'), true);
    assert.equal(re4.recognize('test SEQUENCE'), false);
    assert.equal(re4.recognize('test'), false);
  });

  it('recognizes *', () => {
    const re1 = new RE('a*');

    assert.equal(re1.recognize(''), true);
    assert.equal(re1.recognize('a'), true);
    assert.equal(re1.recognize('aa'), true);
    assert.equal(re1.recognize('aaaaaaaa'), true);
    assert.equal(re1.recognize('abcd'), false);
    assert.equal(re1.recognize('aaaaaaabaaaaaaaa'), false);

    const re2 = new RE('(ABC)*');

    assert.equal(re2.recognize(''), true);
    assert.equal(re2.recognize('ABC'), true);
    assert.equal(re2.recognize('ABCABC'), true);
    assert.equal(re2.recognize('ABCABCABCABCABC'), true);
    assert.equal(re2.recognize('ABCABCxxABCABCABC'), false);

    const re3 = new RE('7*');

    assert.equal(re3.recognize(''), true);
    assert.equal(re3.recognize('7'), true);
    assert.equal(re3.recognize('77'), true);
    assert.equal(re3.recognize('777'), true);
    assert.equal(re3.recognize('7777777777_777'), false);
    assert.equal(re3.recognize('seven'), false);
  });

  it('recognizes +', () => {
    const re1 = new RE('x+');

    assert.equal(re1.recognize('x'), true);
    assert.equal(re1.recognize('xx'), true);
    assert.equal(re1.recognize('xxxxx'), true);
    assert.equal(re1.recognize('xxxxxxxxxxxxxx'), true);
    assert.equal(re1.recognize(''), false);
    assert.equal(re1.recognize('xxxxxxyxxx'), false);

    const re2 = new RE('(xYz)+');

    assert.equal(re2.recognize('xYz'), true);
    assert.equal(re2.recognize('xYzxYz'), true);
    assert.equal(re2.recognize('xYzxYzxYz'), true);
    assert.equal(re2.recognize('xYzxYzxYzxYzxYzxYzxYz'), true);
    assert.equal(re2.recognize(''), false);
    assert.equal(re2.recognize('xY'), false);

    const re3 = new RE('(90)+');

    assert.equal(re3.recognize('90'), true);
    assert.equal(re3.recognize('9090'), true);
    assert.equal(re3.recognize('909090'), true);
    assert.equal(re3.recognize('9090909090909090'), true);
    assert.equal(re3.recognize(''), false);
    assert.equal(re3.recognize('990'), false);
    assert.equal(re3.recognize('900'), false);
  });

  it('recognizes ?', () => {
    const re1 = new RE('u?');

    assert.equal(re1.recognize('u'), true);
    assert.equal(re1.recognize(''), true);
    assert.equal(re1.recognize('uu'), false);
    assert.equal(re1.recognize('uuuuu'), false);

    const re2 = new RE('(abc)?');

    assert.equal(re2.recognize('abc'), true);
    assert.equal(re2.recognize(''), true);
    assert.equal(re2.recognize('abcabc'), false);
    assert.equal(re2.recognize('aXbc'), false);

    const re3 = new RE('(01234)?');

    assert.equal(re3.recognize('01234'), true);
    assert.equal(re3.recognize(''), true);
    assert.equal(re3.recognize('0123401234'), false);
    assert.equal(re3.recognize('012x34'), false);
  });

  it('recognizes character sets/ranges', () => {
    const re1 = new RE('[abc]');

    assert.equal(re1.recognize('a'), true);
    assert.equal(re1.recognize('b'), true);
    assert.equal(re1.recognize('c'), true);
    assert.equal(re1.recognize('x'), false);
    assert.equal(re1.recognize('A'), false);
    assert.equal(re1.recognize('9'), false);

    const re2 = new RE('[A-Z]');

    assert.equal(re2.recognize('A'), true);
    assert.equal(re2.recognize('D'), true);
    assert.equal(re2.recognize('E'), true);
    assert.equal(re2.recognize('Z'), true);
    assert.equal(re2.recognize('J'), true);
    assert.equal(re2.recognize('a'), false);
    assert.equal(re2.recognize('t'), false);
    assert.equal(re2.recognize('z'), false);
    assert.equal(re2.recognize('e'), false);

    const re3 = new RE('[0-9]');

    assert.equal(re3.recognize('2'), true);
    assert.equal(re3.recognize('3'), true);
    assert.equal(re3.recognize('8'), true);
    assert.equal(re3.recognize('0'), true);
    assert.equal(re3.recognize('A'), false);
    assert.equal(re3.recognize('r'), false);
    assert.equal(re3.recognize('l'), false);
    assert.equal(re3.recognize('E'), false);

    const re4 = new RE('[xyA-Z17]');

    assert.equal(re4.recognize('x'), true);
    assert.equal(re4.recognize('y'), true);
    assert.equal(re4.recognize('1'), true);
    assert.equal(re4.recognize('7'), true);
    assert.equal(re4.recognize('A'), true);
    assert.equal(re4.recognize('K'), true);
    assert.equal(re4.recognize('Z'), true);
    assert.equal(re4.recognize('a'), false);
    assert.equal(re4.recognize('j'), false);
    assert.equal(re4.recognize('5'), false);
  });

  it('recognizes exact quantifiers', () => {
    const re1 = new RE('f{5}');

    assert.equal(re1.recognize('fffff'), true);
    assert.equal(re1.recognize('ffff'), false);
    assert.equal(re1.recognize('ffffff'), false);

    const re2 = new RE('(Abc){2}');

    assert.equal(re2.recognize('AbcAbc'), true);
    assert.equal(re2.recognize('Abc'), false);
    assert.equal(re2.recognize('AbcAbcAbc'), false);
    assert.equal(re2.recognize(''), false);

    const re3 = new RE('(word){0}');

    assert.equal(re3.recognize(''), true);
    assert.equal(re3.recognize('word'), false);
    assert.equal(re3.recognize('wordword'), false);
  });

  it('recognizes range quantifiers', () => {
    const re1 = new RE('d{2,3}');

    assert.equal(re1.recognize('dd'), true);
    assert.equal(re1.recognize('ddd'), true);
    assert.equal(re1.recognize('dddd'), false);
    assert.equal(re1.recognize('d'), false);
    assert.equal(re1.recognize(''), false);

    const re2 = new RE('(GHI){0,4}');

    assert.equal(re2.recognize(''), true);
    assert.equal(re2.recognize('GHI'), true);
    assert.equal(re2.recognize('GHIGHI'), true);
    assert.equal(re2.recognize('GHIGHIGHI'), true);
    assert.equal(re2.recognize('GHIGHIGHIGHI'), true);
    assert.equal(re2.recognize('GHIGHIGHIGHIGHI'), false);
    assert.equal(re2.recognize('GHIGHIGHIGHIGHIGHI'), false);

    const re3 = new RE('(hm){3,3}');

    assert.equal(re3.recognize('hmhmhm'), true);
    assert.equal(re3.recognize('hmhm'), false);
    assert.equal(re3.recognize('hmhmhmhm'), false);
  });

  it('recognizes at-least quantifiers', () => {
    const re1 = new RE('w{3,}');

    assert.equal(re1.recognize('www'), true);
    assert.equal(re1.recognize('wwww'), true);
    assert.equal(re1.recognize('wwwww'), true);
    assert.equal(re1.recognize('ww'), false);
    assert.equal(re1.recognize('w'), false);
    assert.equal(re1.recognize(''), false);

    const re2 = new RE('(DEF){2,}');

    assert.equal(re2.recognize('DEFDEF'), true);
    assert.equal(re2.recognize('DEFDEFDEF'), true);
    assert.equal(re2.recognize('DEFDEFDEFDEF'), true);
    assert.equal(re2.recognize('DEF'), false);
    assert.equal(re2.recognize(''), false);

    const re3 = new RE('7{10,}');

    assert.equal(re3.recognize('7777777777'), true);
    assert.equal(re3.recognize('77777777777'), true);
    assert.equal(re3.recognize('777777777777'), true);
    assert.equal(re3.recognize('777777777'), false);
    assert.equal(re3.recognize('7777'), false);
  });

  it('recognizes at-most quantifiers', () => {
    const re1 = new RE('H{,4}');

    assert.equal(re1.recognize(''), true);
    assert.equal(re1.recognize('H'), true);
    assert.equal(re1.recognize('HH'), true);
    assert.equal(re1.recognize('HHH'), true);
    assert.equal(re1.recognize('HHHH'), true);
    assert.equal(re1.recognize('HHHHH'), false);
    assert.equal(re1.recognize('HHHHHHHHHHH'), false);

    const re2 = new RE('(xy){,1}');

    assert.equal(re2.recognize(''), true);
    assert.equal(re2.recognize('xy'), true);
    assert.equal(re2.recognize('xyxy'), false);
    assert.equal(re2.recognize('xyxyxy'), false);

    const re3 = new RE('R{,0}');

    assert.equal(re3.recognize(''), true);
    assert.equal(re3.recognize('R'), false);
    assert.equal(re3.recognize('RR'), false);
  });

});

describe('recognize: more complex expressions', () => {

  it('\\d{3}-\\d{3}-\\d{4}', () => {
    const re = new RE('\\d{3}-\\d{3}-\\d{4}');

    assert.equal(re.recognize('555-137-8290'), true);
    assert.equal(re.recognize('167-220-1015'), true);
    assert.equal(re.recognize('000-000-0000'), true);
    assert.equal(re.recognize('98-137-8290'), false);
    assert.equal(re.recognize('555-17-8290'), false);
    assert.equal(re.recognize('555-137-890'), false);
    assert.equal(re.recognize('5545-137-8290'), false);
    assert.equal(re.recognize('775 255 8290'), false);
  });

  it('[A-Z]\\w*', () => {
    const re = new RE('[A-Z]\\w*');

    assert.equal(re.recognize('Test'), true);
    assert.equal(re.recognize('I'), true);
    assert.equal(re.recognize('Word'), true);
    assert.equal(re.recognize('Example'), true);
    assert.equal(re.recognize('TEST'), true);
    assert.equal(re.recognize('Y_____'), true);
    assert.equal(re.recognize('X1000'), true);  // elon musk's next child
    assert.equal(re.recognize('test'), false);
    assert.equal(re.recognize('9test'), false);
    assert.equal(re.recognize('example'), false);
    assert.equal(re.recognize('A&&&&&'), false);
  });

  // ...

});

describe('matches: tests', () => {

});

describe('replace: tests', () => {

});