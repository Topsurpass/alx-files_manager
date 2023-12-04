import dbClient from "../utils/db";
import redisClient from "../utils/redis";
import mongoDBCore from "mongodb/lib/core";

async function beforeRequest(req, res) {
	const token = req.headers["x-token"];
	if (!token) {
		return res.status(401).json({
			error: "Unathorized",
		});
	}
	const userId = await redisClient.get(`auth_${token}`);
	if (!userId) {
		return res.status(401).json({
			error: "Unathorized",
		});
	}
	const user = await (
		await dbClient.usersCollection()
	).findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

	if (!user) {
		return res.status(401).json({
			error: "Unauthorized",
		});
	}
}

export default beforeRequest;