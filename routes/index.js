import AppController from "../controllers/AppController";

/**
 * This contains all the routes of my application.
 * It's created in a function so as to be able to be called in
 * the server module.
 */

function allAppRoutes(server) {
	server.get("/status", AppController.getStatus);
	server.get("/stats", AppController.getStats);
}

export default allAppRoutes;
