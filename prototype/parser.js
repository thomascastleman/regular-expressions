/*
  parser.js: Parser for our regular expression strings
*/

/*
  Here's the grammar we're going to use.
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
          | '[' { <charset-factor> } ']'
  
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

}

module.exports = Parser;