/*
 * quintet.js : central functionality for formbuilding
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *

 * The goal here is to write html quickly, in half the space ( no closing tags )
 * This means that there can be no nested tags ( no tables in tables etc. )
 * This code is only used for building settings html, which is a very limited use case
 * Obviously this code will break in other real world scenario's, also, goggles wont work

 * Also, convention arises : double quotes for style, and attributes in general
 */

'use strict';

quintet.htmlbuilder = { //Let's just throw it into quintet

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

	/* just go the end, do not collect 100$ */
	end : function()
	{
		this._removeHint("content");
		this.html = sprintf( "%s<!--content-->" , this.html );
	  return this;
	},

	/* Remove a hint ( because we will move it further on ) */
	_removeHint : function( hint )
	{
		var a = this.html.split( "<!--" + hint + "-->" );
		this.html = a.join("");
	},

	/* We dont want to get rid of the hint, just presert content before it 
	   Also we want to abstract the fact that the hints are encoded in html comments */
	_splitOverHint : function( hint )
	{
		if( hint === "content" && this.html.indexOf("cellcontent") !== -1 )
			hint = "cellcontent";

		this.pre  = this.html.split( "<!--" + hint + "-->" )[0];
		this.post = this.html.split( "<!--" + hint + "-->" )[1];
		this.post = "<!--" + hint + "-->" + ( this.post || "" );
	},

	/* Assumed to contain further content, well comes straight from bootstrap */
	well : function()
	{
		this._removeHint("content");
		this.html = sprintf( '%s<div class="well"><!--content--></div>' , this.html );
		return this;
	},

	/* Assumed to contain rows, could be in a well, or not */
	table : function( className )
	{
		className = this.classify( className );
		this._removeHint("cellcontent");
		this._removeHint("cell");
		this._removeHint("row");
		this._splitOverHint("content");
		this.html = sprintf( '%s<table%s><!--row--></table>%s' , this.pre , className, this.post );
		return this;
	},

	/* Assumed to contain cells */
	row : function( className )
	{
		className = this.classify( className );
		this._removeHint("cellcontent");
		this._removeHint("cell");
		this._splitOverHint("row");
		this.html = sprintf( '%s<tr%s><!--cell--></tr>%s' , this.pre , className ,this.post );
		return this;
	},

	classify : function( className )
	{
		return className ? ' class="' + className + '"' : "";
	},

	/* Will contain cellcontent, which is distinct from 'content' */
	cell : function( className )
	{
		className = this.classify( className );
		this._removeHint("cellcontent");
		this._splitOverHint("cell");
		this.html = sprintf( '%s<td%s><!--cellcontent--></td>%s' , this.pre , className , this.post );
		return this;
	},

	/* H4x0rz!! Assumed to be called after cell */
	colspan : function( span )
	{
		var contentHint = this.contentHint();
		this.html = this.html.replace( "<td><!--" + contentHint + "--></td>" , "<td colspan='" + span + "'><!--" + contentHint + "--></td>"  );
		return this;
	},

	/*Are we talking cellcontent or content in the current context ? */
	contentHint : function()
	{
		return ( this.html.indexOf("cellcontent") != -1 ? "cellcontent" : "content" );
	},

	/* H4x0rz!! Assumed to be called after any content addition */
	/* Convention arises : double quotes for HTML attributes!! */
	style : function( s )
	{
		//Yes, this is will only work for my use case
		var contentHint = this.contentHint();
		var contentSplit = this.html.split("<!--" + contentHint + "-->");
		var tags = contentSplit[0].split("<");
    var tagParts;
		for( var i = tags.length-1 ; i >= 0 ; i-- )
			if( tags[i].charAt(0) != '/' && tags[i].indexOf("option") != 0 )
			{
				if( tags[i].indexOf('style="') == -1 )
				{
					tagParts = tags[i].split(">");
					tags[i] = tagParts[0] + " style='" + s + "'>" + tagParts[1];
				}
				else
				{
					tagParts = tags[i].split('style="');
					tags[i] = tagParts[0] + 'style="' + s + ';' + tagParts[1];
				}
				this.html = tags.join("<") + "<!--" + contentHint + "-->" + contentSplit[1];
				break;
			}
		return this;
	},

	stretch : function()
	{
		return this.style("width:100%");
	},

	//<label for="field.%s">%s</label>
	label : function( caption )
	{
		this._splitOverHint("content");
		this.html = sprintf( '%s<label for="field.%s">%s</label>%s' , this.pre , caption , caption.capitalizeFirst() , this.post );
		return this;
	},

	//<label for="field.%s">%s</label>
	text : function( s )
	{
		this._splitOverHint("content");
		this.html = sprintf( '%s%s%s' , this.pre , s , this.post );
		return this;
	},

	//<input type="text" id="field.label" style="width:100%">
	textInput : function( id , value , style )
	{
		this._splitOverHint("content");
		this.html = sprintf( '%s<input type="text" id="field.%s" value="%s" style="%s">%s' , this.pre , id , value , style , this.post );
		return this;
	},

	//<textarea id="field.description" style="width:100%"></textarea>
	textArea : function( id , value )
	{
		this._splitOverHint("content");
		this.html = sprintf( '%s<textarea id="field.%s">%s</textarea>%s' , this.pre , id , value , this.post );
		return this;
	},

	//<div id='fontselector' style="border-radius: 3px;"></div>
	fontSelector : function( id )
	{
		this._splitOverHint("content");
		this.html = sprintf( '%s<div id="field.dummy.%s" class="fontselector" style="border-radius: 3px;"></div><input type="hidden" id="field.%s">%s' , this.pre , id , id , this.post );
		return this;
	},

	//Size selector, ugh..
	//var element = document.getElementById('leaveCode');    element.value = valueToSelect;
	dropdown : function( id , content )
	{
		this._splitOverHint("content");
		//Caller provides comma separated string or an array
		if (typeof content == "string")
			var content = content.split(",")
		//Generate the options
		var s = "";
		for( var i = 0 ; i < content.length ; i++ )
			s = s + '<option value="' + content[i] + '">' + content[i] + '</option>'
		//Put it all together
		this.html = sprintf( '%s<select id="field.%s">%s</select>%s' , this.pre , id , s , this.post );
		return this;
	},

	//<input type="checkbox" id="field.bold">&nbsp;Bold&nbsp;
	checkbox : function( id , value )
	{
		if( value )	value = " checked";

		this._splitOverHint("content");
		this.html = sprintf( '%s<input type="checkbox" id="field.%s" %s>&nbsp;%s&nbsp%s' , this.pre , id , value, id.capitalizeFirst() , this.post );
		return this;
	}
}