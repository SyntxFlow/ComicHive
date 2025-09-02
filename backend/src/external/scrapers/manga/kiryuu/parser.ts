import { Scrape } from "@external/scrapers/scrape.js";
import FormData from "form-data";

import type { MangaData, ScrapedData } from "./genre.model.js";
import type { ISearchModel, All } from "./search.model.js";

export class KiryuuParser extends Scrape {

  static baseUrl = "https://kiryuu02.com";

  static async byGenre(genre: string) {
    const GENRE_MAP: Record<string, string> = {
      "4-koma": "2400",
      "action": "2",
      "adaptation": "3475",
      "adult": "128",
      "adventure": "3",
      "animals": "8050",
      "anthology": "4701",
      "antihero": "8431",
      "award winning": "7613",
      "beasts": "8555",
      "bodyswap": "8052",
      "boys' love": "7695",
      "bully": "6565",
      "cartoon": "8053",
      "childhood friends": "8171",
      "comedy": "14",
      "comic": "8054",
      "cooking": "1372",
      "crime": "5175",
      "crossdressing": "5820",
      "dance": "7980",
      "dark fantasy": "6264",
      "delinquent": "6566",
      "delinquents": "7578",
      "dementia": "8055",
      "demon": "5464",
      "demons": "37",
      "doujinshi": "902",
      "drama": "11",
      "dungeons": "8056",
      "ecchi": "66",
      "emperor's daughter": "8087",
      "fan-colored": "8088",
      "fantas": "8462",
      "fantasy": "4",
      "fetish": "8057",
      "full color": "4460",
      "game": "1494",
      "games": "4242",
      "gang": "6848",
      "gender bender": "84",
      "genderswap": "5614",
      "ghosts": "7600",
      "girls": "7669",
      "girls' love": "6119",
      "gore": "2167",
      "gorre": "6286",
      "gyaru": "6343",
      "harem": "23",
      "hero": "7497",
      "historical": "24",
      "horror": "67",
      "imageset": "8058",
      "incest": "5620",
      "isekai": "15",
      "josei": "78",
      "josei(w)": "7675",
      "kids": "8017",
      "leveling": "3434",
      "loli": "1315",
      "lolicon": "852",
      "long strip": "5623",
      "mafia": "7599",
      "magi": "7330",
      "magic": "38",
      "magical girls": "5569",
      "manga": "5055",
      "manhua": "1048",
      "manhwa": "1311",
      "martial art": "1720",
      "martial arts": "18",
      "mature": "30",
      "mecha": "329",
      "medical": "1709",
      "military": "3510",
      "mirror": "6850",
      "modern": "4376",
      "monster girls": "5657",
      "monsters": "5656",
      "murim": "5587",
      "music": "2024",
      "mystery": "7",
      "necromancer": "4377",
      "ninja": "8059",
      "non-human": "8060",
      "office workers": "7614",
      "official colored": "5777",
      "one-shot": "3956",
      "oneshot": "3419",
      "overpowered": "4378",
      "parody": "3872",
      "pets": "4379",
      "philosophical": "6455",
      "police": "4975",
      "post-apocalyptic": "6122",
      "project": "5840",
      "psychological": "92",
      "regression": "5862",
      "reincarnation": "40",
      "revenge": "7676",
      "reverse harem": "7655",
      "reverse isekai": "8061",
      "romance": "8",
      "royal family": "7670",
      "royalty": "7671",
      "school": "1194",
      "school life": "12",
      "sci-fi": "49",
      "seinen": "19",
      "seinen(m)": "7677",
      "seinin": "5182",
      "sexual violence": "5622",
      "shotacon": "1519",
      "shoujo": "9",
      "shoujo ai": "240",
      "shoujo(g)": "7672",
      "shounen": "5",
      "shounen ai": "97",
      "shounen(b)": "7673",
      "shounn": "6500",
      "showbiz": "8015",
      "slice of life": "20",
      "smut": "1070",
      "space": "8062",
      "sport": "8010",
      "sports": "166",
      "super power": "3613",
      "superhero": "4479",
      "supernatural": "21",
      "supranatural": "5599",
      "survival": "5886",
      "system": "3493",
      "thriller": "1124",
      "time travel": "6056",
      "traditional games": "8063",
      "tragedy": "36",
      "transmigration": "8051",
      "vampire": "4024",
      "vampires": "5617",
      "video games": "5616",
      "villainess": "7150",
      "violence": "5660",
      "virtual reality": "5615",
      "web comic": "5626",
      "webtoon": "7674",
      "webtoons": "701",
      "wuxia": "378",
      "xuanhuan": "8064",
      "yaoi": "903",
      "yuri": "224",
      "zombies": "5877"
    }
    return await this.htmlParser<Partial<ScrapedData>>({
      url: this.baseUrl + "/manga/?genre%5B%5D=" + GENRE_MAP[genre.toLocaleLowerCase()] + "&order=update",
      initial: {},
      cf: false
    }, async ($, data) => {
      const mangaList: MangaData[] = [];

      // Select all manga items in the main list
      $('.listupd .bs .bsx').each((index: number, element: any) => {
        const $element = $(element);

        // Extract title and URL
        const titleElement = $element.find('.tt');
        const title = titleElement.text().trim();
        const url = $element.find('a').attr('href') || '';

        // Extract image
        const imageElement = $element.find('img');
        const image = imageElement.attr('src') || '';

        // Extract chapter info
        const chapterElement = $element.find('.epxs');
        const chapter = chapterElement.text().trim();

        // Extract rating
        const ratingElement = $element.find('.numscore');
        const rating = ratingElement.text().trim();

        // Extract rating percentage
        const ratingBarElement = $element.find('.rtb span');
        const ratingPercentage = ratingBarElement.attr('style')?.match(/width:(\d+%)/)?.pop() || '0%';

        // Extract type (Manga, Manhwa, Manhua, etc.)
        const typeElement = $element.find('.type');
        const type = typeElement.text().trim();

        // Check if it's hot
        const isHot = $element.find('.hotx').length > 0;

        // Check if it's colored
        const isColored = $element.find('.colored').length > 0;

        // Extract genres (if available in the main list)
        const genres: string[] = [];
        $element.find('.genres a').each((_, genreElement) => {
          const genre = $(genreElement).text().trim();
          if (genre) genres.push(genre);
        });

        if (title) {
          mangaList.push({
            title,
            url,
            image,
            chapter,
            rating,
            ratingPercentage,
            type,
            isHot,
            isColored,
            genres: genres.length > 0 ? genres : undefined
          });
        }
      });

      return {
        manga: mangaList
      };
    })
  }

  static async search(query: string) {
    let data = new FormData();
    data.append('action', 'ts_ac_do_search');
    data.append('ts_ac_query', query);

    return await this.apiParser<ISearchModel, All[]>({
      url: this.baseUrl + "/wp-admin/admin-ajax.php",
      initial: [],
      method: "POST",
      body: data,
      headers: data.getHeaders(),
      cf: false
    }, async (response, data) => {
      return response.series?.[0]?.all || [];
    })
  }

}