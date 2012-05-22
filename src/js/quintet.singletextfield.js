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
				size : 13, //bootstrap default
				bold : false,
				italic : false,
				underline : false,
				required : counter == 1 ? true : false,
				filter : "any",
				labelColor : "default",
				valueColor : "default",
				hintColor  : "default",
				id : this.id,
				ref : this.id + counter,
			};
			return o;
		},

		//Really, I am expecting the id to be
		//+1 for innerHTML
		createOptionsUI : function ( id , element )
		{
			var o = quintet.widget.decodeOptions( element );

			$("#"+id)[0].innerHTML =
				quintet.htmlbuilder
				.clear()
				.h3("Basics")
				.well()
					.table()
						.row()
							.cell().label("label")
							.cell("paddedStretch").textInput("label", o.label)
						.row()
							.cell().label("default")
							.cell("paddedStretch").textInput("value", o.value)
						.row()
					.table("stretch")
						.row()
							.cell("paddedStretch").colspan(2).label("hint").textArea("hint", o.hint).style("width:100%")
				//		.row()
				//	.table("stretch")
				//		.row("stretch")
				//			.cell().fontSelector("font")
				//			.cell().sizeSelector("size")//TODO, deal with value
						.row()
							.cell().colspan(2)
								.checkbox("bold" , o.bold ).text("&nbsp;")
								.checkbox("italic" , o.italic ).text("&nbsp;")
								.checkbox("underline" , o.underline ).text("&nbsp;")
				.h3("Value")
				.well()
					.table()
						.row()
							.cell().checkbox("required" , o.required )
							.cell().dropdown("filter" , "Any,Number,Text" , o.filter ).style("width:100px") //TODO, deal with value
				.html;

				//Init the font chooser, some notes;
				//1, fricking jQuery requires double backward slashes to have a dot in a selector
				//1b. Yes, I could have changed my naming standard, but I like namespaced id's
				//2. The selector is called field.dummy.{id} , the value is passed to a hidden input for further processing, name is field.{id}
				//3. Encapsulated in this file is the assumption that the {id} for the font widget is 'font', 
				//4. applyOptions expects an input element, hence the subterfuge of a hidden input..
				$('#field\\.dummy\\.font').fontPickerRegios({
						defaultFont: 'Helvetica Neue',
						callbackFunc: function(fontName)
							{
								quintet.widget.applyOptions( $('#field\\.font').val(fontName)[0] ) 
							},
						selid: 'field\\.dummy\\.font',
				});

				//Init the font size
				$("#field\\.size").val( o.size );

				quintet.widget.current = o.ref;
		},

		/* Mandatory : all widgets must have a create */
		/* This is what the drag helper function calls, magic will place then the helper in the sortable form */
		create : function( o /*options*/ )
		{
			//get options or create new options
			//this gets messed up, hence the go-around for the original self
			if( !o || (o instanceof jQuery.Event) )
				o = quintet.getWidget("line").createOptions()

			o._closeButton = quintet.mode.design ? '<a class="close" href="#">&times;</a>' : ''
			o._isRequired  = o.required ? '<em class="required">*</em>&nbsp;' : ''
			o._labelColor = o.labelColor != "default" ? "style='color:" + o.labelColor + "'" : "";
			o._valueColor = o.valueColor != "default" ? "style='color:" + o.valueColor + "'" : "";
			o._hintColor  = o.hintColor  != "default" ? "style='color:" + o.hintColor  + "'" : "";

			//Pass the options ( by value , lazy me ), the css name, the css value and the default
			//If the value == default, then the css remains unmodified
			//options._style will get modified for later use
			quintet.considerStyle( o , 'font-family' , o.font , "default" );
			quintet.considerStyle( o , 'font-size'   , o.size+"px" , "13px" );
			quintet.considerStyle( o , 'font-weight' , o.bold?"bold":"normal" , "normal" );
			quintet.considerStyle( o , 'font-style'  , o.italic?"italic":"normal" , "normal" );
			quintet.considerStyle( o , 'text-decoration' , o.underline?"underline":"none" , "none" );

			o.data = quintet.widget.encodeOptions( o );//btoa( JSON.stringify( o ) );

			//Contrary to the original, I believe this to be
			//more maintainable than coding all this with DOM manipulation

			return $( sprintf('<div id="%(ref)s">%(_closeButton)s' +
													'<input type="hidden" id="options" name="options" value=\'%(data)s\'>' +
													'<div class="%(id)s widget">' +
														'<label style="%(_style)s">%(_isRequired)s<span %(_labelColor)s >%(label)s</span></label>' +
														'<input type="text" class="textInput" %(_valueColor)s value="%(value)s">' +
														'<span class="formHint" %(_hintColor)s>%(hint)s</span>' +
													'</div>' +
											'</div>' , o )
				)
		},
	}
);