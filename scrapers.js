const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
let price = 0.0000;
let interval;

const express = require('express')
const app = express()
const cors = require('cors'); //security to protect webserver
app.use(cors())
const http = require('http');
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get("/", (req, res) => { //If you choose to manually request it
    res.send({ price: price }).status(200);
});

//run forever
setInterval(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://cryptowat.ch/charts/KRAKEN:DOGE-USD', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#price-ticker');
        const [el] = await page.$x('//*[@id="price-ticker"]')//xpath here
        const txt = await (await el.getProperty('textContent')).jsonValue();

        price = parseFloat(txt.substring(0, 6)).toFixed(4);
        await browser.close();
    }
    catch (err) {
        console.log(err)
    }
}, 15000)

const getApiAndEmit = socket => {
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", price);
};

io.on('connection', (socket) => {
    if (interval) { clearInterval(interval) }
    console.log('a user connected');
    interval = setInterval(() => getApiAndEmit(socket), 1000); //send response every second
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));