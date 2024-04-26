import { Category } from "../models/category.model.js";
import { SubCategory } from "../models/subcategory.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteImagefromLocalPath, imagePathToUrl } from "../utils/ImageHelpers.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteImage } from "../utils/deleteImage.js";


// Controller to create a new category
export const createCategory = asyncHandler(async (req, res) => {
    // Extract necessary fields from the request body
    const { name,slug, description, isActive = false } = req.body;
    let image = "";
    image = imagePathToUrl(req.files?.image[0].path);
    // const imagePath = req.files?.image[0].path.replace('public', '');
    // image = `${process.env.SERVER_URI}/${imagePath.replace(/\\/g, '/')}`; 
    

    if ([name,description,slug].some(field=>field?.trim() === "") ,!name || !description || !slug) {
        deleteImage(req.files?.image[0].path);
        throw new ApiError(400, 'Name,Slug and description are required');
    }
    
    
    const existedCategory =await Category.findOne({
        $or:[{name},{slug}]
    });

    if(existedCategory){
        throw new ApiError(409,'Such Category Already Exists!');
    }

    // Create the new category
    const category = await Category.create({
        name,
        slug,
        image,
        description,
        isActive
    });

    // Check if the category was created successfully
    if (!category) {
        throw new ApiError(500, 'Failed to create category');
    }

    // Return success response
    res.status(201).json(new ApiResponse(
        201,
        { category },
        'Category created successfully'
    ));
});


// Todo Change it aproperiately
// Update a category
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
        deleteFromCloud(image);
        throw new ApiError(400, 'ID, Name, Slug and description are required');
    }

    const existedCategory =await Category.findById(id);

    if(!existedCategory){
        throw new ApiError(404,'Such Category Not Found');
    }

    if(!imageUrl || imageUrl.trim() === ''){
        deleteImagefromLocalPath(existedCategory.image);
    }

    const updateCategory = await Category.findByIdAndUpdate(
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
        deleteFromCloud(image);
        throw new ApiError(500, 'Failed to create category');
    }

    // Return success response
    res.status(200).json(new ApiResponse(
        200,
        { updateCategory },
        'Category updated successfully'
    ));
})



// DELETE : A CATEGORY BY SLUG/ID
export const deleteCategoryBySlugOrId = asyncHandler(async(req,res)=>{
    const {slugOrId} = req.params;
    
    if(!slugOrId){
        throw new ApiError(400,'Please send some slug or ID');
    }

    const category = await Category.findOne({
        $or:[
            {slug:slugOrId},
            {_id:slugOrId}
        ]
    });

    if(!category){
        throw new ApiError(404,'Such Category Not Found');
    }

    deleteImagefromLocalPath(category.image);

    const deleted = await Category.findByIdAndDelete(category._id);

    if(!deleted){
        throw new ApiError(500,'Unable to delete Kindly Try Again');
    }

    res.status(200)
    .json(new ApiResponse(
        200,
        {deleted},
        'Category Deleted Successfully'
    ));
})




// getDetailedCategory - Means along with all its subcategories
export const getDetailedCategoryBySlug = asyncHandler(async(req,res)=>{
    const {slug} = req.params;

    const category = await Category.find({slug});
    if(!category){
        throw new ApiError(404, 'Such Category Not Found');
    }
    // Such Category is found now we just need to find all subcategories associated with its _id;
    const subCategories = await SubCategory.find({category:category[0]._id});
    const resultant = category[0]?._doc || {} ;
    res.status(200)
    .json(new ApiResponse(
        200,
        {
            category:{
                ...resultant,
                subCategories
            }
        },
        'Category Details Found Successfully'
    ))

})



// // Controller to get all categories available
// export const getAllCategories = asyncHandler(async (req, res) => {
//     // Fetch all categories from the database
//     const categories = await Category.find();

//     // Check if any categories were found
//     if (!categories || categories.length === 0) {
//         throw new ApiError(404, 'No categories found');
//     }

//     // Return success response with the categories data
//     res.status(200).json(new ApiResponse(
//         200,
//         { categories },
//         'Categories retrieved successfully'
//     ));
// });

export const getAllCategories = asyncHandler(async (req, res) => {
    // Use aggregation pipeline to fetch categories with additional data
    const categories = await Category.aggregate([
        // Stage 1: Match categories (optional, if additional filtering is needed)
        // {
        //     $match: { /* Filter conditions */ }
        // },
        // Stage 2: Lookup subcategories for each category
        {
            $lookup: {
                from: 'subcategories', // Name of the SubCategory collection
                localField: '_id', // Field from the Category collection
                foreignField: 'category', // Field from the SubCategory collection
                as: 'subCategories' // Output array field name
            }
        },
        // Stage 3: Project fields to include in the output
        {
            $project: {
                _id: 1, // Include the category _id
                name: 1, // Include the category name
                slug: 1, // Include the category slug
                image: 1, // Include the category image
                isActive:1,
                description:1,
                subCategories: {
                    $map: { // Map array of subcategories
                        input: '$subCategories',
                        as: 'subCategory',
                        in: {
                            _id: '$$subCategory._id',
                            name: '$$subCategory.name',
                            slug: '$$subCategory.slug',
                            image: '$$subCategory.image'
                        }
                    }
                }
            }
        }
    ]);

    // Check if any categories were found
    if (!categories || categories.length === 0) {
        throw new ApiError(404, 'No categories found');
    }

    // Return success response with the categories data
    res.status(200).json(new ApiResponse(
        200,
        { categories },
        'Categories retrieved successfully'
    ));
});



export const getAllActiveCategories = asyncHandler(async(req,res)=>{
    const categories = await Category.find({isActive:true});

    if(!categories || categories.length === 0){
        throw new ApiError(404, 'No categories were found');
    }

    res.status(200)
    .json(new ApiResponse(
        200,
        {
            result:categories,
            totalResults:categories.length
        },
        'Categories found successfully'
    ));
})



export const getAllCategoryNamesAndSlugs = asyncHandler(async (req, res) => {
    // Fetch all categories from the database
    const categories = await Category.find({}, { name: 1, slug: 1 });

    // Check if any categories were found
    if (!categories || categories.length === 0) {
        throw new ApiError(404, 'No categories found');
    }

    // Return success response with the category names and slugs
    res.status(200).json(new ApiResponse(
        200,
        { categories },
        'Category names and slugs retrieved successfully'
    ));
});


// Controller to get all Category Names and SubCategory names and slugs as well
// export const getCategoryAndSubCategoryNamesAndSlugs = asyncHandler(async(req,res)=>{
//     // Get all top-level categories
//     // const categories = await Category.find({ parentCategory: null });
//     const categoryIds = ['661e8cab305ba7d5fa5240c3','661e8e8c305ba7d5fa5240ce','6620cf90b5d4722a3af2ea2c','6620d041b5d4722a3af2ea31','6620d0f9b5d4722a3af2ea36','6620d154b5d4722a3af2ea3b','6620d19ab5d4722a3af2ea40','6620d265b5d4722a3af2ea45','6620d369b5d4722a3af2ea4a','6620d3cbb5d4722a3af2ea51','6620d5bdb5d4722a3af2ea56','6620d60eb5d4722a3af2ea5b','6620d661b5d4722a3af2ea60',];

//     // const categoriesWithSubCategories = [];

//     const fetchCategoryAndSubCategory = async(categoryId)=>{
//         const category = await Category.find({ _id: { $in: categoryId } }, { name: 1, slug: 1 });
//         const subCats = await SubCategory.find({category:category[0]._id}, { name: 1, slug: 1 });
//         // console.log(category[0]);
//         return {
//             _is:category[0]._id,
//             name:category[0].name,
//             slug:category[0].slug,
//             subCategories:subCats
//         };
//     }

//     let categoriesWithSubCategories = [];
//     const fetchAllCats = async()=>{
//         categoriesWithSubCategories = await categoryIds.map(async cat=>{
//             const data = await fetchCategoryAndSubCategory(cat);
//             return data;
//         })
//         console.log(categoriesWithSubCategories);
//     }
//     await fetchAllCats();


//     res.json(new ApiResponse(
//         200,
//         { categoriesWithSubCategories },
//         'Category and Subcategory data found successfully'
//     ));
// })


export const getCategoryAndSubCategoryNamesAndSlugs = asyncHandler(async(req, res) => {
    const categoryIds = ['661e8cab305ba7d5fa5240c3', '661e8e8c305ba7d5fa5240ce', '6620cf90b5d4722a3af2ea2c', '6620d041b5d4722a3af2ea31', '6620d0f9b5d4722a3af2ea36', '6620d154b5d4722a3af2ea3b', '6620d19ab5d4722a3af2ea40', '6620d265b5d4722a3af2ea45', '6620d369b5d4722a3af2ea4a', '6620d3cbb5d4722a3af2ea51', '6620d5bdb5d4722a3af2ea56', '6620d60eb5d4722a3af2ea5b', '6620d661b5d4722a3af2ea60'];

    const fetchCategoryAndSubCategory = async (categoryId) => {
        const category = await Category.findById(categoryId, { name: 1, slug: 1 });
        const subCategories = await SubCategory.find({ category: categoryId }, { name: 1, slug: 1 });
        return {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            subCategories: subCategories
        };
    };

    const fetchAllCategoriesWithSubCategories = async () => {
        const promises = categoryIds.map(async (categoryId) => {
            return fetchCategoryAndSubCategory(categoryId);
        });
        return Promise.all(promises);
    };

    const categoriesWithSubCategories = await fetchAllCategoriesWithSubCategories();

    res.json(new ApiResponse(
        200,
        { results:categoriesWithSubCategories },
        'Category and Subcategory data found successfully'
    ));
});











