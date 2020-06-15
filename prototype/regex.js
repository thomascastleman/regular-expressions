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
  recognize(str) {
    /*
      current = follow_epsilon( [start_state] )

      for c in str:
        next = []
        for state in current
          add transition(state, c) to next (add all elts, big union)
        
        current = follow_epsilon(next)
        if current is empty: reject

      if ormap(is_accept_state, current) is true
        accept
      else:
        reject
    */
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