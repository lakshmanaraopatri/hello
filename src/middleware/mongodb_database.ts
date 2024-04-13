import express from "express";
import mongoose from "mongoose";
import cors from "cors";
const router = express();
router.use(express.json());
connectIt();
const d = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
});
router.use(cors({ origin: "*" }));

const UserDataModel = mongoose.model("luckyyadav", d);
async function connectIt() {
  try {
    await mongoose.connect(
      "mongodb+srv://Luckyyadav:Lucky%402002.com@cluster0.ajjqp6b.mongodb.net/luckyyadav"
    );
    console.log("mongodb connected.......");
  } catch (er) {
    console.log(er);
  }
}

router.post("/addname", async (req, res) => {
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

router.get("/data", (req, res) => {
  res.send("hello world");
});

router.get("/getalldata", async (req, res) => {
  res.json(await UserDataModel.find());
});

// app.listen(3000, () =>
//   console.log(`Server running at http://localhost:${3000}`)
// );
export default router;
