/* eslint-disable no-console */
import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
import { envVars } from "./app/config/env";

let server: Server;

// 👉 Handle sync errors first
process.on("uncaughtException", (err) => {
  console.log("Uncaught exception detected...server shutting down", err);
  process.exit(1); // No need to call server.close(), server might not even be running
});

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);

    console.log("MongoDB connected successfully");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
};

// 👉 Start the server
startServer();

// 👉 Handle async promise rejections
process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection detected...server shutting down", err);
  if (server) {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(1);
    });
  }
});

// 👉 Graceful shutdown on termination signals
process.on("SIGTERM", () => {
  console.log("SIGTERM received...server shutting down");
  if (server) {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received...server shutting down");
  if (server) {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }
});
