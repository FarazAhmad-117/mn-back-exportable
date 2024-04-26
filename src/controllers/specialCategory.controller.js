import { Category, SpecialCategory } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteImagefromLocalPath, imagePathToUrl } from "../utils/ImageHelpers.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteImage } from "../utils/deleteImage.js";

export const createSpecialCategory = asyncHandler(async(req,res)=>{
    const { name,slug, description, isActive = false } = req.body;
    let image = "";
    image = imagePathToUrl(req.files?.image[0].path);
    // const imagePath = req.files?.image[0].path.replace('public', '');
    // image = `${process.env.SERVER_URI}/${imagePath.replace(/\\/g, '/')}`; 
    
    if ([name,description,slug].some(field=>field?.trim() === "") ,!name || !description || !slug) {
        deleteImage(req.files?.image[0].path);
        throw new ApiError(400, 'Name,Slug and description are required');
    }
    
    // if(!req.user || req.user?.role !== 'admin'){
    //     deleteFromCloud(image);
    //     throw new ApiError(401,'Unautorized Request. Only Admin can Create Products.');
    // }
    
    const existedCategory =await SpecialCategory.findOne({
        $or:[{name},{slug}]
    });

    if(existedCategory){
        deleteImagefromLocalPath(image)
        throw new ApiError(409,'Such Category Already Exists!');
    }

    // Create the new category
    const category = await SpecialCategory.create({
        name,
        slug,
        image,
        description,
        isActive
    });
    
    // Check if the category was created successfully
    if (!category) {
        deleteImagefromLocalPath(image)
        throw new ApiError(500, 'Failed to create category');
    }

    // Return success response
    res.status(201).json(new ApiResponse(
        201,
        { category },
        'Special Category created successfully'
    ));
})


export const updateSpecialCategory = asyncHandler(async(req,res)=>{
    const {} = req.body;
})


export const updatecategory = asyncHandler(async(req,res)=>{
    // Extract necessary fields from the request body
    const { id , name, slug, description, isActive,imageUrl } = req.body;
    let image = "";
    if(req.files?.image && req.files?.image[0]){
        image = imagePathToUrl(req.files?.image[0].path);
        // const imagePath = req.files?.image[0].path.replace('public', '');
        // image = `${process.env.SERVER_URI}/${imagePath.replace(/\\/g, '/')}`;
    }

    if ([id,name,description,slug].some(field=>field?.trim() === "") ,!name || !description || !slug || !id) {
        deleteImage(req.files?.image[0].path);
        throw new ApiError(400, 'ID, Name, Slug and description are required');
    }

    const existedCategory =await SpecialCategory.findById(id);

    if(!existedCategory){
        throw new ApiError(404,'Such Category Not Found');
    }

    if(!imageUrl || imageUrl.trim() === ''){
        deleteImagefromLocalPath(existedCategory.image);
    }

    const updateCategory = await SpecialCategory.findByIdAndUpdate(
        existedCategory._id,
        {
            name,
            slug,
            description,
            isActive,
            image:imageUrl || image
        },
        {
            new:true
        }
    )
    
    // Check if the category was created successfully
    if (!updateCategory) {
        deleteImagefromLocalPath(image);
        throw new ApiError(500, 'Failed to create category');
    }

    // Return success response
    res.status(200).json(new ApiResponse(
        200,
        { updateCategory },
        'Category updated successfully'
    ));
})


// A controller to get All Special categories
export const getAllSpecialCategories = asyncHandler(async(req,res)=>{
    const categories = await SpecialCategory.find({});
    res.status(200).json(new ApiResponse(
        200,
        { categories },
        'All Special Categories'
    ))
})


// A controller to add a product to a special category
export const addProductToSpecialCategory= asyncHandler(async(req,res)=>{
    const {categoryId , productId} = req.body;

    if(!categoryId || !productId){
        throw new ApiError(400,'Category ID and Product ID are required');
    }

    const existedCategory = await SpecialCategory.findById(categoryId);
    if(!existedCategory){
        throw new ApiError(404,'Such Category Not Found');
    }

    const existedProduct = await Product.findById(productId);
    if(!existedProduct){
        throw new ApiError(404,'Such Product Not Found');
    }
    const updatedCat = await SpecialCategory.findByIdAndUpdate(
        existedCategory._id,
        {
            $addToSet:{
                products:existedProduct._id
            }
        },
        {new:true}
    )
    if(!updatedCat){
        throw new ApiError(500,'Failed to add product to category');
    }
    res.status(200).json(new ApiResponse(
        200,
        { updatedCat },
        'Product added to category successfully'
    ))
})

export const getAllProductsBySpecialCategorySlug = asyncHandler(async(req,res)=>{
    const {slug} = req.params;
    if(!slug || slug.trim() === ''){
        throw new ApiError(400,'Please Enter a valid slug');
    }
    const category = await SpecialCategory.findOne({slug});
    if(!category){
        throw new ApiError(404,'Such Category Not Found');
    }
    const products = await Product.find({_id:{$in:category.products}});
    res.status(200).json(new ApiResponse(
        200,
        { products },
        'Products retrieved successfully'
    ));
})


export const removeProductFromSpecialCategory = asyncHandler(async(req,res)=>{
    const {categoryId , productId} = req.body;
    if(!categoryId || !productId){
        throw new ApiError(400,'Category ID and Product ID are required');
    }
    const existedCategory = await SpecialCategory.findById(categoryId);
    if(!existedCategory){
        throw new ApiError(404,'Such Category Not Found');
    }
    const existedProduct = await Product.findById(productId);
    if(!existedProduct){
        throw new ApiError(404,'Such Product Not Found');
    }
    let productList = existedCategory.products;
    productList = productList.filter(prod => prod != productId);
    const updatedCat = await SpecialCategory.findByIdAndUpdate(
        existedCategory._id,
        {
            products:productList
        },
        {new:true}
    )
    if(!updatedCat){
        throw new ApiError(500,'Failed to remove product from category');
    }
    res.status(200).json(new ApiResponse(
        200,
        { updatedCat },
        'Product removed from category successfully'
    ));
})
