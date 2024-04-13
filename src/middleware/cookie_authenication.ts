import express, { NextFunction } from "express";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import cookieParser from "cookie-parser";
const router = express();
router.use(express.json());
router.use(cookieParser());
const users = [
  {
    username: "lucky",
    password: "mounish@dhakshit",
  },
];
const sessions: any = {};

router.get("/get", (req: Request, res: Response) => {
  const sessionToken = req.cookies["session_token"];
  if (
    !sessionToken ||
    !sessions[sessionToken] ||
    sessions[sessionToken].expireAt < Date.now()
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  //------checking cookie existing is valid or not---means---its checking the user deatails with cokkie details which are stored in session side---
  const currentUser = users.find(
    (user) => user.username === sessions[sessionToken].username
  );
  res.send(`Hello authorized user ${currentUser}`);
});

router.post("/login", (req: Request, res: Response) => {
  const user = users.find((user) => req.body.username === user.username);
  if (!user || req.body.password !== user.password) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }
  const sessionToken = uuidv4();
  const expiresAt = new Date().setFullYear(new Date().getFullYear() + 1);
  sessions[sessionToken] = {
    expiresAt,
    username: user.username,
  };
  res.cookie("session_token", sessionToken, { maxAge: expiresAt });
  res.send(user);
});

export default router;
