import Computer from "tzafon";

const client = new Computer({
  apiKey: process.env.TZAFON_API_KEY,
});

export default client;
