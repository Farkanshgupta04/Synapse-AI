import mongoose from "mongoose"; 

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    googleId:{
        type:String,
        default:null
    },
    profilePicture:{
        type:String,
        default:null
    }
    
})

userSchema.index({ firstName: 1, lastName: 1 });

export const User = mongoose.model("User",userSchema);