import { Router } from "express";
import { createSubCategory, deleteSubCategoryBySlugOrId, getSubCategoriesByIdOrSlug, getSubCategoryByIdOrSlug, getSubcategoriesByCategoryId, updateSubCategory } from "../controllers/subcategory.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


// TODO: ADD VERIFICATION LAYER LATER
router.route("/create").post(
    upload.fields([
        {
            name:'image',
            maxCount:1
        }
    ]),
    createSubCategory
);

// UPDATE : SUBCATEGORY BY USING ITS ID
router.route("/update").put(
    upload.fields([
        {
            name:'image',
            maxCount:1
        }
    ]),
    updateSubCategory
)


// DELETE: SUBCATEGORY BY USING ITS ID OR SLUG
router.route("/delete/:slugOrId").delete(deleteSubCategoryBySlugOrId);

// GET SUBCATEGORY BY ID OR SLUG
router.route("/get/:subCatId").get(getSubCategoryByIdOrSlug);

// GET SUBCATEGORIES BY ID OR SLUG OF CATEGORY
router.route("/getbycat").get(getSubCategoriesByIdOrSlug);

// GET SUBCATEGORY NAMES AND SLUGS FOR A CATEGORY
router.route("/get-names-and-slugs/:categoryId").get(getSubcategoriesByCategoryId);




export default router;


