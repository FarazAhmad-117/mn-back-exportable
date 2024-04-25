import { Router } from "express"; 
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload, uploadVideo } from "../middlewares/multer.middleware.js";
import { createProduct, createProductVariation, deleteProductBySlug, findKeywordOptions, getAllProducts, getProductBySlug, getProductsByKeyword, getProductsBySearchKey, updateProduct, verifyProductSlug } from "../controllers/product.controller.js";

const router = Router();


// Connecting different endpoints with different functions

// verifyJWT,    // TODO: Security Layer to be added
router.route("/create").post(
    upload.fields([
        {
            name:'images',
            maxCount:10,
        }
    ]),
    createProduct
);


// This route could be used for upload
// router.route("/create").post(
//     upload.fields([
//         {
//             name:'images',
//             maxCount:1,
//         },
//         {
//             name:'video',
//             maxCount:1
//         }
//     ]),
//     createProduct
// )

// TODO: ADD Verification Layer Lateron!
router.route("/create-var").post(
    upload.array('images'),
    createProductVariation
);


// To get Product by just slug
router.route("/get/:slug").get(getProductBySlug);

// Define route to handle requests for retrieving products by keyword
router.route("/get").get(getProductsByKeyword);

// VERIFY :: THE END POINT TO CHECK FOR STATUS OF SLUG
router.route("/verify-slug/:slug").get(verifyProductSlug);

router.route("/get-all/:page/:limit").get(getAllProducts);


router.route("/delete/:slug").delete(deleteProductBySlug);

router.route("/search").get(getProductsByKeyword);

router.route('/keywords').get(findKeywordOptions);

router.route('/update').put(
    upload.fields([
        {
            name:'images',
            maxCount:10,
        }
    ]),
    updateProduct
);


export default router;

