import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {UserRole} from "../enum";


export interface AuthRequest extends Request {
    user?:{
        userId:string;
        role:UserRole;
        depoId?:string;
    }
}
export const authMiddleware = (req:AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).send('Unauthorized');
    }

    const token = authHeader.split(" ")[1]


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthRequest["user"];
        req.user = decoded;
        next()
    }catch {
        res.status(401).send("Invalid token");
    }
}