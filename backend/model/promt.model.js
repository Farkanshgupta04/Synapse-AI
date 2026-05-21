import mongoose from "mongoose"; 

const promtSchema=new mongoose.Schema({
   userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
   },
   role:{
    type:String,
    enum:["user","assisstant"],
    required:true,
   },
   content:{
    type:String,
      required:true,
   },
   image: {
      type: String,
      default: null,
   },
   images: {
     type: [String],
     default: [],
   },
   createdAt:{
    type:Date,
    default:Date.now,
   }
    
});

promtSchema.index({ userId: 1, createdAt: -1 });
promtSchema.index({ userId: 1, role: 1, createdAt: -1 });

export const Promt = mongoose.model("Promt",promtSchema);