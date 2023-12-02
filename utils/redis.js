//  Redis database connection for caching system

import { createClient } from "redis";
import { promisify } from "util";

class RedisClient {
	/**
	 * Create new istance of redis server and display
	 * in he console on error or connect
	 */
	constructor() {
		this.client = createClient();
		this.hasClientConnect = true;
		this.client.on("error", (err) => {
			console.log(`Redis has failed to connect: ${err}`);
			this.hasClientConnect = false;
		});
		this.client.on("connect", () => {
			console.log("Redis client is connected");
			this.hasClientConnect = true;
		});
	}
	/**
	 *
	 * @returns {boolean} true when connected or false when not
	 */
	isAlive() {
		return this.hasClientConnect;
	}
	/**
	 *
	 * @param {string} key
	 * @returns {string | Object}the value of a key saved in redis
	 */
	async get(key) {
		return promisify(this.client.GET).bind(this.client)(key);
	}
	/**
	 * Sore new key in the redis server
	 * @param {string} key
	 * @param {string} value
	 * @param {seconds} duration
	 */
	async set(key, value, duration) {
		await promisify(this.client.SETEX).bind(this.client)(
			key,
			duration,
			value
		);
	}
	async del(key) {
		await promisify(this.client.DEL).bind(this.client)(key);
	}
}

export const redisClient = new RedisClient();

export default redisClient;
