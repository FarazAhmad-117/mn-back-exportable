
import fs from 'fs';
import path  from 'path';


export const deleteImagefromLocalPath = (imageUrl) => {
    // Extract path from URL
    const imagePath = new URL(imageUrl).pathname;

    // Construct full local path by prepending "public/"
    const localImagePath = path.join('public', imagePath);

    // Delete image file
    fs.unlink(localImagePath, (err) => {
        if (err) {
            console.error('Error deleting image:', err);
            return;
        }
        console.log('Image deleted successfully:', localImagePath);
    });
};

export const imagePathToUrl=(imagePath)=>{
    const imageUrl = imagePath.replace('public', '');
    return `${process.env.SERVER_URI}/${imageUrl.replace(/\\/g, '/')}`; 
}

export const findImagesInFolder = (folderPath ='public/pictures') => {
    const imagePaths = [];

    const files = fs.readdirSync(folderPath);

    files.forEach(file => {
        const filePath = path.join(folderPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            imagePaths.push(...findImagesInFolder(filePath));
        } else {
            const extname = path.extname(file).toLowerCase();
            if (extname === '.jpg' || extname === '.jpeg' || extname === '.png' || extname === '.gif' || extname === '.bmp') {
                imagePaths.push(filePath);
            }
        }
    });

    return imagePaths;
};

export const makeUrlFromImagePath = (img) =>{
    const imagePath = img.replace('public\\', ''); 
    return `${process.env.SERVER_URI}/${imagePath.replace(/\\/g, '/').split(' ').map(encodeURIComponent).join('%20')}`; 
}


// A function that make thumbnails and store them into the respective folder

export const makeImageThumbnail = async (imagePath,imageName)=>{
    // Custome Logic to make reduced resolution image

}


