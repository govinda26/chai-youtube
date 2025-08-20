import dotenv from "dotenv";
import connectMongo from "./db/db.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

connectMongo()
  .then(() =>
    app.listen(process.env.PORT, () => {
      console.log(`Server running on Port: ${process.env.PORT}`);
    })
  )
  .catch((error) => console.log("Mongo db Connection failed:", error));
