import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;

const setup = async () => {
  if (initialized) return;
  await registerRoutes(app);
  initialized = true;
};

export default async function handler(req: any, res: any) {
  if (!initialized) {
    await setup();
  }
  // Vercel serverless function request handler
  app(req, res);
}
