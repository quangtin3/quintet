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

		//Allow the right panel to receive elements
		$( "#rightColumn" ).sortable(
			{
				receive: function( event, ui )           //Manipulate the button which got dragged so that it turns into the helper
				{
					$( "#rightColumn .btn" )               //Find the item, should be a button within the right column
					.attr('class',ui.helper.attr('class')) //Take over the classes of the helper
					.attr('style',ui.helper.attr('style')) //Take over the style of the helper
					.css('position', 'static')             //But ignore position
					.css('width', 'auto')                  //But ignore width
					.css('height', 'auto')                 //But ignore height
					.css('top', 'auto')                    //But ignore top
					.css('left', 'auto')                   //But ignore left
					.css('display', 'block')               //Make sure this gets displayed as a block
					.on( 'click' , quintet.customize )     //Allow the user to customize the field
					[0].innerHTML = ui.helper[0].innerHTML;//Take over the innerHTML of the helper
				}
			}
		);

		//Make all the form element close buttons work
		//The assumption is that elements are not nested
		//That the close button's parent has all elements that need removal
		//That the close button's parent's parent is the container
		$(".close").live("click" , function(e){ console.log(e); e.currentTarget.parentElement.parentElement.removeChild(  e.currentTarget.parentElement ); } );

		//Enable the buttons
		for( var i = 0 ; i < this.widgets.length ; i++ )
		{
			//Shortcut
			var widget = this.widgets[i];
			//The create button has the id of the widget id
			$( "#" + widget.id )
			.draggable( { connectToSortable: "#rightColumn" , refreshPositions: true , helper : widget.create } );

		}
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
		//KILLME console.log( e );
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
		//KILLME console.log( src );
		//KILLME console.log( src.className.split(" ")[0] );
		var id = src.className.split(" ")[0];
		var widget = quintet.getWidget( id );
		//KILLME console.log( widget );
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
			return btoa( JSON.stringify( clone ) )

		},

		decodeOptions : function( element )
		{
			while( $( element ).find("#options").length == 0 )
				element = element.parentNode;
			

			JSON.parse( atob($( element.parentNode ).find("#options")[0].value) )
		},
	}
};
