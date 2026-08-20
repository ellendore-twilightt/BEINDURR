// Slots.js

module.exports = async function runSlotsEvent(page) {
  try {
    const slotsUrl = process.env.LP_SLOTS_URL;

    await page.goto(slotsUrl, {
      waitUntil: 'domcontentloaded'
    });

    // 🔄 Refresh the page 3 times
    for (let i = 1; i <= 3; i++) {
      await page.reload({
        waitUntil: 'domcontentloaded'
      });

      await page.waitForTimeout(30000); // Wait 30 seconds
    }

    // 🎰 Repeatedly click spin if tries and emeralds available
    while (true) {
      // 💎 Check emeralds
      const emeraldsText =
        await page.$eval(
          '#player-emerald',
          el => el.textContent.trim()
        );

      const emeralds =
        parseInt(
          emeraldsText.replace(/[^\d]/g, ''),
          10
        );

      if (
        isNaN(emeralds) ||
        emeralds < 3
      ) {
        break;
      }

      // 🎯 Check tries
      const tries =
        Math.max(
          0,
          (
            await page.$$eval(
              '.currency.circle.full',
              spans => spans.length
            )
          ) - 1
        );

      if (tries === 0) {
        break;
      }

      // 🎰 Click spin
      try {
        await page.click(
          '#content > div.wrapper.clear > div.slot-event-wrapper > div.slot-event-machine-wrapper > div.spin-btn'
        );
      } catch (clickError) {
        await page.screenshot({
          path: 'click-failure.png',
          fullPage: true
        });

        throw clickError;
      }

      await page.waitForTimeout(15000); // Wait for spin animation
    }

  } catch (error) {
    console.log(
      "❌ Slots Event failed — skipped."
    );
  }
};
