export interface IPost {
  _id?: string;
  caption_is_edited?: boolean;
  code: string;
  date: number;
  dimensions: {
    width: number;
    height: number;
  };
  comments_disabled: boolean;
  comments: {
    count: number;
  };
  caption: string;
  likes: {
    count: number;
  };
  owner: IUser;
  thumbnail_src?: string;
  is_video: boolean;
  id: string;
  display_src: string;
  is_ad: boolean;
}

export interface IPostDto {
  _id?: string;
  caption_is_edited?: boolean;
  date: number;
  dimensions: {
    width: number;
    height: number;
  };
  comments_disabled: boolean;
  edge_media_to_comment: {
    count: number;
  };
  edge_media_to_caption: {
    edges: [{
      node: {
        text: string;
      }
    }]
  };
  edge_liked_by: {
    count: number;
  };
  shortcode: string;
  owner: IUser;
  thumbnail_src?: string;
  is_video: boolean;
  id: string;
  display_src: string;
  is_ad: boolean;
}

export interface IPageInfo {
  has_previous_page: boolean;
  start_cursor: string;
  end_cursor: string;
  has_next_page: boolean;
}

export interface ITagMedia {
  count: number;
  page_info: IPageInfo;
  nodes: Array<IPost>;

}
export interface ITagPage {
  tag: {
    media: ITagMedia;
  };
}

export interface IUser {
  _id?: string;
  username: string;
  country_block: {};
  connected_fb_page: {};
  follows: {
    count: number;
  };
  requested_by_viewer: boolean;
  followed_by: {
    count: number;
  };
  external_url_linkshimmed: string;
  has_requested_viewer: boolean;
  profile_pic_url_hd: string;
  follows_viewer: boolean;
  profile_pic_url: string;
  id: string;
  biography: string;
  full_name: string;
  media: ITagMedia;
  blocked_by_viewer: boolean;
  followed_by_viewer: boolean;
  is_verified: boolean;
  has_blocked_viewer: boolean;
  is_private: boolean;
  external_url: string;
  email?: string;
}
export interface IProfilePage {
  user: IUser;
}

export interface IPostPage {
  media: IPost;
}
export interface IRequest {
  country_code: string;
  language_code: string;
  gatekeepers: {}
  show_app_install: boolean;
  static_root: string;
  platform: string;
  activity_counts: {};
  hostname: string;
  entry_data: {
    TagPage?: Array<ITagPage>;
    ProfilePage?: Array<IProfilePage> ;
    PostPage?: Array<IPostPage>;
  };
}

export interface INode {
  node: IPostDto;
}

export interface IQueryRequest {
  data: {
    hashtag: {
      name: string;
      edge_hashtag_to_media: {
        count: number;
        page_info: IPageInfo;
        edges: Array<INode>;
      }
    }
  }
}

export interface IOptions {
  tag: string;
  type: "crawl"|"watch";
}

export interface IJob {
  name: string;
  type: string;
  seenPosts: number;
  info?: IPageInfo;
  cookie?: string;
  csrftoken?: string;
}