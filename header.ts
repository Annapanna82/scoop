import { Headers } from 'node-fetch';
import { IJob } from './interfaces';

/** 
 * Parse and store the cookie and csrf token for subsequent requests
 * 
 * @param job The job object to store the headers for
 * @param headers a header collection
 */
export function parseAndStoreHeaders(job: IJob, headers: Headers) {
  const csrftoken = headers.getAll('set-cookie').find(c => c.startsWith('csrftoken'));
  if (!csrftoken) {
    job.csrftoken = "";
    console.warn("No csrftoken found in headers: ", headers.getAll('set-cookie').join(';'));
  } else {
    job.csrftoken = csrftoken.substring(csrftoken.indexOf('=') + 1, csrftoken.indexOf(';'));
  }

  job.cookie = headers.getAll('set-cookie').map(c => c.substr(0, c.indexOf(';')))
    .join('; ') + '; ig_pr=1; ig_vw=1920;';

  console.log('cookie: ', job.cookie);
  console.log('csrftoken: ', job.csrftoken);
}

/**
 * This mimics the headers sent when visiting Instagram with Chrome
 * 
 * @param job The job to build headers for
 */
export function getAjaxHeaders(job: IJob) {
  const headers = new Headers();
  headers.append('authority', 'www.instagram.com');
  headers.append('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
  headers.append('accept-encoding', 'gzip, deflate');
  headers.append('accept-language', 'en-US,en;q=0.8,fi;q=0.6,sv;q=0.4');
  headers.append('cache-control', 'no-cache');
  headers.append('pragma', 'no-cache');
  headers.append('upgrade-insecure-requests', '1');
  headers.append('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36');
  if (job.csrftoken) {
    headers.append('x-csrftoken', job.csrftoken);
  }
  if (job.cookie) {
    headers.append('cookie', job.cookie);
  }
  headers.append('origin', 'https://www.instagram.com');
  headers.append('referer', `https://www.instagram.com/explore/tags/${job.name}/`);
  headers.append('x-instagram-ajax', '1');
  headers.append('x-requested-with', 'XMLHttpRequest');
  headers.set('accept', '*/*');
  headers.append('content-type', 'application/x-www-form-urlencoded');

  return headers;
}