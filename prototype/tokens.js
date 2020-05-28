/*
  tokens.js: Classes describing valid tokens in a regular expression
*/

const globals = require('./globals.js');

/*

  A Literal is a Unicode character literal

  A CharsetTerm is one of:
    - Character(Literal)
    - Range(Literal, Literal)

  A Regex is one of:
    - Union(Regex, Regex)
    - Sequence(Regex, Regex)
    - Star(Regex)
    - Plus(Regex)
    - Question(Regex)
    - CharsetSequence(CharsetTerm, CharsetTerm)
    - Character(Literal)
    - Dot()
    - Empty()

*/

/*  Union of left and right terms
    i.e. <left>|<right> 
    concretely, "a|b" */
class Union {
  constructor(_left, _right) {
    this.type = globals.UNION;
    this.left = _left;
    this.right = _right;
  }
}

/*  Sequence (concatenation) of left and right terms
    i.e. <left><right> 
    concretely, "ab"  */
class Sequence {
  constructor(_left, _right) {
    this.type = globals.SEQUENCE;
    this.left = _left;
    this.right = _right;
  }
}

/*  Kleene star (0 or more occurrences) applied to a base 
    i.e. (<base>)*  
    concretely, "a*"  */
class Star {
  constructor(_base) {
    this.type = globals.STAR;
    this.base = _base;
  }
}

/*  + operator (1 or more occurrences) applied to a base
    i.e. (<base>)+  
    concretely, "a+"  */
class Plus {
  constructor(_base) {
    this.type = globals.PLUS;
    this.base = _base;
  }
}

/*  ? operator (0 or 1 occurrences) applied to a base
    i.e. (<base>)?  
    concretely, "a?"  */
class Question {
  constructor(_base) {
    this.type = globals.QUESTION;
    this.base = _base;
  }
}

/*  Represents a sequence of character literals/ranges within a character set
    i.e. [<left><right>]
    concretely, "[ab]"  */
class CharsetSequence {
  constructor(_left, _right) {
    this.type = globals.CHARSET_SEQUENCE;
    this.left = _left;
    this.right = _right;
  }
}

/*  Character range, including characters between first and last (inclusive)
    as determined by Unicode code points
    i.e. [<first>-<last>]
    concretely, "[a-z]" */
class Range {
  constructor(_first, _last) {
    this.type = globals.RANGE;
    this.first = _first;
    this.last = _last;
  }
}

/*  A character literal
    i.e. <char>  
    concretely, "a" */
class Character {
  constructor(_char) {
    this.type = globals.CHARACTER;
    this.char = _char;
  }
}

/*  The . special character, which matches any character expect \n.
    concretely, "." */
class Dot {
  constructor() {
    this.type = globals.DOT;
  }
}

/*  The empty string/expression.
    concretely, ""  */
class Empty {
  constructor() {
    this.type = globals.EMPTY;
  }
}

module.exports = {
  Union,
  Sequence,
  Star,
  Plus,
  Question,
  CharsetSequence,
  Range,
  Character,
  Dot,
  Empty
}