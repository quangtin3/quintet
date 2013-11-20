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
            id: "form",
            /* These options will get serialized and stored in the backend for actual use */
            createOptions: function()
            {
                var o =
                        {
                            name: "<New Form>",
                            columns: 2,
                            size: "medium", //bootstrap default
                            id: this.id,
                            ref: this.id
                        };
                o.data = quintet.widget.encodeOptions(o);
                return o;
            },
            /* Pretty much standard.. */
            createOptionsUI: function(id, element)
            {
                var o = quintet.widget.decodeOptions(element, "formOptions");

                $("#" + id)[0].innerHTML =
                        quintet.htmlbuilder
                        .clear()
                        //.h3("Basics")
                        .well()
                        .table("paddedStretch")
                        .row("paddedStretch")
                        .cell().label("name")
                        .cell("paddedStretch").textInput("name", o.name)
                        .row("paddedStretch")
                        .cell().label("columns")
                        .cell("paddedStretch").dropdown("columns", "1,2,3").style("width:80px;")
                        .row()
                        .html.replace(/field\./g, 'form.');

                //Init the column size
                $("#form\\.columns").val(o.columns);
            },
            /* Non generic version of apply options, for form only */
            applyOptions: function(element)
            {
                var newValue = $(element).is(":checkbox") ? element.checked : element.value;      //Hack for checkboxes
                var o = quintet.widget.decodeOptions($(".quintetForm"), "formOptions"); // Note that we do not use the standard 'options'
                var attribute = element.id.split(".")[1];

                o[attribute] = newValue;
                quintet.widgets.form.apply(o);
            },
            /* Add columns on the right if required ( check the form column count ), enable any new new columns */
            normalizeMissingColumns: function(queryResult, columnCount, columns)
            {
                while (columns.length < columnCount)
                {
                    queryResult.append('<td class="widgetColumn ui-sortable ui-droppable" style="width:49%;vertical-align: top;"><div class="killmenow">&nbsp;</td>');
                    columns = queryResult.find(".widgetColumn");
                }

                if (quintet.builder)
                    quintet.builder.enableWidgetColumns($(".killmenow").parent());
            },
            /* Take columns on the right that are no longer required if we reduced the column count of the form */
            /* Move the content of these columns to the column to the left */
            normalizeObsoleteColumns: function(queryResult, columnCount, columns)
            {
                while (columns.length > columnCount)
                {
                    var from = queryResult.children().last();

                    queryResult.children().last().prev().append(from.children());

                    from.remove();

                    columns = queryResult.find(".widgetColumn");
                }
            },
            /* Take a row, normalize,we assume this only got called for a row with widgetColumns */
            normalizeContentRow: function(queryResult, columnCount)
            {
                var columns = queryResult.find(".widgetColumn");

                //Do we need more columns ?
                if (columnCount > columns.length)
                    this.normalizeMissingColumns(queryResult, columnCount, columns);

                //Do need less columns ? , this will need some merging
                if (columnCount < columns.length)
                    this.normalizeObsoleteColumns(queryResult, columnCount, columns);
            },
            //In case we add new content rows, we need to adjust columns,
            //We keep the logic in quintet.forms.js
            reApply: function()
            {
                //Get the options and go apply
                var o = quintet.widget.decodeOptions($('.quintetForm'), "formOptions");
                this.apply(o);
            },
            apply: function(o)
            {
                var i;
                //Encode options in case they changed
                o.data = quintet.widget.encodeOptions(o);
                //Get all rows with columns
                var rows = $('.contentRow').has('.widgetColumn');
                //Normalize those columns
                for (i = 0; i < rows.length; i++)
                    this.normalizeContentRow(rows.eq(i), o.columns);
                //Size those columns
                $(".widgetColumn").css("width", (Math.floor(100 / o.columns) - 1) + "%");
                //Size the section rows
                $(".quintetForm td[colspan]").attr("colspan", o.columns);

                //Store the new options
                $(".quintetForm #formOptions").replaceWith($('<input type="hidden" id="formOptions" name="formOptions" value="' + o.data + '">'));
            },
            /* Serialize a form, very simple json structure is derived from 'o'
             |
             |- form(1), contains the options/data for the form ( form name, column count etc. )
             |- name(1), just to make life mildly easier for debugger folks
             |- rows(0..n)
             |- type(1), contains either 'section' or 'widgets'
             |- data(1), only present for widgets, contains options/data for the section
             |- columns(0..n), only present for widget columns, contains the data/options for each child widget, in order
             |- data(1), presents data/options for 1 widget
             */
            serialize: function( )
            {
                var form = $(".quintetForm").first();
                var formOptions = form.find("#formOptions")[0].value
                var rows = form.find(".contentRow");

                var o = {form: formOptions, name: JSON.parse(atob(formOptions)).name, rows: []}

                var widgetColumns, i, section, col, widgets, data;

                for (i = 0; i < rows.length; i++)
                {
                    widgetColumns = rows.eq(i).find(".widgetColumn");
                    if (widgetColumns.length)
                    {
                        section = {type: 'widgets', columns: []}
                        //We could have up to 3 widget columns
                        for (col = 0; col < widgetColumns.length; col++)
                        {
                            section.columns.push({data: []});
                            widgetColumns.eq(col).find("#options").each(function(key, value) {
                                section.columns[col].data.push(value.value)
                            })
                        }
                        o.rows.push(section);
                    }
                    else
                    { //Hackerish, for now rows widget widgets can only be section headers
                        o.rows.push({type: 'section', data: rows.eq(i).find("#options")[0].value});
                    }
                }
                //console.log( o , JSON.stringify( o ) );
                return JSON.stringify(o);
            },
            /* Not sure this belongs here.. This is for testing a form */
            popupTest: function(data)
            {
                //Lets have the same width as the right pane
                var width = $("#rightColumn").width() || 600;
                var w = window.open('testpopup.html', 'name', 'height=600,width=' + width);
                if (window.focus)
                    w.focus()
                return false;
            },
            /* Build a form from serialized data  */
            build: function(data)
            {
                var i, j, e, col, row, form, widgetOptions;
                //Get back to the object
                data = JSON.parse(data);
                //Get the form info
                form = JSON.parse(atob(data.form));
                //Set the title correctly of the window
                document.title = "Quintet [" + form.name + "]";
                //Apply options
                this.apply(form);
                //Parse all the rows
                for (i = 0; i < data.rows.length; i++)
                {
                    row = data.rows[i];
                    if (row.type == "section")
                    {
                        //Add the new section at the bottom of the table, copied from quintet.section.js
                        $(".quintetForm").append(quintet.widgets.section.create(JSON.parse(atob(row.data))));
                    }
                    else
                    {
                        //Same as for section, most of this code was already in quintet.section.js
                        //TODO some refactoring is clearly desirable here.
                        //Add a set of new columns under the section
                        $(".quintetForm").append($('<tr class="contentRow"><td class="widgetColumn" style="vertical-align: top;"><div class="killmenow">&nbsp;</div></td></tr>'));
                        //And do some magic to get new columns
                        quintet.widgets.form.reApply();
                        //make sure the columns have a minimum height, we might drop this..
                        $(".widgetColumn").css("height", "15px");
                        for (j = 0; j < form.columns; j++)
                        {
                            col = row.columns[j];
                            //We need to count backwards.. so we use the little known negative offset feature of eq()
                            e = $(".quintetForm").find(".widgetColumn").eq(j - form.columns);
                            //Loop over all the widgets data, parse, instantiate and add
                            $.each(col.data, function(key, value)
                            {
                                widgetOptions = JSON.parse(atob(value));
                                e.append(quintet.widgets[widgetOptions.id].create(widgetOptions));
                            }
                            );
                        }
                    }
                }
                //Remove the close buttons
                $(".close").remove();
            }

        };