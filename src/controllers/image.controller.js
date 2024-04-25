import { asyncHandler } from "../utils/asyncHandler.js";
import path  from 'path';
import { findImagesInFolder, makeUrlFromImagePath } from "../utils/ImageHelpers.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createImage = async(imagePath,name,alt)=>{
    // Takes path of the image and in return sends the image id
    const extension = path.extname(imagePath);
    const newFileName = `${name}${extension}`;
    const imageData = await fs.promises.readFile(imagePath);
    await fs.promises.writeFile(newFileName, imageData);
    await fs.promises.unlink(imagePath);

    // Converts the name into slug
}


export const validImageName = asyncHandler(async(req,res)=>{
    // Take name from req body and if it exists either in database or in folder just reply  with false 
    // If it exists in folder but not in database delete it
    // If it exists in database and not in folder give a server error and give details
    // If it does not exists any where just say true
})

export const imageExists = asyncHandler(async(req,res)=>{
    // Take id from req
    // Locate folder using the node path module and then check for existance of this file
    // I can also make database query
    // If exists return true else false
})


export const deleteUploadedImage = asyncHandler(async(req,res)=>{
    // Try to locate image using path and if it exists delete it using filestream module
    // Also delete it from the database
})


export const updateImage = asyncHandler(async(req,res)=>{
    // Take the id from req body
    // Take the other details
    // verify the image existance and update the things that are available
    // If there comes any image within the multer update it by first deleteing old one in server and then replacing it with the 
    // new one 
    // Make database query and update all the incomming elements
})


export const getImage = asyncHandler(async(req,res)=>{
    // I am not going to use it but may be in future I will need it
})


export const getAllImagesOnServer = asyncHandler(async(req,res)=>{
    const {page=1,totalImages=30} = req.params;
    const images = findImagesInFolder();
    const startIndex = (page - 1) * totalImages;
    const endIndex = page * totalImages;
    const totalPages =Math.ceil( images.length / totalImages);
    const paginatedImages = images.slice(startIndex, endIndex);

    const imageUrls = paginatedImages.map(img=>{
        return makeUrlFromImagePath(img);
    })
    res.status(200).json(new ApiResponse(
        200,
        { images: imageUrls,totalPages },
        'Images found successfully'
    ));
})




