//hamnae controoler bana diya phar vo kab run hoga kisi na kisi url hit hoga tab run hoga  
// us url kae liyae sare kae sare user routes yaha pe honge
import { Router } from "express";//express ka router import kiya
import {registerUser} from "../controllers/user.controller.js";//user.controller.js sae registerUser import kiya    
import {upload} from "../middlewares/multer.middleware.js";//2nd step continuation of user.controller.js
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
export default router;