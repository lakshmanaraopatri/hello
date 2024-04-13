import express, { NextFunction } from "express";
import { Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
const router = express();
router.use(express.json());
router.use(cookieParser());

////--------------swagger api for documentation-------------------//
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0", // Specification (optional, defaults to swagger: '2.0')
    info: {
      title: "Sample API",
      version: "1.0.0",
      description: "A sample API",
    },
    servers: [{ api: `http://localhost:${3000}` }] as { api: string }[],
    components: {
      securitySchemas: {
        User: {
          id: "number",
          username: "string",
          password: "string",
          email: "string",
        },
      },
    },
    security: [{ User: [] }],
  },
  // Path to the API docs
  apis: ["./src/middleware/swagger_api_documentation.ts"],
};
const swagger = swaggerJsdoc(options);
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger));
//jwt authenication-------
import jwt from "jsonwebtoken";
const secretKey = "your_secret_key";

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
function verifyToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.headers["authorization"] as string;
  if (!token) {
    return res.status(403).json({ message: "Token is missing!" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token is invalid!" });
    }
    req.user = decoded as User; // Cast decoded token to User type
    next();
  });
}
/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully.
 */
router.post("/signup", (req: express.Request, res: express.Response) => {
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
});
/**
 * @swagger
 * /login:
 *   post:
 *     summary: create a token when login details is existed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: token created successfully.
 */
router.post("/login", (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;

  const user = users.find(
    (u: any) => u.username === username && u.password === password
  );

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
    res.redirect("/signup");
  }
});
/**
 * @swagger
 * /protected:
 *  get:
 *   summary: Verify if the token is correct or incorrect.
 *   responses:
 *     '403':
 *       description: Token is missing.
 *     '401':
 *       description: Token is invalid.
 *     '200':
 *       description: User details are matched successfully. Redirect to the app.
 */

router.get(
  "/protected",
  verifyToken,
  (req: express.Request, res: express.Response) => {
    res.json({ message: "This is protected data!", user: req.user });
  }
);
// router.listen(3000, () =>
//   console.log(`Server running at http://localhost:${3000}`)
// );

export default router;
