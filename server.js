import express from "express";

/**
 * Create my express server listening to port set from env
 * or 5000 as default
 */
const app = express();
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server connected on port ${port}`));

export default app;