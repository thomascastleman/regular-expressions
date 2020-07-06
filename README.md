# regular-expressions
A small, NFA-based regular expressions engine.

### Supported Syntax
(metasyntax appears within `<>` brackets)

| Feature  | Usage | Example | Description |
| ------------- | ------------- | ------------- | ------------- |
| Character literal  | `<literal>`  | `A` | Matches literal characters |
| Dot | `.`  | `.` | Matches any character except `\n` |
| Digit | `\d` | `\d` | Matches characters in the range `[0-9]` |
| Word | `\w` | `\w` | Matches characters in `[A-Za-z0-9_]` |
| Whitespace | `\s` | `\s` | Matches characters in `[ \t\r\n\f]` |
| Union | `<left>\|<right>` | `a\|b` | Matches either `left` or `right` side |
| Concatenation | `<left><right>` | `XY` | Matches the `left`, then `right`, in sequence |
| Kleene Star | `<base>*` | `.*` | Matches 0 or more instances of the `base` |
| Plus | `<base>+` | `\d+` | Matches 1 or more instances of the `base` |
| Question | `<base>?` | `u?` | Matches 0 or 1 instances of the `base` |
| Character Set | `[<literal><...>]` | `[xyzA-Z]` | Matches any of the characters in the set (including ranges) |
| Exact Quantifier | `<base>{<n>}` | `[a-z]{3}` | Matches exactly `n` of the `base` |
| Range Quantifier | `<base>{<min>,<max>}` | `\w{2,4}` | Matches between (inclusive) `min` and `max` of the `base` |
| "At least" Quantifier | `<base>{<min>,}` | `\d{5,}` | Matches *at least* `min` instances of the `base` |
| "At most" Quantifier | `<base>{,<max>}` | `(word){,10}` | Matches *at most* `max` instances of the `base` |

Additionally, arbitrary expressions can be grouped using parentheses (e.g. `([A-Z]\w*)?`).

### Usage
To construct an instance of a regular expression, invoke the `RegularExpression` constructor on your expression string:
```javascript
const re = new RegularExpression('[A-Z]+');
```

Your `re` object is now equipped with three methods:

1. `recognize(s : string) -> bool`.
    - Returns true if the argument string matches exactly (full string) the regular expression.

2. `matches(s : string) -> list<Match>`.
    - Returns a list of `Match { begin : number, end : number, content : string }`, denoting all matching substrings (of maximal length) that were contained in the input.

3. `replace(text : string, replacement : string) -> string`.
    - Returns the input `text`, with any matching substrings replaced with the `replacement`.

### Implementation Details

This engine uses a recursive descent parser to parse input strings in the above supported syntax, then desugars into a core "language" of 6 constructs (literals, empty expression, dot, union, concatenation, Kleene star).

The expression's parse tree representation is then used to construct a nondeterministic finite automaton that recognizes the same language that the expression describes. This NFA is then simulated to implement the three main functions of the `RegularExpression` class.

For a more detailed explanation, see [here](http://castleman.space/projects/regex/)
