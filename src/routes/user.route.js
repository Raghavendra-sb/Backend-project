//hamnae controoler bana diya phar vo kab run hoga kisi na kisi url hit hoga tab run hoga  
// us url kae liyae sare kae sare user routes yaha pe honge
import { Router } from "express";//express ka router import kiya
import {registerUser} from "../controllers/user.controller.js";//user.controller.js sae registerUser import kiya    


const router = Router();//router ka object banaya Router sae

router.route("/register").post(registerUser)//post method sae registerUser ko call kiya
export default router;//router export kiya