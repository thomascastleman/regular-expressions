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
    return this.treeToNFA(this.tree);
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
    return new NFA(start, new Set([acc]), [start, acc]);
  }

  /*  -> NFA 
      Construct a small NFA that recognizes any character that is 
      not a newline*/
  makeDotRecognizer() {
    const start = new State(), acc = new State();
    start.dots = [acc]; // start transitions to accept, reading anything but \n
    return new NFA(start, new Set([acc]), [start, acc]);
  }

  /*  -> NFA 
      Construct a small NFA that recognizes the empty string */
  makeEmptyRecognizer() {
    // single state, both start and accept
    const start_acc = new State();
    return new NFA(start_acc, new Set([start_acc]), [start_acc]);
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
                  globals.set_union(left.accepts, right.accepts),
                  left.states.concat(right.states).concat([new_start]));
  }

  /*  NFA NFA -> NFA
      Given NFA's recognizing the left- and right-hand sides of a sequence
      respectively, construct an NFA that recognizes the sequence */
  makeSequence(left, right) {
    // add an epsilon from every left accept state to the right start state
    for (let acc of left.accepts) {
      acc.epsilons.push(right.start);
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
    base.accepts.add(new_start);

    // add epsilons from every accept state to the original start
    for (let acc of base.accepts) {
      acc.epsilons.push(base.start);
    }

    return new NFA(new_start,
                  base.accepts,
                  base.states.concat([new_start]));
  }

}

module.exports = NFAConstructor;