import { Request,Response,NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
export const signup = async (req: Request, res: Response, next: NextFunction) => {      
    try {
        const { email, password, name } = req.body;
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    const existing = await prisma.user.findUnique({ where: { email } });
if (existing) return res.status(400).json({ message: "Email already exists" });

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
          return res.json({
      status: 200,
      success: true,
      message: "Signup successfully",
      data: user
    });
    } catch (error) {
        console.error(error);
         return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;   
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        }); 
        if (!user) {
            return res.json({
                status: 404,
                success: false,
                message: "User not found",
            });
        }       
        
        const isPasswordValid = compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.json({
                status: 401,
                success: false,
                message: "Invalid password",
            });
        }
        const sessionId = Math.random().toString(36).substring(2);
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { sessionId },
        });
       const token = jwt.sign(
  { userId: updatedUser.id, email, sessionId },
  process.env.JWT_SECRET as string, 
  { expiresIn: "1h" }
);

        return res.json({
            status: 200,
            success: true,  
            message: "Login successfully",
            data: { updatedUser, token },
        });
    } catch (error) {
        console.error(error);
         return res.json({
             status: 500,
             success: false,
             message: "Internal server error",
         });
    }
}
export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body; 
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.json({
                status: 404,
                success: false,
                message: "User not found",
            });
        }
        await prisma.user.update({
            where: { email },
            data: { sessionId: null },
        });
        return res.json({
            status: 200,
            success: true,
            message: "Logout successfully",
        });
    } catch (error) {
        console.error(error);
        return res.json({
            status: 500,
            success: false,
            message: "Internal server error",
        });
    }
}   