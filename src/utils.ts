import * as cheerio from "cheerio";

export const extractPlayLinks = (html: string): string[] => {
  const $ = cheerio.load(html);
  const links: string[] = [];

  $('a[href^="/play/"]').each((_, element) => {
    const link = $(element).attr("href");
    if (link) {
      links.push(link);
    }
  });

  return links;
};

export const extractEpisodeLinks = (html: string, res: string): string => {
  const $ = cheerio.load(html);
  const links: string[] = [];

  $("a").each((_, element) => {
    const link = $(element).attr("href");
    const text = $(element).text().trim();

    if (text.toLowerCase().includes(res.toLowerCase())) {
      if (link) {
        links.push(link);
      }
    }
  });

  return links[0];
};

export const sleepSync = (ms: number) => {
  const start = Date.now();
  while (Date.now() - start < ms) {}
};

export const extractPreDownloadLinks = (html: string): string => {
  const regex = /href="(https:\/\/kwik\.si\/f\/[^"]+)"/g;
  const links: string[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }

  return links[0];
};
