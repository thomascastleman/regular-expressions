/*
  NFAConstructor.test.js: Unit testing for functions that 
  construct an NFA
*/

const assert = require('assert');
const { NFA, State } = require('../NFA.js');
const NFAConstructor = require('../NFAConstructor.js');
const { union, seq, star, char, dot, empty } = require('./globals.test.js');
const _ = require('lodash');

/*  List<T> List<T> -> Boolean
    Determine that two lists contain the same elements,
    irrespective of ordering */
function same_elts(l1, l2) {
  function subset(small, large) {
    for (let i = 0; i < small.length; i++) {
      if (large.filter(el => _.isEqual(el, small[i])) == [])
        return false;
    }
    return true;
  }

  return subset(l1, l2) && subset(l2, l1);
}

/*  NFA NFA -> Boolean
    Determine if two NFAs are equivalent, structurally */
function NFA_equal(nfa1, nfa2) {
  return  _.isEqual(nfa1.start, nfa2.start) &&
          same_elts(nfa1.accepts, nfa2.accepts) &&
          same_elts(nfa1.states, nfa2.states);
}

describe('converting parse tree to NFA', () => {
  const nfac = new NFAConstructor(empty());

  it('makeCharRecognizer constructs NFA recognizing a char', () => {
    const st = new State(), acc = new State();
    st.transitions['x'] = [acc];
    const nfa = new NFA(st, [acc], [st, acc]);

    assert.equal(NFA_equal(nfac.makeCharRecognizer('x'), nfa), true);
  });

  it('makeDotRecognizer constructs NFA recognizing a char', () => {
    const st = new State(), acc = new State();
    st.dots = [acc];
    const nfa = new NFA(st, [acc], [st, acc]);

    assert.equal(NFA_equal(nfac.makeDotRecognizer(), nfa), true);
  });

  it('makeEmptyRecognizer constructs NFA recognizing empty string', () => {
    const st = new State();
    const nfa = new NFA(st, [st], [st]);

    assert.equal(NFA_equal(nfac.makeEmptyRecognizer(), nfa), true);
  });

  it('makeUnion builds a NFA representing the union', () => {
    const st1 = new State(), acc1 = new State();
    st1.transitions['c'] = [acc1];
    const left = new NFA(st1, [acc1], [st1, acc1]);

    const st2 = new State(), acc2 = new State();
    st2.epsilons = [acc2];
    const right = new NFA(st2, [acc2], [st2, acc2]);

    const new_start = new State();
    new_start.epsilons = [left.start, right.start];
    const nfa = new NFA(new_start, 
                        left.accepts.concat(right.accepts), 
                        left.states.concat(right.states));

    assert.equal(NFA_equal(nfa, nfac.makeUnion(left, right)), true);
  });

  it('makeSequence builds NFA representing the sequence', () => {
    const st1 = new State(), acc1 = new State();
    st1.epsilons = [acc1];
    const left = new NFA(st1, [acc1], [st1, acc1]);

    const st2 = new State(), acc2 = new State();
    st2.dots = [acc2];
    const right = new NFA(st2, [acc2], [st2, acc2]);

    const left_copy = Object.assign({}, left);
    left_copy.accepts[0].epsilons = [right.start];

    const nfa = new NFA(left.start,
                        right.accepts,
                        left.states.concat(right.states));

    assert.equal(NFA_equal(nfa, nfac.makeSequence(left, right)), true);
  });

  it('makeStar builds NFA representing Kleene star of base', () => {
    const st = new State(), acc = new State();
    st.transitions['y'] = [acc];
    const base = new NFA(st, [acc], [st, acc]);

    const copy_base = _.cloneDeep(base);
    const new_start = new State();
    new_start.epsilons = [copy_base.start];
    copy_base.accepts[0].epsilons = [copy_base.start];
    copy_base.accepts.push(new_start);
    copy_base.states.push(new_start);

    const nfa = new NFA(new_start, copy_base.accepts, copy_base.states);

    console.log(nfa);
    console.log(nfac.makeStar(base));

    assert.equal(NFA_equal(nfa, nfac.makeStar(base)), true);
  });
});

// describe('full NFA construction', () => {

// });

// describe('optimizing NFA for post-construction', () => {

// });