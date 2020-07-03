/*
  NFA.test.js: Testing for NFA functions
*/

const assert = require('assert');
const { NFA, State } = require('../src/NFA.js');

/*  Number List<Number> -> NFA
    Generate an empty (no transitions, etc) NFA with n
    states, and the accept states as indicated by the 
    indices in accept_idx */
function empty_NFA(n, accept_idx) {
  const states = [], accepts = new Set();
  let s, start;

  for (let i = 0; i < n; i++) {
    s = new State();
    states.push(s);

    if (accept_idx.includes(i))
      accepts.add(s);

    if (i == 0) start = s;
  }

  // choose 0th state as start
  return new NFA(start, accepts, states);
}

describe('transition', () => {
  it('follows transitions & dots', () => {
    const nfa1 = empty_NFA(5, [4]);
    const s1 = nfa1.states;
  
    s1[0].transitions['a'] = [s1[1], s1[2]];
    s1[0].transitions['Y'] = [s1[3]];
    s1[0].dots = [s1[4]];
  
    assert.deepEqual(
      nfa1.transition(s1[0], 'x'),
      [s1[4]]); // only dot
    assert.deepEqual(
      nfa1.transition(s1[0], 'a'),
      [s1[1], s1[2], s1[4]]);
    assert.deepEqual(
      nfa1.transition(s1[0], 'Y'),
      [s1[3], s1[4]]);
  });

  it('only dots', () => {
    const nfa = empty_NFA(4, [1,2,3]);
    const s = nfa.states;

    s[0].dots = [s[1], s[2], s[3]];

    assert.deepEqual(nfa.transition(s[0], '7'), [s[1], s[2], s[3]]);
    assert.deepEqual(nfa.transition(s[0], '\n'), []); // . doesn't match \n
  });

  it('basic transitions', () => {
    const nfa = empty_NFA(6, [5]);
    const s = nfa.states;

    s[0].transitions['*'] = [s[1], s[3]];
    s[0].transitions['E'] = [s[2]];
    s[2].transitions['j'] = [s[4], s[5]];

    assert.deepEqual(
      nfa.transition(s[0], '*'),
      [s[1], s[3]]);
    assert.deepEqual(
      nfa.transition(s[0], 'E'),
      [s[2]]);
    assert.deepEqual(
      nfa.transition(s[0], 'j'),
      []);
    
    assert.deepEqual(
      nfa.transition(s[2], 'j'),
      [s[4], s[5]]);
    assert.deepEqual(
      nfa.transition(s[2], 'U'),
      []);
  });
});

describe('accept-state checking with numeric IDs', () => {
  it('is_accept_state returns true on accept states & false otherwise', () => {
    const nfa = empty_NFA(6, [0, 3, 4]);
    const s = nfa.states;

    assert.equal(nfa.is_accept_state(s[0]), true);
    assert.equal(nfa.is_accept_state(s[1]), false);
    assert.equal(nfa.is_accept_state(s[2]), false);
    assert.equal(nfa.is_accept_state(s[3]), true);
    assert.equal(nfa.is_accept_state(s[4]), true);
    assert.equal(nfa.is_accept_state(s[5]), false);

    const nfa2 = empty_NFA(15, [4, 2, 9, 11, 5]);
    const s2 = nfa2.states;

    assert.equal(nfa2.is_accept_state(s2[4]), true);
    assert.equal(nfa2.is_accept_state(s2[2]), true);
    assert.equal(nfa2.is_accept_state(s2[9]), true);
    assert.equal(nfa2.is_accept_state(s2[11]), true);
    assert.equal(nfa2.is_accept_state(s2[5]), true);

    assert.equal(nfa2.is_accept_state(s2[0]), false);
    assert.equal(nfa2.is_accept_state(s2[6]), false);
    assert.equal(nfa2.is_accept_state(s2[14]), false);
  });

  it('contains_accept_state returns true when at least one state is accepting', () => {
    const nfa = empty_NFA(10, [3,5,6,7]);
    const s = nfa.states;

    assert.equal(nfa.contains_accept_state(s), true);
    assert.equal(nfa.contains_accept_state([s[0], s[1], s[2], s[3]]), true);
    assert.equal(nfa.contains_accept_state([s[1], s[2], s[4], s[9]]), false);
    assert.equal(nfa.contains_accept_state([]), false);
    assert.equal(nfa.contains_accept_state([s[3], s[5], s[6], s[7]]), true);
    assert.equal(nfa.contains_accept_state([s[0], s[1], s[2], s[4], s[8], s[9]]), false);

    const nfa2 = empty_NFA(50, [0,44,2]);
    const s2 = nfa2.states;

    assert.equal(nfa2.contains_accept_state(s2), true);
    assert.equal(nfa2.contains_accept_state([]), false);
    assert.equal(nfa2.contains_accept_state([s2[4], s2[10], s2[35]]), false);
    assert.equal(nfa2.contains_accept_state([s2[3], s2[15], s2[0], s2[11]]), true);
    assert.equal(nfa2.contains_accept_state([s2[0], s2[44], s2[2]]), true);
  });
});

describe('follow_epsilon adds states reachable by epsilon', () => {

  it('empty list of states yields empty list', () => {
    const nfa = empty_NFA(10, [4, 5]);
    assert.deepEqual(nfa.follow_epsilon([]), []);
  })

  it('state with all epsilon outs', () => {
    const start = new State();
    const accs = [new State(), new State(), new State()];
    start.epsilons = accs;  // epsilon from start to every accept state
    const nfa = new NFA(start, accs, [start].concat(accs));

    assert.deepEqual(nfa.follow_epsilon([start]), [start].concat(accs));
  });

  it('state with no epsilon outs', () => {
    const start = new State();
    const accs = [new State(), new State(), new State()];
    start.transitions['c'] = accs[0];
    start.dots = accs[1];
    accs[1].epsilons = [accs[2]];
    const nfa = new NFA(start, accs, [start].concat(accs));

    assert.deepEqual(nfa.follow_epsilon([start]), [start]); // no added states
  });

  it('chain of epsilons', () => {
    const start = new State();
    const next1 = new State();
    const next2 = new State();
    const next3 = new State();

    // start --> next1 --> next2 --> ( next3 )
    start.epsilons = [next1];
    next1.epsilons = [next2];
    next2.epsilons = [next3];

    const nfa = new NFA(start, [next3], [start, next1, next2, next3]);

    assert.deepEqual(nfa.follow_epsilon([start]), [start, next1, next2, next3]);
    assert.deepEqual(nfa.follow_epsilon([next1]), [next1, next2, next3]);
    assert.deepEqual(nfa.follow_epsilon([next2]), [next2, next3]);
    assert.deepEqual(nfa.follow_epsilon([next3]), [next3]);
  });

  it('regular NFAs', () => {
    // NFA 1
    const nfa1 = empty_NFA(5, [4]);
    const s1 = nfa1.states;
    const start1 = nfa1.start;

    start1.transitions['x'] = [s1[1], s1[2]];
    start1.epsilons = [s1[4]];
    s1[1].epsilons = [s1[2], s1[3]];
    s1[2].dots = [s1[3]];
    s1[2].transitions['y'] = start1;
    s1[2].epsilons = [s1[4]];

    // individual state sets
    assert.deepEqual(nfa1.follow_epsilon([start1]), [start1, s1[4]]);
    assert.deepEqual(nfa1.follow_epsilon([s1[1]]), [s1[1], s1[2], s1[3], s1[4]]);
    assert.deepEqual(nfa1.follow_epsilon([s1[2]]), [s1[2], s1[4]]);
    assert.deepEqual(nfa1.follow_epsilon([s1[3]]), [s1[3]]);
    assert.deepEqual(nfa1.follow_epsilon([s1[4]]), [s1[4]]);

    // multi-state sets
    assert.deepEqual(
      nfa1.follow_epsilon([start1, s1[1]]), 
      [start1, s1[1], s1[4], s1[2], s1[3]]);
    assert.deepEqual(
      nfa1.follow_epsilon([s1[4], s1[1]]), 
      [s1[4], s1[1], s1[2], s1[3]]);
    assert.deepEqual(
      nfa1.follow_epsilon([s1[3], s1[4]]),
      [s1[3], s1[4]]);
    assert.deepEqual(
      nfa1.follow_epsilon([start1, s1[1], s1[2], s1[3]]),
      [start1, s1[1], s1[2], s1[3], s1[4]]);


    // NFA 2
    const nfa2 = empty_NFA(7, [5, 6]);
    const s2 = nfa2.states;
    const start2 = nfa2.start;

    start2.transitions['A'] = [s2[1]];
    start2.dots = [s2[2]];
    start2.epsilons = [s2[3]];
    s2[1].epsilons = [s2[4], s2[6]];
    s2[2].transitions['x'] = [s2[4]];
    s2[3].epsilons = [s2[5]];
    s2[4].epsilons = [s2[5], s2[6]];
    s2[5].transitions['a'] = [s2[6]];
    s2[6].transitions['y'] = start2;

    // individual state sets
    assert.deepEqual(nfa2.follow_epsilon([start2]), [start2, s2[3], s2[5]]);
    assert.deepEqual(nfa2.follow_epsilon([s2[1]]), [s2[1], s2[4], s2[6], s2[5]]);
    assert.deepEqual(nfa2.follow_epsilon([s2[2]]), [s2[2]]);
    assert.deepEqual(nfa2.follow_epsilon([s2[3]]), [s2[3], s2[5]]);
    assert.deepEqual(nfa2.follow_epsilon([s2[4]]), [s2[4], s2[5], s2[6]]);
    assert.deepEqual(nfa2.follow_epsilon([s2[5]]), [s2[5]]);
    assert.deepEqual(nfa2.follow_epsilon([s2[6]]), [s2[6]]);

    // multi-state sets
    assert.deepEqual(
      nfa2.follow_epsilon([start2, s2[4], s2[6]]),
      [start2, s2[4], s2[6], s2[3], s2[5]]);
    assert.deepEqual(
      nfa2.follow_epsilon([s2[2], s2[3]]),
      [s2[2], s2[3], s2[5]]);
    assert.deepEqual(
      nfa2.follow_epsilon([s2[6], start2, s2[1], s2[4]]),
      [s2[6], start2, s2[1], s2[4], s2[3], s2[5]]);
  });

});