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

  charset_factor() {

  }

}

class Union {
  constructor(_left, _right) {
    this.left = _left;
    this.right = _right;
  }
}

class Concat {
  constructor(_first, _next) {
    this.first = _first;
    this.next = _next;
  }
}

class Star {
  constructor(_base) {
    this.base = _base;
  }
}

class Primitive {
  constructor(_char) {
    this.char = _char;
  }
}

// "a(b|c)*"
// const re = new Concat(new Primitive("a"), new Star(new Union("b", "c")));

module.exports = Parser;