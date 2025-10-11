// /lib/auth.ts (ou /utils/jwt.ts)
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, SECRET, { expiresIn: "7d" }); // valable 7 jours
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
};
