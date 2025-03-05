//hamnae controoler bana diya phar vo kab run hoga kisi na kisi url hit hoga tab run hoga  
// us url kae liyae sare kae sare user routes yaha pe honge
import { Router } from "express";//express ka router import kiya
import {changePassword, getCurrentUser, getUserChannelProfile, getUserWatchHistory, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage} from "../controllers/user.controller.js";//user.controller.js sae registerUser import kiya    
import {upload} from "../middlewares/multer.middleware.js";//2nd step continuation of user.controller.js
import {loginUser} from "../controllers/user.controller.js";//loginUser import kiya 
import {verifyJWT} from "../middlewares/auth.middleware.js";//verifyJWT import kiya
import {logoutUser} from "../controllers/user.controller.js";//logoutUser import kiya
import {refreshAccessToken} from "../controllers/user.controller.js";//refreshToken import kiya
import { Cursor } from "mongoose";
const router =  Router();//router ka object banaya Router sae
//initally 
// router.route("/register").post(registerUser)//post method sae registerUser ko call kiya
// export default router;//router export kiya

//modified by adding the middleware upload
//before calling the registerUser we need to call the upload middleware
//jate huhae mujsae milkae jana
router.route("/register").post(
    upload.fields([
              {
                   name:"avatar",
                     maxCount:1
              }
              ,
              {
                     name:"cover",
                        maxCount:1 
              }
    ])
    ,
    registerUser
)
//step 2 done go back to controller.js


//router for login
router.route("/login").post(loginUser)

//secured route
router.route("/logout").post(verifyJWT,logoutUser) //verifyJWT middleware is called before the logoutUser
router.route("/refresh-token").post(refreshAccessToken)//refreshToken is called
router.route("/change-password").post(verifyJWT,changePassword);
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/Watch-history").get(verifyJWT,getUserWatchHistory)
export default router;