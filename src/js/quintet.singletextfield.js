

quintet.registerWidget
(
	widget = {

		id : "line",

		createOptions : 	function()
		{
			var name = "widgetLine";
			var counter = $("."+name).length + 1;
			var o =
		  {
				label : "Single field text " + counter,
				value : "",
				hint : "This is a single field text",
				font : "default",
				size : 16,
				biu : [ false , false , false ], //bold italic underline
				required : counter == 1 ? true : false,
				filter : "any",
				labelColor : "default",
				valueColor : "default",
				hintColor  : "default",
				name : name,
			};
			return o;
		},

		create : function( options )
		{
			//get options or create new options
			//this gets messed up, hence the go-around for the original self
			var options = ( options && !(options instanceof jQuery.Event) ) || quintet.getWidget("line").createOptions()

			options._closeButton = quintet.mode.design ? '<a class="close" href="#">&times;</a>' : ''
			options._isRequired  = options.required ? '<em>*</em>' : ''
			options._labelColor = options.labelColor != "default" ? "style='color:" + options.labelColor + "'" : "";
			options._valueColor = options.valueColor != "default" ? "style='color:" + options.valueColor + "'" : "";
			options._hintColor  = options.hintColor  != "default" ? "style='color:" + options.hintColor  + "'" : "";


			//Pass the options ( by value , lazy me ), the css name, the css value and the default
			//If the value == default, then the css remains unmodified
			//options._style will get modified for later use
			quintet.considerStyle( options , 'font-family' , options.font , "default" );
			quintet.considerStyle( options , 'font-size'   , options.size , 8 );
			quintet.considerStyle( options , 'font-weight' , options.biu[0]?"bold":"normal" , "normal" );
			quintet.considerStyle( options , 'font-style'  , options.biu[1]?"italic":"normal" , "normal" );
			quintet.considerStyle( options , 'font-decoration' , options.biu[2]?"underline":"none" , "none" );

			console.log( options._style );

			//Contrary to the original, I believe this to be
			//more maintainable than coding all this with DOM manipulation

			var s =  sprintf('<div>%(_closeButton)s' +
				       		        '<div class="%(name)s">' +
				       			        '<label>%(_isRequired)s<span %(_labelColor)s >%(label)s</span></label>' +
				       			        '<input type="text" class="textInput" %(_valueColor)s value="%(value)s">' +
				       			        '<span class="formHint" %(_hintColor)s>%(hint)s</span>' +
				       		        '</div>' +
				       	        '</div>' , options );

			var q = $( s );

			jQuery.data(q[0], "options", options );

			return q;

		},
	}
);
