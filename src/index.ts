import express from "express";
import router from "./middleware/mongodb_database";

const app = express();
app.use("/user", router);
app.listen(3000, () =>
  console.log(`Server running at http://localhost:${3000}`)
);
