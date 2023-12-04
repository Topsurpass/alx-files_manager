import { v4 as uuidv4 } from "uuid";
import dbClient from "../utils/db";
import redisClient from "../utils/redis";
import sha1 from "sha1";

export default class AuthController {
	// Sign-in the user by generating a new authentication token
	static async getConnect(req, res) {
		// Check req header for Authentication and verify if user exist
		const authHeader = req.headers.authorization || null;
		if (!authHeader) {
			return res.status(401).json({
				error: "Unauthorized",
			});
		}
		const authCredentials = authHeader.split(" ");
		if (authCredentials.length !== 2 || authCredentials[0] !== "Basic") {
			return res.status(401).json({
				error: "Unauthorized",
			});
		}
		const decodedData = Buffer.from(authCredentials[1], "base64").toString(
			"utf-8"
		);
		const [email, password] = decodedData.split(":");
		const user = await (
			await dbClient.usersCollection()
		).findOne({ email: email });
		if (!user || sha1(password) !== user.password) {
			return res.status(401).json({
				error: "Unauthorized",
			});
		}
		//Save user ID in redis database for 24 hours
		const authToken = uuidv4();
		const redisKey = `auth_${authToken}`;
		await redisClient.set(redisKey, user._id.toString(), 24 * 60 * 60);
		return res.status(200).json({ token: authToken });
	}
	// Sign-out a user by deleting the token
	static async getDisconnect(req, res) {
		const token = req.headers["x-token"];
		const userId = await redisClient.get(token);
		if (!userId) {
			res.status(401).json({
				error: "Unauthorized",
			});
		}
		await redisClient.del(token);
		res.status(204);
	}
}
