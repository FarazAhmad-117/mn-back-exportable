
// Create a middleware that take all the images from multer and makes them proper images by uploading them over database

import { createImage } from "../controllers/image.controller";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteImage } from "../utils/deleteImage";




const takeImagesInServer = asyncHandler(async(req,_,next)=>{
    
    const {names,alts} = req.body;

    const imagePaths = req.files.images.map(img => {
        const imagePath = img.path.replace('public\\', ''); 
        return `http://localhost:8000/${imagePath.replace(/\\/g, '/')}`; 
    });
    const deleteLocalImages = ()=>{
        imagePaths.map(m=>{
            deleteImage(m);
        })
    } 

    if(names.length != alts.length || alts.length != imagePaths.length){
        deleteLocalImages();
        throw new ApiError(400, 'Names and Alts are not given for each Image')
    }

    if(imagePaths && imagePaths.length > 0 ){
        const imagesIds = Array.from(imagePaths.map((path,i)=>{
            createImage(path,names[i],alts[i]);
        }));
        req.imageIds = imagesIds;
    }

    next();
})




