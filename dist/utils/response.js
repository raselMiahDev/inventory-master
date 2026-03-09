"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, responseData) => {
    return {
        statusCode: res.status(responseData.statusCode),
        success: responseData.success,
        message: responseData.message,
        data: responseData.data,
    };
};
exports.sendResponse = sendResponse;
