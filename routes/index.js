import app from "../server";
import AppController from "../controllers/AppController";

/**
 * This contains all the routes of my application
 */

app.get('/status', AppController.getStatus);

app.get("/stats", AppController.getStats);
