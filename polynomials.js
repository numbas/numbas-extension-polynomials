Numbas.addExtension('polynomials',['jme','jme-display'],function(extension) {
	var jme = Numbas.jme;
    var funcObj = jme.funcObj;
    var TNum = jme.types.TNum;
	var matchTree = jme.display.matchTree;

	var Polynomial = extension.Polynomial = function(variable,coefficients) {
		this.variable = variable;
		this.coefficients = coefficients;

		var bits = [];
		for(var d in this.coefficients) {
			if(!isNaN(d)) {
				var c = this.coefficients[d];
				if(!isNaN(c) && c!=0) {
					bits.push({degree:parseFloat(d),coefficient:c});
				}
			}
		}
		bits.sort(function(a,b){a=a.degree; b=b.degree; return a>b ? -1 : a<b ? 1 : 0;});
		this.ordered_coefficients = bits;
	}
	Polynomial.prototype = {

		toString: function() {
			var variable = this.variable;

			if(!this.ordered_coefficients.length) {
				return '0';
			}

			var out = '';
			this.ordered_coefficients.map(function(bit,i){
				var d = Numbas.math.niceNumber(bit.degree);
				var c = Numbas.math.niceNumber(Math.abs(bit.coefficient));
				if(i>0) {
					out += bit.coefficient>0 ? ' + ' : ' - ';
				} else if(i==0 && bit.coefficient<0) {
					out +='-';
				}
				if(d==0) {
					out += c;
				} else {
					if(c!=1) {
						out += c+'*';
					}
					out += variable;
					if(d!=1) {
						out += '^'+d;
					}
				}
			})
			return out;
		},

		toLaTeX: function() {
			var variable = this.variable;

			if(!this.ordered_coefficients.length) {
				return '0';
			}

			var out = '';
			this.ordered_coefficients.map(function(bit,i){
				var d = Numbas.math.niceNumber(bit.degree);
				var c = Numbas.math.niceNumber(Math.abs(bit.coefficient));
				if(i>0) {
					out += bit.coefficient>0 ? ' + ' : ' - ';
				} else {
					if(bit.coefficient<0) {
						out +='-';
					}
				}
				if(d==0) {
					out += c;
				} else {
					if(c!=1) {
						out += c+' ';
					}
					out += jme.display.texName(variable);
					if(d!=1) {
						out += '^{'+d+'}';
					}
				}
			})
			return out;
		},

		evaluate: function(x) {
			var mul = Numbas.math.mul;
			var add = Numbas.math.add;
			var pow = Numbas.math.pow;
			var total = 0;
			for(var d in this.coefficients) {
				d = parseFloat(d);
				total = add(total,mul(this.coefficients[d],pow(x,d)));
			}
			return total;
		},

		isZero: function() {
			return this.ordered_coefficients.length==0;
		},

		degree: function() {
			var max=null;
			for(var d in this.coefficients) {
				d=parseInt(d);
				if(max===null || d>max) {
					max = d;
				}
			}
			return max;
		},

		negate: function() {
			var coefficients = {};
			for(var d in this.coefficients) {
				coefficients[d] = -this.coefficients[d];
			}
			return new Polynomial(this.variable,coefficients);
		},

		add: function(p2) {
			var p1 = this;
			if(p1.variable!=p2.variable) {
				throw(new Error("Can't add polynomials in different variables"));
			}
			var coefficients = {};
			for(var d in p1.coefficients) {
				coefficients[d] = p1.coefficients[d];
			}
			for(var d in p2.coefficients) {
				if(d in coefficients) {
					coefficients[d] += p2.coefficients[d];
					if(coefficients[d] == 0) {
						delete coefficients[d];
					}
				} else {
					coefficients[d] = p2.coefficients[d];
				}
			}
			return new Polynomial(p1.variable,coefficients);
		},
		sub: function(p2) {
			var p1 = this;
			if(p1.variable!=p2.variable) {
				throw(new Error("Can't add polynomials in different variables"));
			}
			var coefficients = {};
			for(var d in p1.coefficients) {
				coefficients[d] = p1.coefficients[d];
			}
			for(var d in p2.coefficients) {
				if(d in coefficients) {
					coefficients[d] -= p2.coefficients[d];
					if(coefficients[d] == 0) {
						delete coefficients[d];
					}
				} else {
					coefficients[d] = -p2.coefficients[d];
				}
			}
			return new Polynomial(p1.variable,coefficients);
		},

		mul: function(p2) {
			var p1 = this;
			if(p1.variable!=p2.variable) {
				throw(new Error("Can't add polynomials in different variables"));
			}
			var coefficients = {};
			for(var d1 in p1.coefficients) {
				d1 = parseFloat(d1);
				var c1 = p1.coefficients[d1];
				for(var d2 in p2.coefficients) {
					d2 = parseFloat(d2);
					var c2 = p2.coefficients[d2];
					var d = d1+d2;
					var c = c1*c2;
					if(d in coefficients) {
						coefficients[d] += c;
						if(coefficients[d]==0) {
							delete coefficients[d];
						}
					} else {
						coefficients[d] = c;
					}
				}
			}
			return new Polynomial(p1.variable,coefficients);
		},

		pow: function(n,mod) {
			if(!Numbas.util.isInt(n)) {
				throw(new Error("Sorry, can't take a non-integer power of a polynomial"));
			}
			if(n<0) {
				throw(new Error("Sorry, can't take a negative power of a polynomial"));
			}
			if(n==0) {
				if(this.ordered_coefficients.length==0) {
					throw(new Error("0^0 is undefined"));
				} else {
					return new Polynomial(p1.variable,{0:1});
				}
			}

			var coefficients = {};
			for(var d in this.coefficients) {
				coefficients[d] = this.coefficients[d];
			}
			for(var i=1;i<n;i++) {
				var n_coefficients = {};
				for(var d1 in this.coefficients) {
					d1 = parseFloat(d1);
					var c1 = this.coefficients[d1];
					for(var d2 in coefficients) {
						d2 = parseFloat(d2);
						var c2 = coefficients[d2];
						var d = d1+d2;
						var c;
						if(mod!==undefined) {
							c = (c1*c2)%mod;
						} else {
							c = c1*c2;
						}
						if(d in n_coefficients) {
							if(mod!==undefined) {
								n_coefficients[d] = (n_coefficients[d]+c)%mod;
							} else {
								n_coefficients[d] += c;
							}
							if(n_coefficients[d]==0) {
								delete n_coefficients[d];
							}
						} else {
							n_coefficients[d] = c;
						}
					}
				}
				coefficients = n_coefficients;
			}
			return new Polynomial(this.variable,coefficients);
		},

		scale: function(n) {
			var coefficients = {};
			for(var d in this.coefficients) {
				coefficients[d] = n*this.coefficients[d];
			}
			return new Polynomial(this.variable,coefficients);
		},

		add_degree: function(n) {
			var coefficients = {};
			for(var d in this.coefficients) {
				coefficients[parseFloat(d)+n] = this.coefficients[d];
			}
			return new Polynomial(this.variable,coefficients);
		},

		div: function(p2) {
			var p1 = this;
			if(!p2.ordered_coefficients.length) {
				throw(new Error("Divide by zero"));
			}

			var quotient_coefficients = {};

			while(p1.ordered_coefficients.length) {
				var t1 = p1.ordered_coefficients[0];
				var t2 = p2.ordered_coefficients[0];
				if(t2.degree>t1.degree) {
					break;
				}
				var c = t1.coefficient/t2.coefficient;
				var d = t1.degree - t2.degree;
				quotient_coefficients[d] = c;

				var sub = {}
				p2.ordered_coefficients.map(function(t) {
					sub[t.degree+d] = t.coefficient*c;
				});

				p1 = p1.sub(new Polynomial(p1.variable,sub));
			}
			return {quotient: new Polynomial(p1.variable,quotient_coefficients), remainder: p1};
		},

		mod: function(n) {
			var coefficients = {};
			for(var d in this.coefficients) {
				coefficients[d] = Numbas.math.mod(this.coefficients[d],n);
			}
			return new Polynomial(this.variable,coefficients);
		},

		eq: function(p2) {
			for(var d in this.coefficients) {
				if(p2.coefficients[d]!=this.coefficients[d]) {
					return false;
				}
			}
			for(var d in p2.coefficients) {
				if(p2.coefficients[d]!=this.coefficients[d]) {
					return false;
				}
			}
			return true;
		}
	}

	var s_pattern_term = 'm_any(m_nothing,m_type(name);variable,(-m_type(name);variable);negative,m_type(name);variable^m_pm(m_number);degree,(-m_type(name);variable^m_pm(m_number);degree);negative)*m_any(m_nothing,m_pm(m_number));coefficient';
	var s_pattern_polynomial_terms = 'm_all(m_pm('+s_pattern_term+'));terms+m_nothing';

	var pattern_polynomial_terms = jme.compile(s_pattern_polynomial_terms);
	var pattern_term = jme.compile(s_pattern_term);
	var pattern_negative_term = jme.compile('-?');

	Polynomial.from_tree = function(tree) {
		var m = matchTree(pattern_polynomial_terms,tree,true);
		if(!m) {
			throw(new Error('Not a polynomial'));
		}
		var terms = jme.display.getCommutingTerms(m.terms,'+').terms;

		function get(tree,otherwise) {
			return tree ? jme.builtinScope.evaluate(tree).value : otherwise;
		}

		var coefficients = {};
		var poly_variable;
		terms.map(function(term) {
			var negate = 1;
			if(matchTree(pattern_negative_term,term)) {
				negate = -1;
				term = term.args[0];
			}
			var m = matchTree(pattern_term,term,true);
			var coefficient = negate*get(m.coefficient,1);
			if(m.negative) {
				coefficient = -coefficient;
			}
			var variable = m.variable ? m.variable.tok.name : null;
			var degree = variable ? get(m.degree,1) : 0;
			
			if(variable) {
				if(!poly_variable) {
					poly_variable = variable;
				} else if(poly_variable && variable != poly_variable) {
					throw(new Error('More than one variable name in polynomial constructor'));
				}
			}
			if(degree in coefficients) {
				coefficients[degree] += coefficient;
				if(coefficients[degree] == 0) {
					delete coefficients[degree];
				}
			} else {
				coefficients[degree] = coefficient;
			}
		});

		return new Polynomial(poly_variable,coefficients);
	}
	Polynomial.from_string = function(s) {
		return Polynomial.from_tree(jme.compile(s));
	}

	var poly = Polynomial.from_string;



	//// JME functions


	var TNum = Numbas.jme.types.TNum;
	var TString = Numbas.jme.types.TString;
	var TList = Numbas.jme.types.TList;
	var TName = Numbas.jme.types.TName;

	var scope = extension.scope;

	var TPoly = Numbas.jme.types.polynomial = Numbas.jme.types.TPoly = function(p) {
		this.value = p;
	};
	TPoly.prototype.type = 'polynomial';

	jme.findvarsOps.polynomial = function(tree,boundvars,scope) {
		if(tree.args.length==1) {	// form created from JME tree
			return [];
		} else {	// form created from variable and list of coefficients
			return jme.findvars(tree.args[1],boundvars,scope);
		}
	}

	// either `polynomial(expression in one variable)`
	// or `polynomial(variable_name,[coefficients])`
	scope.addFunction(new funcObj('polynomial',['?'],TPoly,null,{
		evaluate: function(args,scope) {
			if(args.length==1) {
				return new TPoly(Polynomial.from_tree(args[0]));
			} else {
				var variable_name = args[0].tok.name;
				var l = scope.evaluate(args[1]).value;
				var coefficients = {};
				l.map(function(n,d) {
					coefficients[d]=n.value;
				});
				return new TPoly(new Polynomial(variable_name,coefficients));
			}
		}
	}));
	jme.lazyOps.push('polynomial');

	scope.addFunction(new funcObj('+',[TPoly,TPoly],TPoly,function(a,b) {
		return a.add(b);
	}));

	scope.addFunction(new funcObj('+',[TPoly,TNum],TPoly,function(a,b) {
		b = new Polynomial(a.variable,{0:b});
		return a.add(b);
	}));

	scope.addFunction(new funcObj('+',[TNum,TPoly],TPoly,function(a,b) {
		a = new Polynomial(b.variable,{0:a});
		return a.add(b);
	}));

	scope.addFunction(new funcObj('-',[TPoly,TPoly],TPoly,function(a,b) {
		return a.sub(b);
	}));

	scope.addFunction(new funcObj('-',[TPoly,TNum],TPoly,function(a,b) {
		b = new Polynomial(a.variable,{0:b});
		return a.sub(b);
	}));

	scope.addFunction(new funcObj('-',[TNum,TPoly],TPoly,function(a,b) {
		a = new Polynomial(b.variable,{0:a});
		return a.sub(b);
	}));

	scope.addFunction(new funcObj('*',[TPoly,TPoly],TPoly,function(a,b) {
		return a.mul(b);
	}));

	scope.addFunction(new funcObj('*',[TPoly,TNum],TPoly,function(a,b) {
		return a.scale(b);
	}));

	scope.addFunction(new funcObj('*',[TNum,TPoly],TPoly,function(a,b) {
		return b.scale(a);
	}));

	scope.addFunction(new funcObj('^',[TPoly,TNum],TPoly,function(a,b) {
		return a.pow(b);
	}));

	scope.addFunction(new funcObj('pow_mod',[TPoly,TNum,TNum],TPoly,function(a,b,mod) {
		return a.pow(b,mod);
	}));

	scope.addFunction(new funcObj('quotient',[TPoly,TPoly],TPoly,function(a,b) {
		var result = a.div(b);
		return result.quotient;
	}));

	scope.addFunction(new funcObj('remainder',[TPoly,TPoly],TPoly,function(a,b) {
		var result = a.div(b);
		return result.remainder;
	}));

	scope.addFunction(new funcObj('mod',[TPoly,TNum],TPoly,function(p,n) {
		return p.mod(n);
	}));

	scope.addFunction(new funcObj('degree',[TPoly],TNum,function(p) {
		return p.degree();
	}));

	scope.addFunction(new funcObj('=',[TPoly,TPoly],TPoly,function(a,b) {
		return a.eq(b);
	}));

	Numbas.util.equalityTests['polynomial'] = function(a,b) {
		return a.value.eq(b.value);
	}

	Numbas.jme.display.typeToTeX.polynomial = function(thing,tok,texArgs,settings) {
		return tok.value.toLaTeX();
	}

	Numbas.jme.display.texOps.polynomial = function(thing,texArgs,settings) {
		return texArgs[0];
	}

	Numbas.jme.display.typeToJME.polynomial = function(thing,tok,bits,settings) {
		return 'polynomial('+tok.value.toString()+')';
	}

	/*
	window.poly = poly;
	var p1 = poly('-2x^3+x^2-x+2-1');
	var p2 = poly('x^2-3');
	console.log(p1+' + '+p2+' = '+p1.add(p2))
	console.log(poly('x_1^2').toLaTeX());
	console.log('f(x) = '+p2+' ; f(3) = '+p2.evaluate(3));
	console.log('f(x) = '+p2+' ; f(1-3i) = '+p2.evaluate({re:1,im:-3,complex:true}));
	console.log('('+p1+')*('+p2+') = '+p1.mul(p2));
	console.log(p1);
	console.log(poly('0').toLaTeX()+poly('x-x'));
	console.log(poly('x^2+x+1').pow(3)+'');

	window.show_division = function(a,b) {
		var p1 = poly(a);
		var p2 = poly(b);
		var o = p1.div(p2);
		console.log(p1+' = ('+o.quotient+')*('+p2+') + '+o.remainder);
	}
	*/
})

