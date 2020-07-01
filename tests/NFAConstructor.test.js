/*
  NFAConstructor.test.js: Unit testing for functions that 
  construct an NFA
*/

const assert = require('assert');
const { NFA, State } = require('../NFA.js');
const NFAConstructor = require('../NFAConstructor.js');
const { union, seq, star, char, dot, empty } = require('./globals.test.js');

// helper to construct an NFA that recognizes a single character
function charRec(c) {
  const st = new State(), acc = new State();
  st.transitions[c] = [acc];
  return new NFA(st, [acc], [st, acc]);
}

// helper to construct NFA that recognizes the dot char
function dotRec() {
  const st = new State(), acc = new State();
  st.dots = [acc];
  return new NFA(st, [acc], [st, acc]);
}

// helper to construct NFA that recognizes empty string
function emptyRec() {
  const st = new State();
  return new NFA(st, [st], [st]);
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
                        l1.accepts.concat(r1.accepts), 
                        l1.states.concat(r1.states).concat(new_start1));

    assert.deepEqual(nfa1, nfac.makeUnion(l1, r1));

    // union between NFA recognizing dot and recognizing 'Y'
    const l2 = dotRec();
    const r2 = charRec('Y');

    const new_start2 = new State();
    new_start2.epsilons = [l2.start, r2.start];
    const nfa2 = new NFA(new_start2, 
                        l2.accepts.concat(r2.accepts), 
                        l2.states.concat(r2.states).concat(new_start2));

    assert.deepEqual(nfa2, nfac.makeUnion(l2, r2));
  });

  it('makeSequence builds NFA representing the sequence', () => {
    // make NFA recognizing sequence of dot, then '7'
    const l1 = dotRec();
    const r1 = charRec('7');

    // sequenced NFA
    const l1_copy = Object.assign({}, l1);
    l1_copy.accepts[0].epsilons = [r1.start];

    const nfa1 = new NFA(l1.start,
                        r1.accepts,
                        l1.states.concat(r1.states));

    assert.deepEqual(nfa1, nfac.makeSequence(l1, r1));

    // make NFA recognizing sequence of 'f' then 'H'
    const l2 = charRec('f');
    const r2 = charRec('H');

    // sequenced NFA
    const l2_copy = Object.assign({}, l2);
    l2_copy.accepts[0].epsilons = [r2.start];

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
    starred1.accepts[0].epsilons = [starred1.start];

    const starNFA1 = new NFA(new_start1, 
                            [starred1.accepts[0], new_start1], 
                            [starred1.start, starred1.accepts[0], new_start1]);

    assert.deepEqual(starNFA1, nfac.makeStar(b1));

    // make NFA recognizing .* (dot)
    const b2 = dotRec();

    // base with * applied
    const starred2 = dotRec();

    const new_start2 = new State();
    new_start2.epsilons = [starred2.start];
    starred2.accepts[0].epsilons = [starred2.start];

    const starNFA2 = new NFA(new_start2, 
                            [starred2.accepts[0], new_start2], 
                            [starred2.start, starred2.accepts[0], new_start2]);

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

describe('adding IDs to NFA states/full construction', () => {
  nfac = new NFAConstructor(empty());

  it('simple NFAs', () => {
    // empty tree
    const tree1 = empty();
    const nfa1 = emptyRec();
    const withIDs1 = nfac.addIDs(nfa1);

    assert.deepEqual(withIDs1.states.map(s => s.id), [0]);
    assert.deepEqual(withIDs1.accept_ids, new Set([0]));
    assert.deepEqual(withIDs1, new NFAConstructor(tree1).construct());

    // single-char recognizer
    const tree2 = char('B');
    const nfa2 = charRec('B');
    const withIDs2 = nfac.addIDs(nfa2);

    assert.deepEqual(withIDs2.states.map(s => s.id), [0,1]);
    assert.deepEqual(withIDs2.accept_ids, new Set([1]));
    assert.deepEqual(withIDs2, new NFAConstructor(tree2).construct());

    // dot recognizer
    const tree3 = dot();
    const nfa3 = dotRec();
    const withIDs3 = nfac.addIDs(nfa3);

    assert.deepEqual(withIDs3.states.map(s => s.id), [0,1]);
    assert.deepEqual(withIDs3.accept_ids, new Set([1]));
    assert.deepEqual(withIDs3, new NFAConstructor(tree3).construct());
  });

  it('more complex NFAs', () => {
    // x|yz
    const tree1 = union(char('x'), seq(char('y'), char('z')));
    const nfa1 = nfac.treeToNFA(tree1);
    const withIDs1 = nfac.addIDs(nfa1);
    assert.deepEqual(withIDs1.states.map(s => s.id), [0,1,2,3,4,5,6]);
    assert.deepEqual(withIDs1.accept_ids, new Set([1, 5]));
    assert.deepEqual(withIDs1, new NFAConstructor(tree1).construct());

    // (a(b|))*
    const tree2 = star(seq(char('a'), union(char('b'), empty())));
    const nfa2 = nfac.treeToNFA(tree2);
    const withIDs2 = nfac.addIDs(nfa2);
    assert.deepEqual(withIDs2.states.map(s => s.id), [0,1,2,3,4,5,6]);
    assert.deepEqual(withIDs2.accept_ids, new Set([3,4,6]));
    assert.deepEqual(withIDs2, new NFAConstructor(tree2).construct());

    // ((a|.)(|b))*
    const tree3 = star(seq(union(char('a'), dot()), union(empty(), char('b'))));
    const nfa3 = nfac.treeToNFA(tree3);
    const withIDs3 = nfac.addIDs(nfa3);
    assert.deepEqual(withIDs3.states.map(s => s.id), [0,1,2,3,4,5,6,7,8,9]);
    assert.deepEqual(withIDs3.accept_ids, new Set([5,7,9]));
    assert.deepEqual(withIDs3, new NFAConstructor(tree3).construct());
  });

});