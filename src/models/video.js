import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const videoSchema = new mongoose.Schema({
    VideoFile:{   //Cloudinary file
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    descriptions:{
        type:String,
        required:true
    },
    durations:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0 
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }


},
{
    timestamps:true
});

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video",videoSchema);