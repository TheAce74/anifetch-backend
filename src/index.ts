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
  // use env variables next time
  origin: ["http://localhost:5173", "https://anifetchbyace.vercel.app"],
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

app.get("/", async (req, res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: false,
  });

  try {
    const { url, resolution } = req.query as {
      url: string;
      resolution: string;
    };

    const page = await browser.newPage();
    await page.goto(url);

    setTimeout(async () => {
      const episodesMarkup = await page.content();
      const episodeLinks = extractPlayLinks(episodesMarkup);
      const fullLinks = episodeLinks.map(
        (link) => `https://animepahe.ru${link}`
      );

      const episodeProviderLinks = [];
      for (let i = 0; i < fullLinks.length; i++) {
        await page.goto(fullLinks[i]);
        const episodeMarkup = await page.content();
        episodeProviderLinks.push(
          extractEpisodeLinks(episodeMarkup, resolution)
        );
      }

      console.log(episodeProviderLinks);

      const preDownloadLinks = [];
      for (let i = 0; i < episodeProviderLinks.length; i++) {
        await page.goto(episodeProviderLinks[i]);
        sleepSync(7000);
        const episodeProviderMarkup = await page.content();
        preDownloadLinks.push(extractPreDownloadLinks(episodeProviderMarkup));
      }

      console.log(preDownloadLinks);

      //   for (let i = 0; i < preDownloadLinks.length; i++) {
      //     await page.goto(preDownloadLinks[i]);
      //     let downloadMarkup = await page.content();
      //     const autoDownloadScript = `
      //   <script>
      //     window.onload = function() {
      //       const downloadButton = document.querySelector('form button[type="submit"]');
      //       if (downloadButton) {
      //         downloadButton.click(); // Auto-click the download button
      //       }
      //     };
      //   </script>
      // `;
      //     downloadMarkup = downloadMarkup.replace(
      //       "</body>",
      //       `${autoDownloadScript}</body>`
      //     );
      //     res.write(downloadMarkup);
      //     sleepSync(5000);
      //   }

      res.status(200).json({
        links: preDownloadLinks,
      });
    }, 20000);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went terribly wrong!",
    });
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
