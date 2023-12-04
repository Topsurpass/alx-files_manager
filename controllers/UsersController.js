/**
 * This contains the class that holds methods for the POST /user endpoint
 */
import sha1 from "sha1";
import dbClient from "../utils/db";

export default class UsersController {
	// Sign-up new user
	static async postNew(req, res) {
		const email = req.body ? req.body.email : null;
		const pwd = req.body ? req.body.password : null;
		if (!email) {
			res.status(400).json({
				error: "Missing email",
			});
			return;
		}
		if (!pwd) {
			res.status(400).json({
				error: "Missing password",
			});
			return;
		}
		const existingUser = await (
			await dbClient.usersCollection()
		).findOne({ email });
		if (existingUser) {
			res.status(400).json({
				error: "Already exist",
			});
			return;
		}

		const insertNewUser = await (
			await dbClient.usersCollection()
		).insertOne({
			email: email,
			password: sha1(pwd),
		});
		const userId = insertNewUser.insertedId.toString();
		res.status(201).json({
			email: email,
			id: userId,
		});
	}

	// Retrieve the user based on the token used
	static async getMe(req, res) {
		// const token = req.headers["x-token"];
		// if (!token) {
		// 	return res.status(401).json({
		// 		error: "Unathorized",
		// 	});
		// }
		// const userId = await redisClient.get(`auth_${token}`);
		// if (!userId) {
		// 	return res.status(401).json({
		// 		error: "Unathorized",
		// 	});
		// }
		// const user = await (
		// 	await dbClient.usersCollection()
		// ).findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

		// if (!user) {
		// 	return res.status(401).json({
		// 		error: "Unauthorized",
		// 	});
        // }
        const user = res.locoals.user;
		res.status(200).json({
            id: user._id,
            email: user.email,
		});
	}
}
