import { redisClient } from '../utils/redis';
import { dbClient } from '../utils/db';

/**
 * This contains the class that holds different methods and they get called
 * by specific route endpoint
 */

export default class AppController{
    static getStatus(_req, res) {
        res.status(200).json({
            redis: redisClient.isAlive(),
            db: dbClient.isAlive(),
        })
    }
    static getStats(_req, res) {
        Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
            .then(([countUsers, countFiles]) => {
                res.status(200).json({
                    users: countUsers,
                    files: countFiles
            })
        })
    }
}