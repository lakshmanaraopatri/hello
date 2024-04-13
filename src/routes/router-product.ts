import express from "express";
import { Request, Response } from "express";
import {
  verifyToken,
  loginUser,
  RegisterUser,
} from "../middleware/jwt_authenication";

const router = express();
router.use(express.json());
router.get("/get", (req: Request, res: Response) => {
  res.send("hellooo");
});
router.post("/signup", RegisterUser);

router.post("/login", loginUser);

router.get("/protected", verifyToken);
router.post("/upload", (req, res) => {});

export default router;
