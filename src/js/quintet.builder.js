/*
 * quintet.builder.js : all logic pertaining to building logic, all logic not re-usable for displaying forms
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 * jslint plusplus: true, sloppy: true, vars: true, white: true, maxerr: 10000 
 */

//Hax0rz, this is not really a widget, it does not have create for example but uses init!!

'use strict';

quintet.builder = 
{

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

    //Enable the UI option fields changing the selected widget
    $('[id^="field."]').live( 'input' , function(e) { quintet.widget.applyOptions( e.srcElement ); });
    $('[id^="field."]').live( 'change' , function(e){  quintet.widget.applyOptions( e.srcElement ); }); //Enable the option option changing..

    //Create the form options, ( encoding done already )
    var o = quintet.widgets.form.createOptions();
    //Store them under the form
    $(".quintetForm").append( '<input type="hidden" id="formOptions" name="formOptions" value="' + o.data + '">' );
    //Create the UI for the form options
    quintet.widgets.form.createOptionsUI( 'formOptions' , $(".quintetForm") );
    //Enable the UI option fields changing this form
    $('[id^="form."]').live( 'input' , function(e) {  quintet.widgets.form.applyOptions( e.srcElement ); });
    $('[id^="form."]').live( 'change' , function(e){  quintet.widgets.form.applyOptions( e.srcElement ); }); //Enable the option option changing..

    //Enable the test button on the form tab
    $("#testButton").click
    (
      function(e)
      {
        localStorage.testForm = quintet.widgets.form.serialize();
        quintet.widgets.form.popupTest();
      } 
    );

  },

};