const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/scrape", (req, res) => {
  scrapeLogic(res);
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running for puppeteer-render!<BR>Time= " +  new Date(Date.now()).toTimeString()+ '<BR>Listening on port ${PORT}');
  console.log('GET:   Listening on port ' + PORT + '\nTime= ' +  new Date(Date.now()).toTimeString()) + '\n\n';
});

app.listen(PORT, () => {
  console.log('LISTEN:   Listening on port ' + PORT + '\nTime= ' +  new Date(Date.now()).toTimeString()) + '\n\n';
});
