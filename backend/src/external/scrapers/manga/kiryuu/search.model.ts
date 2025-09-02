export interface ISearchModel {
    series?: Series[];
}

export interface Series {
    all?:        All[];
    template?:   string;
    title?:      string;
    class_name?: string;
}

export interface All {
    ID?:              number;
    post_image?:      string;
    post_image_html?: string;
    post_title?:      string;
    post_genres?:     string;
    post_type?:       string;
    post_status?:     string;
    post_link?:       string;
    post_latest?:     string;
}
