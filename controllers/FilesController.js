import dbClient from "../utils/db";
import mongoDBCore from "mongodb/lib/core";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export default class FilesController {
	static async postUpload(req, res) {
		const { name, type, parentId = 0, isPublic = false, data } = req.body;

		// Validate request body
		if (!name) {
			return res.status(400).json({ error: "Missing name" });
		}
		if (!type || !["folder", "file", "image"].includes(type)) {
			return res.status(400).json({ error: "Missing type" });
		}
		if (!data && type != "folder") {
			return res.status(400).json({ error: "Missing data" });
		}
		// Validate folder to put all other files
		if (parentId !== 0) {
			const parentFile = await (
				await dbClient.filesCollection()
			).findOne({ _id: new mongoDBCore.BSON.ObjectId(parentId) });
			if (!parentFile) {
				return res.status(400).json({ error: "Parent not found" });
			}
			if (parentFile.type !== "folder") {
				return res
					.status(400)
					.json({ error: "Parent is not a folder" });
			}
		}
		const { user } = req;
		const userId = user._id.toString();

		const storingFolderPath =
			process.env.FOLDER_PATH || "/tmp/files_manager";
		const localPath = `${storingFolderPath}/${uuidv4()}`;

		const newFile = {
			userId: new mongoDBCore.BSON.ObjectId(userId),
			name,
			type,
			isPublic,
			parentId,
		};

		if (type !== "folder") {
			// Create new folder for the file and write the data to the file
			// and also save in database
			try {
				await fs.promises.access(storingFolderPath);
			} catch {
				await fs.promises.mkdir(storingFolderPath, {
					recursive: true,
				});
			}
			await fs.promises.writeFile(localPath, Buffer.from(data, "base64"));
			newFile.localPath = localPath;
		}
		// If file is folder,  save file in database (Mongobd)
		const folderInsertionId = await (
			await dbClient.filesCollection()
		).insertOne(newFile);

		const fileId = folderInsertionId.insertedId.toString();
		return res.status(201).json({
			id: fileId,
			userId: userId,
			name,
			type,
			isPublic,
			parentId,
		});
	}
}
