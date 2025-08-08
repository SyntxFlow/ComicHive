import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }): IAnimeSlug => {
  return {
    animeSlug: params.anime_slug
  }
}

export interface IAnimeSlug {
  animeSlug: string;
}