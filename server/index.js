import { createApp } from "./app.js";
import { apiPort } from "./config.js";

createApp().listen(apiPort, () => console.warn(`API: http://localhost:${apiPort}/api/health`));
