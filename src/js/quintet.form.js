/*
 * quintet.form.js : all logic pertaining to forms and columns in forms
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 */

//Hax0rz, this is not really a widget, it does not have create for example but uses init!!
quintet.registerWidget
(
	widget = {

		id : "form",

		/* These options will get serialized and stored in the backend for actual use */
		createOptions : 	function()
		{
			var o =
			{
				name : "<New Form>",
				columns : 2,
				size : "medium", //bootstrap default
				id : this.id,
				ref : this.id,
			};
			o.data = quintet.widget.encodeOptions( o );
			return o;
		},
		/* Pretty much standard.. */
		createOptionsUI : function ( id , element )
		{
			var o = quintet.widget.decodeOptions( element , "formOptions" );

			$("#"+id)[0].innerHTML =
				quintet.htmlbuilder
				.clear()
				.h3("Basics")
				.well()
					.table("paddedStretch")
						.row("paddedStretch")
							.cell().label("name")
							.cell("paddedStretch").textInput("name", o.name)
						.row("paddedStretch")
							.cell().label("columns")
							.cell("paddedStretch").dropdown( "columns" , "1,2,3" ).style("width:80px;")
						.row()
				.html.replace( /field\./g , 'form.' );

				//Init the column size
				$("#form\\.columns").val( o.columns );
		},

		/* See http://jqueryui.com/demos/sortable/#connect-lists */
		enableWidgetColumns : function ( queryResult )
		{
			queryResult.sortable(
				{
					receive: function( event, ui )           //Manipulate the button which got dragged so that it turns into the helper
					{
						if(!ui.helper) return;                 //Only do this for buttons

						var o = quintet.widget.decodeOptions( ui.helper);
						if( o && o.onReceive )
							return quintet.getWidget(o.id).receive( event , ui , o );

						$( "#rightColumn .btn" )               //Find the item, should be a button within the right column
						.attr('class',ui.helper.attr('class')) //Take over the classes of the helper
						.attr('style',ui.helper.attr('style')) //Take over the style of the helper
						.attr('id'   ,ui.helper.attr('id'))    //Take over the id of the helper
						.css('position', 'static')             //But ignore position
						.css('width', 'auto')                  //But ignore width
						.css('height', 'auto')                 //But ignore height
						.css('top', 'auto')                    //But ignore top
						.css('left', 'auto')                   //But ignore left
						.css('display', 'block')               //Make sure this gets displayed as a block
						.html( ui.helper[0].innerHTML );       //Take over the innerHTML of the helper
					},
					connectWith: ".widgetColumn",
				}
			);

			//Okay, very evil jQuery hack, sortable wont work without at least 1 child
			//Or at least, that's how it looks to me, so lets delete the pro-forma kids
			$('.killmenow').remove();
		},


		//For the form only, we need an initial initialization
		init : function()
		{
			//Allow the right panel to receive elements
			this.enableWidgetColumns( $( ".widgetColumn" ) );

			//Make all the form element close buttons work
			//The assumption is that elements are not nested
			//That the close button's parent has all elements that need removal
			//That the close button's parent's parent is the container
			$(".close").live("click" , function(e){ e.currentTarget.parentElement.parentElement.removeChild(  e.currentTarget.parentElement ); } );

			$(".widget").live("click" , quintet.customize );

			//Enable the UI option fields changing the selected widget
			$('[id^="field."]').live( 'input' , function(e) { quintet.widget.applyOptions( e.srcElement ); });
			$('[id^="field."]').live( 'change' , function(e){	quintet.widget.applyOptions( e.srcElement ); }); //Enable the option option changing..

			//Create the form options, ( encoding done already )
			o = this.createOptions();
			//Store them under the form
			$(".quintetForm").append( '<input type="hidden" id="formOptions" name="formOptions" value="' + o.data + '">' );
			//Create the UI for the form options
			this.createOptionsUI( 'form' , $(".quintetForm") );
			//Enable the UI option fields changing this form
			$('[id^="form."]').live( 'input' , function(e) {  quintet.getWidget("form").applyOptions( e.srcElement ); });
			$('[id^="form."]').live( 'change' , function(e){	quintet.getWidget("form").applyOptions( e.srcElement ); }); //Enable the option option changing..
		},
		/* Non generic version of apply options, for form only */
		applyOptions : function( element )
		{
			var newValue  = $(element).is(":checkbox") ? element.checked : element.value;      //Hack for checkboxes
			var o         = quintet.widget.decodeOptions( $(".quintetForm") , "formOptions" ); // Note that we do not use the standard 'options'
			var attribute = element.id.split(".")[1];

			o[attribute] = newValue;
			quintet.getWidget("form").apply( o );
		},

		apply : function( o )
		{
			//Encode options in case they changed
			o.data = quintet.widget.encodeOptions( o );

			//Do we need any column magic ?
			if( $(".widgetColumn").length != o.columns )
			{
				//Do we need more columns
				if( $(".widgetColumn").length < o.columns )
				{
					while( $(".widgetColumn").length < o.columns )
						$(".quintetForm").append( '<div class="widgetColumn ui-sortable ui-droppable" style="display:inline-block;width:49%;vertical-align: top;"><div class="killmenow">&nbsp;</div>' );

					this.enableWidgetColumns( $(".killmenow").parent() );
				}
				//Do we need less columns ?
				if( $(".widgetColumn").length > o.columns )
				{
					while( $(".widgetColumn").length > o.columns )
					{
						var from = $(".widgetColumn").last();
						var to   = $(".widgetColumn").eq( o.columns - 1 );
						var children = from.children();

						for( var i = 0 ; i < children.length ; i++ )
						{
							to.append(children[i]);
							//from.remove(children[i]);
						}

						$(".widgetColumn").last().remove();
					}
				}
				//Size the columns correctly
				$(".widgetColumn").css( "width" , ( Math.floor( 100 / o.columns ) - 1 ) + "%" );
			}
			//Store the new options
			$(".quintetForm #formOptions").replaceWith( $('<input type="hidden" id="formOptions" name="formOptions" value="' + o.data + '">') );

		},
	}
);