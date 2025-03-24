import express from "express";
import morgan from "morgan";
import cors, { CorsOptions } from "cors";
import puppeteer from "puppeteer";
import {
  extractPreDownloadLinks,
  extractEpisodeLinks,
  extractPlayLinks,
  sleepSync,
} from "@/utils";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions: CorsOptions = {
  origin: process.env.ORIGINS
    ? process.env.ORIGINS.split(", ")
    : ["http://localhost:5173"],
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

app.get("/", async (req, res) => {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === "prod" ? true : false,
  });

  try {
    const { url, resolution } = req.query as {
      url: string;
      resolution: string;
    };

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    setTimeout(async () => {
      const episodesMarkup = await page.content();
      const episodeLinks = extractPlayLinks(episodesMarkup);
      const fullLinks = episodeLinks.map(
        (link) => `https://animepahe.ru${link}`
      );

      const episodeProviderLinks: string[] = [];
      for (let i = 0; i < fullLinks.length; i++) {
        await page.goto(fullLinks[i], { waitUntil: "networkidle2" });
        const episodeMarkup = await page.content();
        episodeProviderLinks.push(
          extractEpisodeLinks(episodeMarkup, resolution)
        );
      }
      console.log(episodeProviderLinks);

      const preDownloadLinks: string[] = [];
      for (let i = 0; i < episodeProviderLinks.length; i++) {
        const page = await browser.newPage();
        await page.goto(episodeProviderLinks[i], { waitUntil: "networkidle2" });
        sleepSync(7000);
        const episodeProviderMarkup = await page.content();
        const downloadLink = extractPreDownloadLinks(episodeProviderMarkup);
        preDownloadLinks.push(downloadLink);
        await page.goto(downloadLink, { waitUntil: "networkidle2" });
        page.on("response", async (response) => {
          if (response.url().includes(".mp4")) {
            preDownloadLinks.push(response.url());
          }
        });
        await page.click('form button[type="submit"]');
      }
      console.log(preDownloadLinks);

      res.status(200).json({
        links: preDownloadLinks,
      });
      await browser.close();
    }, 20000);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went terribly wrong!",
    });
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
