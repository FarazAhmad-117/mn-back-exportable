import { Product, ProductVariation } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteImage } from "../utils/deleteImage.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";
import { SubCategory } from "../models/subcategory.model.js";
import { imagePathToUrl } from "../utils/ImageHelpers.js";






export const verifyProductSlug = asyncHandler(async(req,res)=>{
    const {slug} = req.params;
    if(!slug || slug.trim() === ""){
        throw new ApiError(400,'Must Give a Slug');
    }
    const product = await Product.findOne({slug});
    if(!product){
        res.status(200).json(
            new ApiResponse(200,{
                available:true
            },
            "Yes the slug you are looking for is available"
            )
        )
        return;
    }
    res.status(200).json(
        new ApiResponse(
            200,{
                available:false
            },
            "No the slug you are looking for is not available"
        )
    )
})



// TODO: Add Varification Layer After it Please

// POST: /api/v1/products/create
export const createProduct = asyncHandler(async(req,res)=>{
    const {title='',metaDescription='',shortDescription='', name, slug, description, price, comparePrice=null, quantity=0,isActive=false,sellingOutOfStock = false,category=null,subcategory = null , videoUrl='' } = req.body;
    // Getting Image Urls from images
    // const imagePaths = Array.from(req.files?.images?.map(img=>img.path));
    const imagePaths = req.files.images?.map(img => {
        return imagePathToUrl(img.path);
        // const imagePath = img.path.replace('public', ''); 
        // return `${process.env.SERVER_URI}/${imagePath.replace(/\\/g, '/')}`; 
    });
    const deleteLocalImages = ()=>{
        imagePaths?.map(m=>{
            deleteImage(m);
        })
    }   


    // Checking if all details are there
    if([name,slug,description,price].some(field=>field?.trim() === "") || !name || !description || !slug || !price){
        deleteLocalImages();
        throw new ApiError(400,"Name, Slug, Price and Description are must Required Fields");
    }


    const existedProduct = await Product.findOne({
        $or:[{slug},{name}]
    });
    if(existedProduct){
        deleteLocalImages();
        throw new ApiError(409,"A Product with this name already exists")
    }

    let catVerif;
    if(category !== undefined && category.trim() !== "" && category.length > 0){
        catVerif =await Category.findOne({
            slug:category
        });
        if(!catVerif){
            // deleteUploadedImages();
            deleteLocalImages();
            throw new ApiError(400,'The category is Invalid');
        }
    }
    let subCatrVerif;
    if( subcategory !== undefined && subcategory.trim() !== ""){
        subCatrVerif = await SubCategory.findOne({
            slug:subcategory
        });
        if(!subCatrVerif){
            // deleteUploadedImages();
            deleteLocalImages();
            throw new ApiError(400,'The subcategory is Invalid');
        }
    }

    // Creating new Product
    const product = await Product.create({
        title,
        metaDescription,
        name,
        slug,
        shortDescription,
        description,
        price,
        comparePrice,
        isActive,
        imageUrls:imagePaths,
        quantity,
        category:catVerif._id,
        subCategory:subCatrVerif._id,
        sellingOutOfStock,
        videoUrl
    });

    if(!product){
        throw new ApiError(500,"Could not create A new Product in Database")
    }

    res
    .status(201)
    .json(new ApiResponse(
        201,
        {product},
        "Product Created Successfully"
    ))
});

// A controller to update the product;
export const updateProduct = asyncHandler(async(req,res)=>{
    const {title='',metaDescription='',shortDescription='', name, slug, description, price, comparePrice=null, quantity=0,isActive=false,sellingOutOfStock = false,category=null,subcategory = null , videoUrl='',id,imageUrls} = req.body;
    // Getting Image Urls from images
    // const imagePaths = Array.from(req.files?.images?.map(img=>img.path));
    const imagePaths = req.files.images?.map(img => {
        return imagePathToUrl(img.path);
        // const imagePath = img.path.replace('public', ''); 
        // return `${process.env.SERVER_URI}/${imagePath.replace(/\\/g, '/')}`; 
    });
    const deleteLocalImages = ()=>{
        imagePaths?.map(m=>{
            deleteImage(m);
        })
    }
    if([id,name,title,price].some(fld=>fld.trim() === "") || !id || !name || !title || !price){
        deleteLocalImages();
        throw new ApiError(400,'Id, Name, Title and Price must be provided.');
    }   
    const existingProduct =  await Product.findOne({_id:id});
    if(!existingProduct){
        deleteLocalImages();
        throw new ApiError(400,"A Product with this id does not exists on database.");
    }

    let catVerif;
    if(category !== undefined && category.trim() !== "" && category.length > 0){
        catVerif =await Category.findOne({
            slug:category
        });
        if(!catVerif){
            // deleteUploadedImages();
            deleteLocalImages();
            throw new ApiError(400,'The category is Invalid');
        }
    }
    let subCatrVerif;
    if( subcategory !== undefined && subcategory.trim() !== ""){
        subCatrVerif = await SubCategory.findOne({
            slug:subcategory
        });
        if(!subCatrVerif){
            // deleteUploadedImages();
            deleteLocalImages();
            throw new ApiError(400,'The subcategory is Invalid');
        }
    }

    // Update the product fields
    existingProduct.title = title;
    existingProduct.metaDescription = metaDescription;
    existingProduct.shortDescription = shortDescription;
    existingProduct.name = name;
    existingProduct.slug = slug;
    existingProduct.description = description;
    existingProduct.price = price;
    existingProduct.comparePrice = comparePrice;
    existingProduct.quantity = quantity;
    existingProduct.isActive = isActive;
    existingProduct.sellingOutOfStock = sellingOutOfStock;
    existingProduct.category = catVerif._id;
    existingProduct.subCategory = subCatrVerif._id;
    existingProduct.videoUrl = videoUrl;
    if(imagePaths){
        if(Array.isArray(imageUrls) && imageUrls.length > 0){
            existingProduct.imageUrls = [...imageUrls,...imagePaths];
        }else{
            existingProduct.imageUrls = [imageUrls,...imagePaths];
        }
    }else if(Array.isArray(imageUrls) && imageUrls.length > 0){
        existingProduct.imageUrls = [...imageUrls];
    }else{
        existingProduct.imageUrls = imageUrls;
    }

    // Save the updated product
    const updatedProduct = await existingProduct.save({new:true});

    if(!updatedProduct){
        deleteLocalImages();
        throw new ApiError(500,"Could not update the product in database.");
    }

    // Return the updated product
    res.status(200).json(new ApiResponse(200,{product: updatedProduct},'Product Updated Successfully'));

})



export const getProductBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    // Find the product by slug
    const product = await Product.aggregate([
        { $match: { slug } },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id', 
                as: 'category_slug' 
            }
        },
        {
            $lookup: {
                from: 'subcategories', 
                localField: 'subCategory',
                foreignField: '_id',
                as: 'subcategory_slug' 
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                metaDescription: 1,
                name: 1,
                slug: 1,
                shortDescription: 1,
                description: 1,
                price: 1,
                comparePrice: 1,
                category: 1,
                subCategory: 1,
                sellingOutOfStock: 1,
                isActive: 1,
                videoUrl: 1,
                imageUrls: 1,
                imageIds: 1,
                quantity: 1,
                createdAt: 1,
                updatedAt: 1,
                category_slug: {
                    $map: {
                        input: '$category_slug',
                        as: 'cat',
                        in: '$$cat.slug'
                    }
                },
                subcategory_slug: {
                    $map: {
                        input: '$subcategory_slug',
                        as: 'subcat',
                        in: '$$subcat.slug'
                    }
                }
            }
        }
    ]);

    // Find variations by productId
    const variations = await ProductVariation.find({ productId: product[0]?._id })

    // If product is not found, throw 404 error
    if (!product.length) {
        throw new ApiError(404, 'Product not found');
    }

    // Return the product details
    res.status(200).json(new ApiResponse(
        200,
        { product: {...product[0],variations} }, // Assuming the result is a single product object
        "Product details retrieved successfully"
    ));
});

// Controller to get all products by a query keyword
export const getProductsByKeyword = asyncHandler(async (req, res) => {
    const { keyword, page = 1, limit = 10 } = req.query;

    // If no keyword provided, return error
    if (!keyword) {
        throw new ApiError(400, 'Keyword is required');
    }

    // Calculate skip value based on page number and limit
    const skip = (page - 1) * limit;

    // Find products containing the keyword in their name or description
    const products = await Product.find({
        $or: [
            { name: { $regex: keyword, $options: 'i' } }, // Case-insensitive search in name
            { title: { $regex: keyword, $options: 'i' } }, // Case-insensitive search in title
            { description: { $regex: keyword, $options: 'i' } } // Case-insensitive search in description
        ]
    })
    .skip(skip) // Apply skip
    .limit(limit) // Apply limit
    .select("-variations -imageIds");

    // Count total number of products matching the keyword (for pagination)
    const totalResults = await Product.countDocuments({
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { title: { $regex: keyword, $options: 'i' } }, 
            { description: { $regex: keyword, $options: 'i' } }
        ]
    });

    // Return the products with pagination information
    res.status(200).json(new ApiResponse(
        200,
        {
            products,
            currentResults:products.length,
            totalResults,
            totalPages: Math.ceil(totalResults / limit),
            currentPage: page,
            limit,
            keyword
        },
        "Products retrieved successfully"
    ));
});






// Controller to create a product Variation

// TODO: Add Varification Layer

export const createProductVariation = asyncHandler(async(req,res)=>{
    const {color,size = 'None',stock=0,price,productId} = req.body;

    // const imagePaths = Array.from(req.files?.map(img=>img.path));
    const imagePaths = req.files.images?.map(img => {
        return imagePathToUrl(img.path);
        // const imagePath = img.path.replace('public\\', ''); 
        // return `${process.env.SERVER_URI}/${imagePath.replace(/\\/g, '/')}`; 
    });
    const deleteLocalImages = ()=>{
        imagePaths?.map(m=>{
            deleteImage(m);
        })
    }

    if([color,price,productId].some(field=>field?.trim() === '') || !color || !price || !productId){
        deleteLocalImages();
        throw new ApiError(400,'ProductId, Color And Price are all required');
    }

    const product = await Product.findById(productId);
    if(!product){
        deleteLocalImages();
        throw new ApiError(404,'Such Product Does Not Exists!');
    }

    // Uploading Images on cloud
    // const imageUrls = [];
    // const imageIds = [];
    // const uploadedImages = await Promise.all(
    //     imagePaths.map(async (img) => uploadOnCloud(img))
    // );
    // uploadedImages.forEach((image) => {
    //     imageUrls.push(image.url);
    //     imageIds.push(image.public_id);
    // })
    
    // if(!imagePaths.length || !imageIds.length || imageIds.length !== imagePaths.length){
    //     deleteLocalImages();
    //     throw new ApiError(500,"Error Uploading Images");
    // }
    // deleteLocalImages();

    // Now creating the variation 
    const variation  = await ProductVariation.create({
        productId:product._id,
        color,
        images:imagePaths || [],
        // imageIds,
        size,
        stock,
        price
    });

    if(!variation){
        throw new ApiError(500,'There was an Error Creating A Variation in Database.')
    }

    res
    .status(201)
    .json(new ApiResponse(
        201,
        {variation},
        'Variation created Successfully!'
    ))

}) 



// Controller to fetch all products
// export const getAllProducts = asyncHandler(async (req, res) => {
//     const {page,limit} = req.body;
//     // Fetch all products
//     const products = await Product.find();

//     // If no products found, return 404 error
//     if (!products || products.length === 0) {
//         throw new ApiError(404, 'No products found');
//     }

//     // Return the products
//     res.status(200).json(new ApiResponse(
//         200,
//         { products },
//         'Products retrieved successfully'
//     ));
// });
export const getAllProducts = asyncHandler(async (req, res) => {
    // Parse query parameters for pagination
    const { page , limit} = req.params;

    // Calculate the skip value based on the page and limit
    const skip = (page - 1) * limit;

    // Fetch products for the current page using pagination
    const products = await Product.find()
        .skip(skip)
        .limit(limit);

    // If no products found for the current page, return 404 error
    if (!products || products.length === 0) {
        throw new ApiError(404, 'No products found for this page');
    }

    // Count total number of products in the database
    const totalProducts = await Product.countDocuments();

    // Calculate total number of pages based on total products and limit
    const totalPages = Math.ceil(totalProducts / limit);

    // Return the products along with pagination metadata
    res.status(200).json(new ApiResponse(
        200,
        {
            products,
            totalPages,
            currentPage: page,
            totalProducts,
            limit
        },
        'Products retrieved successfully'
    ));
});



// Controller to delete a product by slug
export const deleteProductBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const toBeDeleted = await Product.find({slug});
    if(!toBeDeleted){
        throw new ApiError(404,'Such Product Was Not Found');
    }

    if(toBeDeleted.videoId){
        const deleteVid = await deleteFromCloud(toBeDeleted.videoId);
        if(!deleteVid){
            throw new ApiError(500,'Could not delete Video from Cloudinary');
        }
    }
    // First deleting cloud images;
    const deletedImageIds = await Promise.all(
        toBeDeleted[0]?.imageIds.map(async (imageId) => {
            try {
                await deleteFromCloud(imageId); 
                return imageId; 
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error.message);
                return null;
            }
        })
    );
    const deleted =  await deleteAllProductVariationsByProductId(toBeDeleted[0]._id);
    if(!deleted){
        throw new ApiError(500,'Could not delete Variations');
    }

    // Find the product by slug and delete it
    const deletedProduct = await Product.findOneAndDelete({ slug });

    // If product is not found, throw 404 error
    if (!deletedProduct) {
        throw new ApiError(500, 'Product could not be deleted');
    }

    // Return success response
    res.status(200).json(new ApiResponse(
        200,
        { deletedProduct },
        'Product deleted successfully'
    ));
});



export const deleteProductVariationById = asyncHandler(async (req, res) => {
    const { variationId } = req.params;

    const variation = await ProductVariation.findById(variationId);

    if (!variation) {
        throw new ApiError(404, 'Product variation not found');
    }

    const deletedImageIds = await Promise.all(
        variation.imageIds.map(async (imageId) => {
            try {
                await deleteFromCloud(imageId); 
                return imageId; 
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error.message);
                return null; 
            }
        })
    );

    const successfullyDeletedImageIds = deletedImageIds.filter((id) => id !== null);

    const deletedVariation = await ProductVariation.findByIdAndDelete(variationId);

    if (!deletedVariation) {
        throw new ApiError(500, 'Product variation could not be deleted');
    }

    res.status(200).json(new ApiResponse(
        200,
        { deletedVariation, successfullyDeletedImageIds },
        'Product variation deleted successfully'
    ));
});



// Controller to delete all product variations of a product by its ID
export const deleteAllProductVariationsByProductId = async (productId) => {
    // Find all product variations of the product
    const variations = await ProductVariation.find({ productId });
    // If no variations found, return
    if (!variations || variations.length === 0) {
        return 1;
    }

    // Iterate through each variation
    for (const variation of variations) {
        // First delete cloud images associated with the variation
        await Promise.all(
            variation.imageIds.map(async (imageId) => {
                try {
                    await deleteFromCloud(imageId); // Assuming deleteFromCloud is your Cloudinary delete function
                } catch (error) {
                    console.error('Error deleting image from Cloudinary:', error.message);
                }
            })
        );

        // Delete the product variation from the database
        await ProductVariation.findByIdAndDelete(variation._id);
    }
    return 1;
}

// A Get function to take keywords
export const findKeywordOptions = asyncHandler(async (req, res) => {
    const { initials } = req.body;

    // Fetch products matching the initial words, limited to 8 results
    const products = await Product.find({
        $or: [
            { name: { $regex: '^' + initials, $options: 'i' } }, // Case-insensitive search in name
            { title: { $regex: '^' + initials, $options: 'i' } } // Case-insensitive search in title
        ]
    }).select('name title').limit(8);

    // Extract keywords from fetched products
    let keywords = [];
    products.forEach(product => {
        keywords.push(product.name.toLowerCase(), product.title.toLowerCase());
    });

    // Deduplicate keywords
    const uniqueKeywords = [...new Set(keywords)];

    // Sort keywords by exactness of match
    const sortedKeywords = uniqueKeywords.sort((a, b) => {
        // Compare lengths of the matched strings
        const lengthDiff = a.length - b.length;
        if (lengthDiff !== 0) {
            return lengthDiff; // Shorter strings come first
        }
        // If lengths are equal, compare lexicographically
        return a.localeCompare(b);
    });

    // Return sorted keyword options
    res.status(200).json({ options: sortedKeywords });
});


// Get Products By search Key

export const getProductsBySearchKey = asyncHandler(async(req,res)=>{
    const {searchKey} = req.params;
    if(!searchKey || searchKey.trim() === ''){
        return new ApiError(400,'Please Enter a valid search Key');
    }
    const products = await Product.find({
        $or: [
            { name: { $regex: searchKey, $options: 'i' } }, // Case-insensitive regex search for name
            { title: { $regex: searchKey, $options: 'i' } }, // Case-insensitive regex search for title
        ]
    });

    // Send the products found as the response
    res.status(200).json(new ApiResponse(
        200,
        { products },
        'Products retrieved successfully'
    ));
})















