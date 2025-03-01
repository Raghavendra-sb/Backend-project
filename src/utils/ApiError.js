// This is a JavaScript class called ApiError that extends (builds on top of) the built-in Error class. 
// The Error class is what JavaScript uses to represent errors—like when something crashes or fails. 
// By extending it, ApiError inherits all the basic features of Error (like a message and a stack tra0ce) 
// and adds extra properties to make it more useful for specific scenarios, such as handling errors in an API.
class ApiError extends Error
{
    constructor(
        statusCode,
        message="something went wrong",
        errors = [],
        stack= ""

    )
    {
        super(message) //super(message): Calls the parent Error class’s constructor with the message. This sets up the basic error message (e.g., "Not found") that Error already knows how to handle.
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false;
        this.errors=errors

        if(stack)
        {
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}export {ApiError}