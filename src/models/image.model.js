import mongoose from 'mongoose';

const imageSchema = mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true
    },
    alt:{
        type:String
    },
    url:{
        type:String,
        required:true
    },
    thumbnailUrl:{
        type:String,
        required: true
    }
});

export const Image = mongoose.model('Image',imageSchema);


