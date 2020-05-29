/*
  parser.js: Parser for our regular expression strings
*/

const tokens = require('./tokens.js');

/*
  The grammar for the regular expressions we'll accept.
  Largely adapted from Matt Might's post: 
  http://matt.might.net/articles/parsing-regex-with-recursive-descent/

  <regex> := <term> '|' <regex>
          |  <term>

  <term> := { <factor> }

  <factor> := <base> '*'
            | <base> '+'
            | <base> '?'
            | <base>

  <base> := <char>
          | '\' <char>
          | '.'
          | '(' <regex> ')'
          | '[' <charset-term> ']'

  <charset-term> := { <charset-factor> }

  <charset-factor> := <char> '-' <char>
                    | <char>

*/

class Parser {
  /*  _re : String
      Construct a parser for a given regular expression _re */
  constructor(_re) {
    this.re = _re;
  }

  /*  Construct a parse tree for the stored regex */
  parse() {
    return new tokens.Empty();
  }


  /* ------------ Navigating the input stream ------------ */

  /*  -> char
      Peek at the next character in the input stream */
  peek() {
    return this.re[0];
  }

  /*  c : char ->
      Consume the next character in the input stream */
  eat(c) {
    if (this.peek() == c) {
      this.re = this.re.substring(1); // shift off the first char
    } else {
      throw new Error(`Expected: ${c}, but got: ${this.peek()}`);
    }
  }

  /*  -> char 
      Eat the next character and return it */
  next() {
    let c = this.peek();
    this.eat(c);
    return c;
  }

  /*  -> bool
      Are there more chars in the input stream? */
  more() {
    return this.re.length > 0;
  }


  /* ------------ Parsing each term ------------ */

  regex() {

  }

  term() {

  }

  factor() {

  }

  base() {

  }

  charset_term() {

  }

  charset_factor() {

  }

}

module.exports = Parser;