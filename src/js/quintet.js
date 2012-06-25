/*
 * quintet.js : central functionality for formbuilding
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 */

'use strict';

var quintet =
{
  widgets : [],

  mode : { design : true },

  init : function()
  {
    var key;
    //Show the first tab of the left side panel and the application tabs
    $('#tabs a:first').tab('show');
    $('#apptabs a:first').tab('show');

    //Enable the buttons
    for( key in this.widgets )
    {
      //Shortcut
      var widget = this.widgets[key];
      //The create button has the id of the widget id
      $( "#" + widget.id )
      .draggable( 
        { 
          connectToSortable: ".widgetColumn" , 
          refreshPositions: true , 
          helper : widget.create , 
          start: function(e, ui) {  e.stopImmediatePropagation();  } , 
          drag: function(e, ui) {  e.stopImmediatePropagation();  } 
        } 
      ); 
    }
    //Enable the builder, if the builder is present
    if( quintet.builder )
      quintet.builder.init();
  },

  //A helper function, might get moved to quintetHelp if this file gets too large
  //potentially even to quintet.widget
  considerStyle : function( o /*options*/ , property , value , defaultValue )
  {
    o._style = o._style || "";
    if( value !== defaultValue )
      { o._style = o._style + property + ":" + value + ";"; } 
  },

  //TODO: move this to builder.js
  customize : function(e)
  {
    //We need to find an element ( this one or a parent to the nth degree ) with
    //the 'widget' class, which will then give the widget name, which then gives the
    //the 'widget' through widget.find which allows then to change the innerHTML of settings
    //then we need to wire all the element from the innerHTML to the selected widget
    //See Gandalf..
    var src = e.srcElement;
    while( src )
    {
      if( src.className.indexOf( 'widget' ) !== -1 )
        break; //We found it
      src = src.parentElement;
    }
    var id = src.className.split(" ")[0];
    var widget = quintet.widget.find( id );

    widget.createOptionsUI( 'settings' , src );
    $('#tabs a').eq( 1 ).tab( 'show' );
  },

  widget :
  {
    encodeOptions : function( o )
    {
      //Create a clone, this approach is ok for options
      var clone  = JSON.parse( JSON.stringify( o ) ) , key;
      //We know we dont want to encode data
      delete clone.data;
      //Loop over the properties, kill the private ones
      for( key in clone )
        if( key.charAt(0) === '_' )
          delete clone[key];
      //Binary to Ascii, html5 for the win
      return btoa( JSON.stringify( clone ) );
    },

    decodeOptions : function( element , id )
    {
      var query = "#" + ( id || "options" );

      while( $( element ).find( query ).length === 0 )
        element = element.parentNode;

      return JSON.parse( atob($( element ).find( query )[0].value) );
    },

    find : function( name )
    {
      var key;
      for( key in quintet.widgets )
        if( key === name )
          return quintet.widgets[key];
    },

    applyOptions : function( element )
    {
      var newValue  = $(element).is(":checkbox") ? element.checked : element.value;  //Hack for checkboxes
      var control   = $('#' + quintet.widget.current );                              //The control we are working on
      var o         = quintet.widget.decodeOptions( control );                       //The options linked to the control
      var widget    = quintet.widget.find( o.id );                                   //The widget class of the control
      var attribute = element.id.split(".")[1];                                      //Attribute we are changing

      if( o[attribute] !== undefined )
      {
        o[attribute] = newValue;
        var newWidget = widget.create( o );
        control.replaceWith( newWidget );
        if( widget.postCreate )
          widget.postCreate(o);
      }
      else
      {
        console.error("Unknown attribute:" , attribute);
      }
    }
  }
};