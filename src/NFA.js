/*
  NFA.js: Representation of a nondeterministic finite automaton to
  simulate the regular expressions
*/

class NFA {

  constructor(_start, _accepts, _states) {
    this.start = _start;      // State
    this.accepts = _accepts;  // Set<State>
    this.states = _states;    // List<State>
  }

  /*  Where Option<Number> is one of:
        - Number
        - null

      String Number -> Option<Number>
      Simulate the NFA on an input string, starting at index start,
      and return the index of the end of the longest match. If no
      matches, return null. */
  simulate(str, start) {
    if (start > str.length || start < 0)
      throw new Error(`simulate: start index ${start} out of bounds`);

    let current = [this.start]; // {start} as starting set of states
    let next;
    let max_accept = null;

    // for each char in input stream, starting from start idx
    for (let i = start; i <= str.length; i++) {
      // extend set to include states reachable by epsilon arrows
      current = this.follow_epsilon(current);

      // if this is an accepting configuration, record it
      if (this.contains_accept_state(current))
        max_accept = i;

      // if chars left to read
      if (i < str.length) {
        // find all states reachable from current set by reading next char
        next = [];
        for (let j = 0; j < current.length; j++)
          next = next.concat(this.transition(current[j], str[i]));
        current = next;
      }

      /* no states could be transitioned to, so 
      terminate, returning the longest match so far */
      if (current.length == 0) return max_accept;
    }

    return max_accept;
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
    return this.accepts.has(state);
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