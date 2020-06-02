/*
  parser.js: Parser for our regular expression strings
*/

const globals = require('./globals.js');
const tokens = require('./tokens.js');

/*

  The grammar for the regular expressions we'll accept.
  Adapted from Matt Might's post: 
  http://matt.might.net/articles/parsing-regex-with-recursive-descent/

  <regex> := <term> '|' <regex>
          |  <term>

  <term> := { <factor> }

  <factor> := <base> <unary-op>
            | <base>

  <unary-op> := '*'
              | '+'
              | '?'
              | <count>

  <base> := <char>
          | <built-in>
          | '.'
          | '\' <char>
          | '(' <regex> ')'
          | '[' <charset-term> ']'

  <count> :=  '{' <number> '}'
            | '{' <number> ',' <number> '}'
            | '{' <number> ',}'
            | '{,' <number> '}'

  <charset-term> := <charset-factor> { <charset-factor> }

  <charset-factor> := <char> '-' <char>
                    | <char>
                    | <built-in>

  <built-in> := '\d'
              | '\w'
              | '\s'

*/

class Parser {
  /*  _re : String
      Construct a parser for a given regular expression _re */
  constructor(_re) {
    this.re = _re;
  }

  /*  Construct a parse tree for the stored regex */
  parse() {
    const expr = this.regex();
    
    // if any part of input left unprocessed, signal error
    if (this.re != '')
      throw new Error(`Excess characters found after parse: '${this.re}'`);

    return expr;
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

  /*  char -> bool
      Determine if a character matches one of the reserved characters
      with special meanings. These characters need to be escaped for 
      literal use, unless within a charset. */
  is_special_char(c) {
    return  c == '(' || c == ')' ||
            c == '[' || c == ']' ||
            c == '{' || c == '}' ||
            c == '*' || 
            c == '+' ||
            c == '?' || 
            c == '|' ||
            c == '.';
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
  A Number is a nonnegative integer value

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
    - ExactCount(Base, Number)
    - RangeCount(Base, Number, Number)
    - AtLeast(Base, Number)
    - AtMost(Base, Number)

  A Base is one of:
    - Digit()
    - Alphanumeric()
    - Whitespace()
    - Dot()
    - Character(Literal)
    - Regex
    - CharsetTerm

  A CharsetTerm is one of:
    - CharsetFactor
    - CharsetSequence(CharsetFactor, CharsetFactor)

  A CharsetFactor is one of:
    - Character(Literal)
    - Range(Literal, Literal)
    - Digit()
    - Alphanumeric()
    - Whitespace()

  */

  /*  -> Regex
      Parses a full regular expression off the input stream. */
  regex() {
    const left = this.term();   // parse a term

    // finished parsing, return the single term
    // (check bounds of rightmost term: eof and right paren)
    if (!this.more() || this.peek() == ')') return left;  

    // proceed parsing the righthand side of the union
    this.eat('|');
    const right = this.regex();
    return new tokens.Union(left, right);
    
  }

  /*  -> Term
      Parses a term off the input stream.
      A Term is a possibly empty sequence of Factors */
  term() {
    let f = new tokens.Empty();
    let next_f;

    // while there are factors to be parsed (check boundaries of a term)
    while (this.more() && this.peek() != '|' && this.peek() != ')') {
      next_f = this.factor(); // parse a factor

      if (f.type == globals.EMPTY) {
        f = next_f;
      } else {
        f = new tokens.Sequence(f, next_f);
      }
    }

    return f;
  }

  /*  -> Factor
      Parses a factor off the input stream.
      A factor is a Base that optionally has some unary 
      operator (*, +, ?) applied to it. */
  factor() {
    const b = this.base();  // parse a base

    // check the following char for unary operators
    switch (this.peek()) {
      case '*':
        this.eat('*');
        return new tokens.Star(b);

      case '+':
        this.eat('+');
        return new tokens.Plus(b);

      case '?':
        this.eat('?');
        return new tokens.Question(b);

      default:
        return b;
    }
  }

  /*  -> Base
      Parses a Base off the input stream.
      Bases can be literals, the '.' char, another sub-expression,
      a character set, or a selector like \d */
  base() {
    switch (this.peek()) {
      // escaped character
      case '\\':
        return this.escaped();

      // dot character
      case '.':
        this.eat('.');
        return new tokens.Dot();

      // sub-expression
      case '(':
        this.eat('(');
        const r = this.regex();
        this.eat(')');
        return r;

      // character set
      case '[':
        this.eat('[');
        const t = this.charset_term();
        this.eat(']');
        return t;

      // character literal
      default:
        const c = this.next();

        if (this.is_special_char(c))
          throw new Error(`Unexpected special character '${c}' with remaining '${this.re}'`);

        return new tokens.Character(c);
    }
  }

  /*  -> char
        | Digit
        | Alphanumeric
        | Whitespace
      Parses an escape sequence off the input stream. Handles \d, \w, and \s
      as special selectors, otherwise returns the char after '\' */
  escaped() {
    this.eat('\\');
    const esc = this.next();

    // determine if this is a special selector or just an escaped literal
    switch (esc) {
      case 'd':
        return new tokens.Digit();

      case 'w':
        return new tokens.Alphanumeric();

      case 's':
        return new tokens.Whitespace();

      default:
        return new tokens.Character(esc);
    }
  }

  /*  -> CharsetTerm
      Parses a CharsetTerm off the input stream.
      A CharsetTerm is any number of charset factors, enclosed 
      in []. It represents a character set */
  charset_term() {
    let f = this.charset_factor();
    let next_f;

    // while there are charset factors to parse
    while (this.more() && this.peek() != ']') {
      next_f = this.charset_factor();
      f = new tokens.CharsetSequence(f, next_f);
    }

    return f;
  }

  /*  -> CharsetFactor
      Parses a CharsetFactor off the input stream.
      This is a single character literal or a character range which
      is found within a character set */
  charset_factor() {
    // check for escape sequence within the charset
    if (this.peek() == '\\') {
      return this.escaped();
    }

    const first = this.next();

    // if char range
    if (this.peek() == '-') {
      this.eat('-');
      const last = this.next();
      return new tokens.Range(first, last);
    } else {
      return new tokens.Character(first);
    }
  }

}

module.exports = Parser;