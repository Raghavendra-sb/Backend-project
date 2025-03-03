import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username:
        {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true,
        },
        email:
        {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
        },
        fullname:
        {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar:
        {
            
            type: String,//cloudinary URL
            required: true,
            
        },
        coverImage:
        {
            type: String,//cloudinary URL
        }
        ,
        watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video",

        },
    ],
        password:
        {
            type:String,
            required:[true,'Password is required']
        },
        refreshToken:
        {
            type:String,

        }
    }
    , { timestamps: true, })
//ensure that the password is hasshed only if the password is modifies or newly created
userSchema.pre("save",async function (next) {//pre is a middleware which runs before the save method 
    if( !this.isModified("password")) return next();//before saving the password we need to check if the password is modified or not
    this.password= await bcrypt.hash(this.password,10)//if the password is modified then hash the password  and store it in the password field 
    next()//then call the next middleware 
})

//method to check if the password is correct or not
//if the password is correct then it will return true else false
userSchema.methods.isPasswordCorrect = async function (password) {//userSchema.methods: A Mongoose feature to add custom 
// instance methods to documents created from this schema.
   return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = function (){
  return jwt.sign(
    { //payload
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },//this: Refers to the user document calling this method.
    process.env.ACCESS_TOKEN_SECRET,//
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
   )
}
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id:this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
       )
}

export const User = mongoose.model("User",userSchema)  