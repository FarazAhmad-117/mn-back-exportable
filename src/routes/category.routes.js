import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createCategory, deleteCategoryBySlugOrId, getAllActiveCategories, getAllCategories, getAllCategoryNamesAndSlugs, getCategoryAndSubCategoryNamesAndSlugs, getDetailedCategoryBySlug, updatecategory } from "../controllers/category.controller.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { addProductToSpecialCategory, createSpecialCategory, getAllProductsBySpecialCategorySlug, getAllSpecialCategories, removeProductFromSpecialCategory, updateSpecialCategory } from "../controllers/specialCategory.controller.js";

const router = Router();

// MAJOR API LAYER: "/api/v1/category"


// TODO: ADD VERIFICATION LAYER
router.route("/create").post(
    upload.fields([
        {
            name:'image',
            maxCount:1
        }
    ]),
    createCategory
);

router.route("/create-sp").post(
    upload.fields([
        {
            name:'image',
            maxCount:1
        }
    ]),
    createSpecialCategory
);

//UPDATE CATEGORY
router.route("/update").put(
    upload.fields([
        {
            name:'image',
            maxCount:1
        }
    ]),
    updatecategory
);

router.route("/update-sp").put(
    upload.fields([
        {
            name:'image',
            maxCount:1
        }
    ]),
    updateSpecialCategory
);

// DELETE CATEGORY
router.route("/delete/:slugOrId").delete(deleteCategoryBySlugOrId);

// Get Detailed Category by Slug
router.route("/get/:slug").get(getDetailedCategoryBySlug);

// Get All Categories
router.route("/get-all").get(getAllCategories);

// Get All Active Categories for sidebar etc;
router.route("/get-all-active").get(getAllActiveCategories);

// Get all category Names and slugs
router.route("/get-cat-names-and-slug").get(getAllCategoryNamesAndSlugs);


router.route("/get-maincat-names-and-slug").get(getCategoryAndSubCategoryNamesAndSlugs);

// To get details of all special categories
router.route('/getspecial').get(getAllSpecialCategories);

// To ADD A Product to special Category
router.route("/add-prod-spec").put(addProductToSpecialCategory);

// TO GET ALL PRODUCTS OF SPECIAL CATEGORY BY SLUG
router.route("/get-products-in-special-cat/:slug").get(getAllProductsBySpecialCategorySlug);

// To REMOVE A Product FROM special Category
router.route("/delete-prod-spec").put(removeProductFromSpecialCategory);


export default router;

