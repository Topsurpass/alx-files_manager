// Redis database connection for our storage of data

import { MongoClient } from "mongodb";

class DBClient {
	/**
	 * Connect to mongodb database on every instance of DBClient
	 */
	constructor() {
		const host = process.env.DB_HOST || "localhost";
		const port = process.env.DB_PORT || 27017;
		const database = process.env.DB_DATABASE || "files_manager";
		const url = `mongodb://${host}:${port}/${database}`;
		this.client = new MongoClient(url, { useUnifiedTopology: true });
		this.client.connect();
	}
	/**
	 * CHeck if database is connected
	 * @returns {boolean}
	 */
	isAlive() {
		return this.client.topology.isConnected();
	}
	/**
	 * Count number of documents(rows) in users collection(table)
	 * @returns {Object}
	 */
	async nbUsers() {
		return this.client.db().collection("users").countDocuments();
	}
	/**
	 * Count number of documents(rows) in files collection(table)
	 * @returns {Object}
	 */
	async nbFiles() {
		return this.client.db().collection("files").countDocuments();
	}
}

export const dbClient = new DBClient();
export default dbClient;
