import * as mongo from 'mongodb';

import { IJob, IPost} from './interfaces';
import { d } from './util';
export let db: mongo.Db = null;

const JOB_COLLECTION = 'instascrape_jobs';

async function connect() {
  db = await mongo.MongoClient.connect('mongodb://localhost:27017/instascrape');
}

/**
 * This fetches stored posts from MongoDB
 *
 * @param tag The hashtag to get posts for
 * @param offset How many posts to skip
 * @param limit How many posts to fetch
 */
export async function getPosts (tag: string, offset: number = 0, limit: number = -1): Promise<Array<IPost>> {
  console.log(d(), 'Getting posts for ', tag);
  if (!db) {
    await connect();
  }
  const collection = db.collection(tag);
  if (limit > 0) {
    return collection.find().skip(offset).limit(limit).sort({'date': -1}).toArray();
  }
  return collection.find().skip(offset).sort({'date': -1}).toArray() as Promise<Array<IPost>>;
}

/**
 * This fetches stored posts containing email addresses
 *
 * This shouldn't be it's own method really but copy paste
 * can be a quick way to get things done when not designing
 * for the future
 *
 * @param tag The hashtag to get posts for
 * @param limit How many posts to get
 */
export async function getPostsWithEmail (tag: string, limit: number = -1) {
  console.log(d(), 'Getting posts for ', tag);
  if (!db) {
    await connect();
  }
  const collection = db.collection(tag);
  if (limit > 0) {
    return collection.find().limit(limit).toArray();
  }
  return collection.find({
    'owner.email': {
      $exists: true
    }
  }).toArray();
}

/**
 * Store fetched posts in MongoDB
 *
 * @param job The job to store posts for, could really be just the hashtag
 * @param posts Array of post objects to store
 */
export async function storePosts(job: IJob, posts: Array<IPost>) {
  console.log(d(), 'Storing posts');
  if (!db) {
    await connect();
  }
  const collection = db.collection(job.name);
  return collection.insertMany(posts.map(p => {
    p._id = p.code;
    return p;
  }));
}

/**
 * Get a stored job and it's state such as cookies and
 * where in the stream it is
 *
 * @param name Job name (an hashtag)
 * @param type Watch or crawl
 */
export async function getJob(name: string, type: 'crawl'|'watch') {
  console.log(d(), 'Getting job object');
  if (!db) {
    await connect();
  }
  const collection = db.collection(JOB_COLLECTION);
  return collection.findOne({
    name: {
      $eq: name
    },
    type: {
      $eq: type
    }
  });
}

/**
 * Get all stored job objects
 */
export async function getJobs() {
  console.log(d(), 'Getting job objects');
  if (!db) {
    await connect();
  }
  const collection = db.collection(JOB_COLLECTION);
  return collection.find().toArray();
}

/**
 * Store the state of a running job
 *
 * @param job The job to store in MongoDB
 */
export async function storeJob(job: IJob) {
  console.log(d(), 'Storing job object');
  const collection = db.collection(JOB_COLLECTION);
  return collection.updateOne({
    name: {
      $eq: job.name
    },
    type: {
      $eq: job.type
    }
  }, job, {
    upsert: true
  });
}