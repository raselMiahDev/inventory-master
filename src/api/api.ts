import {Router} from "express";
import depoRouter from "../modules/depo/depo.routes";
import productRouter from "../modules/product/product.routes";
import authRouter from "../modules/auth/auth.routes";
import inventoryRouter from "../modules/inventory/inventory.routes";
import salesRouter from "../modules/sale/sale.routes"
import transferRoutes from "../modules/transfer/transfer.routes";


const router =  Router();

router.use("/auth",authRouter)
router.use("/depots",depoRouter);
router.use("/products",productRouter);
router.use("/inventory",inventoryRouter);
router.use("/sales",salesRouter);
router.use("/transfers",transferRoutes)



export default router
