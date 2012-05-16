/*
 * quintet.singletextfield.js : all logic pertaining to simple text fields
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 */
quintet.registerWidget
(
	widget = {

		id : "line",

		/* Mandatory : all widgets must have a createOptions */
		/* These options will get serialized and stored in the backend for actual use */
		createOptions : 	function()
		{
			var counter = $("."+this.id).length + 1;
			var o =
		  {
				label : "Single field text '" + counter + "'",
				value : "",
				hint : "This is a single field text",
				font : "default",
				size : 16,
				bold : false,
				italic : false,
				underline : false,
				required : counter == 1 ? true : false,
				filter : "any",
				labelColor : "default",
				valueColor : "default",
				hintColor  : "default",
				id : this.id,
			};
			return o;
		},

		//Really, I am expecting the id to be
		//+1 for innerHTML
		createOptionsUI : function ( id , element )
		{
			var o;
			console.log( o = JSON.parse( atob($( element.parentNode ).find("#options")[0].value) ) );

			$("#"+id)[0].innerHTML =
				quintet.htmlbuilder
				.clear()
				.h3("Basics")
				.well()
					.table()
						.row()
							.cell().label("label")
							.cell().textInput("label")
						.row()
							.cell().label("value")
							.cell().textInput("value")
						.row()
					.table()
						.row()
							.cell().colspan(2).label("hint").textArea("hint").style("width:250px")
						.row()
					.table()
						.row()
							.cell().fontSelector("font")
							.cell().sizeSelector("size")
						.row()
							.cell().colspan(2)
								.checkbox("bold")
								.checkbox("italic")
								.checkbox("underline")
				.h3("Value")
				.well()
					.table()
						.row()
							.cell().checkbox("required")
							.cell().dropdown("filter" , "Any,Number,Text").style("width:100px")
				.html;

				$('#field\\.font').fontPickerRegios({
						defaultFont: 'Helvetica Neue',
						callbackFunc: function(){},
						selid: 'field\\.font',
				});
		},

		/* Mandatory : all widgets must have a create */
		/* This is what the drag helper function calls, magic will place then the helper in the sortable form */
		create : function( o /*options*/ )
		{
			//get options or create new options
			//this gets messed up, hence the go-around for the original self
			var o = ( o && !(o instanceof jQuery.Event) ) || quintet.getWidget("line").createOptions()

			o._closeButton = quintet.mode.design ? '<a class="close" href="#">&times;</a>' : ''
			o._isRequired  = o.required ? '<em class="required">*</em>&nbsp;' : ''
			o._labelColor = o.labelColor != "default" ? "style='color:" + o.labelColor + "'" : "";
			o._valueColor = o.valueColor != "default" ? "style='color:" + o.valueColor + "'" : "";
			o._hintColor  = o.hintColor  != "default" ? "style='color:" + o.hintColor  + "'" : "";

			//Pass the options ( by value , lazy me ), the css name, the css value and the default
			//If the value == default, then the css remains unmodified
			//options._style will get modified for later use
			quintet.considerStyle( o , 'font-family' , o.font , "default" );
			quintet.considerStyle( o , 'font-size'   , o.size , 8 );
			quintet.considerStyle( o , 'font-weight' , o.bold?"bold":"normal" , "normal" );
			quintet.considerStyle( o , 'font-style'  , o.italic?"italic":"normal" , "normal" );
			quintet.considerStyle( o , 'font-decoration' , o.underline?"underline":"none" , "none" );

			o.data = quintet.widget.encodeOptions( o );//btoa( JSON.stringify( o ) );

			//Contrary to the original, I believe this to be
			//more maintainable than coding all this with DOM manipulation

			return $( sprintf('<div>%(_closeButton)s' +
													'<input type="hidden" id="options" name="options" value=\'%(data)s\'>' +
													'<div class="%(id)s widget">' +
														'<label>%(_isRequired)s<span %(_labelColor)s >%(label)s</span></label>' +
														'<input type="text" class="textInput" %(_valueColor)s value="%(value)s">' +
														'<span class="formHint" %(_hintColor)s>%(hint)s</span>' +
													'</div>' +
											'</div>' , o )
				)
		},
	}
);