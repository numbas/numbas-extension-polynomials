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

### `p1/p2`

Divide `p1` by `p2`, and throw away the remainder (polynomial quotient of `p1` and `p2`)

### `mod(p1,p2)`

Remainder when dividing `p1` by `p2`.

### `degree(p)`

Degree of `p` - highest power of the variable with a non-zero coefficient.

### `p1=p2`

Are `p1` and `p2` equal? True if all the coefficients match.
