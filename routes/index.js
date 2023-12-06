import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";
import AuthController from "../controllers/AuthController";
import beforeRequest from "../utils/middleware";
import FilesController from "../controllers/FilesController";

/**
 * This contains all the routes of my application.
 * It's created in a function so as to be able to be called in
 * the server module.
 */

function allAppRoutes(server) {
	server.get("/status", AppController.getStatus);
    server.get("/stats", AppController.getStats);
    server.get("/connect", AuthController.getConnect);
    server.get("/disconnect", AuthController.getDisconnect);
    server.post("/users", UsersController.postNew);
    server.get("/users/me", beforeRequest, UsersController.getMe);
    server.post("/files", beforeRequest, FilesController.postUpload);
    
    
}
export default allAppRoutes;
