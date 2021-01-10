
// API wrapper used to have control over the APIs (Geonames, weatherbitURL, Pixabay)
const geonamesURL = 'http://localhost:8081/geonames';
const weatherbitURL = 'http://localhost:8081/weatherbit';
const pixabayURL = 'http://localhost:8081/pixabay';


// track the number of locations added to the results
let itemsCount = 0;
let results = document.querySelector('#results');

// trip object
const tripObject = {
    location: '',
    date: '',
    toponymName: '',
    name: '',
    countryName: '',
    lat: '',
    lon: '',
    temp: '',
    maxTemp: '',
    minTemp: '',
    description: '',
    notes: '',
    datetime: '',
    imageURL: '',
    countdown: function () {
        let userDate = new Date(this.date);
        var countDownDate = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate(), 0, 0, 0);
        let now = new Date();

        let seconds = Math.floor((countDownDate - (now)) / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        hours = hours - (days * 24);
        minutes = minutes - (days * 24 * 60) - (hours * 60);
        seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

        if (days == -1) {
            return 'Today';
        } else if (days < -1) {
            return ''
        } else {
            return 'In ' + days + " days, " + hours + " hours and " + minutes + ' minutes';
        }
    },
    stringDate: function () {
        let date = new Date(this.date).toDateString();
        return date;
    }
};


function handleSubmit(event) {
    event.preventDefault();
    removeAlert();

    // get user input
    let formInputPlace = document.getElementById('place').value
    let formInputDate = document.getElementById('date').value

    // validate that inputs
    if (formInputPlace.replace(/\s/g, "") == "" || formInputDate.replace(/\s/g, "") == "") {
        showAlert("Please fill all fields!");
        return;
    }

    // check if date is in the correct format
    if (typeof Client !== "undefined") {
        if (!Client.isValidDate(formInputDate)) {
            showAlert("Date is not valid!");
            return;
        }
    }

    // create new object
    let trip = { ...tripObject };

    showLoader();

    // start get coordinates
    let urlCoordinates = new URL(geonamesURL);
    let paramsCoordinates = { place: formInputPlace }
    urlCoordinates.search = new URLSearchParams(paramsCoordinates).toString();


    fetch(urlCoordinates)
        .then(res => res.json())
        .then(function (res) {

            // handle no results found
            if (res.status != 200) {
                showAlert(res.statusText);
                hideLoader();
                return;
            }

            console.table(res);
            trip.location = formInputPlace;
            trip.date = formInputDate;
            trip.toponymName = res.data.toponymName;
            trip.name = res.data.name;
            trip.countryName = res.data.countryName;
            trip.lat = res.data.lat;
            trip.lon = res.data.lon;



            // start get weather
            let urlWeather = new URL(weatherbitURL);
            let paramsWeather = { lat: res.data.lat, lon: res.data.lon, date: formInputDate }
            urlWeather.search = new URLSearchParams(paramsWeather).toString();

            fetch(urlWeather)
                .then(res => res.json())
                .then(function (res) {

                    console.table(res);
                    trip.temp = res.data.temp;
                    trip.maxTemp = res.data.maxTemp;
                    trip.minTemp = res.data.minTemp;
                    trip.description = res.data.description;
                    trip.notes = res.data.notes;
                    trip.datetime = res.data.datetime;

                    // start get photo
                    let urlPhoto = new URL(pixabayURL);
                    let paramsPhoto = { place: formInputPlace, country: trip.countryName }
                    urlPhoto.search = new URLSearchParams(paramsPhoto).toString();

                    fetch(urlPhoto)
                        .then(res => res.json())
                        .then(function (res) {

                            console.table(res);
                            trip.imageURL = res.data.imageURL;
                            console.table(trip);
                            addItem(trip);
                            document.getElementById('place').value = "";
                            document.getElementById('date').value = "";

                            hideLoader();
                            // end of get photo
                        });


                    // end of get weather
                });

            // end of get coordinates
        }).catch(function (error) {
            hideLoader();
            showAlert(error);
        });
}

function addItem(item) {
    let html = `
        <div class="container card" style="background-image: url(${item.imageURL});">
            <div class="grid-container">
                <div>
                    <h2>${item.name}, ${item.countryName}</h2>
                    <h3>${item.stringDate()}</h3>
                    <p>${item.countdown()}</p>
                    <br>
                </div>

                <div>
                    <p>${item.notes}</p>
                    <p><strong>${item.temp}°C</strong></p>
                    ${item.minTemp ? '<p>Min <strong>' + item.minTemp + '°C</strong> </p>' : ''}
                    ${item.maxTemp ? '<p>Max <strong>' + item.maxTemp + '°C</strong> </p>' : ''}
                </div>
            </div>
        </div>
    `;
    let li = document.createElement("li");
    li.id = "item-" + (++itemsCount);
    li.innerHTML = html;
    results.appendChild(li);
    li.scrollIntoView({
        behavior: 'smooth'
    });
}

function showLoader() {
    document.querySelector('.loader').style.display = 'block';
}

function hideLoader() {
    document.querySelector('.loader').style.display = 'none';
}

function showAlert(text) {
    let pageAlert = document.querySelector(".alert");
    let pageAlertContent = document.querySelector(".alert-content");
    if (typeof Client !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    pageAlert.style.display = "block";
    pageAlertContent.innerHTML = text;
}

function removeAlert() {
    let pageAlert = document.querySelector(".alert");
    let pageAlertContent = document.querySelector(".alert-content");
    pageAlertContent.innerHTML = "";
    pageAlert.style.display = "none";
}

export { handleSubmit }