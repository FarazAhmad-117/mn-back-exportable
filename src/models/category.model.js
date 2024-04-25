import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoose, { mongo } from 'mongoose'

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true, 
    },
    description: {
        type: String,
    },
    image: { 
        type: String,
    },
    isActive: {   // Used to determin if it is to be shown at the Category Bar
        type: Boolean,
        default: true,
    },
},{timestamps:true});

categorySchema.plugin(mongooseAggregatePaginate);

export const Category = mongoose.model('Category', categorySchema);


const specialCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true, 
    },
    description: {
        type: String,
    },
    image: { 
        type: String,
    },
    products:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
},{timestamps:true});


export const SpecialCategory = mongoose.model('SpecialCategory',specialCategorySchema);


