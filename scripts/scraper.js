const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

async function scrape() {
  try {
    const url = "https://www.football-coefficient.eu/";

    // ⚡ Cloudflare engel olmasın diye User-Agent ekliyoruz
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const countries = [];

    $("table tbody tr").each((i, el) => {
      const tds = $(el).find("td");

      const rank = $(tds[0]).text().trim();
      const countryName = $(tds[1]).text().trim();
      const totalPoints = $(tds[2]).text().trim();
      const seasonPoints = $(tds[3]).text().trim();
      const teamsCount = $(tds[4]).text().trim();

      countries.push({
        rank: Number(rank),
        country: countryName,
        totalPoints: Number(totalPoints),
        seasonPoints: Number(seasonPoints),
        teamsCount
      });
    });

    const filePath = path.join(__dirname, "..", "data", "countries.json");
    fs.writeFileSync(filePath, JSON.stringify(countries, null, 2));

    console.log("✔ countries.json güncellendi!");
  } catch (err) {
    console.error("SCRAPER HATASI:", err);
    process.exit(1);
  }
}

scrape();
