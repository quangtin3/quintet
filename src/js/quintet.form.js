/*
 * quintet.form.js : all logic pertaining to forms and columns in forms
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 * jslint plusplus: true, sloppy: true, vars: true, white: true, maxerr: 10000 
 */

//Hax0rz, this is not really a widget, it does not have create for example but uses init!!

'use strict';

quintet.widgets.form = 
{
  id : "form",

  /* These options will get serialized and stored in the backend for actual use */
  createOptions : function()
  {
    var o =
    {
      name : "<New Form>",
      columns : 2,
      size : "medium", //bootstrap default
      id : this.id,
      ref : this.id
    };
    o.data = quintet.widget.encodeOptions( o );
    return o;
  },
  /* Pretty much standard.. */
  createOptionsUI : function ( id , element )
  {
    var o = quintet.widget.decodeOptions( element , "formOptions" );

    $("#"+id)[0].innerHTML =
      quintet.htmlbuilder
      .clear()
      .h3("Basics")
      .well()
        .table("paddedStretch")
          .row("paddedStretch")
            .cell().label("name")
            .cell("paddedStretch").textInput("name", o.name)
          .row("paddedStretch")
            .cell().label("columns")
            .cell("paddedStretch").dropdown( "columns" , "1,2,3" ).style("width:80px;")
          .row()
      .html.replace( /field\./g , 'form.' );

      //Init the column size
      $("#form\\.columns").val( o.columns );
  },

  /* See http://jqueryui.com/demos/sortable/#connect-lists */
  enableWidgetColumns : function ( queryResult )
  {
    queryResult.sortable(
      {
        receive: function( event, ui )           //Manipulate the button which got dragged so that it turns into the helper
        {
          if(!ui.helper) return; //Only do this for buttons

          var o = quintet.widget.decodeOptions( ui.helper );
          var widget = quintet.widget.find( o.id );
          if( o && o.onReceive )
            return quintet.widget.find( o.id ).receive( event , ui , o );

          $( "#rightColumn .widgetButton" )               //Find the item, should be a button within the right column
          .attr('class',ui.helper.attr('class')) //Take over the classes of the helper
          .attr('style',ui.helper.attr('style')) //Take over the style of the helper
          .attr('id'   ,ui.helper.attr('id'))    //Take over the id of the helper
          .css('position', 'static')             //But ignore position
          .css('width', 'auto')                  //But ignore width
          .css('height', 'auto')                 //But ignore height
          .css('top', 'auto')                    //But ignore top
          .css('left', 'auto')                   //But ignore left
          .css('display', 'block')               //Make sure this gets displayed as a block
          .html( ui.helper[0].innerHTML );       //Take over the innerHTML of the helper

          //Do we need to do some post-creation stuff ? ( Calendars etc. )
          if( widget.postCreate )
            widget.postCreate(o);
        },
        connectWith: ".widgetColumn"
      }
    );

    //Okay, very evil jQuery hack, sortable wont work without at least 1 child
    //Or at least, that's how it looks to me, so lets delete the pro-forma kids
    $('.killmenow').remove();
  },


  //For the form only, we need an initial initialization
  init : function()
  {
    //Allow the right panel to receive elements
    this.enableWidgetColumns( $( ".widgetColumn" ) );

    //Make the right hand accordion work
    $(document).on('click' , '.btn.stretch90' , function(e){ $(".fieldCategory").collapse('hide')  } );
    //And open the first of the accordion
    $(".btn.stretch90").first().click();

    //Make all the form element close buttons work
    //The assumption is that elements are not nested
    //That the close button's parent has all elements that need removal
    //That the close button's parent's parent is the container
    $(".close").live("click" , function(e){ e.currentTarget.parentElement.parentElement.removeChild(  e.currentTarget.parentElement ); } );

    //Clicking a widget allows the user to customize it
    //TODO : separate out design from run-time behaviour
    $(".widget").live("click" , quintet.customize );

    //Allow accordions to accord
    $( ".accordion" ).accordion( { autoHeight: false } );

    //Enable the UI option fields changing the selected widget
    $('[id^="field."]').live( 'input' , function(e) { quintet.widget.applyOptions( e.srcElement ); });
    $('[id^="field."]').live( 'change' , function(e){  quintet.widget.applyOptions( e.srcElement ); }); //Enable the option option changing..

    //Create the form options, ( encoding done already )
    var o = this.createOptions();
    //Store them under the form
    $(".quintetForm").append( '<input type="hidden" id="formOptions" name="formOptions" value="' + o.data + '">' );
    //Create the UI for the form options
    this.createOptionsUI( 'formOptions' , $(".quintetForm") );
    //Enable the UI option fields changing this form
    $('[id^="form."]').live( 'input' , function(e) {  quintet.widgets.form.applyOptions( e.srcElement ); });
    $('[id^="form."]').live( 'change' , function(e){  quintet.widgets.form.applyOptions( e.srcElement ); }); //Enable the option option changing..
  },
  /* Non generic version of apply options, for form only */
  applyOptions : function( element )
  {
    var newValue  = $(element).is(":checkbox") ? element.checked : element.value;      //Hack for checkboxes
    var o         = quintet.widget.decodeOptions( $(".quintetForm") , "formOptions" ); // Note that we do not use the standard 'options'
    var attribute = element.id.split(".")[1];

    o[attribute] = newValue;
    quintet.widgets.form.apply( o );
  },

  /* Add columns on the right if required ( check the form column count ), enable any new new columns */
  normalizeMissingColumns : function( queryResult , columnCount , columns )
  {
    while( columns.length < columnCount )
    {
      queryResult.append( '<td class="widgetColumn ui-sortable ui-droppable" style="width:49%;vertical-align: top;"><div class="killmenow">&nbsp;</td>' );
      columns = queryResult.find(".widgetColumn");
    }
    this.enableWidgetColumns( $(".killmenow").parent() );      
  },

  /* Take columns on the right that are no longer required if we reduced the column count of the form */
  /* Move the content of these columns to the column to the left */
  normalizeObsoleteColumns : function( queryResult , columnCount , columns )
  {
    while( columns.length > columnCount )
    {
      var from = queryResult.children().last();

      queryResult.children().last().prev().append( from.children() );

      from.remove();

      columns = queryResult.find(".widgetColumn");
    }
  },

  /* Take a row, normalize,we assume this only got called for a row with widgetColumns */
  normalizeContentRow : function( queryResult , columnCount )
  {
    var columns = queryResult.find(".widgetColumn");
    
    //Do we need more columns ?
    if( columnCount > columns.length )
      this.normalizeMissingColumns( queryResult , columnCount , columns );

    //Do need less columns ? , this will need some merging
    if( columnCount < columns.length )
      this.normalizeObsoleteColumns( queryResult , columnCount , columns );
  },
  
  //In case we add new content rows, we need to adjust columns,
  //We keep the logic in quintet.forms.js
  reApply : function ()
  {
    //Get the options and go apply
    var o = quintet.widget.decodeOptions( $('.quintetForm') , "formOptions" );
    this.apply( o );
  },

  apply : function( o )
  {
    var i;
    //Encode options in case they changed
    o.data = quintet.widget.encodeOptions( o );
    //Get all rows with columns
    var rows = $('.contentRow').has('.widgetColumn');
    //Normalize those columns
    for( i = 0 ; i < rows.length ; i++ )
      this.normalizeContentRow( rows.eq(i) , o.columns );
    //Size those columns
    $(".widgetColumn").css( "width" , ( Math.floor( 100 / o.columns ) - 1 ) + "%" );
    //Size the section rows
    $(".quintetForm td[colspan]").attr( "colspan" , o.columns );

    //Store the new options
    $(".quintetForm #formOptions").replaceWith( $('<input type="hidden" id="formOptions" name="formOptions" value="' + o.data + '">') );
  }
};