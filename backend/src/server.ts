import { createServer } from "http";
import app from "./app";

import { initializeSocket } from "./shared/socket";
import { env } from "./config/env.config";
const httpServer = createServer(app);
initializeSocket(httpServer);
// Main function to start the server
async function main() {
  const server = httpServer.listen(Number(env.PORT), "0.0.0.0", () => {
    console.log(
      "Server is running on port ==>",
      `http://localhost:${Number(env.PORT)}`,
    );
  });

  // Graceful shutdown function
  const exitHandler = (err?: any) => {
    if (err) console.error("Unhandled error:", err);
    if (server) {
      server.close(() => {
        console.log("Server closed");
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  // Handle uncaught exceptions and unhandled promise rejections
  process.on("uncaughtException", exitHandler);
  process.on("unhandledRejection", exitHandler);
}

// Start the server
main();

export default app;
