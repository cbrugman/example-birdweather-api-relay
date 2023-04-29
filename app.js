// These import necessary modules and set some initial variables
require("dotenv").config();
const express = require("express");
const needle = require('needle');
const rateLimit = require("express-rate-limit");
var cors = require("cors");
const app = express();
const port = 3000;

// Rate limiting - Left over from Goodreads version, limits to 1/sec, so we should too

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
    
	console.log("Received a request");
    // This pulls the posted query param and reformats it for BirdWeather 
	// To send a parameter to this search string you use ?q=parameter at the end of the URL 
	// eg: http://localhost:3000/api/search?q=parameter
	const searchString = `${req.query.q}`;
    
	// Create the api calling url using string interpolation
	// This also reads the key from .env via dotenv
	const api_url = `https://app.birdweather.com/api/v1/stations/${process.env.BIRDWEATHER_API_KEY}/${searchString}`
	
	// Use needle to call the BirdWeather api
    	
	const apiResponse = await needle('get',`${api_url}`);
    const data = apiResponse.body;
    console.log("Returned " + data);
	res.json(data);
	
	//more info here https://app.birdweather.com/api/index.html

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
