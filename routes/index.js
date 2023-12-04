import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";
import AuthController from "../controllers/AuthController";

/**
 * This contains all the routes of my application.
 * It's created in a function so as to be able to be called in
 * the server module.
 */

function allAppRoutes(server) {
	server.get("/status", AppController.getStatus);
    server.get("/stats", AppController.getStats);
    server.post("/users", UsersController.postNew);
    server.get("/connect", AuthController.getConnect);
    server.get("/disconnect", AuthController.getDisconnect);
    server.get("/users/me", UsersController.getMe);
}
export default allAppRoutes;
