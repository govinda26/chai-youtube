import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectMongo from "./db/db.js";
import { app } from "./app.js";

connectMongo()
  .then(() =>
    app.listen(process.env.PORT, () => {
      console.log(`Server running on Port: ${process.env.PORT}`);
    })
  )
  .catch((error) => console.log("Mongo db Connection failed:", error));
