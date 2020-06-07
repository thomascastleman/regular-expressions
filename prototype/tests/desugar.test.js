/*
  desugar.test.js: Unit testing for parse tree desugarer
*/

const assert = require('assert');
const Desugarer = require('../desugarer.js');
const {
  union, seq, star, plus, q, charseq, range, char, dot, empty,
  digit, word, whitespace, exact, rangequant, atleast, atmost
} = require('./globals.test.js');

/*  String -> Union 
    Converts a string into a union of all characters in the string */
function charUnion(chars) {
  const tokenized = chars.split('').map(c => char(c));
  return new Desugarer(empty()).arbitrary_union(tokenized);
}

/*  These are the desugared equivalents of each of these character
    sets, for convenience. */
const DIGIT = charUnion('0123456789');
const WORD = charUnion( 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 
                        'abcdefghijklmnopqrstuvwxyz' + 
                        '0123456789' + 
                        '_');
const WHITESPACE = charUnion(' \t\r\n\f');

describe('arbitrary union & arbitrary sequence', () => {
  const d = new Desugarer(empty());

  const small_l1 = [char('x'), char('y')];
  const small_l2 = [dot(), word()];
  const small_l3 = [star(char('x')), seq(char('a'), char('b'))];

  const large_l1 = [char('a'), char('b'), char('c'), char('d')];
  const large_l2 = [whitespace(), plus(char('x')), union(char('b'), empty())];
  const large_l3 = [empty(), empty(), word(), star(char('x')), q(char('y')),
              range('a', 'z')];

  const one_el1 = [char('a')];
  const one_el2 = [empty()];
  const one_el3 = [exact(digit(), 10)];

  // -------------- Arbitrary Union Tests --------------

  it('list of one token returns that token (union)', () => {
    assert.deepEqual(
      d.arbitrary_union(one_el1),
      char('a'));

    assert.deepEqual(
      d.arbitrary_union(one_el2),
      empty());

    assert.deepEqual(
      d.arbitrary_union(one_el3),
      exact(digit(), 10));
  });

  it('list of two tokens becomes single union', () => {
    assert.deepEqual(
      d.arbitrary_union(small_l1), 
      union(char('x'), char('y')));

    assert.deepEqual(
      d.arbitrary_union(small_l2), 
      union(dot(), word()));

    assert.deepEqual(
      d.arbitrary_union(small_l3),
      union(star(char('x')), seq(char('a'), char('b'))));
  });

  it('list of arbitrary length becomes nested unions', () => {
    assert.deepEqual(
      d.arbitrary_union(large_l1),
      union(union(union(char('a'), char('b')), char('c')), char('d')));

    assert.deepEqual(
      d.arbitrary_union(large_l2),
        union(
          union(
            whitespace(), 
            plus(char('x'))), 
          union(char('b'), empty())));

    assert.deepEqual(
      d.arbitrary_union(large_l3),
      union(
        union(
          union(
            union(
              union(
                empty(),
                empty()),
              word()),
            star(char('x'))),
          q(char('y'))),
        range('a', 'z')));
  });


  // -------------- Arbitrary Sequence Tests --------------

  it('list of one token returns that token (sequence)', () => {
    assert.deepEqual(
      d.arbitrary_sequence(one_el1),
      char('a'));

    assert.deepEqual(
      d.arbitrary_sequence(one_el2),
      empty());

    assert.deepEqual(
      d.arbitrary_sequence(one_el3),
      exact(digit(), 10));
  });
  
  it('list of two tokens becomes single sequence', () => {
    assert.deepEqual(
      d.arbitrary_sequence(small_l1), 
      seq(char('x'), char('y')));

    assert.deepEqual(
      d.arbitrary_sequence(small_l2), 
      seq(dot(), word()));

    assert.deepEqual(
      d.arbitrary_sequence(small_l3),
      seq(star(char('x')), seq(char('a'), char('b'))));
  });

  it('list of arbitrary length becomes nested sequences', () => {
    assert.deepEqual(
      d.arbitrary_sequence(large_l1),
      seq(seq(seq(char('a'), char('b')), char('c')), char('d')));

      assert.deepEqual(
        d.arbitrary_sequence(large_l2),
          seq(
            seq(
              whitespace(), 
              plus(char('x'))), 
            union(char('b'), empty())));

    assert.deepEqual(
      d.arbitrary_sequence(large_l3),
      seq(
        seq(
          seq(
            seq(
              seq(
                empty(),
                empty()),
              word()),
            star(char('x'))),
          q(char('y'))),
        range('a', 'z')));
  });

});

describe('generating character ranges', () => {
  const d = new Desugarer(empty());
  
  it('range of a char to itself is just that char', () => {
    assert.deepEqual(
      d.char_range('f', 'f'),
      [char('f')]);
    
    assert.deepEqual(
      d.char_range('}', '}'),
      [char('}')]);
  });

  it('range of adjacent chars includes only those chars', () => {
    assert.deepEqual(
      d.char_range('a', 'b'),
      [char('a'), char('b')]);

    assert.deepEqual(
      d.char_range('F', 'G'),
      [char('F'), char('G')]);

    assert.deepEqual(
      d.char_range('3', '4'),
      [char('3'), char('4')]);
  });

  it('includes all characters within range', () => {
    assert.deepEqual(
      d.char_range('a', 'e'),
      [char('a'), char('b'), char('c'), char('d'), char('e')]);

    assert.deepEqual(
      d.char_range('4', '9'),
      [char('4'), char('5'), char('6'), char('7'), char('8'), char('9')]);

    assert.deepEqual(
      d.char_range('T', 'W'),
      [char('T'), char('U'), char('V'), char('W')]);

    assert.deepEqual(
      d.char_range('!', '&'),
      [char('!'), char('\"'), char('#'), char('$'), char('%'), char('&')]);
  });

  it('invalid ranges yield errors', () => {
    assert.throws(() => { d.char_range('z', 'a') });
    assert.throws(() => { d.char_range('R', 'D') });
    assert.throws(() => { d.char_range('9', '2') });
  });

});

describe('arbitrary copying', () => {
  const d = new Desugarer(empty());

  const t1 = empty();
  const t2 = char('b');
  const t3 = atmost(dot(), 10);
  const t4 = union(dot(), char('x'));

  it('n_copy can produce singleton copy', () => {
    assert.deepEqual(
      d.n_copy(t1, 1),
      [t1]);

    assert.deepEqual(
      d.n_copy(t2, 1),
      [t2]);
  });

  it('n_copy can produce arbitrary copies', () => {
    assert.deepEqual(
      d.n_copy(t1, 5),
      [t1, t1, t1, t1, t1]);

    assert.deepEqual(
      d.n_copy(t2, 7),
      [t2, t2, t2, t2, t2, t2, t2]);

    assert.deepEqual(
      d.n_copy(t4, 2)
      [t4, t4]);
  });

  it('n_copy errors on non-positive n', () => {
    assert.throws(() => { d.n_copy(t1, 0) });
    assert.throws(() => { d.n_copy(t4, -1) });
    assert.throws(() => { d.n_copy(t2, -50) });
  });
});

describe('tokens not affected by desugaring', () => {
  const union_1 = union(char('x'), dot());
  const union_2 = union(empty(), char('a'));

  const sequence_1 = seq(dot(), char('y'));
  const sequence_2 = seq(star(char('x')), char('y'));

  const star_1 = star(char('a'));
  const star_2 = star(union(char('x'), char('y')));

  const char_1 = char('x');
  const char_2 = char('9');

  const dot_1 = dot();

  const empty_1 = empty();

  it('Union is unaffected', () => {
    const d1 = new Desugarer(union_1);
    const d2 = new Desugarer(union_2);

    assert.deepEqual(d1.desugar(), union_1);
    assert.deepEqual(d2.desugar(), union_2);
  });

  it('Sequence is unaffected', () => {
    const d1 = new Desugarer(sequence_1);
    const d2 = new Desugarer(sequence_2);

    assert.deepEqual(d1.desugar(), sequence_1);
    assert.deepEqual(d2.desugar(), sequence_2);
  });

  it('Star is unaffected', () => {
    const d1 = new Desugarer(star_1);
    const d2 = new Desugarer(star_2);

    assert.deepEqual(d1.desugar(), star_1);
    assert.deepEqual(d2.desugar(), star_2);
  });

  it('Character (literals) are unaffected', () => {
    const d1 = new Desugarer(char_1);
    const d2 = new Desugarer(char_2);

    assert.deepEqual(d1.desugar(), char_1);
    assert.deepEqual(d2.desugar(), char_2);
  });

  it('Dot is unaffected', () => {
    const d1 = new Desugarer(dot_1);
    assert.deepEqual(d1.desugar(), dot_1);
  });

  it('Empty expression is unaffected', () => {
    const d1 = new Desugarer(empty_1);
    assert.deepEqual(d1.desugar(), empty_1);
  });
});

describe('tokens affected by desugaring', () => {
  /*  Each set of examples tests for a particular token being desugared
    --that is, we are not testing that the full parse tree is recursively 
    desugared. Those tests are in the block below. */

  /*  Plus(b) desugars to Sequence(b, Star(b))
      i.e. b+ ===> bb* 
  */
  const plus_1 = plus(char('x'));
  const plus_desugar_1 = seq(char('x'), star(char('x')));

  const plus_2 = plus(union(char('a'), char('b')));
  const plus_desugar_2 = 
    seq(
      union(char('a'), char('b')),
      star(union(char('a'), char('b'))));

  it('Plus desugars', () => {
    const d1 = new Desugarer(plus_1);
    const d2 = new Desugarer(plus_2);

    assert.deepEqual(d1.desugar(), plus_desugar_1);
    assert.deepEqual(d2.desugar(), plus_desugar_2);
  });

  /*  Question(b) desugars to Union(Empty(), b)
      i.e. b? ===> (|b)
  */
  const question_1 = q(char('B'));
  const question_desugar_1 = union(empty(), char('B'));

  const question_2 = q(seq(char('A'), char('X')));
  const question_desugar_2 = 
    union(empty(), seq(char('A'), char('X')));

  it('Question desugars', () => {
    const d1 = new Desugarer(question_1);
    const d2 = new Desugarer(question_2);

    assert.deepEqual(d1.desugar(), question_desugar_1);
    assert.deepEqual(d2.desugar(), question_desugar_2);
  });

  /*  CharsetSequence(l, r) desugars to Union(l, r)
      i.e. [xyz] ===> (x|y|z)
  */
  const char_seq_1 = charseq(char('x'), char('y'));
  const char_seq_desugar_1 = union(char('x'), char('y'));

  const char_seq_2 = charseq(char('0'), char('X'));
  const char_seq_desugar_2 = union(char('0'), char('X'));

  it('CharsetSequence desugars', () => {
    const d1 = new Desugarer(char_seq_1);
    const d2 = new Desugarer(char_seq_2);

    assert.deepEqual(d1.desugar(), char_seq_desugar_1);
    assert.deepEqual(d2.desugar(), char_seq_desugar_2);
  });

  /*  Range(c_1, c_k) desugars to Union[c_1, ..., c_k]
      i.e. [a-d] ===> (a|b|c|d)
  */
  const range_1 = range(char('a'), char('c'));
  const range_desugar_1 = 
    union(union(char('a'), char('b')), char('c'));

  const range_2 = range(char('5'), char('9'));
  const range_desugar_2 =
    union(
      union(
        union(
          union(
            char('5'),
            char('6')),
          char('7')),
        char('8')),
      char('9'));

  const range_3 = range(char('C'), char('H'));
  const range_desugar_3 = 
    union(
      union(
        union(
          union(
            union(
              char('C'),
              char('D')),
            char('E')),
          char('F')),
        char('G')),
      char('H'));

  it('Range desugars', () => {
    const d1 = new Desugarer(range_1);
    const d2 = new Desugarer(range_2);
    const d3 = new Desugarer(range_3);

    assert.deepEqual(d1.desugar(), range_desugar_1);
    assert.deepEqual(d2.desugar(), range_desugar_2);
    assert.deepEqual(d3.desugar(), range_desugar_3);
  });


  /*  Digit() desugars to Union['0', ..., '9']
      i.e. \d ===> (0|1|2|...|9)
  */
  const digit_1 = digit();
  const digit_desugar_1 = DIGIT;

  it('Digit desugars', () => {
    const d1 = new Desugarer(digit_1);
    assert.deepEqual(d1.desugar(), digit_desugar_1);
  });


  /*  Word() desugars to Union['A', ..., 'Z',
                              'a', ..., 'z',
                              '0', ..., '9', '_']
      i.e. \w ===> (A|...|Z|a|...|z|0|...|9|_)
  */
  const word_1 = word();
  const word_desugar_1 = WORD;

  it('Word desugars', () => {
    const d1 = new Desugarer(word_1);
    assert.deepEqual(d1.desugar(), word_desugar_1);
  });

  /*  Whitespace() desugars to Union[' ', '\t', '\r', '\n', '\f']
      i.e. \s ===> ( |\t|\r|\n|\f)
  */
  const whitespace_1 = whitespace();
  const whitespace_desugar_1 = WHITESPACE;

  it('Whitespace desugars', () => {
    const d1 = new Desugarer(whitespace_1);
    assert.deepEqual(d1.desugar(), whitespace_desugar_1);
  });

  // use this for arbitrary union/sequence
  const d = new Desugarer(empty());

  /*  ExactQuantifier(b, n) desugars to Seq[b_1, ..., b_n]
      i.e. b{n} ===> bbbb...b (n times)
  */
  const exact_1 = exact(char('a'), 3);
  const exact_desugar_1 = 
    d.arbitrary_sequence([char('a'), char('a'), char('a')]);

  const exact_2 = exact(dot(), 5);
  const exact_desugar_2 =
    d.arbitrary_sequence([dot(), dot(), dot(), dot(), dot()]);

  const exact_3 = exact(char('4'), 1);
  const exact_desugar_3 =
    d.arbitrary_sequence([char('4')]);

  const exact_4 = exact(char('B'), 0);
  const exact_desugar_4 = empty();

  it('ExactQuantifier desugars', () => {
    const d1 = new Desugarer(exact_1);
    const d2 = new Desugarer(exact_2);
    const d3 = new Desugarer(exact_3);
    const d4 = new Desugarer(exact_4);

    assert.deepEqual(d1.desugar(), exact_desugar_1);
    assert.deepEqual(d2.desugar(), exact_desugar_2);
    assert.deepEqual(d3.desugar(), exact_desugar_3);
    assert.deepEqual(d4.desugar(), exact_desugar_4);
  });

  /*  RangeQuantifier(b, min, max) desugars to Seq[Seq[b_1, ..., b_min], 
                                                  Union(Empty(), b_min+1), 
                                                  ..., 
                                                  Union(Empty(), b_max)]
      i.e. b{min,max} ===> bbbb...b(|b)(|b)...(|b)
  */
  const range_quant_1 = rangequant(char('x'), 2, 4);
  const range_quant_desugar_1 =
    d.arbitrary_sequence([
      char('x'), char('x'), 
      union(empty(), char('x')), union(empty(), char('x'))
    ]);

  const range_quant_2 = rangequant(seq(char('a'), char('b')), 1, 3);
  const range_quant_desugar_2 =
    d.arbitrary_sequence([
      seq(char('a'), char('b')),
      union(empty(), seq(char('a'), char('b'))),
      union(empty(), seq(char('a'), char('b')))
    ]);

  const range_quant_3 = rangequant(char('9'), 0, 5);
  const range_quant_desugar_3 = 
    d.arbitrary_sequence([
      union(empty(), char('9')),
      union(empty(), char('9')),
      union(empty(), char('9')),
      union(empty(), char('9')),
      union(empty(), char('9'))
    ]);

  const range_quant_4 = rangequant(char('z'), 2, 2);
  const range_quant_desugar_4 =
    d.arbitrary_sequence([
      char('z'),
      char('z')
    ]);

  it('RangeQuantifier desugars', () => {
    const d1 = new Desugarer(range_quant_1);
    const d2 = new Desugarer(range_quant_2);
    const d3 = new Desugarer(range_quant_3);
    const d4 = new Desugarer(range_quant_4);

    assert.deepEqual(d1.desugar(), range_quant_desugar_1);
    assert.deepEqual(d2.desugar(), range_quant_desugar_2);
    assert.deepEqual(d3.desugar(), range_quant_desugar_3);
    assert.deepEqual(d4.desugar(), range_quant_desugar_4);
  });

  /*  AtLeastQuantifier(b, min) desugars to Seq[Seq[b_1, ..., b_min], Star(b)]
      i.e. b{min,} ===> bbbb...bb*
  */
  const atleast_1 = atleast(char('a'), 4);
  const atleast_desugar_1 =
    d.arbitrary_sequence([
      char('a'),
      char('a'),
      char('a'),
      char('a'),
      star(char('a'))
    ]);

  const atleast_2 = atleast(char('x'), 0);
  const atleast_desugar_2 = star(char('x'));

  const atleast_3 = atleast(union(char('x'), char('y')), 1);
  const atleast_desugar_3 = 
    d.arbitrary_sequence([
      union(char('x'), char('y')),
      star(union(char('x'), char('y')))
    ]);

  it('AtLeastQuantifier desugars', () => {
    const d1 = new Desugarer(atleast_1);
    const d2 = new Desugarer(atleast_2);
    const d3 = new Desugarer(atleast_3);

    assert.deepEqual(d1.desugar(), atleast_desugar_1);
    assert.deepEqual(d2.desugar(), atleast_desugar_2);
    assert.deepEqual(d3.desugar(), atleast_desugar_3);
  });

  /*  AtMostQuantifier(b, max) desugars to Seq[Union(Empty(), b_1), 
                                              ...,
                                              Union(Empty(), b_max)]
      i.e. b{,max} ===> (|b)(|b)...(|b)   (max times) 
  */
  const atmost_1 = atmost(char('a'), 3);
  const atmost_desugar_1 = 
    d.arbitrary_sequence([
      union(empty(), char('a')),
      union(empty(), char('a')),
      union(empty(), char('a'))
    ]);

  const atmost_2 = atmost(char('['), 1);
  const atmost_desugar_2 =
    d.arbitrary_sequence([
      union(empty(), char('['))
    ]);

  const atmost_3 = atmost(seq(char('x'), char('y')), 2);
  const atmost_desugar_3 = 
    d.arbitrary_sequence([
      union(empty(), seq(char('x'), char('y'))),
      union(empty(), seq(char('x'), char('y')))
    ]);

  const atmost_4 = atmost(char('z'), 0);
  const atmost_desugar_4 = empty();

  it('AtMostQuantifier desugars', () => {
    const d1 = new Desugarer(atmost_1);
    const d2 = new Desugarer(atmost_2);
    const d3 = new Desugarer(atmost_3);
    const d4 = new Desugarer(atmost_4);

    assert.deepEqual(d1.desugar(), atmost_desugar_1);
    assert.deepEqual(d2.desugar(), atmost_desugar_2);
    assert.deepEqual(d3.desugar(), atmost_desugar_3);
    assert.deepEqual(d4.desugar(), atmost_desugar_4);
  });
});

describe('full parse tree is desugared', () => {
  const complex_1 = 
    seq(seq(char('x'), plus(char('y'))), char('z'));
  const desugar_1 =
    seq(seq(char('x'), seq(char('y'), star(char('y')))), char('z'));

  it('nested Plus', () => {
    const d = new Desugarer(complex_1);
    assert.deepEqual(d.desugar(), desugar_1);
  });

  const complex_2 = 
    seq(seq(seq(char('a'), char('b')), q(char('c'))), char('d'));
  const desugar_2 = 
    seq(seq(seq(char('a'), char('b')), union(empty(), char('c'))), char('d'));

  it('nested Question', () => {
    const d = new Desugarer(complex_2);
    assert.deepEqual(d.desugar(), desugar_2);
  });

  const complex_3 = 
    seq(char('a'), charseq(charseq(char('x'), char('y')), char('z')));
  const desugar_3 =
    seq(char('a'), union(union(char('x'), char('y')), char('z')));

  it('nested CharsetSequence', () => {
    const d = new Desugarer(complex_3);
    assert.deepEqual(d.desugar(), desugar_3);
  });

  const complex_4 = 
    union(char('x'), range('d', 'f'));
  const desugar_4 = 
    union(char('x'), union(union(char('d'), char('e')), char('f')));

  it('nested Range', () => {
    const d = new Desugarer(complex_4);
    assert.deepEqual(d.desugar(), desugar_4);
  });

  const complex_5 =
    seq(seq(digit(), word()), plus(whitespace()));
  const desugar_5 =
    seq(seq(DIGIT, WORD), seq(WHITESPACE, star(WHITESPACE)));

  it('nested Digit, Word, and Whitespace', () => {
    const d = new Desugarer(complex_5);
    assert.deepEqual(d.desugar(), desugar_5);
  });

  const complex_6 =
    seq(seq(char('x'), char('1')), exact(digit(), 3));
  const desugar_6 =
    seq(seq(char('x'), char('1')), seq(seq(DIGIT, DIGIT), DIGIT));

  it('nested ExactQuantifier', () => {
    const d = new Desugarer(complex_6);
    assert.deepEqual(d.desugar(), desugar_6);
  });

  const complex_7 =
    seq(seq(seq(rangequant(word(), 3, 5), char('x')), char('y')), char('z'));
  const desugar_7 =
    seq(
      seq(
        seq(
          seq(
            seq(
              seq(
                seq(WORD, WORD),
                WORD),
              union(empty(), WORD)),
            union(empty(), WORD)),
          char('x')), 
        char('y')), 
      char('z'));

  it('nested RangeQuantifier', () => {
    const d = new Desugarer(complex_7);
    assert.deepEqual(d.desugar(), desugar_7);
  });

  const complex_8 = 
    seq(
      seq(
        char('a'),
        atleast(char('b'), 2)),
      char('c'));
  const desugar_8 =
    seq(
      seq(
        char('a'),
        seq(seq(char('b'), char('b')), star(char('b')))),
      char('c'));

  it('nested AtLeastQuantifier', () => {
    const d = new Desugarer(complex_8);
    assert.deepEqual(d.desugar(), desugar_8);
  });

  const complex_9 =
    seq(
      seq(
        char('a'),
        atmost(char('b'), 3)),
      char('c'));
  const desugar_9 =
    seq(
      seq(
        char('a'),
        seq(
          seq(
            union(empty(), char('b')),
            union(empty(), char('b'))),
          union(empty(), char('b')))),
      char('c'));

  it('nested AtMostQuantifier', () => {
    const d = new Desugarer(complex_9);
    assert.deepEqual(d.desugar(), desugar_9);
  });
});