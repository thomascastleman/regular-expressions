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

  <charset-term> := <charset-factor> { <charset-factor> }

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

  /*

  ############################################################################
  #---------------------------- Data Definitions ----------------------------#
  #                                                                          #
  #          See tokens.js for all tokens that can be instantiated.          #
  #         The below definitions outline how these tokens fit together      #
  #         and how they will be parsed in the below parsing functions.      #
  #                                                                          #
  ############################################################################

  A Literal is a Unicode character literal

  A Regex is one of:
    - Union(Term, Regex)
    - Term

  A Term is one of:
    - Empty()
    - Factor
    - Sequence(Factor, Factor)

  A Factor is one of:
    - Base
    - Star(Base)
    - Plus(Base)
    - Question(Base)

  A Base is one of:
    - Character(Literal)
    - Dot()
    - Regex
    - CharsetTerm

  A CharsetTerm is one of:
    - CharsetFactor
    - CharsetSequence(CharsetFactor, CharsetFactor)

  A CharsetFactor is one of:
    - Character(Literal)
    - Range(Literal, Literal)

  */

  /*  -> Regex
      Parses a full regular expression off the input stream. */
  regex() {

  }

  /*  -> Term
      Parses a term off the input stream.
      A Term is a possibly empty sequence of Factors */
  term() {

  }

  /*  -> Factor
      Parses a factor off the input stream.
      A factor is a Base that optionally has some unary 
      operator (*, +, ?) applied to it. */
  factor() {

  }

  /*  -> Base
      Parses a Base off the input stream.
      Bases can be literals, the '.' char, another sub-expression,
      or a character set */
  base() {

  }

  /*  -> CharsetTerm
      Parses a CharsetTerm off the input stream.
      These terms are enclosed in [] and represent character sets */
  charset_term() {

  }

  /*  -> CharsetFactor
      Parses a CharsetFactor off the input stream.
      This is a single character literal or a character range which
      is found within a character set */
  charset_factor() {

  }

}

module.exports = Parser;