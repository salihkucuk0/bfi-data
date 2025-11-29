// Undici'nin global fetch override etmesini engelle
delete global.ReadableStream;
delete global.WritableStream;
delete global.TransformStream;
delete global.Blob;
delete global.File;
delete global.Headers;
delete global.Request;
delete global.Response;


const https = require("https");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

async function scrape() {
  try {
    const url = "https://www.football-coefficient.eu/";
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const countries = [];

    // Şimdilik ana tabloyu hedefliyoruz:
    $("table tbody tr").each((i, el) => {
      const tds = $(el).find("td");

      const rank = $(tds[0]).text().trim();
      const countryName = $(tds[1]).text().trim();
      const totalPoints = $(tds[2]).text().trim();
      const seasonPoints = $(tds[3]).text().trim();
      const teamsCount = $(tds[4]).text().trim();

      if (!rank || !countryName) return;

      countries.push({
        rank: Number(rank),
        country: countryName,
        totalPoints: Number(totalPoints),
        seasonPoints: Number(seasonPoints),
        teamsCount,
      });
    });

    const filePath = path.join(__dirname, "..", "data", "countries.json");
    fs.writeFileSync(filePath, JSON.stringify(countries, null, 2));

    console.log("✔ countries.json güncellendi! Toplam ülke:", countries.length);
  } catch (err) {
    console.error("SCRAPER HATASI:", err);
    process.exit(1);
  }
}

scrape();
