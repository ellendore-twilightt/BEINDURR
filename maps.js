// maps.js

module.exports = async function runMapsEvent(page) {
  try {
    const mapsUrl = process.env.LP_MAPS_URL;

    // 🗺️ Maps Event
    console.log("🗺️ Navigating to Maps Event...");

    await page.goto(mapsUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    for (let i = 1; i <= 1; i++) {
      await page.reload({
        waitUntil: 'domcontentloaded'
      });

      await page.waitForTimeout(10000);
    }

    const fullCircles = await page.$$eval(
      '.currency.tries .currency-circle.currency-circle-full',
      circles => circles.length
    );

    let successfulClicks = 0;

    for (let i = 0; i < fullCircles; i++) {
      const antiquesText = await page.$eval(
        '#player-emerald',
        el => el.textContent.trim()
      );

      const antiques = parseInt(
        antiquesText.replace(/[^\d]/g, '')
      );

      if (antiques < 2) {
        break;
      }

      const unopenedCells = await page.$$(
        'a.square.unopened'
      );

      if (unopenedCells.length === 0) {
        break;
      }

      const randomIndex =
        Math.floor(
          Math.random() * unopenedCells.length
        );

      const cell =
        unopenedCells[randomIndex];

      await cell.scrollIntoViewIfNeeded();

      const relAttr =
        await cell.getAttribute('rel');

      await cell.click();

      successfulClicks++;

      await page.waitForTimeout(15000);
    }

    console.log(
      `🏁 Maps complete. Total clicks: ${successfulClicks}`
    );

  } catch (error) {
    console.log(
      "❌ Maps Event failed — skipped."
    );
  }
};
