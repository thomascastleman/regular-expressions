/*
  regex.js: Regular expressions API
*/

const Parser = require('./parser.js');
const Desugarer = require('./desugarer.js');
const NFAConstructor = require('./NFAConstructor.js');

class RegularExpression {

  /*  String -> 
      Parse the given expression string, desugar the parse tree, and
      construct an NFA that simulates the expression. */
  constructor(_expr) {
    this.expr = _expr;

    const parsed = new Parser(this.expr).parse();
    const desugared = new Desugarer(parsed).desugar();
    const nfa = new NFAConstructor(desugared).construct();

    this.nfa = nfa;
  }

  /*  String -> Boolean
      Determine if the given string matches this regular expression. If 
      simulating the NFA representation of this expr on the input 
      ends in an accept state, return true, otherwise false. */
  recognize(str) {
    /* immediately follow any epsilon arrows from start state--use
    this as the starting set */
    let current = this.nfa.follow_epsilon([this.nfa.start]);
    let i, j, c, next;

    // for each char in input stream
    for (i = 0; i < str.length; i++) {
      c = str[i];

      // find all states reachable from current set by reading char c
      next = [];
      for (j = 0; j < current.length; j++)
        next = next.concat(this.nfa.transition(current[j], c));
      
      // extend set to include states reachable by epsilon arrows
      current = this.nfa.follow_epsilon(next);

      // no states could be transitioned to, reject
      if (current.length == 0) return false;
    }

    // having reached end of input, if NFA in at least 1 accepting state, accept
    return this.nfa.contains_accept_state(current);
  }

  /*  String -> List<Match>
      Extract all substrings of the given text that match 
      this regular expression. */
  matches(text) {
    /*
      i = 0
      matches = []

      while i < text.length
        max_acc = not defined

        (simulate NFA on substring i to eof (let j be current index))
          if there is an accept state in current during simulation:
            max_acc = j
        
        if max_acc still not defined:
          i++
        else:
          add match(i, j, ...) to matches
          if i = j: i++
          else: i = j
      
      return matches
    */
  }

  /*  String String -> String 
      Produces a copy of the input string with any substring that matches
      with this regex replaced with the replacement string */
  replace(text, replacement) {
    /*
      Run matches
      split text into the substrings *between* each match
      return (join substrings with replacement as delimiter)
    */
  }

}

/*
  In a Match, begin indicates the starting index of the match, end indicates
  the first index after the match, and content is the matching string itself
*/
class Match {
  constructor(_begin, _end, _content) {
    this.begin = _begin;
    this.end = _end;
    this.content = _content;
  }
}

module.exports = RegularExpression;