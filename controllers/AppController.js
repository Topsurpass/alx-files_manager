import { redisClient } from "../utils/redis";
import { dbClient } from "../utils/db";

/**
 * This contains the class that holds methods for the GET /stats and
 * GET /status endpoint
 */

export default class AppController {
	static getStatus(_req, res) {
		res.status(200).json({
			redis: redisClient.isAlive(),
			db: dbClient.isAlive(),
		});
	}
	static async getStats(_req, res) {
		const [countUsers, countFiles] = await Promise.all([
			dbClient.nbUsers(),
			dbClient.nbFiles(),
		]);
		res.status(200).json({
			users: countUsers,
			files: countFiles,
		});
	}
}
