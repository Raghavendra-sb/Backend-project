import mongoose from "mongoose";

const subsciptionSchema = new mongoose.Schema(
    {
        subscriber:
        {
            type:Schema.Types.ObjectId,//one who is subscribing
            ref:"User"
            required:true
        }
        channel:
        {
            type:Schema.Types.ObjectId,//one to whom subscriber is subscribing
            ref:"User"
        }

    }
    ,{timestamps:true})


export const Subsciption = mongoose.model("Subsciption",subsciptionSchema)

