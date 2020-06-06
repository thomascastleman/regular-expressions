/*
  desugar.test.js: Unit testing for parse tree desugarer
*/

const assert = require('assert');
const Desugarer = require('../desugarer.js');
const {
  union, seq, star, plus, q, charseq, range, char, dot, empty,
  digit, word, whitespace, exact, rangequant, atleast, atmost
} = require('./globals.test.js');

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