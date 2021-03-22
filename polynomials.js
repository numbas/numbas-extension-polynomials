Numbas.addExtension('polynomials',['jme','jme-display'],function(extension) {
	var jme = Numbas.jme;
    var funcObj = jme.funcObj;
    var TNum = jme.types.TNum;
	var mod = Numbas.math.mod;

	var Polynomial = extension.Polynomial = function(variable,coefficients,modulo) {
		this.variable = variable;
		this.coefficients = coefficients;
		this.modulo = modulo || Infinity;

		var bits = [];
		for(var d in this.coefficients) {
			if(!isNaN(d)) {
				var c = mod(this.coefficients[d], this.modulo);
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

		coefficient: function(d) {
			return this.coefficients[d] || 0;
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
			return mod(total, this.modulo);
		},

		isZero: function() {
			return this.ordered_coefficients.length==0;
		},

		degree: function() {
			var max=0;
			for(var d in this.coefficients) {
				d=parseInt(d);
				if(this.coefficients[d]!=0 && (max===null || d>max)) {
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
			return new Polynomial(this.variable,coefficients,this.modulo);
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
					coefficients[d] = mod(coefficients[d]+p2.coefficients[d], this.modulo);
					if(coefficients[d] == 0) {
						delete coefficients[d];
					}
				} else {
					coefficients[d] = p2.coefficients[d];
				}
			}
			return new Polynomial(p1.variable,coefficients,this.modulo);
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
					coefficients[d] = mod(coefficients[d]-p2.coefficients[d], this.modulo);
					if(coefficients[d] == 0) {
						delete coefficients[d];
					}
				} else {
					coefficients[d] = -p2.coefficients[d];
				}
			}
			return new Polynomial(p1.variable,coefficients,this.modulo);
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
					var c = mod(c1*c2, this.modulo);
					if(d in coefficients) {
						coefficients[d] = mod(coefficients[d]+c, this.modulo);
						if(coefficients[d]==0) {
							delete coefficients[d];
						}
					} else {
						coefficients[d] = c;
					}
				}
			}
			return new Polynomial(p1.variable,coefficients,this.modulo);
		},

		pow: function(n) {
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
					return new Polynomial(p1.variable,{0:1},this.modulo);
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
						var c = mod(c1*c2, this.modulo);
						if(d in n_coefficients) {
							n_coefficients[d] = mod(n_coefficients[d]+c, this.modulo);
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
			return new Polynomial(this.variable,coefficients,this.modulo);
		},

		scale: function(n) {
			var coefficients = {};
			for(var d in this.coefficients) {
				coefficients[d] = mod(n*this.coefficients[d], this.modulo);
			}
			return new Polynomial(this.variable,coefficients,this.modulo);
		},

		add_degree: function(n) {
			var coefficients = {};
			for(var d in this.coefficients) {
				coefficients[parseFloat(d)+n] = this.coefficients[d];
			}
			return new Polynomial(this.variable,coefficients,this.modulo);
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
					sub[t.degree+d] = mod(t.coefficient*c, p1.modulo);
				});

				p1 = p1.sub(new Polynomial(p1.variable,sub,this.modulo));
			}
			return {quotient: new Polynomial(p1.variable,quotient_coefficients,this.modulo), remainder: p1};
		},

		mod: function(n) {
			var coefficients = {};
			for(var d in this.coefficients) {
				coefficients[d] = Numbas.math.mod(this.coefficients[d],n);
			}
			return new Polynomial(this.variable,coefficients,this.modulo);
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

  	var s_pattern_term = '(`+-($v;variable^(`+-$n);degree`? * $n;coefficient`?)) `| `+-$n;coefficient;degree:0'; 
  	var s_pattern_polynomial_terms = '["term": '+s_pattern_term+'] `@ term`*;terms + $z';

	var pattern_polynomial_terms = new jme.rules.Rule(s_pattern_polynomial_terms,null,'acgl','polynomial');
	var pattern_term = new jme.rules.Rule(s_pattern_term,null,'acg','polynomial term');
	var pattern_negative_term = new jme.rules.Rule('-? `| (-?)*?',null,'','negative');

	Polynomial.from_tree = function(tree,modulo) {
		var m = pattern_polynomial_terms.match(tree);
		if(!m) {
			throw(new Error('Not a polynomial'));
		}
		var terms = jme.isType(m.terms.tok,'list') ? m.terms.args.map(function(a) { return a.tok.tree; }) : [m.terms];

		function get(tree,otherwise) {
			return tree ? jme.builtinScope.evaluate(tree).value : otherwise;
		}

		var coefficients = {};
		var poly_variable;
		terms.map(function(term) {
			var negate = 1;
			if(pattern_negative_term.match(term)) {
                term = jme.rules.extractLeadingMinus(term);
				negate = -1;
				term = term.args[0];
			}
			var m = pattern_term.match(term);
			var coefficient = negate*get(m.coefficient,1);
			var variable = m.variable ? m.variable.tok.name : null;
			var degree = variable ? get(m.degree,1) : 0;
			
			if(variable) {
				if(!poly_variable) {
					poly_variable = variable;
				} else if(variable != poly_variable) {
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

		return new Polynomial(poly_variable,coefficients,modulo);
	}
	Polynomial.from_string = function(s,modulo) {
		return Polynomial.from_tree(jme.compile(s),modulo);
	}

	var poly = Polynomial.from_string;

	extension.long_division = function(p1,p2) {
		var q = p1.div(p2).quotient;
		var dq = q.degree();

		var tex = '\\begin{array}{l}\n';

		tex += '\\underline{\\begin{alignat}{2}\n';
		tex += line(p1).map(function(b){return '\\phantom{'+b+'}'}).join(' & ')+' \\\\\n';
		for(var i=q.degree();i<p1.degree();i++) {
			tex += '&&&';
		}
		tex += line(q).join(' & ')+' \n';
		tex += '\\end{alignat}} \\\\\n';

		var tphantom = '';
		var bphantom = '';

		function line(p) {
			var bits = [];
			for(var j=p.degree();j>=0;j--) {
				var rc = p.coefficient(j);
				var c = Math.abs(rc);
				if(j<p.degree()) {
					bits.push(rc==0 ? '' : rc>=0 ? '+' : '-');
				}
				if(c==0) {
					bits.push('');
					bits.push('\\quad');
				} else if(j==0) {
					bits.push(c);
				} else {
					bits.push((rc<0 && j==p.degree() ? '-' : '') + (c==1 ? '' : c));
					bits.push(p.variable+(j>1 ? '^{'+j+'}'  : ''));
				}
			}
			for(var i=bits.length-1;i>=2 && bits[i]=='\\quad';i-=3) {
				bits=bits.slice(0,i-2);
			}
			return bits;
		}
			
		for(var i=0;i<=dq;i++) {
			var coefficients = {};
			for(var j=0;j<=dq;j++) {
				coefficients[j] = j>dq-i ? q.coefficients[j] : 0;
			}
			var t = p1.sub(p2.mul(new Polynomial(p1.variable,coefficients,p1.modulo)));

			var b;

			if(i<dq) {
				coefficients = {};
				coefficients[dq-i] = q.coefficients[dq-i];
				for(var j=0;j<dq-i;j++) {
					coefficients[j] = 0;
				}
			} else {
				coefficients = {0:q.coefficients[0]}
			}
			b = p2.mul(new Polynomial(p1.variable, coefficients,p1.modulo));

			coefficients = {};
			for(var j=0;j<t.degree();j++) {
				coefficients[i] = 0;
			}
			coefficients[t.degree()] = t.coefficients[t.degree()];
			var p = new Polynomial(p1.variable,coefficients,p1.modulo);

			var tbits = line(t);
			var bbits = line(b);

			tex += '\\underline{\\begin{alignat}{2}\n';
			tex += tphantom+' '+tbits.join(' & ')+' \\\\\n';
			tex += bphantom+' '+bbits.join(' & ')+' \\\\\n';
			tex += '\\end{alignat}} \\\\\n';

			tphantom += tbits.slice(0,3).map(function(b){return '\\phantom{'+b+'}'}).join(' & ');
			if(i==0) {
				tphantom+=' & ';
			}
			bphantom += bbits.slice(0,3).map(function(b){return '\\phantom{'+b+'}'}).join(' & ');
			if(i==0) {
				bphantom+=' & ';
			}
		}
		var coefficients = {};
		for(var j=0;j<=dq;j++) {
			coefficients[j] = j>dq-i ? q.coefficients[j] : 0;
		}
		var t = p1.sub(p2.mul(new Polynomial(p1.variable,coefficients,p1.modulo)));

		tex += '\\begin{alignat}{2}\n'+tphantom+line(t).join(' & ')+'\\end{alignat}\n';

		tex += '\\end{array}';
		return tex;
	}


	//// JME functions


	var TNum = Numbas.jme.types.TNum;
	var TString = Numbas.jme.types.TString;
	var TList = Numbas.jme.types.TList;
	var TName = Numbas.jme.types.TName;
	var TExpression = Numbas.jme.types.TExpression;

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

	jme.findvarsOps.mod_polynomial = function(tree,boundvars,scope) {
		if(tree.args.length==2) {	// form created from JME tree
			return jme.findvars(tree.args[1],boundvars,scope);
		} else {	// form created from variable and list of coefficients
			var vars = jme.findvars(tree.args[1],boundvars,scope);
			vars = vars.merge(jme.findvars(tree.args[2],boundvars,scope));
			return vars;
		}
	}

	// either `polynomial(expression in one variable)`
	// or `polynomial(variable_name,[coefficients])`
	scope.addFunction(new funcObj('mod_polynomial',['?'],TPoly,null,{
		evaluate: function(args,scope) {
			if(args.length==2) {
				var modulo = scope.evaluate(args[1]).value
				return new TPoly(Polynomial.from_tree(args[0],modulo));
			} else {
				var variable_name = args[0].tok.name;
				var l = scope.evaluate(args[1]).value;
				var coefficients = {};
				l.map(function(n,d) {
					coefficients[d]=n.value;
				});
				var modulo = scope.evaluate(args[2]).value
				return new TPoly(new Polynomial(variable_name,coefficients,modulo));
			}
		}
	}));
	jme.lazyOps.push('mod_polynomial');

	scope.addFunction(new funcObj('+',[TPoly,TPoly],TPoly,function(a,b) {
		return a.add(b);
	}));

	scope.addFunction(new funcObj('+',[TPoly,TNum],TPoly,function(a,b) {
		b = new Polynomial(a.variable,{0:b},a.modulo);
		return a.add(b);
	}));

	scope.addFunction(new funcObj('+',[TNum,TPoly],TPoly,function(a,b) {
		a = new Polynomial(b.variable,{0:a},b.modulo);
		return a.add(b);
	}));

	scope.addFunction(new funcObj('-',[TPoly,TPoly],TPoly,function(a,b) {
		return a.sub(b);
	}));

	scope.addFunction(new funcObj('-',[TPoly,TNum],TPoly,function(a,b) {
		b = new Polynomial(a.variable,{0:b},a.modulo);
		return a.sub(b);
	}));

	scope.addFunction(new funcObj('-',[TNum,TPoly],TPoly,function(a,b) {
		a = new Polynomial(b.variable,{0:a},b.modulo);
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

	scope.addFunction(new funcObj('listval',[TPoly,TNum],TNum,function(p,i) {
		return p.coefficient(i);
	}));

	scope.addFunction(new funcObj('eval',[TPoly,TNum],TNum,function(p,x) {
		return p.evaluate(x);
	}));

	scope.addFunction(new funcObj('expr',[TPoly],TExpression, function(p) {
		return new TExpression(Numbas.jme.compile(p+''));
	},{unwrapValues: true}));

	scope.addFunction(new funcObj('long_division',[TPoly,TPoly],TString, function(p1,p2) {
		var tex = extension.long_division(p1,p2);
		var s = new TString(tex);
		s.latex = true;
		return s;
	},{unwrapValues: true}));

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
		var p = tok.value;
		if(p.modulo===Infinity) {
			return 'polynomial('+p.toString()+')';
		} else {
			return 'mod_polynomial('+p.toString()+','+p.modulo+')';
		}
	}

})
