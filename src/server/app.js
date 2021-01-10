const dotenv = require('dotenv');
dotenv.config();

const geonamesApiUsername = process.env.GEONAMES_API_USERNAME;
const weatherbitApiKey = process.env.WEATHERBIT_API_KEY;
const pixabayApiKey = process.env.PIXABAY_API_KEY;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');


const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('dist'));


async function getCoordinates(query) {
    try {
        var params = new URLSearchParams();
        params.append('q', query);
        params.append('maxRows', '10');
        params.append('username', geonamesApiUsername);
        params.append('featureClass', 'P');
        const result = await axios.post('http://api.geonames.org/searchJSON', params);
        return result.data;
    } catch (err) {
        console.error(err);
    }
}

async function getWeather(lat, lon, date, weatherRoute) {
    try {
        var params = new URLSearchParams();
        params.append('lat', lat);
        params.append('lon', lon);
        if (date) {
            // add one day to the end date
            let endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            params.append('start_date', date);
            params.append('end_date', endDate.toISOString().slice(0, 10));
        }
        params.append('key', weatherbitApiKey);
        const result = await axios.get('https://api.weatherbit.io/v2.0' + weatherRoute, { params });
        return result.data;
    } catch (err) {
        console.error(err);
    }
}

async function getPhoto(place) {
    try {
        var params = new URLSearchParams();
        params.append('key', pixabayApiKey);
        params.append('q', place);
        params.append('image_type', 'photo');
        params.append('category', 'buildings');
        const result = await axios.get('https://pixabay.com/api', { params });
        return result.data;
    } catch (err) {
        console.error(err);
    }
}


app.get('/geonames', async function (req, res) {

    let result = await getCoordinates(req.query.place);

    // handle zero result ({ totalResultsCount: 0, geonames: [] })
    if (result.geonames.length > 0) {
        let data = {
            'toponymName': result.geonames[0].toponymName,
            'name': result.geonames[0].name,
            'countryName': result.geonames[0].countryName,
            'lat': result.geonames[0].lat,
            'lon': result.geonames[0].lng,
        }

        res.send({
            'status': 200,
            'statusText': 'OK',
            'data': data
        })
    } else {
        res.send({
            'status': 404,
            'statusText': 'No results found!'
        })
    }


})



app.get('/weatherbit', async function (req, res) {

    // get the current date
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);


    // get user travel date
    let userTravelDate = new Date(req.query.date);
    userTravelDate.setHours(0, 0, 0, 0);

    // get the difference in days
    const diffInMilliseconds = userTravelDate - currentDate;
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

    let notes;
    let result;
    let data;

    // if travel date is in this week we use current route
    if (diffInDays == 0) {
        result = await getWeather(req.query.lat, req.query.lon, null, '/current');
        notes = 'Current weather information';
    }
    // if travel is within the available next 16 days from the weather api we use forecast route
    else if (diffInDays > 0 && diffInDays < 17) {
        result = await getWeather(req.query.lat, req.query.lon, null, '/forecast/daily');
        notes = 'Weather upon arrival based on the forecast weather data';
    }
    // if travel is in the far future we use the historical information
    else if (diffInDays > -1) {
        // remove the year form the date and make it the last year with same month and day
        userTravelDate.setFullYear(currentDate.getFullYear() - 1);
        userTravelDate.setDate(userTravelDate.getDate() + 1);
        result = await getWeather(req.query.lat, req.query.lon, userTravelDate.toISOString().slice(0, 10), '/history/daily');
        notes = 'Weather upon arrival based on the historical weather data';
    }
    // if travel is in the past we use the historical information
    else {
        result = await getWeather(req.query.lat, req.query.lon, req.query.date, '/history/daily');
        notes = 'Weather upon arrival based on the historical weather data';
    }

    // handle the case of 16 days 
    if (diffInDays > 0 && diffInDays < 17) {
        data = {
            'temp': result.data[diffInDays].temp,
            'maxTemp': result.data[diffInDays].max_temp,
            'minTemp': result.data[diffInDays].min_temp,
            'description': result.data[diffInDays].weather?.description,
            'notes': notes,
            'datetime': result.data[diffInDays].datetime
        }
    } else {
        data = {
            'temp': result.data[0].temp,
            'maxTemp': result.data[0].max_temp,
            'minTemp': result.data[0].min_temp,
            'description': result.data[0].weather?.description,
            'notes': notes,
            'datetime': result.data[0].datetime
        }
    }

    res.send({
        'status': 200,
        'statusText': 'OK',
        'data': data
    })
})



app.get('/pixabay', async function (req, res) {

    let imageType = "location";
    let result = await getPhoto(req.query.place);

    // get image of country if location is not avaliable
    if (result.hits.length == 0) {
        imageType = "country";
        result = await getPhoto(req.query.country);
    }

    // placeholder
    let data = {
        'imageURL': 'https://cdn.pixabay.com/photo/2011/12/13/14/31/earth-11015_1280.jpg',
        'imageType': 'placeholder'
    }

    // handle zero result: hits == zero ({"total":0,"totalHits":0,"hits":[]})
    if (result.hits.length > 0) {
        data = {
            'imageURL': result.hits[0].webformatURL,
            'imageType': imageType
        }
    }

    res.send({
        'status': 200,
        'statusText': 'OK',
        'data': data
    })
})


module.exports = app;