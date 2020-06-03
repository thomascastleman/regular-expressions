/*
  desugarer.js: Desugarer for parse trees
*/

const globals = require('./globals.js');
const tokens = require('./tokens.js');

/*
  -------------------------- Desugaring Rules --------------------------

  Let Seq[ x_1, x_2, ..., x_n ] stand for 
    Sequence(Sequence(... Sequence(x_1, x_2), x_3), ..., x_n)

  Similarly, let Union[ x_1, x_2, ..., x_n ] stand for
    Union(Union(... Union(x_1, x_2), x_3), ..., x_n)

  Primitive Tokens:
    - Union
    - Sequence
    - Star
    - Character
    - Dot
    - Empty

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
  constructor() {

  }
}