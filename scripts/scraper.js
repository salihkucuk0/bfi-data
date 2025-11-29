const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

async function scrape() {
  try {
    const url = "https://www.football-coefficient.eu/";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const countries = [];

    // 🔥 Tabloyu seçiyoruz
    $("table tbody tr").each((i, el) => {
      const tds = $(el).find("td");

      const rank = $(tds[0]).text().trim();
      const countryName = $(tds[1]).text().trim();
      const totalPoints = $(tds[2]).text().trim();
      const seasonPoints = $(tds[3]).text().trim();
      const teamsCount = $(tds[4]).text().trim();

      // 🔥 Takımların oldugu 'details' linki (gerekirse genişletiriz)
      countries.push({
        rank: Number(rank),
        country: countryName,
        totalPoints: Number(totalPoints),
        seasonPoints: Number(seasonPoints),
        teamsCount: teamsCount,
      });
    });

    // 🔥 JSON dosyasına yaz
    const filePath = path.join(__dirname, "..", "data", "countries.json");
    fs.writeFileSync(filePath, JSON.stringify(countries, null, 2));

    console.log("✔ countries.json güncellendi!");
  } catch (err) {
    console.error("HATA:", err);
    process.exit(1);
  }
}

scrape();

