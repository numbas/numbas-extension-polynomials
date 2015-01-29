Polynomials extension for Numbas
==========================

This extension provides a new data type and some functions to deal with polynomials

Examples
--------

JME functions
-------------

### `polynomial(expression in one variable)`

Create a polynomial, automatically detecting the variable name from the expression. Example: `polynomial(x^3+x-2)`. This is quite strict about what it accepts - only one variable name, and coefficients and degrees have to be literal numbers, not calculations or references to other variables.

### `polynomial(variable_name,coefficients)`

Create a polynomial in the given variable, with the given coefficients (`coefficients[i]` is the coefficient of `variable_name^i`). Example: `polynomial(x,[-1,0,1])` represents the polynomial `x^2-1`.

### `p1+p2`

Add two polynomials

### `p1+n` or `n+p1`

Add a constant to a polynomial - more convenient than `p+polynomial(n)`.

### `p1-p2`

Subtract `p2` from `p1`

### `p1-n` or `n-p1`

Subtract a constant from a polynomial (or vice versa) - more convenient than `p-polynomial(n)`.

### `p1*p2`

Multiply two polynomials

### `p1*n or n*p1`

Multiply a polynomial by a constant - more convenient than `p*polynomial(n)`.

### `p^n`

Take polynomial `p` to the `n`th (integer, non-negative) power.

### `mod_pow(p,n,m)`

Take polynomial `p` to the `n`th power, with coefficients modulo `m`.

### `quotient(p1,p2)`

Divide `p1` by `p2`, and throw away the remainder (polynomial quotient of `p1` and `p2`)

### `remainder(p1,p2)`

Remainder when dividing `p1` by `p2`.

### `mod(p,n)`

Take each coefficient of `p` mod `n`.

### `degree(p)`

Degree of `p` - highest power of the variable with a non-zero coefficient.

### `p1=p2`

Are `p1` and `p2` equal? True if all the coefficients match.


JavaScript functions
--------------------

**Base object: `Numbas.extensions.polynomials.Polynomial`** 

(set it to a more convenient name, e.g. `var poly = Numbas.extensions.polynomials.Polynomial`)

### `new Polynomial(variable_name,coefficients)`

`coefficients` is a dictionary of `degree → coefficient`.

### `Polynomial.from_tree(tree)`

Create a polynomial object from a compiled JME tree

### `Polynomial.from_string(expr)`

Create a polynomial object from a JME string

## `Polynomial` object methods

### `p.evaluate(x)`

Evaluate at point `x` to a number

### `p.toLaTeX()`

Render as a LaTeX string

### `p.isZero()`

Is this polynomial zero?

### `p.degree()`

Degree of highest power term in `p` with a non-zero coefficient

### `p.negate()`

Negate every coefficient of `p` (returns a new polynomial)

### `p1.add(p2)`

Add `p1` to `p2`

### `p1.sub(p2)`

Subtract `p2` from `p1`

### `p1.mul(p2)`

Mutliply `p1` by `p2`

### `p.pow(n)`

`n`th power of `p`

### `p.pow(n,mod)`

`n`th power of `p`, taking coefficients mod `mod`.

### `p.scale(n)`

Multiply `p` by constant `n`

### `p.add_degree(n)`

Add `n` to the degree of each term of `p`

### `p1.div(p2)`

Divide `p1` by `p2`. Returns an object `{quotient: <polynomial>, remainder: <polynomial>}`


### `p.mod(n)`

Take each coefficient of `p` mod `n` (returns a new polynomial object)

### `p1.eq(p2)`

Are `p1` and `p2` equal?
