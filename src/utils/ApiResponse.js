class ApiResponse {
    constructor(statusCode, data, message="Success")
    {
        this.statusCode = statusCode
        this.data=data
        this.message=message
        this.success=statusCode < 400

    }
}
 export {ApiResponse};

// What I Mean by "ApiResponse Wraps It Up for You"
// The ApiResponse class we discussed earlier:

// javascript
// Wrap
// Copy
// class ApiResponse {
//     constructor(statusCode, data, message = "Success") {
//         this.statusCode = statusCode;
//         this.data = data;
//         this.message = message;
//         this.success = statusCode < 400;
//     }
// }
// is like a reusable template. Instead of manually building that JSON every time, you just create an ApiResponse object and let it handle the structure for you. Here’s how it simplifies the same example:

// javascript
// Wrap
// Copy
// app.get('/users', (req, res) => {
//     const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
//     const response = new ApiResponse(200, users);
//     res.status(response.statusCode).json(response);
// });