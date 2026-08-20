// furniture.js

async function runFurniture(page) {
  try {
    function parseDollars(text) {
      text = text.toLowerCase().replace(',', '').trim();

      if (text.endsWith('k')) {
        return parseFloat(text) * 1000;
      }

      if (text.endsWith('m')) {
        return parseFloat(text) * 1_000_000;
      }

      return parseFloat(text);
    }

    const ITEM_PRICE = 260;
    const MAX_CART_ITEMS = 100;
    const MIN_LOOP_DURATION = 45000; // 45 seconds.

    while (true) {

      await page.goto(
        'https://v3.g.ladypopular.com/mall/cart.php?action=loadMallContent'
      );

      await page.waitForLoadState('networkidle');

      // 💰 Check if we have enough dollars
      const dollarText =
        await page.locator('#player-dollar').innerText();

      const dollars =
        parseDollars(dollarText);

      if (
        dollars <
        ITEM_PRICE * MAX_CART_ITEMS
      ) {
        break;
      }

      // 🛍️ Add 100 items to cart
      const start = Date.now();

      for (
        let i = 0;
        i < MAX_CART_ITEMS;
        i++
      ) {
        const response =
          await page.request.post(
            'https://v3.g.ladypopular.com/ajax/mall/cart.php',
            {
              form: {
                action: 'addToCart',
                mallType: '3',
                itemId: '726',
                itemCategoryId: '19',
                itemCollectionId: '19',
                itemColor: '1',
                pageNum: '1',
                collectionsPage: 'false',
                orderBy: 'id',
                orderType: 'desc'
              }
            }
          );

        const json =
          await response.json();

        if (json?.status !== 1) {
          break;
        }

        // Small delay per request
        await page.waitForTimeout(50);
      }

      // 🕒 Ensure at least 45 seconds passed
      const elapsed =
        Date.now() - start;

      if (
        elapsed <
        MIN_LOOP_DURATION
      ) {
        const waitMore =
          MIN_LOOP_DURATION - elapsed;

        await page.waitForTimeout(
          waitMore
        );
      }

      // 🔁 Reload the cart page to reflect new items
      await page.goto(
        'https://v3.g.ladypopular.com/mall/cart.php?action=loadMallContent'
      );

      await page.waitForLoadState(
        'networkidle'
      );

      // 🧾 Click Buy button if available
      const buyButton =
        page.locator('#cart.buy.btn');

      try {
        await buyButton.waitFor({
          state: 'visible',
          timeout: 10000
        });

        await buyButton.click({
          force: true
        });

      } catch (err) {
        await page.screenshot({
          path: 'buy.button.error.png',
          fullPage: true
        });

        break;
      }

      // 💤 Optional wait after purchase
      await page.waitForTimeout(5000);
    }

  } catch (error) {
    console.log(
      "❌ Furniture Script failed — skipped."
    );
  }
}

module.exports = runFurniture;
