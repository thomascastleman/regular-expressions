/*
  NFAConstructor.test.js: Unit testing for functions that 
  construct an NFA
*/

const assert = require('assert');
const { NFA, State } = require('../src/NFA.js');
const NFAConstructor = require('../src/NFAConstructor.js');
const { union, seq, star, char, dot, empty } = require('./globals.test.js');
const { set_union } = require('../src/globals.js');

// helper to construct an NFA that recognizes a single character
function charRec(c) {
  const st = new State(), acc = new State();
  st.transitions[c] = [acc];
  return new NFA(st, new Set([acc]), [st, acc]);
}

// helper to construct NFA that recognizes the dot char
function dotRec() {
  const st = new State(), acc = new State();
  st.dots = [acc];
  return new NFA(st, new Set([acc]), [st, acc]);
}

// helper to construct NFA that recognizes empty string
function emptyRec() {
  const st = new State();
  return new NFA(st, new Set([st]), [st]);
}

describe('unit tests for combining NFAs', () => {
  const nfac = new NFAConstructor(empty());

  it('makeCharRecognizer constructs NFA recognizing a char', () => {
    assert.deepEqual(nfac.makeCharRecognizer('x'), charRec('x'));
    assert.deepEqual(nfac.makeCharRecognizer('A'), charRec('A'));
    assert.deepEqual(nfac.makeCharRecognizer('.'), charRec('.'));
    assert.deepEqual(nfac.makeCharRecognizer('&'), charRec('&'));
    assert.deepEqual(nfac.makeCharRecognizer('0'), charRec('0'));
  });

  it('makeDotRecognizer constructs NFA recognizing a char', () => {
    assert.deepEqual(nfac.makeDotRecognizer(), dotRec());
  });

  it('makeEmptyRecognizer constructs NFA recognizing empty string', () => {
    assert.deepEqual(nfac.makeEmptyRecognizer(), emptyRec());
  });

  it('makeUnion builds NFA representing the union', () => {
    // union between NFA recognizing 'x' and recognizing empty string
    const l1 = charRec('x');
    const r1 = emptyRec();

    const new_start1 = new State();
    new_start1.epsilons = [l1.start, r1.start];
    const nfa1 = new NFA(new_start1, 
                        set_union(l1.accepts, r1.accepts), 
                        l1.states.concat(r1.states).concat(new_start1));

    assert.deepEqual(nfa1, nfac.makeUnion(l1, r1));

    // union between NFA recognizing dot and recognizing 'Y'
    const l2 = dotRec();
    const r2 = charRec('Y');

    const new_start2 = new State();
    new_start2.epsilons = [l2.start, r2.start];
    const nfa2 = new NFA(new_start2, 
                        set_union(l2.accepts, r2.accepts), 
                        l2.states.concat(r2.states).concat(new_start2));

    assert.deepEqual(nfa2, nfac.makeUnion(l2, r2));
  });

  it('makeSequence builds NFA representing the sequence', () => {
    // make NFA recognizing sequence of dot, then '7'
    const l1 = dotRec();
    const r1 = charRec('7');

    // sequenced NFA
    const l1_copy = Object.assign({}, l1);
    for (let acc of l1_copy.accepts)
      acc.epsilons = [r1.start];

    const nfa1 = new NFA(l1.start,
                        r1.accepts,
                        l1.states.concat(r1.states));

    assert.deepEqual(nfa1, nfac.makeSequence(l1, r1));

    // make NFA recognizing sequence of 'f' then 'H'
    const l2 = charRec('f');
    const r2 = charRec('H');

    // sequenced NFA
    const l2_copy = Object.assign({}, l2);
    for (let acc of l2_copy.accepts)
      acc.epsilons = [r2.start];

    const nfa2 = new NFA(l2.start,
                        r2.accepts,
                        l2.states.concat(r2.states));

    assert.deepEqual(nfa2, nfac.makeSequence(l2, r2));
  });

  it('makeStar builds NFA representing Kleene star of base', () => {
    // make NFA recognizing c*
    const b1 = charRec('c');

    // base with * applied
    const starred1 = charRec('c');

    const new_start1 = new State();
    new_start1.epsilons = [starred1.start];
    for (let acc of starred1.accepts)
      acc.epsilons = [starred1.start];

    const new_acc1 = starred1.accepts.add(new_start1);
    const new_states1 = starred1.states.concat([new_start1]);

    const starNFA1 = new NFA(new_start1, 
                            new_acc1,
                            new_states1);

    assert.deepEqual(starNFA1, nfac.makeStar(b1));

    // make NFA recognizing .* (dot)
    const b2 = dotRec();

    // base with * applied
    const starred2 = dotRec();

    const new_start2 = new State();
    new_start2.epsilons = [starred2.start];
    for (let acc of starred2.accepts)
      acc.epsilons = [starred2.start];

    const new_acc2 = starred2.accepts.add(new_start2);
    const new_states2 = starred2.states.concat([new_start2]);

    const starNFA2 = new NFA(new_start2, 
                            new_acc2,
                            new_states2);

    assert.deepEqual(starNFA2, nfac.makeStar(b2));
  });
});

describe('NFA from parse tree', () => {
  const nfac = new NFAConstructor(empty());

  it('non-nested: character tree', () => {
    assert.deepEqual(nfac.treeToNFA(char('a')), nfac.makeCharRecognizer('a'));
    assert.deepEqual(nfac.treeToNFA(char('9')), nfac.makeCharRecognizer('9'));
    assert.deepEqual(nfac.treeToNFA(char('{')), nfac.makeCharRecognizer('{'));
    assert.deepEqual(nfac.treeToNFA(char(',')), nfac.makeCharRecognizer(','));
  });

  it('non-nested: dot tree', () => {
    assert.deepEqual(nfac.treeToNFA(dot()), nfac.makeDotRecognizer());
  });

  it('non-nested: empty tree', () => {
    assert.deepEqual(nfac.treeToNFA(empty()), nfac.makeEmptyRecognizer());
  });

  it('sequence with 1 level of nesting', () => {
    const tree = seq(char('a'), char('b'));
    const nfa = 
      nfac.makeSequence(
        nfac.makeCharRecognizer('a'), 
        nfac.makeCharRecognizer('b'));

    assert.deepEqual(nfac.treeToNFA(tree), nfa);
  });

  it('union with 2 levels of nesting', () => {
    const tree = union(empty(), seq(dot(), char('X')));
    const nfa = 
      nfac.makeUnion(
        nfac.makeEmptyRecognizer(),
        nfac.makeSequence(
          nfac.makeDotRecognizer(),
          nfac.makeCharRecognizer('X')));

    assert.deepEqual(nfac.treeToNFA(tree), nfa);
  });

  it('star with several levels of nesting', () => {
    const tree = star(seq(char('a'), seq(char('s'), star(dot()))));;
    const nfa = 
      nfac.makeStar(
        nfac.makeSequence(
          nfac.makeCharRecognizer('a'),
          nfac.makeSequence(
            nfac.makeCharRecognizer('s'),
            nfac.makeStar(
              nfac.makeDotRecognizer()))));

    assert.deepEqual(nfac.treeToNFA(tree), nfa);
  });

  it('complicated nested expressions', () => {
    const tree = 
      union(
        star(char('q')), 
        seq(
          union(
            dot(), 
            char('b')),
          seq(
            char('x'),
            char('y'))));
    const nfa = 
      nfac.makeUnion(
        nfac.makeStar(nfac.makeCharRecognizer('q')),
        nfac.makeSequence(
          nfac.makeUnion(
            nfac.makeDotRecognizer(),
            nfac.makeCharRecognizer('b')),
          nfac.makeSequence(
            nfac.makeCharRecognizer('x'),
            nfac.makeCharRecognizer('y'))));

    assert.deepEqual(nfac.treeToNFA(tree), nfa);
  });

});

describe('construct() is a wrapper of treeToNFA()', () => {
  nfac = new NFAConstructor(empty());

  it('simple NFAs', () => {
    // empty tree
    const tree1 = empty();
    const nfa1 = emptyRec();

    assert.deepEqual(nfa1, new NFAConstructor(tree1).construct());

    // single-char recognizer
    const tree2 = char('B');
    const nfa2 = charRec('B');

    assert.deepEqual(nfa2, new NFAConstructor(tree2).construct());

    // dot recognizer
    const tree3 = dot();
    const nfa3 = dotRec();

    assert.deepEqual(nfa3, new NFAConstructor(tree3).construct());
  });

  it('more complex NFAs', () => {
    // x|yz
    const tree1 = union(char('x'), seq(char('y'), char('z')));
    const nfa1 = nfac.treeToNFA(tree1);

    assert.deepEqual(nfa1, new NFAConstructor(tree1).construct());

    // (a(b|))*
    const tree2 = star(seq(char('a'), union(char('b'), empty())));
    const nfa2 = nfac.treeToNFA(tree2);

    assert.deepEqual(nfa2, new NFAConstructor(tree2).construct());

    // ((a|.)(|b))*
    const tree3 = star(seq(union(char('a'), dot()), union(empty(), char('b'))));
    const nfa3 = nfac.treeToNFA(tree3);

    assert.deepEqual(nfa3, new NFAConstructor(tree3).construct());
  });

});