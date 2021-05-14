const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

async function scrapePrice(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#price-ticker');
    const [el] = await page.$x('//*[@id="price-ticker"]')//xpath here
    const txt = await (await el.getProperty('textContent')).jsonValue();

    console.log([txt]);

    browser.close();
}

scrapePrice('https://cryptowat.ch/charts/KRAKEN:DOGE-USD');