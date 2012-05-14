

/*
	The goal here is to write html quickly, in half the space ( no closing tags )
	This means that there can be no nested tags ( no tables in tables etc. )
	This code is only used for building settings html, which is a very limited use case
	Obviously this code will break in other real world scenario's
	Also, goggles wont work
*/

//Let's just throw it into quintet

quintet.htmlbuilder = {

	html : "",

	clear : function()
	{
		this.html = "";
		return this;
	},

	/* Assumed to be a header , at the bottom*/
	h3 : function( caption )
	{
		this._removeHint("content");
		this.html = sprintf( "%s<h3>%s</h3><!--content-->" , this.html , caption  );
	  return this;
	},

	/* Remove a hint ( because we will move it further on)*/
	_removeHint : function( hint )
	{
		var a = this.html.split( "<!--" + hint + "-->" );
		this.html = a.join("");
	},

	/* We dont want to get rid of the hint, just presert content before it */
	_splitOverHint : function( hint )
	{
		this.pre  = this.html.split( "<!--" + hint + "-->" )[0];
		this.post = this.html.split( "<!--" + hint + "-->" )[1];
		this.post = "<!--" + hint + "-->" + ( this.post || "" );
	},

	/* Assumed to contain further content */
	well : function()
	{
		this._removeHint("content");
		this.html = sprintf( '%s<div class="well"><!--content--></div>' , this.html );
		return this;
	},

	/* Assumed to contain rows, could be in a well, or not */
	table : function()
	{
		this._removeHint("row");
		this._splitOverHint("content");
		this.html = sprintf( '%s<table><!--row--></table>%s' , this.pre , this.post );
		return this;
	},

	/* Assumed to contain cells */
	row : function()
	{
		this._removeHint("cell");
		this._splitOverHint("row");
		this.html = sprintf( '%s<tr><!--cell--></tr>%s' , this.pre , this.post );
		return this;
	},

	/* Assumed to contain content, ouch.. */
	cell : function()
	{
		this._removeHint("content");
		this._splitOverHint("cell");
		this.html = sprintf( '%s<td><!--content--></td>%s' , this.pre , this.post );
		return this;
	},

	/* H4x0rz!! Assumed to be called after cell */
	colspan : function( span )
	{
		this.html = this.html.replace( "<td><!--content--></td>" , "<td colspan='" + span + "'><!--content--></td>"  )
		return this;
	},
	
	//<label for="field.%s">%s</label>
	label : function( caption )
	{
		this._splitOverHint("content");
		this.html = sprintf( '%s<label for="field.%s">%s</label>%s' , this.pre , caption , caption.capitalizeFirst() , this.post );
		return this;
	},

	//<input type="text" id="field.label" style="width:100%">
	textInput : function( id , style )
	{
		style = style || "width:100%"; //Assume we want 100% width
		this._splitOverHint("content");
		this.html = sprintf( '%s<input type="text" id="field.%s" style="%s">%s' , this.pre , id , style , this.post );
		return this;
	},

	//<textarea id="field.description" style="width:100%"></textarea>
	textArea : function( id , style )
	{
		style = style || "width:100%"; //Assume we want 100% width
		this._splitOverHint("content");
		this.html = sprintf( '%s<textarea id="field.%s" style="%s"></textarea>%s' , this.pre , id , style , this.post );
		return this;
	},

	//<div id='fontselector' style="border-radius: 3px;"></div>	
	fontSelector : function( id )
	{
		this._splitOverHint("content");
		this.html = sprintf( '%s<div id="field.%s" class="fontselector" style="border-radius: 3px;"></div>%s' , this.pre , id , this.post );
		return this;
	},

	//Size selector, ugh..
	//var element = document.getElementById('leaveCode');    element.value = valueToSelect;
	sizeSelector : function( id )
	{
		this._splitOverHint("content");
		//Generate the options
		var s = "";
		for( var i = 9 ; i < 33 ; i++ )
			s = s + '<option value="' + i + '" ' + (i==13?'SELECTED':'') + '">' + i + ' px</option>'
			
		this.html = sprintf( '%s<select id="field.%s" style="width:130px" value="13">%s</select>%s' , this.pre , id , s , this.post );

		return this;
	},

	//<input type="checkbox" id="field.bold">&nbsp;Bold&nbsp;
	checkbox : function( id , value )
	{
		value = value || false;
		this._splitOverHint("content");
		this.html = sprintf( '%s<input type="checkbox" id="field.%s">&nbsp;%s&nbsp%s' , this.pre , id , id.capitalizeFirst() , this.post );
		return this;
	}

}