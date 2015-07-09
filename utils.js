/*
  Check whether given value is null or undefined

  Parameter:
    value - any, the value to check

  Returns:
    boolean, false when the value is null or undefined,
    true otherwise
*/
function no( value ) {
  var undef; // do not trust global undefined, which can be set to a value
  return value === null || value === undef;
}

/*
  Get a default value when given value is null or undefined

  Parameters:
    a - any, the value to check
    b - any, the default value

  Returns:
    any, the default value when the value is null or undefined,
    the value itself otherwise.

  Dependency:
    nada/no.js
*/
function or( a, b ) {
  return no( a )? b: a;
}

/*
  Run the given function and return the result

  This function is useful to create a private scope for the declaration
  of a module:
  var module = privately(function() {
    // private scope
    ...
  });
  as a replacement to the complex Immediately Invoked Function Expression [1]:
  var module = (function(){
    // private scope
    ...
  }());
  or confusing alternatives such as:
  var module = !function() {
    // private scope
    ...
  };
  or even:
  var module = new function() {
    // private scope
    ...
  };

  Parameter:
    func - function(), the function to run, called without arguments

  Returns:
    any, the result of the function called

  Reference:
  [1] Immediately-Invoked Function Expression (IIFE)
  2010-11-15, by Ben Alman
  http://benalman.com
    /news/2010/11/immediately-invoked-function-expression/
*/
function privately( func ) {
  return func();
}

/*
  Run given function for each item in given array,
  including items with null and undefined values

  Parameters:
    array - array, the array to iterate
    callback - function( item, offset ), the callback called at each offset,
               with the item value and current offset provided as arguments.
               If the callback returns true, the iteration is interrupted and
               following items will not be processed.

  Returns:
    boolean, true when the iteration has been interrupted by a callback,
    false otherwise

  Notes:
  * items are processed in ascending order of offset, from 0 to the initial
  length of the array at the time of the call to forEach()
  * in case items are deleted, updated or inserted, the current value of each
  item at the current offset at the time of the call to the callback will be
  provided to the callback
*/
function forEach( array, callback ) {
  var
    isBreak = false,
    i,
    length = array.length;

  for ( i = 0; i < length && !isBreak ; i++ ){
    isBreak = callback( array[ i ], i ) === true;
  }

  return isBreak;
}

/*
  Find the first item that matches given criterion

  Parameters:
    array - array, the list of items to check
    criterion - function( item ), the condition to check,
                called with each item of the array in turn,
                it must return true to select the item and end the search,
                and false otherwise.

  Returns:
    any, the first item for which criterion() returns true,
    or null if no such item is found.
*/
function find( array, criterion ) {
  var result = null;

  forEach( array, function( item ) {
    if ( criterion( item ) ) {
      result = item;
      return true;
    }
  });

  return result;
}

/*
  Wrap a function in a closure that configures given object as context

  Parameters:
    func - function, the function to wrap
    object - object, the object to provide as 'this' for the function

  Returns:
    function, a closure that calls the given function with provided parameters,
    with the given object configured as 'this', and returns the same value.

  Note:
  This function calls the apply() method of the given function, and its
  behavior changes depending on whether the function is in strict mode.

  When the provided function is not in strict mode:

    1) a null argument for context object defaults to the global object
    2) automatic boxing of arguments is performed

    Reference:
    https://developer.mozilla.org/en-US/docs/JavaScript/Reference
      /Functions_and_function_scope/Strict_mode#.22Securing.22_JavaScript
*/
function bind( func, object ) {
  return function() {
    return func.apply( object, arguments );
  };
}

/*
  Define an alias for a (Native prototype) function

  The alias allows to call the function with the context object
  as first argument, followed with regular arguments of the function.

  Example:
    var has = alias( Object.prototype.hasOwnProperty );
    has( object, name ) === object.hasOwnProperty( name ); // true

  Parameter:
    func - function, a method part of the prototype of a Constructor

  Dependency:
    nada/bind.js
*/
function alias( func ) {
  return bind( func.call, func );
}

var hasOwnProperty = alias( Object.prototype.hasOwnProperty );

/*
  Run given function for each property of given object matching the filter,
  skipping inherited properties

  Parameters:
    object - object, the object to iterate
    callback - function( value, name ): boolean, the callback called for each
               property owned by the object (not inherited), with property
               value and name provided as arguments.

  Notes:
    * properties are iterated in no particular order
    * whether properties deleted or added during the iteration are iterated
      or not is unspecified
*/
function forEachProperty( object, callback ) {
  var
    name,
    value;

  for ( name in object ) {
    if ( hasOwnProperty( object, name ) ) {
      value = object[name];
      callback( value, name );
    }
  }
}
