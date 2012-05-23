/*
 * quintet.boxtext.js : all logic pertaining to simple text area's
 * 'extends' : quintet.singletextfield
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 */

quintet.registerWidget
(
	widget = {

		id : "box",

		/* Mandatory : all widgets must have a createOptions */
		/* These options will get serialized and stored in the backend for actual use */
		createOptions : 	function()
		{
			var counter = $("."+this.id).length + 1;
			if (counter==1) counter = "";
			var o = quintet.getWidget("line").createOptions(); //<-- Lean on line
			o.label = "Text " + counter;
			o.hint = '';
			o.required = false;
			o.id = this.id;
			o.ref = this.id + counter;
			return o;
		},

		//Really, I am expecting the id to be
		//+1 for innerHTML
		createOptionsUI : function ( id , element )
		{
			quintet.getWidget("line").createOptionsUI( id , element ); //<-- Lean on line
		},

		/* Mandatory : all widgets must have a create */
		/* This is what the drag helper function calls, magic will place then the helper in the sortable form */
		create : function( o /*options*/ )
		{
			//get options or create new options
			//this gets messed up, hence the go-around for the original self
			if( !o || (o instanceof jQuery.Event) )
				o = quintet.getWidget("box").createOptions()

			//use the style options of line
			quintet.getWidget("line").styleOptions( o );

			o.data = quintet.widget.encodeOptions( o );

			//Contrary to the original, I believe this to be
			//more maintainable than coding all this with DOM manipulation

			return $( sprintf('<div id="%(ref)s">%(_closeButton)s' +
													'<input type="hidden" id="options" name="options" value=\'%(data)s\'>' +
													'<div class="%(id)s widget">' +
														'<label style="%(_style)s">%(_isRequired)s<span %(_labelColor)s >%(label)s</span></label>' +
														'<textarea %(_valueColor)s rows="5" style="width:90%%">%(value)s</textarea>' +
														'<span class="formHint" %(_hintColor)s>%(hint)s</span>' +
													'</div>' +
											'</div>' , o )
				)
		},
	}
);