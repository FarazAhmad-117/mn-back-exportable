import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, 
    },
    slug: {
        type: String,
        required: true,
        unique: true, 
    },
    description: {
        type: String,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    image: { 
        type: String,
    },
    imageId: { 
        type: String,
    },
    isActive: { 
        type: Boolean,
        default: true,
    }
},{timestamps:true});

subCategorySchema.plugin(mongooseAggregatePaginate);

export const SubCategory = mongoose.model('SubCategory', subCategorySchema);


