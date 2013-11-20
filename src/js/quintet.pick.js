/*
 * quintet.pick.js : all logic pertaining to picklists
 * 'extends' : quintet.singletextfield
 * 'extends' : http://code.google.com/p/jquery-ui-picklist/
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
            id: "pick",
            /* Mandatory : all widgets must have a createOptions */
            /* These options will get serialized and stored in the backend for actual use */
            createOptions: function()
            {
                var counter = $("." + this.id).length + 1;
                var o = quintet.widgets.line.createOptions(); //<-- Lean on line
                o.label = "List " + counter;
                o.hint = '';
                o.chosen = '';
                o.choices = '';
                o.sourceLabel = 'Options';
                o.targetLabel = 'Chosen';
                o.size = 7;
                o.required = false;
                o.id = this.id;
                o.ref = this.id + counter;
                return o;
            },
            //Really, I am expecting the id to be
            //+1 for innerHTML
            createOptionsUI: function(id, element)
            {

                var o = quintet.widget.decodeOptions(element);

                $("#" + id)[0].innerHTML =
                        quintet.htmlbuilder
                        .clear()
                        .h3("Basics")
                        .well()
                        .table()
                        .row()
                        .cell().label("label")
                        .cell("paddedStretch").textInput("label", o.label)
                        .row()
                        .cell().label("default")
                        .cell("paddedStretch").textInput("value", o.value)
                        .row()
                        .cell().label("size")
                        .cell("paddedStretch").textInput("size", o.size)
                        .row()
                        .table()
                        .row()
                        .cell().label("sourceLabel")
                        .cell("paddedStretch").textInput("sourceLabel", o.sourceLabel)
                        .row()
                        .cell().label("targetLabel")
                        .cell("paddedStretch").textInput("targetLabel", o.targetLabel)
                        .row()
                        .table("stretch")
                        .row()
                        .cell("paddedStretch").colspan(2).label("hint").textArea("hint", o.hint).stretch()
                        .row()
                        .cell("paddedStretch").colspan(2).label("choices").textArea("choices", o.choices).stretch()
                        .row()
                        .cell("paddedStretch").colspan(2).label("chosen").textArea("chosen", o.choices).stretch()
                        .row()
                        .table("stretch")
                        .row("stretch")
                        .cell().fontSelector("font")
                        .cell().dropdown("size", "x-small,small,medium,large,x-large").style("width:130px") //sizeSelector("size") x-small,small,medium,large,x-large
                        .row()
                        .cell().colspan(2)
                        .checkbox("bold", o.bold).text("&nbsp;")
                        .checkbox("italic", o.italic).text("&nbsp;")
                        .checkbox("underline", o.underline).text("&nbsp;")
                        .h3("Value")
                        .well()
                        .table()
                        .row()
                        .cell().checkbox("required", o.required)
                        .html;

                //For comments, see quintet.singletextfield.js
                $('#field\\.dummy\\.font').fontPickerRegios({
                    defaultFont: 'Helvetica Neue',
                    callbackFunc: function(fontName)
                    {
                        quintet.widget.applyOptions($('#field\\.font').val(fontName)[0]);
                    },
                    selid: 'field\\.dummy\\.font'
                });

                //Init the font size
                $("#field\\.size").val(o.size);

                //Stretch the choices and chosen textarea
                $("#field\\.choices").attr("rows", 12)
                $("#field\\.chosen").attr("rows", 12)

                //Build the link from the option field back to the widget!
                quintet.widget.current = o.ref;
            },
            /* Mandatory : all widgets must have a create */
            /* This is what the drag helper function calls, magic will place then the helper in the sortable form */
            create: function(o /*options*/)
            {
                //get options or create new options
                //this gets messed up, hence the go-around for the original self
                if (!o || (o instanceof jQuery.Event))
                    o = quintet.widgets.pick.createOptions();

                //use the style options of line
                quintet.widgets.line.styleOptions(o);

                //Rationalize size
                o.size = o.size * 1;
                if (isNaN(Math.floor(o.size)))
                    o.size = 7;
                if (o.size < 1 || o.size > 15) //<- Arbitrary value, w00t !!
                    o.size = 7;

                o.data = quintet.widget.encodeOptions(o);

                //Return the element
                return $(sprintf('<div id="%(ref)s">%(_closeButton)s' +
                        '<input type="hidden" id="options" name="options" value=\'%(data)s\'>' +
                        '<div class="%(id)s widget">' +
                        '<label style="%(_style)s">%(_isRequired)s<span %(_labelColor)s >%(label)s</span></label>' +
                        '<select multiple="multiple" " id="actual_%(ref)s"></select>' +
                        '<span class="formHint" %(_hintColor)s>%(hint)s</span>' +
                        '</div>' +
                        '</div>', o)
                        );
            },
            //Lets just hope that reinits are not too bad
            //When cloning this, consider grepping for postCreate
            postCreate: function(o)
            {
                var i, list, choicesCount;
                //Set up the items
                o._items = [];
                //Loop over the choices to fill up _items
                list = o.choices.split("\n");
                choicesCount = list.length;
                for (i = 0; i < list.length; i++)
                    o._items.push({value: i /*list[i]*/, label: list[i], selected: false});
                //Now do the chosen items ( index starting from the count of possible choices )
                list = o.chosen.split("\n");
                for (i = 0; i < list.length; i++)
                    o._items.push({value: choicesCount + i /*list[i]*/, label: list[i], selected: true});

                //Initialize the widget
                $("#actual_" + o.ref).pickList
                        (
                                {
                                    sourceListLabel: o.sourceLabel,
                                    targetListLabel: o.targetLabel,
                                    items: o._items,
                                    sortAttribute: "value",
                                }
                        );

                //Set the height
                var itemHeight = $(".pickList_listItem").height();
                if (itemHeight)
                    $(".pickList_list").height(o.size * itemHeight)

                //Stop dragging on the picklist itself
                $(".pickList_list").mousedown(function(event) {
                    event.stopImmediatePropagation();
                });
            }
        };