import fs from "fs"


export const deleteImage = async(localFilePath)=>{
    try{
        fs.unlinkSync(localFilePath);
    }catch(error){
        console.log("Error Deleting Image",error.message);
    }
}



