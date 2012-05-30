/*
 * quintet.section.js : all logic pertaining to a section which breaks up the form
 *                      much hackery should be expected
 * clones: quintet.header.js which leans on quintet.singletextfield.js
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 */

'use strict';

quintet.widgets.section =
{
  id : "section",

  /* Mandatory : all widgets must have a createOptions */
  /* These options will get serialized and stored in the backend for actual use */
  createOptions :   function()
  {
    var counter = $("."+this.id).length + 1;
    var o = quintet.widgets.line.createOptions(); //<-- Lean on line
    o.label = "Section " + counter;
    o.id = this.id;
    o.ref = this.id + counter;
    o.onReceive = true;
    o.onRemove  = true;
    return o;
  },

  //Usual options UI
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
            .cell().label("label")
            .cell("paddedStretch").textInput("label", o.label)
      .html;

      quintet.widget.current = o.ref;

  },
  /* Odd, but part of the design, this overrides the default adding of the control to a sortable panel */
  receive : function( event, ui , o )
  {
    //Get rid of the dragged button
    $( "#rightColumn .btn" ).remove();

    //Add the new section at the bottom of the table
    $(".quintetForm").append(  this.create(o) );
    //Add a set of new columns under the section
    $(".quintetForm").append(  $('<tr class="contentRow"><td class="widgetColumn ui-sortable ui-droppable" style="vertical-align: top;"><div class="killmenow">&nbsp;</div></td></tr>') );
    //set the old columns flexible
    $(".widgetColumn").css( "height" , "15px" );
    //make sure that new widgets can be dragged in.
    $(".widgetColumn").css( "padding-bottom" , "15px" );
    //And do some magic to get new columns
    quintet.widgets.form.reApply();
  },

  /* Mandatory : all widgets must have a create */
  /* This is what the drag helper function calls, magic will place then the helper in the sortable form */
  create : function( o /*options*/ )
  {
    //get options or create new options
    //this gets messed up, hence the go-around for the original self
    if( !o || (o instanceof jQuery.Event) )
      o = quintet.widgets.section.createOptions();

    //use the style options of line
    quintet.widgets.line.styleOptions( o );

    o.data = quintet.widget.encodeOptions( o );

    //Okay, we know this will be appended to a table, so we include the tr / td tags
    return $( sprintf('<tr class="contentRow"><td style="vertical-align:top;" colspan="2">' +
                        '<div id="%(ref)s">%(_closeButton)s' +
                          '<input type="hidden" id="options" name="options" value=\'%(data)s\'>' +
                          '<h2 class="%(id)s widget">%(label)s</h2>' +
                        '</div>' +
                      '</td></tr>' , o )
      );
  }
};