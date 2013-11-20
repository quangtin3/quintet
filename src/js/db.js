/*
 * db.js : faking a database with localStorage
 *
 * Copyright 2012 konijn@gmail.com aka Tom Demuyt
 *
 * Licensed under Apache v2.0 http://www.apache.org/licenses/LICENSE-2.0.html
 *
 */

db = {ns: 'db'};

db.store = function(o, params)
{
    //Sanity
    if (!o)
        return;
    //Sanitize params
    params = params || {};
    //Sane type
    var type = o.type || params.type || "universe";
    //Warn on types with wildcards, but dont stop, great power -> great responability
    if (type.indexOf('*') != -1)
        console.log("Types should not contain asterisks", type);
    //get the type container or create one ( from JSON -> object )
    var container = db.getContainer(type);
    //Figure out a key, if any, key should be a property of o
    var key = o.key || params.key
    //assign the object thru a key or just push it
    if (key && o[key])
        container[o[key]] = o;
    else
        container.push(o);
    //store it back into the localdata
    db.setContainer(type, container)
}

//Sometimes you want to keep things tidy
db.setNameSpace = function(ns)
{
    db.ns = ns;
}

db.getContext = function()
{
    return JSON.parse(localStorage[ db.ns ] || "{}");
}

//Neutronic operation, set a container, used by setContainer
//hlc -> high level context
db.getContainer = function(id)
{
    var hlc = db.getContext();
    return (hlc[id] || [])
}

//Atomic operation, set a container
db.setContainer = function(id, o)
{
    var hlc = db.getContext();
    hlc[id] = o
    localStorage[db.ns] = JSON.stringify(hlc);
}

db.query = function(params)
{
    //There is no sanity, this should work with no params
    params = params || {};
    //Consideration: if no type is provided should we give the universe or everything ?
    params.type = params.type || "universe";
    //If no key is provided then we go with everything
    params.key = params.key || "*";
    //keep things tidy to a namespace
    var hlc = db.getContext();
    //Prepare the result container
    var bag = [];
    //Deal with a generic query
    if (params.type == "*")
    {
        for (key in hlc)
        {
            params.type = key;
            bag = bag.concat(db.query(params));
        }
        return bag;
    }
    //So we are not dealing with a generic key
    var container = db.getContainer(params.type);
    //Deal with a generic key
    if (params.key == "*")
    { //This is purposefully different from just returning the container..
        for (key in container)
            bag.push(container[key]);
        return bag;
    }
    //Dealing with a specific key
    for (key in container)
        if (container[key][params.key] == params.value)
            bag.push(container[key]);
    return bag;
}