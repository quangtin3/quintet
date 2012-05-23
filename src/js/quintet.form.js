/*
 * quintet.singletextfield.js : all logic pertaining to simple text fields
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 */

//Hax0rz, this is not a widget, it does not have create for example!!
quintet.registerWidget
(
	widget = {

		id : "form",

		/* Mandatory : all widgets must have a createOptions */
		/* These options will get serialized and stored in the backend for actual use */
		createOptions : 	function()
		{
			var o =
		  {
				formFont : "inherit",
				name : "<New Form>",
				size : "medium", //bootstrap default
				id : this.id,
				ref : this.id,
				labelColor : "inherit",
				valueColor : "inherit",
				hintColor : "inherit",
			};
			return o;
		},

		createOptionsUI : function ( id , element )
		{
			var o = quintet.widget.decodeOptions( element , "formOptions" );

			$("#"+id)[0].innerHTML =
				quintet.htmlbuilder
				.clear()
				.h3("Basics")
				.well()
					.table("stretch")
						.row("stretch")
							.cell().label("name")
							.cell("paddedStretch").textInput("name", o.name)
						.row()
					//.table("stretch")
					//	.row("stretch")
					//		.cell().fontSelector("formFont")
					//		.cell().dropdown("size" , "x-small,small,medium,large,x-large" ).style("width:130px") 
				.html.replace( /field\./g , 'form.' );

				//Init the font chooser, some notes;
				//1, fricking jQuery requires double backward slashes to have a dot in a selector
				//1b. Yes, I could have changed my naming standard, but I like namespaced id's
				//2. The selector is called field.dummy.{id} , the value is passed to a hidden input for further processing, name is field.{id}
				//3. Encapsulated in this file is the assumption that the {id} for the font widget is 'font',
				//4. applyOptions expects an input element, hence the subterfuge of a hidden input..
				$('#form\\.dummy\\.formFont').fontPickerRegios({
						defaultFont: 'Helvetica Neue',
						fontclass: 'singleformfont',
						callbackFunc: function(fontName)
							{
								quintet.getWidget("form").applyOptions( $('#form\\.formFont').val(fontName)[0] );
							},
						selid: 'form\\.dummy\\.formFont',
						id: 'formfontbox',
				});

				//Init the font size
				$("#form\\.size").val( o.size );
		},

		//For the form only, we need an initial initialization 
		init : function()
		{
			//Create some options
			o = quintet.getWidget("form").createOptions();
			//Encode them
			o.data = quintet.widget.encodeOptions( o );
			//Store them under the form
			$(".quintetForm").append( '<input type="hidden" id="formOptions" name="formOptions" value="' + o.data + '">' );
			//Create the UI for the form options
			quintet.getWidget("form").createOptionsUI( 'form' , $(".quintetForm") );
		},

		applyOptions : function( element )
		{
			var newValue  = $(element).is(":checkbox") ? element.checked : element.value;  //Hack for checkboxes
			var o         = quintet.widget.decodeOptions( $(".quintetForm") , "formOptions" );
			var attribute = element.id.split(".")[1];

			o[attribute] = newValue;
			quintet.getWidget("form").apply( o );
		},

		apply : function( o )
		{
			//Encode options in case they changed
			o.data = quintet.widget.encodeOptions( o );

			//We will not create a widget, but adjust the current one			

				$(".quintetForm")
					.css( "font-family" , o.formFont=='inherit' ? '' : o.formFont )
					.css( "font-size"   , o.size=='medium'  ? '' : o.size );

			$(".quintetForm #formOptions").replaceWith( $('<input type="hidden" id="formOptions" name="formOptions" value="' + o.data + '">') );

		},
	}
);