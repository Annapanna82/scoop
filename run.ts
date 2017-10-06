import { escape } from 'querystring';
import * as _ from 'lodash';
import fetch, { Headers } from 'node-fetch';
import * as mongo from 'mongodb';
import { db, getJob, storeJob, storePosts } from './db';
import { d } from './util';
import { getAjaxHeaders, parseAndStoreHeaders } from './header';

import { IQueryRequest, IOptions, IJob, IPageInfo, IRequest, IUser, IPost } from './interfaces';


interface ITimer {
  name: string;
  type: string;
  timer?: NodeJS.Timer;
  job?: IJob;
  startTime: number;
}
let timers: Array<ITimer> = [];

/**
 * Find a timer or create a new one if it doesn't exist
 * 
 * @param name the job name to fetch
 * @param type crawl or watch
 */
async function findTimer (name: string, type: 'crawl'|'watch') {
  let timer = timers.find(t => t.name === name && t.type === type);
  if (!timer) {
    timer = {
      name: name,
      type: type,
      startTime: Date.now()
    };
  }
  if (!timer.job) {
    const job = await getJob(name, type);
    if (job) {
      timer.job = job;
    } else {
      timer.job = {
        name: name,
        type: type,
        seenPosts: 0
      };
    }
  }

  return timer;
}

export function startTimer(opts) {
  return runOnInterval(opts);
}

export function getTimers() {
  
  return timers;
}

export function stopTimer(name: string, type: string) {
  const timer = timers.find(t => t.name === name && t.type === type);
  timers = timers.filter(t => t !== timer);
  if (timer && timer.timer) {
    clearInterval(timer.timer);
  }
}

async function fetchFromQuery(job: IJob) {
  console.log(job.info.end_cursor);
  const response = await fetch(`https://www.instagram.com/graphql/query/?query_id=17875800862117404&variables=${escape(`{"tag_name":"${job.name}","first":5,"after":"${job.info.end_cursor}"}`)}`, {
    headers: getAjaxHeaders(job)
  });
  const json = JSON.parse(await response.text()) as IQueryRequest;
  parseAndStoreHeaders(job, response.headers);
  const tags = json.data.hashtag.edge_hashtag_to_media.edges;
  job.info= json.data.hashtag.edge_hashtag_to_media.page_info;
  return tags.map(t => t.node.shortcode);
}

function fetchBlob(url, tag) {
  console.log(d(), `fetching blob: ${url}`)
  return fetch(`${url}?tagged=${tag}&__a=1`);
}

function fetchBlobs(urls: Array<string>, tag) {
  console.log(d(), 'fetching blobs');
  return Promise.all(urls.map(u => fetchBlob(u, tag)))
    .then(blobs => Promise.all(blobs.map(b => b.text())));
}

function blobToJson(blobs: Array<string>) {
  console.log(d(), 'parsing blobs to json');
  const result: Array<IPost> = [];
  for (let i = 0; i < blobs.length; ++i) {
    try {
      const res = JSON.parse(blobs[i]).graphql.shortcode_media;
      const post: IPost = {
        id: res.id,
        dimensions: res.dimensions,
        display_src: res.display_url,
        caption_is_edited: res.caption_is_edited,
        caption: res.edge_media_to_caption.edges[0].node.text,
        comments: {
          count: res.edge_media_to_comment.count
        },
        code: res.shortcode,
        comments_disabled: res.comments_disabled,
        date: res.taken_at_timestamp,
        is_ad: res.is_ad,
        is_video: res.is_video,
        owner: res.owner,
        likes: {
          count: res.edge_media_preview_like.count
        }
      };
      result.push(post);
    } catch (error) {
    }
  }

  return result;
}

function mapCodeToUrl(data: Array<string>) {
  console.log(d(), 'extracting urls');
  return data.map(node => `https://instagram.com/p/${node}`);
}

function fetchUser(url: string) {
  console.log(`Fetching user: ${url}`);
  return fetch(url).then(r => r.text());
}

async function fetchUsers(posts: Array<IPost>) {
  console.log(d(), 'Fetching users');
  const users = parseEmail(await Promise.all(posts.map(b => fetchUser(`https://instagram.com/${b.owner.username}/`)))
    .then(html => {
      return html.filter(h => h).map(h => {
        const r = JSON.parse(/sharedData\s*=\s*(\{.*\});/.exec(h)[1]) as IRequest;
        return r.entry_data.ProfilePage[0].user;
      });
    }));


  return posts.map(p => {
    const u = users.find(u => u.username === p.owner.username);
    if (u) {
      p.owner = u;
    }
    return p;
  });
}

async function filterAlreadySeenPosts(opts, db: mongo.Db, codes: Array<string>) {
  console.log('filtering posts, count: ', codes.length)
  const collection = db.collection(opts.tag);
  const result = await collection.find({
    _id: {
      $in: codes
    }
  }, {
      _id: 1
    }).toArray();

  const res = codes.filter(c => result.findIndex(r => r._id === c) === -1);
  console.log('done filtering, new count: ', res.length);
  return res;
}

function parseEmail(users: Array<IUser>) {
  const EMAIL_REGEX = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

  return users.map(u => {
    const res = EMAIL_REGEX.exec(u.biography);
    if (res) {
      u.email = res[0];
    }
    return u;
  });
}

/**
 * Fetch a tag page and store relevant headers for subsequent requests
 * This parses the sharedData json blob on the page and returns a list of
 * post ids
 * 
 * @param job 
 */
async function fetchFromTagPage (job: IJob) {
  const response = await fetch(`https://www.instagram.com/explore/tags/${escape(job.name)}/`);
  const html = await response.text();
  parseAndStoreHeaders(job, response.headers);
  const json = JSON.parse(/sharedData\s*=\s*(\{.*\});/.exec(html)[1]) as IRequest;
  const tags = json.entry_data.TagPage[0].tag.media.nodes;
  job.info= json.entry_data.TagPage[0].tag.media.page_info;
  return tags.map(t => t.code);
}

/**
 * Fetch posts and filter out out duplicates
 * 
 * returns a list of urls to fetch
 * @param opts 
 * @param job 
 */
async function fetchUrls(opts: IOptions, job: IJob) {
  let codes: string[] = null;
  if ((job.type === 'crawl' && !job.info) || job.type === 'watch') {
    codes = await fetchFromTagPage(job);
  } else if (job.type === 'crawl') {
    codes = await fetchFromQuery(job);
  }
  const filteredCodes = await filterAlreadySeenPosts(opts, db, codes);
  return mapCodeToUrl(filteredCodes);
}

async function fetchPosts(opts, urls: Array<string>) {
  console.log(d(), 'Fetching posts');
  const html = await fetchBlobs(urls, opts.tag);
  return blobToJson(html);
}

/**
 * Query a hashtag
 * 
 * Get the page
 * Grab the post data
 * Grab the urls from that data and iterate over them
 * Grab the user information for the posts
 * 
 * @param opts options for the job
 */
export async function watch(opts: IOptions) {
  console.log(d(), `Starting job: ${opts.tag} of type ${opts.type}`);
  const timer = await findTimer(opts.tag, opts.type);
  const urls = await fetchUrls(opts, timer.job);
  let posts = await fetchPosts(opts, urls);
  posts = await fetchUsers(posts);
  if (posts.length > 0) {
    await storePosts(timer.job, posts);
  }

  const runTime = Date.now() - timer.startTime;
  if (runTime >= 3600 * 1000) {
    stopTimer(opts.tag, opts.type);
  }

  if (opts.type === 'crawl' && !timer.job.info.has_next_page) {
    stopTimer(opts.tag, opts.type);
    console.log(d(), `Stopping job: ${opts.tag} of type ${opts.type}, no more posts available`);
  } 

  await storeJob(timer.job);

  console.log(d(), `Ending job: ${opts.tag} of type ${opts.type}`);
}

function runOnInterval(opts: IOptions) {
  if (opts.type === 'watch') {
    timers.push({
      name: opts.tag,
      type: opts.type,
      startTime: Date.now(),
      // Conservative. This might miss posts on popular hashtags
      timer: setInterval(() => watch(opts), 2 * 60 * 1000)
    });
  }
}