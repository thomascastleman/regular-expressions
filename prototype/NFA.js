/*
  NFA.js: Representation of a nondeterministic finite automaton to
  simulate the regular expressions
*/

class NFA {
  constructor() {
    this.num_states;
    this.start_state;
    this.accepts;
    this.transitions;
  }
}

/*  Represents a transition from one state to a set of other 
    states given a character*/
class Transition {
  constructor(_state, _symbol, _next) {
    this.state = _state;
    this.symbol = _symbol;
    this.next = _next;
  }
}

module.exports = NFA;