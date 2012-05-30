/*
 * quintet.pick.js : all logic pertaining to picklists
 * 'extends' : quintet.singletextfield
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 *jslint nomen: true, plusplus: true, sloppy: true, vars: true, white: true
 */

'use strict';

quintet.widgets.pick =
{
  id : "pick",

  /* Mandatory : all widgets must have a createOptions */
  /* These options will get serialized and stored in the backend for actual use */
  createOptions :   function()
  {
    var counter = $("."+this.id).length + 1;
    var o = quintet.widgets.line.createOptions(); //<-- Lean on line
    o.label = "List " + counter;
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
    quintet.widgets.line.createOptionsUI( id , element ); //<-- Lean on line
  },

  /* Mandatory : all widgets must have a create */
  /* This is what the drag helper function calls, magic will place then the helper in the sortable form */
  create : function( o /*options*/ )
  {
    //get options or create new options
    //this gets messed up, hence the go-around for the original self
    if( !o || (o instanceof jQuery.Event) )
      o = quintet.widgets.date.createOptions();

    //use the style options of line
    quintet.widgets.line.styleOptions( o );

    o.data = quintet.widget.encodeOptions( o );

    //Contrary to the original, I believe this to be
    //more maintainable than coding all this with DOM manipulation

    return $( sprintf('<div id="%(ref)s">%(_closeButton)s' +
                        '<input type="hidden" id="options" name="options" value=\'%(data)s\'>' +
                        '<div class="%(id)s widget">' +
                          '<label style="%(_style)s">%(_isRequired)s<span %(_labelColor)s >%(label)s</span></label>' +
                          '<input type="text" id="actual_%(ref)s"></input>' +
                          '<span class="formHint" %(_hintColor)s>%(hint)s</span>' +
                        '</div>' +
                    '</div>' , o )
      );
  },
  //Lets just hope that reinits are not too bad
  //When cloning this, consider grepping for postCreate
  postCreate : function(o)
  {
    //$( ".datepicker" ).datepicker();
    $("#actual_"+o.ref).pickList( );
  }
};