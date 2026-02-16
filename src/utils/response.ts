import {Response} from "express";

export const sendResponse =<T> (res:Response,responseData:TResponse<T>)=>{
    return{
        statusCode:res.status(responseData.statusCode),
        success:responseData.success,
        message:responseData.message,
        data:responseData.data,
    }
}

interface TResponse<T> {
    statusCode: number;
    success: boolean;
    message?: string;
    data?:T;
}