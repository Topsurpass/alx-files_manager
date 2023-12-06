import dbClient from "../utils/db";
import mongoDBCore from "mongodb/lib/core";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const NULL_ID = Buffer.alloc(24, "0").toString("utf-8");
const MAX_FILES_PER_PAGE = 20;
const isValidId = (id) => {
	const size = 24;
	let i = 0;
	const charRanges = [
		[48, 57], // 0 - 9
		[97, 102], // a - f
		[65, 70], // A - F
	];
	if (typeof id !== "string" || id.length !== size) {
		return false;
	}
	while (i < size) {
		const c = id[i];
		const code = c.charCodeAt(0);

		if (!charRanges.some((range) => code >= range[0] && code <= range[1])) {
			return false;
		}
		i += 1;
	}
	return true;
};

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
			).findOne({
				_id: new mongoDBCore.BSON.ObjectId(
					isValidId(parentId) ? parentId : NULL_ID
				),
			});
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
	/**
	 *  Retrieve the file document based on the ID
	 * @param {string} req
	 * @param {string} res
	 * @returns  file document
	 */
	static async getShow(req, res) {
		const { user } = req;
		const id = req.params ? req.params.id : NULL_ID;
		const userId = user._id.toString();
		const file = await (
			await dbClient.filesCollection()
		).findOne({
			_id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
			userId: new mongoDBCore.BSON.ObjectId(
				isValidId(userId) ? userId : NULL_ID
			),
		});
		if (!file) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(200).json({
			id,
			userId,
			name: file.name,
			type: file.type,
			isPublic: file.isPublic,
			parentId: file.parentId === "0" ? 0 : file.parentId.toString(),
		});
	}
	/**
	 * Retrieve all users file documents for a specific parentId and with pagination.
	 * Retrieve user file with parentId 0 if parentId is not specified
	 * @param {string} req
	 * @param {string} res
	 * @Return array of objects
	 */
	static async getIndex(req, res) {
		const { user } = req;
		const { parentId = 0, page = 0 } = req.query;

		const files = await (
			await dbClient.filesCollection()
		)
			.aggregate([
				{
					$match: {
						userId: user._id,
						parentId:
							parentId === "0"
								? parentId
								: new mongoDBCore.BSON.ObjectId(
										isValidId(parentId) ? parentId : NULL_ID
								  )
								? parentId
								: NULL_ID,
					},
				},
				{
					$sort: { _id: -1 },
				},
				{
					$skip: page * MAX_FILES_PER_PAGE,
				},
				{
					$limit: MAX_FILES_PER_PAGE,
				},
			])
			.toArray();
		res.status(200).json(files);
	}
	/**
	 * Set file isPublic key to true on the file document based on the ID
	 * @param {string} req
	 * @param {string} res
	 * @returns
	 */
	static async putPublish(req, res) {
		const { user } = req;
		const { id } = req.params;
		const userId = user._id.toString();
		const fileFilter = {
			_id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
			userId: new mongoDBCore.BSON.ObjectId(
				isValidId(userId) ? userId : NULL_ID
			),
		};
		const file = await (
			await dbClient.filesCollection()
		).findOne(fileFilter);

		if (!file) {
			res.status(404).json({ error: "Not found" });
			return;
		}
		await (
			await dbClient.filesCollection()
		).updateOne(fileFilter, { $set: { isPublic: true } });
		res.status(200).json({
			id,
			userId,
			name: file.name,
			type: file.type,
			isPublic: true,
			parentId: file.parentId === "0" ? 0 : file.parentId.toString(),
		});
	}
	/**
	 * Set file isPublic attribute to false on the file document based on the ID
	 * @param {string} req
	 * @param {string} res
	 * @returns
	 */
	static async putUnpublish(req, res) {
		const { user } = req;
		const { id } = req.params;
		const userId = user._id.toString();
		const findFile = {
			_id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
			userId: new mongoDBCore.BSON.ObjectId(
				isValidId(userId) ? userId : NULL_ID
			),
		};
		const file = await (await dbClient.filesCollection()).findOne(findFile);

		if (!file) {
			res.status(404).json({ error: "Not found" });
			return;
		}
		await (
			await dbClient.filesCollection()
		).updateOne(findFile, { $set: { isPublic: false } });
		res.status(200).json({
			id,
			userId,
			name: file.name,
			type: file.type,
			isPublic: false,
			parentId: file.parentId === "0" ? 0 : file.parentId.toString(),
		});
	}
}
