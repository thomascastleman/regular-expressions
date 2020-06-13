/*
  regex.js: Regular expressions API
*/

class RegularExpression {

  constructor(_expr) {
    this.expr = _expr;

    // parse, desugar, construct NFA
  }

  /*  String -> Boolean
      Determine if the given string matches this regular expression. If 
      simulating the NFA representation of this expr on the input 
      ends in an accept state, return true, otherwise false. */
  recognize(s) {

  }

  /*  String -> List<Match>
      Extract all substrings of the given text that match 
      this regular expression. */
  matches(text) {

  }

  /*  String String -> String 
      Produces a copy of the input string with any substring that matches
      with this regex replaced with the replacement string */
  replace(text, replacement) {

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