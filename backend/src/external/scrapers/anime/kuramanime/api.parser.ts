import { Scrape } from "@external/scrapers/scrape.js";
import type { ISearchModel, Datum } from "./search.model.js";
import type { IAnimeDetail } from "./detail.model.js";
import type { IAnimeEpisodeDetail, AnimeDownloadGroup } from "./episode.model.js";
import type { IHomeModel } from "./home.model.js";
import type { ISummerModel } from "./summer.model.js";

export class KuramanimeParser extends Scrape {

  static baseUrl = "https://v8.kuramanime.tel";

  static async searchAnime(query: string, page: string) {
    return this.apiParser<ISearchModel, Datum[] | undefined>({
      url: `${this.baseUrl}/anime?order_by=latest&search=${encodeURIComponent(query)}&page=${page}&need_json=true`,
      initial: [],
      cf: true
    }, async (response, data) => {

      return response.animes?.data;
    });
  }

  static async homeAnime() {
    return this.apiParser<IHomeModel, IHomeModel>({
      url: `${this.baseUrl}/?need_json=true`,
      initial: {},
      cf: true
    }, async (response, data) => {

      return response;
    });
  }

  static async summerAnime() {
    return this.apiParser<ISummerModel, ISummerModel>({
      url: `${this.baseUrl}/properties/season/summer-2025?order_by=popular&page=1&need_json=true`,
      initial: {},
      cf: true
    }, async (response, data) => {

      return response;
    });
  }

  static async episodeAnime(slug: string) {
    return this.htmlParser<Partial<IAnimeEpisodeDetail>>({
      url: `${this.baseUrl}/anime/${slug}`,
      initial: {},
      cf: true
    }, async ($, data) => {

      // Meta tags
      const meta: Record<string, string | undefined> = {};
      $('meta').each((_, el) => {
        const name = $(el).attr('name') || $(el).attr('property');
        if (name) meta[name] = $(el).attr('content');
      });

      // Title
      const title = $('title').text().trim();
      // Canonical
      const canonical = $('link[rel="canonical"]').attr('href') || '';
      // Description
      const description = $('meta[name="description"]').attr('content') || '';

      // OG tags
      const og: Record<string, string | undefined> = {};
      $('meta[property^="og:"]').each((_, el) => {
        const name = $(el).attr('property');
        if (name) og[name] = $(el).attr('content');
      });
      // Twitter tags
      const twitter: Record<string, string | undefined> = {};
      $('meta[name^="twitter:"]').each((_, el) => {
        const name = $(el).attr('name');
        if (name) twitter[name] = $(el).attr('content');
      });
      // Keywords
      const keywords = (meta['keywords'] || '').split(',').map(s => s.trim()).filter(Boolean);
      // Published time
      const publishedTime = meta['article:published_time'];

      // Hidden inputs
      const hiddenInputs: Record<string, string> = {};
      $('input[type="hidden"]').each((_, el) => {
        const id = $(el).attr('id');
        const value = $(el).attr('value') || '';
        if (id) hiddenInputs[id] = value;
      });

      // Breadcrumb (if any)
      const breadcrumb: { name: string; url?: string }[] = [];
      $('.breadcrumb-option a').each((_, el) => {
        breadcrumb.push({ name: $(el).text().trim(), url: $(el).attr('href') });
      });
      $('.breadcrumb-option span').each((_, el) => {
        const name = $(el).text().trim();
        if (name) breadcrumb.push({ name });
      });

      // Server mirrors (from select#changeServer)
      const servers: { value: string; label: string }[] = [];
      $('#changeServer option').each((_, el) => {
        servers.push({
          value: $(el).attr('value') || '',
          label: $(el).text().trim(),
        });
      });

      // Download links (from #animeDownloadLink), grouped by type (e.g. h6 as group title)
      const downloadLinks: AnimeDownloadGroup[] = [];
      let currentGroup: AnimeDownloadGroup | null = null;
      $('#animeDownloadLink').children().each((_, el) => {
        if ($(el).is('h6')) {
          // Start new group
          if (currentGroup) downloadLinks.push(currentGroup);
          currentGroup = { type: $(el).text().trim(), links: [] };
        } else if ($(el).is('a')) {
          if (currentGroup) {
            const url = $(el).attr('href') || '';
            const label = $(el).text().trim() || url;
            if (url) currentGroup.links.push({ label, url });
          }
        }
      });
      if (currentGroup) downloadLinks.push(currentGroup);

      // Other hidden fields
      const timezone = hiddenInputs['selTimezone'];
      const nowPlus1Sec = hiddenInputs['nowPlus1Sec'];
      const updatedAtPlus5Min = hiddenInputs['updatedAtPlus5Min'];
      const updatedAtPlus2Min = hiddenInputs['updatedAtPlus2Min'];
      const isNot48Hours = hiddenInputs['isNot48Hours'];
      const checkEp = hiddenInputs['checkEp'];
      const checkBatch = hiddenInputs['checkBatch'];
      const exactPostId = hiddenInputs['exactPostId'];
      const saveWatchHistoryRoute = hiddenInputs['saveWatchHistoryRoute'];
      const kuramaskipStatus = hiddenInputs['kuramaskipStatus'];
      const driveCheckPingRoute = hiddenInputs['driveCheckPingRoute'];
      const driveCheckQuotaRoute = hiddenInputs['driveCheckQuotaRoute'];

      let videoUrls: string[] | string = [];
      if (!($(".video-content").find("video").length)) {
        videoUrls = $(".video-content .iframe-container").find("iframe").attr("src")?.trim() || ""
      } else {
        console.log($(".video-content video").text().trim())
        $(".video-content video").children().each((_, el) => {
          const link = $(el).attr("src")?.trim() || "";
          (videoUrls as string[]).push(link);
        })
      }

      return {
        meta,
        title,
        canonical,
        description,
        og,
        twitter,
        keywords,
        publishedTime,
        animeId: hiddenInputs['animeId'],
        postId: hiddenInputs['postId'],
        isEpisode: hiddenInputs['isEpisode'],
        isHentai: hiddenInputs['isHentai'],
        hiddenInputs,
        breadcrumb,
        timezone,
        nowPlus1Sec,
        updatedAtPlus5Min,
        updatedAtPlus2Min,
        isNot48Hours,
        checkEp,
        checkBatch,
        exactPostId,
        saveWatchHistoryRoute,
        kuramaskipStatus,
        driveCheckPingRoute,
        driveCheckQuotaRoute,
        servers,
        downloadLinks,
        videoUrls
      };

    });
  }

  static async detailAnime(slug: string) {
    return this.htmlParser<Partial<IAnimeDetail>>({
      url: `${this.baseUrl}/anime/${slug}`,
      initial: {},
      cf: true
    }, async ($, data) => {

      // Metadata
      const meta = {
        ogTitle: $('meta[property="og:title"]').attr('content'),
        ogDescription: $('meta[property="og:description"]').attr('content'),
        ogImage: $('meta[property="og:image"]').attr('content'),
        ogUrl: $('meta[property="og:url"]').attr('content'),
        ogSiteName: $('meta[property="og:site_name"]').attr('content'),
        twitterTitle: $('meta[name="twitter:title"]').attr('content'),
        twitterDescription: $('meta[name="twitter:description"]').attr('content'),
        twitterImage: $('meta[name="twitter:image"]').attr('content'),
        keywords: ($('meta[name="keywords"]').attr('content') || '').split(',').map(s => s.trim()).filter(Boolean),
      };

      // Anime ID
      const id = $('#animeId').val() as string || '';
      // URL
      const url = $('link[rel="canonical"]').attr('href') || '';
      // Title
      const title = $('.anime__details__title h3').text().trim();
      // Alt Titles
      const altTitles = $('.anime__details__title span').text().split(',').map(s => s.trim()).filter(Boolean);
      // Description
      const description = $('#synopsisField').text().replace(/\s+/g, ' ').trim();
      // Image
      const image = $('.anime__details__pic').attr('data-setbg') || meta.ogImage || '';
      // Score
      const score = $('.anime__details__pic .ep').text().replace(/[^\d.]/g, '').trim() || null;
      // Status & Schedule
      let status: string | null = null;
      let scheduleDay: string | null = null;
      let scheduleTime: string | null = null;
      const statusInfo = $('.breadcrumb__links__v3 .fa-info-circle').parent().parent().text();
      if (statusInfo) {
        const matchStatus = statusInfo.match(/berstatus\s+([\w\s!]+)/i);
        if (matchStatus) status = matchStatus[1].replace('!', '').trim();
        const matchDay = statusInfo.match(/setiap hari ([^,]+),/i);
        if (matchDay) scheduleDay = matchDay[1].trim();
        const matchTime = statusInfo.match(/pukul ([\d:.]+) WIB/i);
        if (matchTime) scheduleTime = matchTime[1].trim();
      }

      // Share link
      const shareLink = $('#shareLink').attr('href') || undefined;

      // Followers (from Ikuti (20))
      let followers: string | undefined = undefined;
      const followBtn = $('#followButton').text();
      if (followBtn) {
        const match = followBtn.match(/Ikuti\s*\((\d+)\)/i);
        if (match) followers = match[1];
      }

      // HD/BD info (from .ep-v2 or .view)
      let hdBd: string | undefined = undefined;
      const epV2 = $('.anime__details__pic .ep-v2').text().trim();
      if (epV2) hdBd = epV2;
      // fallback: sidebar .view
      if (!hdBd) {
        const sidebarView = $('.product__sidebar__view__item .view').first().text().trim();
        if (sidebarView) hdBd = sidebarView;
      }

      // View count & comment count (from .views-count-3802, .comments-count-3802)
      let viewCount: string | undefined = undefined;
      let commentCount: string | undefined = undefined;
      const viewCountEl = $('.views-count-' + id).text().replace(/\D/g, '').trim();
      if (viewCountEl) viewCount = viewCountEl;
      const commentCountEl = $('.comments-count-' + id).text().replace(/\D/g, '').trim();
      if (commentCountEl) commentCount = commentCountEl;

      // Sidebar animes (Anime Lainnya)
      const sidebarAnimes: { title: string; url: string; image: string; score: string; quality: string }[] = [];
      $('#randomList a').each((_, el) => {
        const url = $(el).attr('href') || '';
        const item = $(el).find('.product__sidebar__view__item');
        const image = item.attr('data-setbg') || '';
        const score = item.find('.ep').text().replace(/[^\d.]/g, '').trim();
        const quality = item.find('.view').text().trim();
        const title = item.find('h5').text().trim();
        if (title && url) sidebarAnimes.push({ title, url, image, score, quality });
      });

      // Copyright (footer)
      let copyright: string | undefined = undefined;
      const copyrightText = $('.footer .col-lg-3.text-right p').text().trim();
      if (copyrightText) copyright = copyrightText;

      // Social media (from Media Sosial dropdown)
      const socialMedia: { name: string; url: string }[] = [];
      $("a[href^='https://discord.com'], a[href*='telegram'], a[href*='whatsapp'], a[href*='facebook'], a[href*='instagram'], a[href*='x.com'], a[href*='twitter']").each((_, el) => {
        const url = $(el).attr('href') || '';
        const name = $(el).text().replace(/Channel & Grup|Fanpage|Akun|Server|Akun /gi, '').replace(/\s+/g, ' ').trim();
        if (url && name) socialMedia.push({ name, url });
      });

      // Navigation (footer nav)
      const navigation: { name: string; url: string }[] = [];
      $('.footer__nav ul li a').each((_, el) => {
        const url = $(el).attr('href') || '';
        const name = $(el).text().trim();
        if (url && name) navigation.push({ name, url });
      });

      // Widget details
      let type, episodes, season, duration, quality, country, source, explicit, demographic, studio, members, rating, credit;
      let airing: { from?: string; to?: string } = {};
      let themes: string[] = [];
      $('.anime__details__widget .row ul li').each((_, el) => {
        const label = $(el).find('.col-3 span').text().trim().toLowerCase();
        const valueEl = $(el).find('.col-9');
        const valueText = valueEl.text().replace(/\s+/g, ' ').trim();
        if (label === 'tipe:') type = valueEl.text().trim();
        else if (label === 'episode:') episodes = valueEl.text().trim();
        else if (label === 'status:') status = valueEl.text().trim();
        else if (label === 'tayang:') {
          const dates = valueEl.find('a').map((_, a) => $(a).text().trim()).get();
          if (dates.length > 0) airing.from = dates[0];
          if (dates.length > 1) airing.to = dates[1];
        }
        else if (label === 'musim:') season = valueEl.text().trim();
        else if (label === 'durasi:') duration = valueEl.text().trim();
        else if (label === 'kualitas:') quality = valueEl.text().trim();
        else if (label === 'negara:') country = valueEl.text().trim();
        else if (label === 'adaptasi:') source = valueEl.text().trim();
        else if (label === 'eksplisit:') explicit = valueText;
        else if (label === 'demografis:') demographic = valueText;
        else if (label === 'studio:') studio = valueEl.text().trim();
        else if (label === 'skor:') {/* skip, already parsed */ }
        else if (label === 'peminat:') members = valueEl.text().trim();
        else if (label === 'rating:') rating = valueEl.text().trim();
        else if (label === 'kredit:') credit = valueEl.text().trim();
        else if (label === 'tema:') {
          themes = valueEl.find('a').map((_, a) => $(a).text().trim()).get();
        }
      });

      // Genres (from widget and genre row)
      const genres: string[] = [];
      $('.anime__details__widget a[href*="/properties/genre/"]').each((_, el) => {
        const genre = $(el).text().replace(/,$/, '').trim();
        if (genre && !genres.includes(genre)) genres.push(genre);
      });

      // Tags (from content__tags)
      const tags = $('.content__tags').text().split(',').map(s => s.trim()).filter(Boolean);

      // Related tags (from Tag yang Berhubungan)
      const relatedTags: string[] = [];
      $('.breadcrumb__links__v2__tags a').each((_, el) => {
        const tag = $(el).text().replace(/,$/, '').trim();
        if (tag) relatedTags.push(tag);
      });

      // Episode list (from Daftar Episode popover)
      const episodeList: { ep: string; url: string }[] = [];
      const episodePopover = $("#episodeLists").attr("data-content");
      if (episodePopover) {
        let latestEpisode: string | null = null
        const $ep = this.cheerio.load(episodePopover);
        $ep('a').each((_, el) => {
          const ep = $ep(el).text().replace(/Ep\s*/i, '').trim();
          const url = $ep(el).attr('href') || '';
          if (/Terlama|Terbaru/i.test(ep)) {
            latestEpisode = ep.match(/(\d+)\s?\(Terbaru\)/i)?.[1] || null;
            return;
          };
          if (ep && url) episodeList.push({ ep, url });
          if ($ep(el).hasClass("page__link__episode") && typeof latestEpisode == "string") {
            const leps = parseInt(latestEpisode);
            const lfirst = episodeList.length - 1;
            for (let i = 0; i < (leps - lfirst) - 1; i++) {
              episodeList.push({ ep: ((leps - lfirst) + i).toString(), url })
            }
          }
        });
      }

      return {
        id,
        url,
        title,
        altTitles,
        description,
        image,
        score,
        status,
        scheduleDay,
        scheduleTime,
        type,
        episodes,
        airing,
        season,
        duration,
        quality,
        country,
        source,
        explicit,
        demographic,
        themes,
        studio,
        members,
        rating,
        credit,
        genres,
        tags,
        relatedTags,
        episodeList,
        shareLink,
        followers,
        hdBd,
        viewCount,
        commentCount,
        copyright,
        socialMedia,
        navigation,
        sidebarAnimes,
        meta,
      };
    });
  }

}
