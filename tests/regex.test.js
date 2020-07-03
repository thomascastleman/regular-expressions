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

  it('$([0-9,]+)?[.][0-9]+', () => {
    // adapted from Google
    const re = new RE('$([0-9,]+)?[.][0-9]+');

    assert.equal(re.recognize('$4.666'), true);
    assert.equal(re.recognize('$17.86'), true);
    assert.equal(re.recognize('$7.76'), true);
    assert.equal(re.recognize('$.54'), true);
    assert.equal(re.recognize('$900,001.00'), true);
    assert.equal(re.recognize('$523,877,231.56'), true);

    assert.equal(re.recognize('5.41'), false);
    assert.equal(re.recognize('.'), false);
    assert.equal(re.recognize('$2.31.00'), false);
    assert.equal(re.recognize('$ab.xy'), false);
  });

  it('[0-9]{5}(-[0-9]{4})?', () => {
    // adapted from Google
    const re = new RE('[0-9]{5}(-[0-9]{4})?');

    assert.equal(re.recognize('55401'), true);
    assert.equal(re.recognize('82773-4401'), true);
    assert.equal(re.recognize('56670'), true);
    assert.equal(re.recognize('11382-3655'), true);
    assert.equal(re.recognize('4481'), false);
    assert.equal(re.recognize('91882-303'), false);
    assert.equal(re.recognize('77871-45001'), false);
  });

  it('\\d{1,2}/\\d{1,2}/(\\d{4}|\\d{2})', () => {
    // date format
    const re = new RE('\\d{1,2}/\\d{1,2}/(\\d{4}|\\d{2})');

    assert.equal(re.recognize('6/7/2020'), true);
    assert.equal(re.recognize('12/21/98'), true);
    assert.equal(re.recognize('1/05/1958'), true);
    assert.equal(re.recognize('03/04/2023'), true);
    assert.equal(re.recognize('2/4/12'), true);
    assert.equal(re.recognize('111/10/2013'), false);
    assert.equal(re.recognize('7/00005/2021'), false);
    assert.equal(re.recognize('12/1/210000'), false);
    assert.equal(re.recognize('1//2015'), false);
    assert.equal(re.recognize('4//99'), false);
  });

  it('(a|b)cd*e+f?[ghi][j-l].\\d\\w\\sm{2}n{3,5}o{3,}p{,2}', () => {
    // every possible token
    const re = new RE('(a|b)cd*e+f?[ghi][j-l].\\d\\w\\sm{2}n{3,5}o{3,}p{,2}');

    assert.equal(re.recognize('bceefhk&4U mmnnnnooooop'), true);
    assert.equal(re.recognize('acdddddegl-0e\nmmnnnooopp'), true);
    assert.equal(re.recognize('acdeeeeeeijL5y\tmmnnnoooooooo'), true);
    assert.equal(re.recognize('bceefhk&4U mnnnnooooop'), false); // not enough m's
    assert.equal(re.recognize('xceefhk&4U mmnnnnooooop'), false); // wrong first char
    assert.equal(re.recognize('aceefhk\n4U mmnnnnooooop'), false); // . doesn't match \n
  });

});

describe('matches: tests', () => {

  it('no matches', () => {
    const re = new RE('%{5}');
    const text = "Normal text here, not five %'s in a row.";

    assert.deepEqual(
      re.matches(text),
      []);
  });

  it('extracts literals', () => {
    const re1 = new RE('literal');
    const text1 = "This literal is a literal, there are literals here.";

    assert.deepEqual(
      re1.matches(text1),
      [match(5, 12, "literal"),
      match(18, 25, "literal"),
      match(37, 44, "literal")]);

    const re2 = new RE('f');
    const text2 = "Not 'F', but 'f'";

    assert.deepEqual(
      re2.matches(text2),
      [match(14, 15, "f")]);
  });

  it('extracts numbers', () => {
    const re = new RE('[0-9]+');
    const text = 
      "First number: 700, second number is 3, and the third is 189203. " + 
      "The fourth is 157 and finally, 17.";

    assert.deepEqual(
      re.matches(text),
      [match(14, 17, "700"),
      match(36, 37, "3"),
      match(56, 62, "189203"),
      match(78, 81, "157"),
      match(95, 97, "17")]);
  });

  it('extracts capitalized words', () => {
    const re = new RE('[A-Z]\\w*');
    const text = "The first word is Capitalized, but (some) others are Not.";

    assert.deepEqual(
      re.matches(text),
      [match(0, 3, "The"),
      match(18, 29, "Capitalized"),
      match(53, 56, "Not")]);
  });

  it('extracts newlines', () => {
    const re = new RE('\n');
    const text = "First line.\nSecond line.\nThird line...\n";

    assert.deepEqual(
      re.matches(text),
      [match(11, 12, "\n"),
      match(24, 25, "\n"),
      match(38, 39, "\n")]);
  });

});

describe('replace: tests', () => {

  it('replaces literals', () => {
    const re = new RE('the');
    const text = "Replace the word 'the' in the text";

    assert.equal(
      re.replace(text, "XYZ"),
      "Replace XYZ word 'XYZ' in XYZ text");
    assert.equal(
      re.replace(text, ""),
      "Replace  word '' in  text");
    assert.equal(
      re.replace(text, "\n"),
      "Replace \n word '\n' in \n text");
  });

  it('no matches for replacement', () => {
    const re = new RE('not here');
    const text = "This text doesn't contain the above expression.";

    assert.equal(
      re.replace(text, "000"),
      text);
  });

  it('redact hex digits', () => {
    const re = new RE('0x[A-Fa-f0-9]+');
    const text = "Address 1: 0xaff6, address 2: 0x5FC7, and finally 0x0041";

    assert.equal(
      re.replace(text, "______"),
      "Address 1: ______, address 2: ______, and finally ______");
  });

  it('replaces capitalized words', () => {
    const re = new RE('[A-Z]\\w*');
    const text = "Some of these Words are Capitalized.";

    assert.equal(
      re.replace(text, "_"),
      "_ of these _ are _.");
  });

});