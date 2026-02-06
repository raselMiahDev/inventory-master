import {Router} from "express";
import depoRouter from "../modules/depo/depo.routes";
import productRouter from "../modules/product/product.routes";
import authRouter from "../modules/auth/auth.routes";


const router =  Router();

router.use("/auth",authRouter)
router.use("/depots",depoRouter);
router.use("/products",productRouter);




export default router
