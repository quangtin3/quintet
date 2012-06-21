/*
 * quintet.blurb.js : all logic pertaining to a blurb of text
 * leans on: quintet.singletextfield
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 */

'use strict';

quintet.widgets.blurb =
{
  id : "blurb",

  /* Mandatory : all widgets must have a createOptions */
  /* These options will get serialized and stored in the backend for actual use */
  createOptions :   function()
  {
    var counter = $("."+this.id).length + 1;
    var o = quintet.widgets.line.createOptions(); //<-- Lean on line
    o.text = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    o.id = this.id;
    o.ref = this.id + counter;
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
            .cell().label("text")
            .cell("paddedStretch").textArea("text", o.text).stretch()
      .html;

      quintet.widget.current = o.ref;

  },

  /* Mandatory : all widgets must have a create */
  /* This is what the drag helper function calls, magic will place then the helper in the sortable form */
  create : function( o /*options*/ )
  {
    //get options or create new options
    //this gets messed up, hence the go-around for the original self
    if( !o || (o instanceof jQuery.Event) )
      o = quintet.widgets.blurb.createOptions();

    //use the style options of line
    quintet.widgets.line.styleOptions( o );

    o.data = quintet.widget.encodeOptions( o );

    //Contrary to the original, I believe this to be
    //more maintainable than coding all this with DOM manipulation

    return $( sprintf('<div id="%(ref)s">%(_closeButton)s' +
                        '<input type="hidden" id="options" name="options" value=\'%(data)s\'>' +
                        '<span class="%(id)s widget"><pre>%(text)s</pre></span>' +
                    '</div>' , o )
      );
  }
};