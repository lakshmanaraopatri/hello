import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const router = express();
router.use(express.json());
router.use(cookieParser());

interface User {
  id: number;
  username: string;
  password: string;
}

const users: User[] = [];

// Extending Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Middleware to verify JWT token
export function verifyToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.headers["authorization"] as string;
  if (!token) {
    return res.status(403).json({ message: "Token is missing!" });
  }
  const secretKey = "your_secret_key";

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token is invalid!" });
    }
    req.user = decoded as User;
    next();
  });
}
export function loginUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const { username, password } = req.body;

  const user = users.find(
    (u: any) => u.username === username && u.password === password
  );
  const secretKey = "your_secret_key";
  if (user) {
    const token = jwt.sign(
      { id: user.id, username: user.username },
      secretKey,
      { expiresIn: "30m" }
    );
    res.json({ token });
    console.log(token);
  } else {
    res.status(401).json({ message: "Invalid credentials!" });
  }

  res.json({ message: "This is protected data!", user: req.user });
}

export function RegisterUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required!" });
  }

  const userExists = users.find((u) => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Username already exists!" });
  }

  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);

  res.status(201).json({ message: "User created successfully!" });
  console.log(users);
}
export default router;
