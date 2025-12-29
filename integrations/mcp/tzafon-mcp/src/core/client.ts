import dotenv from "dotenv";
import Computer from "tzafon";

dotenv.config();

const client = new Computer({
  apiKey: process.env.TZAFON_API_KEY,
});

export default client;
