// These import necessary modules and set some initial variables
require("dotenv").config();
const express = require("express");
const fetch = import("node-fetch");
const convert = require("xml-js");
const rateLimit = require("express-rate-limit");
var cors = require("cors");
const app = express();
const port = 3000;

// Rate limiting - Goodreads limits to 1/sec, so we should too

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 1, // limit each IP to 1 requests per windowMs
});

//  apply to all requests
app.use(limiter);

// Allow CORS from any origin
app.use(cors());

// Routes

// Test route, visit localhost:3000 to confirm it's working
// should show 'Hello World!' in the browser
app.get("/", (req, res) => res.send("Hello World!"));

// My BirdWeather relay route
app.get("/api/search", async (req, res) => {
  try {
    // This uses string interpolation to make our search query string
    // it pulls the posted query param and reformats it for BirdWeather
    const searchString = `q=${req.query.q}`;
	console.log(`https://app.birdweather.com/api/v1/stations/{process.env.BIRDWEATHER_API_KEY}&${searchString}`);
    // It uses node-fetch to call the BirdWeather api, and reads the key from .env
    const response = await fetch(
      `https://app.birdweather.com/api/v1/stations/{process.env.BIRDWEATHER_API_KEY}&${searchString}`,
    );
	
	//more info here https://app.birdweather.com/api/index.html
    const results = await response.text();

    // BirdWeather API returns JSON
    // The API returns stuff we don't care about, so we may as well strip out
    // everything except the results:
	//Chris - I'm not sure what the GoodreadsResponse part does here so it's out for now
    //const results = JSON.parse(json).GoodreadsResponse.search.results;

    return res.json({
      success: true,
      results,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// This spins up our sever and generates logs for us to use.
// Any console.log statements you use in node for debugging will show up in your
// terminal, not in the browser console!
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
