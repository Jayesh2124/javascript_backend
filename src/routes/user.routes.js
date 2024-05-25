import { Router } from "express";
import { logoutUser, registerUser } from "../controller/user.controller.js";
import { upload} from '../middlewears/multer.middlewear.js';
import { verifyJWT } from "../middlewears/auth.middlewears.js";
const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route('/login').post(

    logoutUser
)

// secured Routes 
router.route('/logout').post(
    verifyJWT,
    logoutUser
)
export default router;