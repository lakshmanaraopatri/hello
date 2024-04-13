import express, { NextFunction } from "express";
import { Request, Response } from "express";
//import { version } from "../package.json";
const router = express();
router.use(express.json());
//--------------middleware-------;
function helloworld(req: Request, res: Response, next: NextFunction) {
  let a = "hello this lakshman";
  console.log(a);
  res.send(a);
  next();
}
router.use(helloworld);
router.get("/", async (req, res) => {
  //res.json(await UserDataModel.find());
  // res.send("data is ");
});
export default router;
