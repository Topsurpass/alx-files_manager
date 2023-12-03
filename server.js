import express from "express";
import allAppRoutes from "./routes";

/**
 * Create my express server listening to port set from env
 * or 5000 as default
 */
const app = express();
const port = process.env.PORT || 5000;

allAppRoutes(app);

app.listen(port, () => console.log(`Server connected on port ${port}`));

export default app;