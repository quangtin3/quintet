/*
 * js.js : all logic pertaining to extending standard js objects
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 * jslint plusplus: true, sloppy: true, vars: true, white: true, maxerr: 10000 
 */

/* Whatever you do, do not extend Array ( boo ) */

'use strict';

String.prototype.condense = function()
{
	return this.split(" ").join("");
};

String.prototype.capitalizeFirst = function()
{
	return ( this.charAt(0).toUpperCase() + this.slice(1) );
};