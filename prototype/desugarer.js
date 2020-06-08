/*
  desugarer.js: Reduce the set of tokens that comprise a parse tree by 
    rewriting some in terms of others
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

  /*  Token -> 
      Construct a new instance of a desugarer, for the 
      given complex parse tree (contains non-simple tokens). */
  constructor(_tree) {
    this.tree = _tree;
  }

  /*  -> SimpleToken
      Construct a parse tree equivalent to the one given, but 
      using only primitive tokens */
  desugar() {
    /*  Apply recursive desugaring at the root of the parse tree,
        and simplify the result */
    return this.simplify(this.desugar_token(this.tree));
  }

  /*  Token -> SimpleToken
      Desugars a given token, expressing it as a (combination of)
      simple tokens */
  desugar_token(token) {
    switch (token.type) {

      /*  Simple tokens: Union, Sequence, Star, Character, Dot, Empty
          No change, just desugar any internal expressions */

      case globals.UNION:
        token.left = this.desugar_token(token.left);
        token.right = this.desugar_token(token.right);
        return token;


      case globals.SEQUENCE:
        token.left = this.desugar_token(token.left);
        token.right = this.desugar_token(token.right);
        return token;

      
      case globals.STAR:
        token.base = this.desugar_token(token.base);
        return token;
      

      case globals.CHARACTER:
        return token;
      

      case globals.DOT:
        return token;

      
      case globals.EMPTY:
        return token;

      
      /*  Complex tokens: the rest
          Desugar the token as well as any internal expressions */

      case globals.PLUS:
        var desugared_base = this.desugar_token(token.base);
        return new tokens.Sequence(
          desugared_base, 
          new tokens.Star(desugared_base));


      case globals.QUESTION:
        var desugared_base = this.desugar_token(token.base);
        return new tokens.Union(new tokens.Empty(), desugared_base);


      case globals.CHARSET_SEQUENCE:
        // charset sequences represent unions of every char in the set
        const left = this.desugar_token(token.left);
        const right = this.desugar_token(token.right);
        return new tokens.Union(left, right);


      case globals.RANGE:
        // generate character range between first, last and union them together
        return this.arbitrary_union(this.char_range(token.first, token.last));


      case globals.DIGIT:
        // \d == [0-9]
        return this.arbitrary_union(this.char_range('0', '9'));

      
      case globals.WORD:
        // \w == [A-Za-z0-9_]
        const A_to_Z = this.char_range('A', 'Z');
        const a_to_z = this.char_range('a', 'z');
        const zero_to_nine = this.char_range('0', '9');
        const underscore = [new tokens.Character('_')];

        var chars = A_to_Z.concat(a_to_z).concat(zero_to_nine).concat(underscore);
        return this.arbitrary_union(chars);


      case globals.WHITESPACE:
        // \s == [ \t\r\n\f]
        var chars = [
          new tokens.Character(' '),
          new tokens.Character('\t'),
          new tokens.Character('\r'),
          new tokens.Character('\n'),
          new tokens.Character('\f'),
        ];

        return this.arbitrary_union(chars);

      
      case globals.EXACT_QUANTIFIER:
        if (token.count == 0) {
          // 0 occurrences is nothing
          return new tokens.Empty();
        } else {
          // produce n copies of the base, in sequence
          var desugared_base = this.desugar_token(token.base);
          const base_copies = this.n_copy(desugared_base, token.count);
          return this.arbitrary_sequence(base_copies);
        }


      case globals.RANGE_QUANTIFIER:
        if (token.min > token.max) 
          throw new Error(`Invalid range quantifier: min greater than max: {${min},${max}}`)
        
        let obligatory, optional;
        var desugared_base = this.desugar_token(token.base);

        // produce min copies of the base (if positive min)
        if (token.min == 0) {
          obligatory = [];
        } else {
          obligatory = this.n_copy(desugared_base, token.min);
        }

        // produce (max - min) optional occurrences of the base
        if (token.max - token.min == 0) {
          optional = [];
        } else {
          const opt_base = new tokens.Union(new tokens.Empty(), desugared_base);
          optional = this.n_copy(opt_base, token.max - token.min);
        }

        const both = obligatory.concat(optional);

        // sequence them all together
        if (both.length > 0) {
          return this.arbitrary_sequence(both);
        } else {
          return new tokens.Empty();
        }

      
      case globals.AT_LEAST_QUANTIFIER:
        var desugared_base = this.desugar_token(token.base);

        if (token.min == 0) {
          // at least 0 occurrences is equivalent to star
          return new tokens.Star(desugared_base);
        } else {
          // produce min copies of base, followed by star
          return new tokens.Sequence(
            this.arbitrary_sequence(this.n_copy(desugared_base, token.min)),
            new tokens.Star(desugared_base));
        }


      case globals.AT_MOST_QUANTIFIER:
        if (token.max == 0) {
          // at most 0 occurrences is equivalent to nothing
          return new tokens.Empty();
        } else {
          // produce max optional copies of base
          var desugared_base = this.desugar_token(token.base);
          const opt_token = new tokens.Union(new tokens.Empty(), desugared_base);
          const base_copies = this.n_copy(opt_token, token.max);
          return this.arbitrary_sequence(base_copies);
        }


      default:
        throw new Error(`Invalid token with unknown type: ${token.type}`);

    }
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
      Converts a non-empty list of tokens into an arbitrary length Union */
  arbitrary_union(l) {
    return this.arbitrary_nest(l, tokens.Union);
  }

  /*  List<Token> -> Sequence
      Converts a non-empty list of tokens into an arbitrary length Sequence */
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

  /*  SimpleToken -> SimpleToken
      Reduce any unnecessarily complex compositions of simple tokens
      into their simplest form. */
  simplify(token) {
    /*
      Union:
        Union(dot, dot) ==> dot
        Union(e, e) ==> e

        Union(c, dot) ==> dot (if c =/= \n)
        Union(dot, c) ==> dot (if c =/= \n)

      Sequence:
        Sequence(e, anything) ==> anything
        Sequence(anything, e) ==> anything

        where anything is char, dot, empty

      Star:
        Star(e) ==> e
    */

    switch (token.type) {
      case globals.UNION:
        token.left = this.simplify(token.left);
        token.right = this.simplify(token.right);

        // if left & right are both dot or both empty, return dot or empty respectively
        if (token.left.type == token.right.type &&
            (token.left.type == globals.DOT ||
            token.left.type == globals.EMPTY)) {
          return token.left;
        }

        // if a union of dot and a non-\n char, dot will supersede
        if ((token.left.type == globals.CHARACTER && 
            token.left.char != '\n' &&
            token.right.type == globals.DOT)
            ||
            (token.right.type == globals.CHARACTER && 
              token.right.char != '\n' &&
              token.left.type == globals.DOT)) {
          return new tokens.Dot();
        }

        return token;

      case globals.SEQUENCE:
        token.left = this.simplify(token.left);
        token.right = this.simplify(token.right);

        // if either left or right expression is empty, return the other
        if (token.left.type == globals.EMPTY) {
          return token.right;
        } else if (token.right.type == globals.EMPTY) {
          return token.left;
        } else {
          return token;
        }

      case globals.STAR:
        token.base = this.simplify(token.base);

        if (token.base.type == globals.EMPTY) {
          return token.base;
        } else {
          return token;
        }

      default:
        return token;
    }
  }

}

module.exports = Desugarer;