/*
  NFA.js: Representation of a nondeterministic finite automaton to
  simulate the regular expressions
*/

class NFA {

  constructor(_start, _accepts, _states) {
    this.start = _start;
    this.accepts = _accepts;
    this.states = _states;
    this.accept_ids;
  }

  /*  State Character -> List<State>
      Determine all states that can be reached from the given state
      by reading char off the input stream (includes literals/dots, but
      not epsilon transitions) */
  transition(state, char) {
    let next = state.transitions[char] || [];

    // follow all . transitions if this char isn't \n
    if (char != '\n')
      next = next.concat(state.dots);

    return next;
  }

  /*  State -> Boolean
      Determines if a given state is an accept state */
  is_accept_state(state) {
    return this.accept_ids.has(state.id);
  }

  /*  List<State> -> Boolean
      Determine if a list of states contains at least one accept */
  contains_accept_state(states) {
    const acceptSoFar = (acc, cur) => this.is_accept_state(cur) || acc;
    return states.reduce(acceptSoFar, false);
  }

  /*  List<State> -> List<State>
      Expands a list of states to include any states that are
      reachable by following any number of epsilon transitions */
  follow_epsilon(states) {
    const queue = states;
    const reached = [];
    let current, reachable, i;

    // while there are states left to explore
    while (queue.length > 0) {
      current = queue.shift();

      // if not already explored
      if (!reached.includes(current)) {
        reached.push(current);

        // add unexplored states neighboring current via epsilon to queue
        for (i = 0; i < current.epsilons.length; i++) {
          reachable = current.epsilons[i];

          if (!reached.includes(reachable))
            queue.push(reachable);
        }
      }
    }

    return reached;
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

}

module.exports = { NFA, State };