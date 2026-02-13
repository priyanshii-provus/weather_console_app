const readline = require("readline");

const API_KEY = WHEATER_API;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getCityFromIP() {
    const response = await fetch(CITY_IP);
    const data = await response.json();
    return data.city;
}

async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
        console.log("Error:", data.message);
        return;
    }

    console.log("City:", data.name);
    console.log("Temperature:", data.main.temp + "°C");
    console.log("Weather:", data.weather[0].description);
}

rl.question("Enter city name (type na if you don't know): ", async(input) => {
    let city = input;

    if (input.toLowerCase() === "na") {
        console.log("Detecting city using IP address...");
        city = await getCityFromIP();
    }

    await getWeather(city);
    rl.close();
});