// modules/product/routes/product.routes.ts
import { Router } from 'express';
import {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController,
    deactivateProductController,
    getProductCategoriesController,
    getProductStockSummaryController,
    getProductsWithLowStockController,
    getActiveProductsController
} from './product.controller';
import {authMiddleware} from "../../middlewares/auth.middlewares";
import {roleMiddleware} from "../../middlewares/role.middlewares";
import {UserRole} from "../../enum";


const productRouter = Router();

// All product routes require authentication
productRouter.use(authMiddleware);

// Public product routes (read-only)
productRouter.get('/', getAllProductsController);
productRouter.get('/categories', getProductCategoriesController);
productRouter.get('/active', getActiveProductsController);
productRouter.get('/low-stock', getProductsWithLowStockController);
productRouter.get('/:id', getProductByIdController);
productRouter.get('/:id/stock-summary', getProductStockSummaryController);

// Admin-only routes
productRouter.post('/', roleMiddleware([UserRole.ADMIN]), createProductController);
productRouter.put('/:id', roleMiddleware([UserRole.ADMIN]), updateProductController);
productRouter.delete('/:id', roleMiddleware([UserRole.ADMIN]), deleteProductController);
productRouter.patch('/:id/deactivate', roleMiddleware([UserRole.ADMIN]), deactivateProductController);

export default productRouter;