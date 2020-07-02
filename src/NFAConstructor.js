/*
  NFAConstructor.js: Builds an NFA from a parse tree
*/

const globals = require('./globals.js');
const { NFA, State } = require('./NFA.js');

class NFAConstructor {

  /*  ParseTree ->
      Take in the parse tree that will be used to construct this NFA */
  constructor(_tree) {
    this.tree = _tree;  
  }

  /*  -> NFA
      Produces an NFA that simulates the regular expression encoded
      in the parse tree */
  construct() {
    const fullNFA = this.treeToNFA(this.tree);
    const withIDs = this.addIDs(fullNFA);
    return withIDs;
  }

  /*  NFA -> NFA
      Add numeric IDs to nodes, so accept state checker can use these 
      IDs for better performance. IDs are added *after* the full NFA
      has been constructed so we don't need to keep updating the ID schemes
      of sub-NFAs to prevent ID conflicts. */
  addIDs(nfa) {
    /* this set of IDs of accepting states will be used in simulation to 
    efficiently check for accepting states */
    nfa.accept_ids = new Set();

    let s;
    for (let i = 0; i < nfa.states.length; i++) {
      s = nfa.states[i];

      s.id = i; // set the ID

      // if accepting state, add its ID to set of accepting IDs
      if (nfa.accepts.includes(s)) {
        nfa.accept_ids.add(s.id);
      }
    }

    return nfa;
  }

  /*  ParseTree -> NFA
      Recursively construct NFAs for subtrees of this tree and
      combine them to form an NFA that recognizes the full expression */
  treeToNFA(tree) {
    // handle valid tokens
    switch (tree.type) {
      case globals.CHARACTER:
        return this.makeCharRecognizer(tree.char);

      case globals.EMPTY:
        return this.makeEmptyRecognizer();

      case globals.DOT:
        return this.makeDotRecognizer();

      case globals.UNION:
        var left = this.treeToNFA(tree.left);
        var right = this.treeToNFA(tree.right);
        return this.makeUnion(left, right);

      case globals.SEQUENCE:
        var left = this.treeToNFA(tree.left);
        var right = this.treeToNFA(tree.right);
        return this.makeSequence(left, right);

      case globals.STAR:
        var base = this.treeToNFA(tree.base);
        return this.makeStar(base);

      default:
        throw new Error(
          `Unexpected token encountered while converting to NFA, ` +
          `with type: ${tree.type}`);
    }
  }

  /*  ####################################################################
      #---------------------------- Base Cases --------------------------#
      #################################################################### */

  /*  Char -> NFA 
      Construct a small NFA that recognizes the given character */
  makeCharRecognizer(c) {
    const start = new State(), acc = new State();
    start.transitions[c] = [acc]; // start transitions to accept, reading char c
    return new NFA(start, [acc], [start, acc]);
  }

  /*  -> NFA 
      Construct a small NFA that recognizes any character that is 
      not a newline*/
  makeDotRecognizer() {
    const start = new State(), acc = new State();
    start.dots = [acc]; // start transitions to accept, reading anything but \n
    return new NFA(start, [acc], [start, acc]);
  }

  /*  -> NFA 
      Construct a small NFA that recognizes the empty string */
  makeEmptyRecognizer() {
    // single state, both start and accept
    const start_acc = new State();
    return new NFA(start_acc, [start_acc], [start_acc]);
  }

  /*  ####################################################################
      #----------------------- Regular Operations  ----------------------#
      #################################################################### */

  /*  NFA NFA -> NFA
      Given NFA's recognizing the left- and right-hand sides of a union
      respectively, construct an NFA that recognizes the union */
  makeUnion(left, right) {
    const new_start = new State();
    new_start.epsilons = [left.start, right.start];

    // NFA starting at new state and accepting if either sub-NFA accepts
    return new NFA(new_start,
                  left.accepts.concat(right.accepts),
                  left.states.concat(right.states).concat([new_start]));
  }

  /*  NFA NFA -> NFA
      Given NFA's recognizing the left- and right-hand sides of a sequence
      respectively, construct an NFA that recognizes the sequence */
  makeSequence(left, right) {
    // add an epsilon from every left accept state to the right start state
    for (let i = 0; i < left.accepts.length; i++) {
      left.accepts[i].epsilons.push(right.start);
    }

    // NFA starting at left, accepting at right, with all states in between
    return new NFA(left.start,
                  right.accepts,
                  left.states.concat(right.states));
  }

  /*  NFA -> NFA
      Given an NFA that recognizes a base expression, construct an NFA
      that recognizes Kleene star applied to this base (any number of 
      occurrences) */
  makeStar(base) {
    // construct new start state, make accept
    const new_start = new State();
    base.accepts.push(new_start);

    // add epsilons from every accept state to the original start
    for (let i = 0; i < base.accepts.length; i++) {
      base.accepts[i].epsilons.push(base.start);
    }

    return new NFA(new_start,
                  base.accepts,
                  base.states.concat([new_start]));
  }

}

module.exports = NFAConstructor;