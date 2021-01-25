const express = require('express');
const fetch = require('node-fetch');
const convert = require('xml-js');

const app = express();


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/documents', async (req, res) => {
   const url= 'https://www.patersonnj.gov/egov/api/request.egov?request=feed;dateformat=%25m-%25d-%25Y;ctype=4;title=Latest%20Documents;classificationid=62;count=200'
   try{
    const response = await fetch(url)
    const body = await response.text()
    const data = await JSON.parse(convert.xml2json(body, {compact: true, spaces: 4}))
    const entries = data.feed.entry
    const filteredArray = entries.filter(entry => (entry.title._text.includes('Bid') || entry.title._text.includes('RFP') || entry.title._text.includes('BID') || entry.title._text.includes('rfp')))
    res.status(200).json(filteredArray)
   } catch(e){
       res.status(500).json({message: 'unable to parse data'})
   }
   
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));