


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
				receive: function( event, ui )						 //Manipulate the button which got dragged so that it turns into the helper
				{
					$( "#rightColumn .btn" )               //Find the item, should be a button within the right column
					.attr('class',ui.helper.attr('class')) //Take over the classes of the helper
					.attr('style',ui.helper.attr('style')) //Take over the style of the helper
					.css('position', 'static')             //But ignore position
					.css('width', 'auto')						    	 //But ignore position
					.css('height', 'auto')						    	 //But ignore position
					.css('top', 'auto')	                    //But ignore position
					.css('left', 'auto')                   //But ignore position
					.css('display', 'block')								//Make sure this gets displayed as a block
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
	considerStyle : function( options , property , value , defaultValue )
	{
		options._style = options._style || "";
		if( value != defaultValue )
			options._style = options._style + property + ":" + value + ";"
	},

};