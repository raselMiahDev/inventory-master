import {Response,NextFunction} from "express";
import {AuthRequest} from "./auth.middlewares";
import {UserRole} from "../enum";

export const roleMiddleware = (allowedRoles:Array<UserRole>)=>{
    return function(req: AuthRequest, res: Response, next: NextFunction){
        if(!req.user){
            return res.status(403).send("Not authorized");
        }
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({message:"You don't have permission to access this role"});
        }
        next()
    }
}