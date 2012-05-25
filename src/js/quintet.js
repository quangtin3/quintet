/*
 * quintet.js : central functionality for formbuilding
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 */

quintet =
{
	widgets : [],

	mode : { design : true },

	init : function()
	{
		//Show the first tab of the left side panel
		$('#tabs a:first').tab('show');

		//Enable the buttons
		for( var i = 0 ; i < this.widgets.length ; i++ )
		{
			//Shortcut
			var widget = this.widgets[i];
			//The create button has the id of the widget id
			$( "#" + widget.id )
			.draggable( { connectToSortable: ".widgetColumn" , refreshPositions: true , helper : widget.create } ); 
		}
		//Enable the form options
		quintet.getWidget("form").init();
	},

	//Each widget must register itself
	//which really only means that it gets added to the widgets array
	registerWidget : function( o )
	{
		this.widgets.push( o );
	},

	//Due to messed up 'this' we need a way to retrieve a widget by it's id
	//No curly braces, not for wusses :P
	getWidget : function( id )
	{
		//Enumerate over the widgets
		for( var i = 0 ; i < this.widgets.length ; i++ )
			if( this.widgets[i].id == id )
				return this.widgets[i];
	},

	//A helper function, might get moved to quintetHelp if this file gets too large
	//potentially even to quintet.widget
	considerStyle : function( o /*options*/ , property , value , defaultValue )
	{
		o._style = o._style || "";
		if( value != defaultValue )
			o._style = o._style + property + ":" + value + ";"
	},

	customize : function(e)
	{
		//We need to find an element ( this one or a parent to the nth degree ) with
		//the 'widget' class, which will then give the widget name, which then gives the
		//the 'widget' through getWidget which allows then to change the innerHTML of settings
		//then we need to wire all the element from the innerHTML to the selected widget
		//See Gandalf..
		var src = e.srcElement;
		while( src )
		{
			if( src.className.indexOf( 'widget' ) != -1 )
				break; //We found it
			src = src.parentElement;
		}
		var id = src.className.split(" ")[0];
		var widget = quintet.getWidget( id );

		widget.createOptionsUI( 'settings' , src );
	},

	widget :
	{
		encodeOptions : function( o )
		{
			//Create a clone, this approach is ok for options
			var clone  = JSON.parse( JSON.stringify( o ) );
			//We know we dont want to encode data
			delete clone.data;
			//Loop over the properties, kill the private ones
			for( var key in clone )
				if( key.charAt(0) == '_' )
					delete clone[key];
			//Binary to Ascii, html5 for the win
			return btoa( JSON.stringify( clone ) )
		},

		decodeOptions : function( element , id )
		{
			var query = "#" + ( id || "options" )

			while( $( element ).find( query ).length == 0 )
				element = element.parentNode;

			return JSON.parse( atob($( element ).find( query )[0].value) )
		},

		applyOptions : function( element )
		{
			var newValue  = $(element).is(":checkbox") ? element.checked : element.value;  //Hack for checkboxes
			var control   = $('#' + quintet.widget.current );                              //The control we are working on
			var o         = quintet.widget.decodeOptions( control );                       //The options linked to the control
			var widget    = quintet.getWidget( o.id );                                     //The widget class of the control
			var attribute = element.id.split(".")[1];                                      //Attribute we are changing

			if( o[attribute] !== undefined )
			{
				o[attribute] = newValue;
				var newWidget = widget.create( o );
				control.replaceWith( newWidget );
			}
			else
			{
				console.error("Unknown attribute:" , attribute)
			}
		}
	}
};