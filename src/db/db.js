import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectMongo = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(
      `MONGODB Connected on HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`MONGODB CONNECTION FAILED DUE TO: ${error}`);
    process.exit(1);
  }
};

export default connectMongo;
