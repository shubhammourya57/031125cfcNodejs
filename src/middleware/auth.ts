import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";  
import { Prisma } from "@prisma/client";
interface RequestWithUser extends Request {
    user?: any;
}

export const authenticateToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const authHeader = req.cookies['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET as string, (err:any, user:any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// export const authenticateToken = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     const cookie = req.cookies['token'];
//     const token = cookie && cookie.split(' ')[1];

//     if (!token) return res.sendStatus(401);
//     const existing = await Prisma.user.findUnique({ where: { id: req.user.id } });
//     jwt.verify(token, process.env.JWT_SECRET as string, (err:any, user:any) => {
//         if (err) return res.sendStatus(403);
//         req.user = user;
//         next();
//     });
// };
