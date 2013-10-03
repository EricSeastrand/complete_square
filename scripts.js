CTS = (function(){
	var self = {};
	
	self.init = function(){
		self.inputs = {
			a: $('.polynomial-A'),
			b: $('.polynomial-B'),
			c: $('.polynomial-C')
		};
		self.output = $('.steps-printout');
		self.solveButton = $('.solve-polynomial').on('click', self.solvePolynomial);
		
		_initTests();
	};
	self.tests = [
		{a:  2  , b: 12   , c: 25   },
		{a: -4  , b: 24   , c: -34  },
		{a: -10 , b: -40  , c: -4   },
		{a: 1   , b: 8    , c: -9   },
		{a: 1   , b: 16   , c: 1    }
	];
	
	function _initTests() {
		self.testsSelect = $('.tests-selection').bind('change', function(){ self.fillInTestValues(this.selectedIndex - 1); });
		for(var i=0; i<self.tests.length; i++) {
			var thisTest = self.tests[i];
			var formatted = _formatQuadratic(thisTest.a, thisTest.b, thisTest.c).html();
				formatted = formatted.replace('<sup>2</sup>', HTML_Exponent(2));
			self.testsSelect.append( $('<option>').html( formatted ) );
		}
		
		//self.testsSelect.selectBox();
	}
	
	self.fillInTestValues = function(testIndex){
		vals = self.tests[testIndex];
		self.inputs.a.val(vals.a);
		self.inputs.b.val(vals.b);
		self.inputs.c.val(vals.c);
	}
	
	
	self.solvePolynomial = function(){
		self.output.empty();
		self.getInputValues();
		
		self.steps.Move_C_To_Right_Side();
		self.steps.Pull_Out_GCF();
		self.steps.Extract_A_X_H();
		self.steps.Complete_The_Square();
		self.steps.Compute_Constant();
		self.steps.Output_Result();
		self.steps.Output_Vertex();
		
	};
	
	self.getInputValues = function() {
		self.polynomial = {
			a : self.inputs.a.val(),
			b : self.inputs.b.val(),
			c : self.inputs.c.val(),
			eq: 0 
		};
		self.originalPolynomial = $.extend({}, self.polynomial);
		return self.polynomial;
	}

	self.appendStepLine = function(  ){
		var stepLine = $('<li>').appendTo( self.output );
		stepLine.append.apply( stepLine, arguments )
	};
	
	function _formatQuadratic( a, b, c, eq, coefficient ){
		if(a==1) a = '';
		var parts = [a, 'x<sup>2</sup> + ', b, 'x']
		if( coefficient ) parts.unshift(coefficient, '(');
		if( c           ) parts.push(' + ', c);
		if( coefficient ) parts.push(')');
		
		if( eq          ) parts.push(' = ', eq);
		return $('<span>').addClass('quadratic').html(parts.join(''));
	}
	
	function _formatQuadratic_ExponentOutside( a, b, coefficient, eq ) {
		if(a==1) a = '';
		coefficient = coefficient || '';
		
		var parts = [coefficient, '(', a, 'x + ', b, ')', '<sup>2</sup>']
		if(eq) parts.push( ' = ', eq );
		
		return $('<span>').addClass('quadratic-ExponentOutside').html(parts.join(''));
	}
	
	function _formatQuadratic_StdForm( a, h, k ) {
		a = _writeFraction(a);
		h = _writeFraction(h);
		k = _writeFraction(k);
		
		var parts = [a, '(x + ', h, ')<sup>2</sup> + ', k];
		return $('<span>').addClass('quadratic-StdForm').html(parts.join(''));
	}
	
	function _writeFraction( decimal ) {
		if( decimal.precision() === 0 )
			return decimal.toString();
		
		return decimal.toFraction().join('/');
	}
	
	self.steps = {
		Move_C_To_Right_Side: function(){
			self.polynomial.eq = self.polynomial.c * -1;
			self.polynomial.c  = 0;
			var formatted = _formatQuadratic( self.polynomial.a, self.polynomial.b, self.polynomial.c, self.polynomial.eq );
			
			self.appendStepLine( formatted );
		},
		Pull_Out_GCF: function(){
			var commonFactor = Math.GCF( Math.abs(self.polynomial.a), Math.abs(self.polynomial.b) );
			if(self.polynomial.a < 0) commonFactor *= -1; // Required so that the coefficient of x is always positive.
			self.polynomial.a /= commonFactor;
			self.polynomial.b /= commonFactor;
			self.polynomial.coefficient = commonFactor;
			
			var formatted = _formatQuadratic( self.polynomial.a, self.polynomial.b, self.polynomial.c, self.polynomial.eq, self.polynomial.coefficient );
			
			self.appendStepLine( formatted );
		},
		Extract_A_X_H: function() {
			self.polynomial.h = self.polynomial.b / 2 / self.polynomial.a; // h as in a(x - h)^2			
			
			var axhForm = _formatQuadratic_ExponentOutside(self.polynomial.a, self.polynomial.h, self.polynomial.coefficient);
			
			self.appendStepLine( 'a(x - h)<sup>2</sup> = ' + axhForm.html() );
		},
		Complete_The_Square: function() {
			var foilResult  = Math.FOIL(self.polynomial.a, self.polynomial.h, self.polynomial.a, self.polynomial.h);
			self.completedSquare = {
				a : foilResult.a * self.polynomial.coefficient,
				b : foilResult.b * self.polynomial.coefficient,
				c : foilResult.c * self.polynomial.coefficient,
				eq: 0
			};
			
			var foilDistributed = _formatQuadratic( self.completedSquare.a, self.completedSquare.b, self.completedSquare.c, self.completedSquare.eq );
			var foilProof   = _formatQuadratic(foilResult.a, foilResult.b, foilResult.c, foilDistributed.html(), 2);

			var formatted = _formatQuadratic_ExponentOutside(self.polynomial.a, self.polynomial.h, self.polynomial.coefficient, foilProof.html());
			self.appendStepLine( formatted );
		},
		Compute_Constant: function() {
			var foilDistributed    = _formatQuadratic( self.completedSquare.a, self.completedSquare.b, self.completedSquare.c, self.completedSquare.eq );
			var originalPolynomial = _formatQuadratic( self.originalPolynomial.a, self.originalPolynomial.b, self.originalPolynomial.c, self.originalPolynomial.eq );
			self.polynomial.axh_Constant = self.originalPolynomial.c - self.completedSquare.c;
			
			self.appendStepLine('(', originalPolynomial, ') - (', foilDistributed, ') = ', self.polynomial.axh_Constant );
		},
		Output_Result: function(){
			var solution = _formatQuadratic_StdForm( self.polynomial.coefficient, self.polynomial.h, self.polynomial.axh_Constant);
			
			self.appendStepLine( solution );
		},
		Output_Vertex: function(){
			self.appendStepLine( 'Vertex: (' + (self.polynomial.h * -1) + ', ' + self.polynomial.axh_Constant + ')');
		}
		
	};

	
	$(self.init);
	
	return self;
}());

Math.GCF = function(a, b) {
	var toTest = a;
	if(b < a)
		toTest = b;
	
	for(; toTest>0; toTest--) {
		var aRemainder = a % toTest;
		var bRemainder = b % toTest;
		if(aRemainder === 0 && bRemainder === 0)
			return toTest;
	}
}

Math.SimplifyFraction = function( numerator, denominator ) {
	var GCF = Math.GCF( numerator, denominator );
	return [ numerator/GCF, denominator/GCF ];
}

Number.prototype.toFraction = function() {
	return Math.dec2frac(this);
}

Math.dec2frac = function( decimal ) {
	var coeff = 1;
	if( decimal < 0 ){
		coeff = -1;
	}
	
	decimal *= coeff;
	
	var denominator = Math.pow( 10, decimal.precision() );
	var numerator   = decimal * denominator;
	
	var simplified = Math.SimplifyFraction(numerator, denominator);
	
	return [coeff * simplified[0], simplified[1]];
}

Number.prototype.precision = function() {
	var number = Math.abs(this).toString();
	var decimalPos = number.lastIndexOf('.');
	if( decimalPos === -1 ) return 0;
	return number.length - decimalPos - 1;
}

Math.FOIL = function( aX, a, bX, b ) {
	// ( aX(x) + a )( bX(x) + b )
	return {
		a: aX * bX, // Firsts
		b: a + b,   // Outers + Inners
		c: a * b    // Lasts
	}
};

(function(){
	var unicodeEntities = {
		'0': 'x2070',
		'1': 'x00B9',
		'2': 'x00B2',
		'3': 'x00B3',
		'4': 'x2074',
		'5': 'x2075',
		'6': 'x2076',
		'7': 'x2077',
		'8': 'x2078',
		'9': 'x2079',
	};
	
	window.HTML_Exponent = function(number) {
		var digits = parseInt(number).toString();
		var chars = [];
		for(var i=0; i<digits.length; i++) {
			chars.push( '&#', unicodeEntities[ digits[i] ] );
		}
		return chars.join('');
	}
}());
