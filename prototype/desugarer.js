/*
  desugarer.js: Desugarer for parse trees
*/

const globals = require('./globals.js');
const tokens = require('./tokens.js');

/*
  -------------------------- Desugaring Rules --------------------------

  A SimpleToken is one of:
    - Union
    - Sequence
    - Star
    - Character
    - Dot
    - Empty

  Let Seq[ x_1, x_2, ..., x_n ] stand for 
    Sequence(Sequence(... Sequence(x_1, x_2), x_3), ..., x_n)

  Similarly, let Union[ x_1, x_2, ..., x_n ] stand for
    Union(Union(... Union(x_1, x_2), x_3), ..., x_n)

  Rules:
    Plus(base) => Sequence(base, Star(base))

    Question(base) => Union(Empty(), base)

    CharsetSequence(left, right) => Union(left, right)

    Range(c_1, c_k) => Union[ Char(c_1), ..., Char(c_k) ]
      where each c_i is a char in the range [c_1, c_k] (code points)

    Digit() => Union[ Char('0'), ..., Char('9') ]

    Word() => Union[  Char('A'), ..., Char('Z'),
                      Char('a'), ..., Char('z'),
                      Char('0'), ..., Char('9'),
                      Char('_') ]

    Whitespace() => Union[  Char(' '), Char('\t'), Char('\r'), 
                            Char('\n'), Char('\f') ]

    ExactQuantifier(b, n) => Seq[ b_1, ..., b_n ]

    RangeQuantifier(b, min, max) =>
      Seq[ Seq[ b_1, ..., b_min ], Union(Empty(), b_min+1), ..., Union(Empty(), b_max) ]

    AtLeastQuantifier(b, min) => Seq[ Seq[ b_1, ..., b_min ], Star(b) ]

    AtMostQuantifier(b, max) => Seq[ Union(Empty(), b_1), ..., Union(Empty(), b_max) ]

*/

class Desugarer {

  /*  ParseTree -> 
      Construct a new instance of a desugarer, for the 
      given complex parse tree (contains non-primitive tokens). */
  constructor(_tree) {
    this.tree = _tree;
  }

  /*  -> SimpleParseTree
      Construct a parse tree equivalent to the one given, but 
      using only primitive tokens */
  desugar() {

  }

  /*  Token -> SimpleToken
      Desugars a given token, expressing it as a (combination of)
      simple tokens */
  desugar_token(token) {

  }

  /*  List<Token> (Token Token -> NestingToken) -> NestingToken
      Converts a non-empty list into a nested representation 
      with the given nest-able token (e.g. Union) */
  arbitrary_nest(l, cons) {
    if (l.length < 1)
      throw new Error('Cannot construct an arbitrary nest with 0 tokens');
    
    if (l.length == 1) return l[0]; // if one element, return that element

    let inner = new cons(l[0], l[1]);
    let i = 2;

    // add remaining terms by nesting
    while (i < l.length) {
      inner = new cons(inner, l[i]);
      i++;
    }

    return inner;
  }

  /*  List<Token> -> Union
      Converts a list of (>= 2) tokens into an arbitrary length Union */
  arbitrary_union(l) {
    return this.arbitrary_nest(l, tokens.Union);
  }

  /*  List<Token> -> Sequence
      Converts a list of (>= 2) tokens into an arbitrary length Sequence */
  arbitrary_sequence(l) {
    return this.arbitrary_nest(l, tokens.Sequence);
  }

  /*  char char -> List<Char>
      Produce a list of Character tokens in the range between
      literals c1 and c2, specified by Unicode */
  char_range(c1, c2) {
    const cp1 = c1.codePointAt(0);
    const cp2 = c2.codePointAt(0);

    // check for invalid range
    if (cp2 < cp1) {
      throw new Error(
        `Invalid character range '${c1}-${c2}'. The former ` + 
        `must precede the latter character`);
    }

    let cp = cp1;
    const range = [];

    // add every char in the range
    while (cp <= cp2) {
      range.push(new tokens.Character(String.fromCodePoint(cp)));
      cp++;
    }

    return range;
  }

  /*  Token -> List<Token>
      Produces a list containing n copies of (references to) the given token */
  n_copy(t, n) {
    if (n <= 0)
      throw new Error(`Cannot produce ${n} copies of token ${t}`);

    const copies = [];
    for (let i = 0; i < n; i++) { copies.push(t); }

    return copies;
  }

}

module.exports = Desugarer;