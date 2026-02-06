import jwt from "jsonwebtoken";

export const signToken = (payload: { userId: any; role: any; depoId: any })=>
    jwt.sign(payload,process.env.JWT_SECRET!,{expiresIn:"1d"});
