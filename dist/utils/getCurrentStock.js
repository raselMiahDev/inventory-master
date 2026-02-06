"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentStockAgg = void 0;
const mongoose_1 = require("mongoose");
const ladger_model_1 = require("../modules/inventory/ladger.model");
const getCurrentStockAgg = async (depoId, productId) => {
    const result = await ladger_model_1.Ladger.aggregate([
        {
            $match: {
                depoId: new mongoose_1.Types.ObjectId(depoId),
                productId: new mongoose_1.Types.ObjectId(productId)
            }
        },
        {
            $lookup: {
                from: "products", // must be collection name
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $group: {
                _id: null,
                totalKg: {
                    $sum: {
                        $multiply: ["$quantity", "$product.packSize"]
                    }
                }
            }
        }
    ]);
    return result.length ? result[0].totalKg : 0;
};
exports.getCurrentStockAgg = getCurrentStockAgg;
