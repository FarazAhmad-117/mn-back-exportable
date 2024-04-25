import { Router } from "express";
import { createAdmin, createUser, logoutUser, userLogin, verifyAdminLogin } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();


// To Create an admin

router.route("/register-admin").post(createAdmin);

// To create a normal user
router.route("/register").post(createUser);

// To login
router.route("/login").post(userLogin);

// To logout
router.route("/logout").post(
    verifyJWT,
    logoutUser
)

//Temporary For Admin Login
router.route("/admin-login").post(verifyAdminLogin);





export default router;


