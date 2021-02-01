const express = require('express');
const fetch = require('node-fetch');
const convert = require('xml-js');

const app = express();
let entries

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/documents', async (req, res) => {
   const url= `https://www.patersonnj.gov/egov/api/request.egov?xml=<egov><request id="agedas" xsl="cw-docs-no-desc" type="feed"><title>Latest Documents</title><ctype>documents</ctype><classificationid>63</classificationid><classificationid>62</classificationid><count>200</count><dateformat>%A, %B %d, %Y</dateformat></request></egov>`
   try{
     if(!entries){
      const response = await fetch(url)
      const body = await response.text()
      const data = await JSON.parse(convert.xml2json(body, {compact: true, spaces: 4}))
      entries = data.results.result.feed.entry
     }
    const filteredArray = entries.filter(entry => (entry.title._text.includes('Bid') || entry.title._text.includes('RFP') || entry.title._text.includes('BID') || entry.title._text.includes('rfp')))
    res.status(200).json(filteredArray.filter(entry=> (!entry.title._text.includes('Re-Bid'))))
   } catch(e){
       res.status(500).json({message: 'unable to parse data'})
   }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));