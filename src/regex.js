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
    /* simulate on input, from beginning, and
    accept only if entire string matched */
    return this.nfa.simulate(str, 0) == str.length;
  }

  /*  String -> List<Match>
      Extract all substrings of the given text that match 
      this regular expression. */
  matches(text) {
    let i = 0;
    let max_acc;
    const matches = [];

    while (i < text.length) {
      // simulate on input starting at idx i
      max_acc = this.nfa.simulate(text, i);

      if (max_acc == null) {
        // no match, move onto next idx
        i++;
      } else {
        // extract the longest match
        matches.push(new Match(i, max_acc, text.substring(i, max_acc)));

        if (i == max_acc) {
          // empty match, increment, so as to move along
          i++;
        } else {
          // jump to end position of match
          i = max_acc;
        }
      }
    }

    return matches;
  }

  /*  String String -> String 
      Produces a copy of the input string with any substring that matches
      with this regex replaced with the replacement string */
  replace(text, replacement) {
    const m = this.matches(text);

    // if no matches, then nothing to replace
    if (m.length == 0)
      return text;

    const subs = [];
    let lastEnd = 0;

    for (let i = 0; i < m.length; i++) {
      // get substring from last match's ending up to this match's start
      subs.push(text.substring(lastEnd, m[i].begin));

      lastEnd = m[i].end;

      if (i == m.length - 1) {
        // handle last substring
        subs.push(text.substring(m[i].end));
      }
    }

    return subs.join(replacement);
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