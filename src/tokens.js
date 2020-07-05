/*
  tokens.js: Classes describing valid tokens in a regular expression
*/

const globals = require('./globals.js');

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

/*  Represents any digit 0-9.
    concretely, "\d" or "[0-9]" */
class Digit {
  constructor() {
    this.type = globals.DIGIT;
  }
}

/*  Represents any alphanumeric "word" character, plus "_" (underscore).
    concretely, "\w" or "[A-Za-z0-9_]"  */
class Word {
  constructor() {
    this.type = globals.WORD;
  }
}

/*  Represents whitespace including spaces, tabs, newlines, etc. 
    concretely, "\s" or "[ \t\r\n\f]"   */
class Whitespace {
  constructor() {
    this.type = globals.WHITESPACE;
  }
}

/*  {n} which demands exactly n occurrences of the
    preceding base. 
    concretely, "a{4}" */
class ExactQuantifier {
  constructor(_base, _count) {
    this.type = globals.EXACT_QUANTIFIER;
    this.base = _base;
    this.count = _count;
  }
}

/*  {min, max} which demands anywhere between min and max 
    (inclusive) occurrences of the preceding base
    concretely, "a{3,6}" */
class RangeQuantifier {
  constructor(_base, _min, _max) {
    this.type = globals.RANGE_QUANTIFIER;
    this.base = _base;
    this.min = _min;
    this.max = _max;
  }
}

/*  {min,} which demands at least min occurrences of the preceding
    base, but any amount over that also matches. 
    concretely, "a{5,}" */
class AtLeastQuantifier {
  constructor(_base, _min) {
    this.type = globals.AT_LEAST_QUANTIFIER;
    this.base = _base;
    this.min = _min;
  }
}

/*  {,max} which demands at most max occurrences of the preceding
    base, but any amount below also matches.
    concretely, "a{,7}" */
class AtMostQuantifier {
  constructor(_base, _max) {
    this.type = globals.AT_MOST_QUANTIFIER;
    this.base = _base;
    this.max = _max;
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
  Empty,
  Digit,
  Word,
  Whitespace,
  ExactQuantifier,
  RangeQuantifier,
  AtLeastQuantifier,
  AtMostQuantifier
}