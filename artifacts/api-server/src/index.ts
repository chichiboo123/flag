import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];
const parsedPort = rawPort ? Number(rawPort) : Number.NaN;
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3000;

if (rawPort && (Number.isNaN(parsedPort) || parsedPort <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
