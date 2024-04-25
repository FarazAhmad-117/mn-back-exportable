import { Router } from "express";
import { getAllImagesOnServer } from "../controllers/image.controller.js";


const router = Router();


router.route("/all-img/:page/:totalImages").get(getAllImagesOnServer);



export default router;

