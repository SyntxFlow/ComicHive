export interface MangaData {
  title: string;
  url: string;
  image: string;
  chapter: string;
  rating: string;
  ratingPercentage: string;
  type: string;
  isHot: boolean;
  isColored: boolean;
  genres?: string[];
}

export interface PopularMangaData {
  rank: string;
  title: string;
  url: string;
  image: string;
  genres: string[];
  rating: string;
  ratingPercentage: string;
}

export interface NewMangaData {
  title: string;
  url: string;
  image: string;
  genres: string[];
  year?: string;
}

export interface ScrapedData {
  manga: MangaData[];
}