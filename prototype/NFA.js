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

  /*  State -> Boolean
      Determines if a given state is an accept state */
  is_accept_state(state) {

  }

  /*  State Character -> List<State>
      Produces a list of all states that can be reached from the
      given state by reading character sym */
  transition(state, sym) {

  }

  /*  List<State> -> List<State>
      Expands a list of states to include any states that are
      reachable by following any number of epsilon transitions */
  follow_epsilon(states) {
    /*
      queue = states
      reached = []

      while queue is not empty:
        current = pop state off the queue
        add current to reached

        for st in transition(current, EPSILON)
          if st in reached:
            error or don't add to queue
          else:
            add to queue
      
      return reached
    */
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