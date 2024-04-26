import { Category } from "../models/category.model.js";
import { SubCategory } from "../models/subcategory.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { imagePathToUrl } from "../utils/ImageHelpers.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteImage } from "../utils/deleteImage.js";



// Controller to create a new category
// TODO: ADD VERIFICATION LATER

export const createSubCategory = asyncHandler(async (req, res) => {
    // Extract necessary fields from the request body
    const { name,slug, description,categoryId, isActive = true } = req.body;
    let image = "";
    image = imagePathToUrl(req.files?.image[0].path);
    // const imagePath = req.files?.image[0].path.replace('public', '');
    // image = `${process.env.SERVER_URI}/${imagePath.replace(/\\/g, '/')}`;

    // Perform validation checks
    if ([name,description,slug].some(field=>field?.trim() === "") ,!name || !description || !slug) {
        deleteImage(req.files?.image[0].path)
        throw new ApiError(400, 'Name,Slug and description are required');
    }
    

    const verifyCat = await Category.findOne({slug:categoryId});
    if(!verifyCat){
        throw new ApiError(400,'Such category does not exists');
    }
    
    const existedSubCat =await SubCategory.findOne({
        $or:[{name},{slug}]
    });

    if(existedSubCat){
        throw new ApiError(409,'Such SubCategory Already Exists!');
    }

    // Create the new category
    const subCategory = await SubCategory.create({
        name,
        slug,
        category:verifyCat._id,
        image,
        description,
        isActive
    });

    // Check if the category was created successfully
    if (!subCategory) {
        throw new ApiError(500, 'Failed to create Subcategory');
    }

    // Return success response
    res.status(201).json(new ApiResponse(
        201,
        { subCategory },
        'SubCategory created successfully'
    ));
});


// UPDATE the subcategory using its id
export const updateSubCategory = asyncHandler(async(req,res)=>{
    const {id,name,slug, description,categorySlug, isActive,imageUrl} = req.body;
    let img = "";
    if(req.files?.image && req.files?.image[0]){
        img = imagePathToUrl(req.files?.image[0].path);
        // const imagePath = req.files?.image[0].path.replace('public', '');
        // img = `${process.env.SERVER_URI}/${imagePath.replace(/\\/g, '/')}`;
    }

    // Perform validation checks
    if ([id,name,description,slug,categorySlug].some(field=>field?.trim() === "") ,!name || !description || !slug || !id || !categorySlug) {
        throw new ApiError(400, 'ID,Name,Slug,Category and description are required');
    }

    const verifyCat = await Category.findOne({slug:categorySlug});
    if(!verifyCat){
        throw new ApiError(400,'Such category does not exists');
    }

    let subCategory;
    // Create the new category
    if(img == "" ){
        // Means user did not send new Image
        subCategory = await SubCategory.findByIdAndUpdate(
            id,
            {
                name,
                slug,
                image:imageUrl,
                category:verifyCat._id,
                description,
                isActive
            },
            {
                new:true
            }
        );
    }else{
        // Means user send a new Image
        subCategory = await SubCategory.findByIdAndUpdate(
            id,
            {
                name,
                slug,
                category:verifyCat._id,
                image:img,
                description,
                isActive
            },
            {
                new:true
            }
        );
    }

    // Check if the category was created successfully
    if (!subCategory) {
        throw new ApiError(500, 'Failed to update subcategory');
    }

    // Return success response
    res.status(200).json(new ApiResponse(
        200,
        { subCategory },
        'SubCategory updated successfully'
    ));
})


// DELETE : SUBCATEGROY BY SLUG OR ID;
export const deleteSubCategoryBySlugOrId = asyncHandler(async(req,res)=>{
    const {slugOrId} = req.params;

    if(!slugOrId){
        throw new ApiError(404,'Slug Or ID must be provided to delete a sub Category');
    }

    const existedSubCat = await SubCategory.findOne({
        $or:[
            {slug:slugOrId},
            {_id:slugOrId}
        ]
    });

    if(!existedSubCat){
        throw new ApiError(404,'Such Subcategory Not Found');
    }
    // const deletedImage =await deleteFromCloud(existedSubCat.imageId);
    // if(!deleteImage){
    //     throw new ApiError(500,'Was Unable to delete Image from Cloud.');
    // }
    
    const deleteSubCat = await SubCategory.findByIdAndDelete(existedSubCat._id);
    
    if(!deleteSubCat){
        throw new ApiError(500,'Was Unable to delete Subcategory');
    }

    res.status(200)
    .json(new ApiResponse(
        200,
        {deleteSubCat},
        'Deleted SubCategory Successfully.'
    ))

})


// Get all subcategories by categoryId or Slug endpoint
export const getSubCategoryByIdOrSlug = asyncHandler(async(req,res)=>{
    const {subCatId} = req.params;
    if(!subCatId || subCatId.trim() === ""){
        throw new ApiError(400,'Must Give an Id Or Slug');
    }
    const subcategory = await SubCategory.findOne({
        slug:subCatId
    });
    if(!subcategory){
        throw new ApiError(404,'Such SubCategory Not Found')
    }

    res
    .status(200)
    .json(new ApiResponse(
        200,
        {
            subcategory
        },
        "SubCategory Found Successfully"
    ))
})


// Get all subcategories by categoryId or Slug endpoint
export const getSubCategoriesByIdOrSlug = asyncHandler(async(req,res)=>{
    const {idOrSlug} = req.body;
    if(!idOrSlug || idOrSlug.trim() === ""){
        throw new ApiError(400,'Must Give an Id Or Slug');
    }
    const category = await Category.findOne({
        $or:[
            {_id:idOrSlug},
            {slug:idOrSlug}
        ]
    });
    if(!category){
        throw new ApiError(404,'Such Category Not Found')
    }

    const subCategories = await SubCategory.find({category:category._id}).select("-imageId");
    if(!subCategories){
        throw new ApiError(404,'There exist no subcategories in this category');
    }
    res
    .status(200)
    .json(new ApiResponse(
        200,
        {
            totalResults:subCategories.length,
            results:subCategories
        },
        "SubCategories Found Successfully"
    ))
})


export const getSubcategoriesByCategoryId = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    // Use aggregation pipeline to directly get name and slug fields for each subcategory
    const subcategories = await Category.aggregate([
        // Match the category with the provided categoryId (slug)
        { $match: { slug: categoryId } },
        // Lookup subcategories associated with the matched category
        {
            $lookup: {
                from: 'subcategories',
                localField: '_id',
                foreignField: 'category',
                as: 'subcategories'
            }
        },
        // Project only the necessary fields (name and slug) for each subcategory
        {
            $project: {
                _id: 0,
                subcategories: { name: 1, slug: 1 }
            }
        }
    ]);

    if (!subcategories.length) {
        // If no subcategories found, return an empty array
        return res.status(200).json([]);
    }

    res.status(200).json(new ApiResponse(
        200,
        {subcategories},
        'SubCategories Found Successfully'
    ));
});










