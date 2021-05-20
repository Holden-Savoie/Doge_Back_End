const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
var price = 0.0000;
var loggedDate = Date.now();//vars only run once on startup

const express = require('express') //webserver
const app = express()
const cors = require('cors'); //security to protect webserver
app.use(cors())
 
app.get('/dogePrice', async (req, res) => {
    try{
        let currentDate = Date.now();
        //If we've done this <15 secs ago, just return old number - save power
        if((currentDate-loggedDate) < 15000){
            res.status(200).send(JSON.stringify({"price":price})); 
            return;
        }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://cryptowat.ch/charts/KRAKEN:DOGE-USD', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#price-ticker');
    const [el] = await page.$x('//*[@id="price-ticker"]')//xpath here
    const txt = await (await el.getProperty('textContent')).jsonValue();

    price = parseFloat(txt.substring(0, 6)).toFixed(4);
    res.status(200).send(JSON.stringify({"price":price}))
    await browser.close();
    loggedDate = currentDate;
    }
    catch(err){
        res.status(500).send(JSON.stringify({"error":err})) 
    }
})

app.listen(5000)
