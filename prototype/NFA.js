/*
  NFA.js: Representation of a nondeterministic finite automaton to
  simulate the regular expressions
*/

class NFA {

  constructor(_start, _accepts, _states) {
    this.start = _start;
    this.accepts = _accepts;
    this.states = _states;
  }

  /*  State -> Boolean
      Determines if a given state is an accept state */
  is_accept_state(state) {

  }

  /*  List<State> -> Boolean
      Determine if a list of states contains at least one accept */
  contains_accept_state(states) {

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

        if current in reached
          continue loop
        else: 
          add current to reached

        for st in transition(current, EPSILON)
          if st NOT in reached:
            add to queue
      
      return reached
    */
  }

}


class State {

  constructor() {
    /*  id :: Integer
        Unique ID defined later when NFA represents complete expression,
        not sub-expression (because reassigning IDs during NFA 
        construction would be cumbersome) */
    this.id;

    /*  transitions :: (Char -> List<State>)
        Mapping that encodes which states to move to
        if a given character literal is read */
    this.transitions = {};

    /*  epsilons :: List<State>
        States that are directly connected to this state
        by an epsilon transition */
    this.epsilons = [];

    /*  dots :: List<State>
        States directly connected to this state
        by a dot character transition */
    this.dots = [];
  }

  /*  Integer -> 
      Set the value of this state's identity */
  set_id(id) {
    this.id = id;
  }

}

module.exports = { NFA, State };