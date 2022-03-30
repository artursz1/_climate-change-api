const PORT = 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const {response} = require("express");
const app = express();

const newspapersToScrapeFrom = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: ''
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        base: 'https://www.telegraph.co.uk'
    }
]

const articles = [];

newspapersToScrapeFrom.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text();
                const url = $(this).attr('href');

                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
            })
        })
})

app.get('/', (req, res) => {
    res.json('Welcome to my Climate Change API');
})

app.get('/news', (req, res) => {
    res.json(articles);
})

app.get('/news/:newspaperId', (req, res) => {
    const newsPaperID = req.params.newspaperId;

    const newspaperName = newspapersToScrapeFrom.filter(newspaper => newspaper.name === newsPaperID)[0].name;
    const newspaperAddress = newspapersToScrapeFrom.filter(newspaper => newspaper.name === newsPaperID)[0].address;
    console.log('The selected newspaper is: ' + newspaperName + '\nURL Address: ' + newspaperAddress);

    const newspaperBase = newspapersToScrapeFrom.filter(newspaper => newspaper.name === newsPaperID)[0].base;

    //for example if you want informations only from ONE PARTICULAR WEBSITE:
    axios.get(newspaperAddress)
        .then(response => {
            const htmlResponse = response.data;
            const $ = cheerio.load(htmlResponse);
            const specificArticles = []

            $('a:contains("climate")', htmlResponse).each(function () {
                const htmlResponseTitle = $(this).text();
                const htmlResponseURL = $(this).attr('href');
                specificArticles.push({
                    htmlResponseTitle,
                    htmlResponseURL: newspaperBase + htmlResponseURL,
                    source: newsPaperID
                })
            })
            res.json(specificArticles);
        }).catch(err => console.log(err));
})

app.listen(PORT, () => console.log(`server running on PORT: ${PORT}`));
