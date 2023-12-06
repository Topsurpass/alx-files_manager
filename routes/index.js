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
	server.get("/files/:id", beforeRequest, FilesController.getShow);
	server.get("/files", beforeRequest, FilesController.getIndex);
	server.put("/files/:id/publish", beforeRequest, FilesController.putPublish);
	server.put(
		"/files/:id/unpublish",
		beforeRequest,
		FilesController.putUnpublish
	);
}
export default allAppRoutes;
