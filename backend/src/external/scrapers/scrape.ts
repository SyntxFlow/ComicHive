/**
 * Class Induk Dari Scrape, Taruh Fungsi Yang Akan Digunakan Berkali kali Selama Scraping
 */


import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

export class Scrape {

  public static cheerio = cheerio;

  public static async fetch(url: string, json: boolean = false, method: "GET" | "POST" = "GET", body: Record<string, any> | string | FormData | URLSearchParams = {}, headers: Record<string, string> = {}): Promise<AxiosResponse<any, any>> {
    try {
      const response = await axios({
        url,
        method,
        timeout: 10000,
        ...(method === "POST" ? body instanceof URLSearchParams ? { params: body } : { data: body } : {}),
        validateStatus: (status) => status >= 200 && status < 300,
        maxRedirects: 5,
        maxContentLength: 100000000,
        maxBodyLength: 100000000,
        responseType: "json",
        responseEncoding: "utf-8",
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
          ...headers
        },
      });

      if (response.status === 301 || response.status === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          return await this.fetch(redirectUrl);
        }
      }

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response
    } catch (error) {
      throw error as AxiosResponse<any, any>;
    }
  }

  public static async fetchJinaAI(url: string, json: boolean = false, method: "GET" | "POST" = "GET", body: Record<string, any> | string | FormData | URLSearchParams  = {}, headers: Record<string, string> = {}): Promise<AxiosResponse<any, any>> {
    try {
      const response = await axios({
        url: `https://r.jina.ai/${url}`,
        method: "GET",
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300,
        maxRedirects: 5,
        maxContentLength: 100000000,
        maxBodyLength: 100000000,
        responseType: "json",
        responseEncoding: "utf-8",
        headers: {
          // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
          'User-Agent': 'Mozilla/5.0 (Windows NT x.y; rv:10.0) Gecko/20100101 Firefox/10.0',
          // 'Authorization': 'Bearer jina_f8719ed869a545309dc2a774b9efc5c0rLBO0XhWdlXvXZ3VBIGMF7OKoi-e',
          'Accept': 'application/json',
          'X-Engine': 'direct',
          'DNT': '1',
          'X-No-Cache': 'true',
          'X-Return-Format': 'html',
          // ...( !json ? {'X-Return-Format': 'html'} : {}),
          // ...( json ? {'X-Respond-With': 'no-content'} : {})
        },
      });

      if (response.status === 301 || response.status === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          return await this.fetchJinaAI(redirectUrl);
        }
      }

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response
    } catch (error) {
      throw error as AxiosResponse<any, any>;
    }
  }

  public static async htmlParser<T>(
    {
      url,
      initial,
      headers = {},
      cf = false
    }: {
      url: string;
      initial: T,
      headers?: Record<string, string>,
      cf?: boolean
    },
    parser: ($: cheerio.CheerioAPI, data: T) => Promise<T>
  ): Promise<T> {
    try {
      const response = await (cf ? this.fetchJinaAI : this.fetch)(url, false, "GET", {}, headers);
      // console.log(response.data.data.html)
      const $ = cheerio.load((cf ? response.data.data.html : response.data));
      const parserResult = await parser($, initial);
      return parserResult as T;
    } catch {
      return initial
    }
  }

  public static async apiParser<R, T>(
    {
      url,
      initial,
      method = "GET",
      body = {},
      headers = {},
      cf = false
    }: {
      url: string;
      initial: T;
      method?: "GET" | "POST";
      body?: Record<string, any> | string | FormData | URLSearchParams;
      headers?: Record<string, string>,
      cf?: boolean;
    },
    parser: (response: R, data: T) => Promise<T>
  ): Promise<T> {
    try {
      const response = await (cf ? this.fetchJinaAI : this.fetch)(url, true, method, body, headers);
      let serial = "";
      if (cf) {
        serial = response.data.data.html.match(/<pre.*">(.*[\w\W]+)<\/pre>/im)[1] || "{}";
        serial = this.removeHtmlTags(serial);
      }
      const parserResult = await parser((cf ? JSON.parse(serial) || {} : response.data) as R, initial);
      return parserResult as T;
    } catch (error) {
      console.log(error)
      return initial
    }
  }

  public static removeHtmlTags(html: string): string {
    const htmlWithoutTags = html.replace(/<[^>]*>/g, '');
    return htmlWithoutTags.replace(/\s+/g, ' ').trim();
  }

}