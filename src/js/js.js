

/* Whatever you do, do not extend Array ( boo ) */


String.prototype.condense = function()
{
	return this.split(" ").join("");
}

String.prototype.capitalizeFirst = function()
{
	return ( this.charAt(0).toUpperCase() + this.slice(1) );
};