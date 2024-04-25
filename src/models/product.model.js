import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const productVariationSchema = new mongoose.Schema({
    productId:{
        type:String,
        require:true
    },
    color: {
        type: String,
        required: true,
    },
    images: [
        {
        type: String,
        required: true,
        },
    ],
    imageIds: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Image'
        },
    ],
    size: {
        type: String,
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
});


export const ProductVariation = mongoose.model('ProductVariation',productVariationSchema);

const productSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    metaDescription : {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase:true,
        unique:true
    },
    shortDescription: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    comparePrice: {
        type: Number,
        default:0,
        min: 0,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Categroy'
    },
    subCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'SubCategroy'
    },
    sellingOutOfStock:{
        type:Boolean,
        default:false
    },
    isActive:{
        type:Boolean,
        default:false
    },
    videoUrl: {
        type:String
    },
    imageUrls: [String],
    // imageIds: [
    //     {
    //         type:mongoose.Schema.Types.ObjectId,
    //         ref:'Image'
    //     }
    // ],
    quantity: {
        type: Number,
        default: 0,
    } 
}, { timestamps: true }); 

productSchema.plugin(mongooseAggregatePaginate);


export const Product = mongoose.model('Product', productSchema);


