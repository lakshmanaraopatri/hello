import express, { NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";
//import log from "logger";
import cookieParser from "cookie-parser";
const router = express();
router.use(express.json());

////---------------------------------swagger api for documentation-------------------//
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
  apis: ["./src/routes/index.ts"], // assuming your routes are in a directory called "routes"
};
const swagger = swaggerJsdoc(options);
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger));

//-------connecting to data base---------------;
const d = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
});

export const UserDataModel = mongoose.model("luckyyadav", d);
mongoose
  .connect(
    "mongodb+srv://Luckyyadav:Lucky%402002.com@cluster0.ajjqp6b.mongodb.net/luckyyadav"
  )
  .then(() => console.log("mongodb connected......."))
  .catch((er) => console.log(er.message));

router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const newData = new UserDataModel({ name });
    await newData.save();
    res.json(await UserDataModel.find());
    console.log("successfully .......");
  } catch (err) {
    console.log(err);
  }
});

//--------cors--------------
router.use(cors({ origin: "*" }));

//--------------middleware-------;
function helloworld(req: Request, res: Response, next: NextFunction) {
  let a = "hello this lakshman";
  next();
  return a;
}
router.use(helloworld);
router.get("/", async (req, res) => {
  //res.json(await UserDataModel.find());
  res.send(`data is ${helloworld}`);
});

//server side authantication-----cookies-------------------------------------------------------==========
router.use(cookieParser());
// const users = [
//   {
//     username: "lucky",
//     password: "mounish@dhakshit",
//   },
// ];
// const sessions: any = {};

// router.get("/get", (req, res) => {
//   const sessionToken = req.cookies["session_token"];
//   if (!sessionToken) {
//     return res.status(401);
//   }
//   const currentUserSession = sessions[sessionToken];
//   if (!currentUserSession) {
//     return res.status(401);
//   }
//   if (currentUserSession.expireAt < new Date()) {
//     return res.status(401);
//   }
//   //------checking cookie existing is valid or not---means---its checking the user deatails with cokkie details which are stored in session side---
//   const currentUser = users.find(
//     (user) => user.username === currentUserSession.username
//   );
//   console.log("currentUserSession", currentUserSession);
//   res.send(`Hello authorized user ${currentUser}`);
// });

// router.post("/login", (req, res) => {
//   const user = users.find((user) => req.body.username === user.username);
//   if (!user || req.body.password !== user.password) {
//     return res.status(401).json({ error: "Incorrect email or password" });
//   }
//   const sessionToken = uuidv4();
//   const expiresAt = new Date().setFullYear(new Date().getFullYear() + 1);
//   sessions[sessionToken] = {
//     expiresAt,
//     username: user.username,
//   };
//   res.cookie("session_token", sessionToken, { maxAge: expiresAt });
//   res.send(user);
// });

// export default router;

//jwt authenication-------
import jwt, { JwtPayload } from "jsonwebtoken";

const secretKey = "your_secret_key";
interface User {
  id: number;
  username: string;
  password: string;
  email: string;
}

const users: User[] = [];
// Middleware to verify JWT token
function verifyToken(
  req: express.Request,
  res: express.Response,
  next: NextFunction
) {
  const token = req.headers["authorization"] as string;
  if (!token) {
    return res.status(403).json({ message: "Token is missing!" });
  }
}
// jwt.verify(token, secretKey, (err, decoded) => {
//   if (err) {
//     return res.status(401).json({ message: "Token is invalid!" });
//   }
//   req.user = decoded;
//   next();
// });

router.post("/signup", (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required!" });
  }

  const userExists = users.find((u) => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Username already exists!" });
  }

  const newUser = { id: users.length + 1, username, password, email };
  users.push(newUser);
  console.log(users);
  res.status(201).json({ message: "User created successfully!" });
});

router.get("/login", (req: Request, res: Response) => {
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
  } else {
    res.status(401).json({ message: "Invalid credentials!" });
    res.redirect("/signup");
  }
});

// router.listen(3000, () =>
//   console.log(`Server running at http://localhost:${3000}`)
// );

export default router;
