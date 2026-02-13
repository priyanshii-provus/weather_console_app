const readline = require('readline/promises');
const { stdin, stdout } = require('process');

// Get weather by city
async function getWeather(city) {
  try {
    const res = await fetch(`WHEATER_API${city}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Get weather using IP
async function getWeatherFromIP() {
  try {
    const res = await fetch('CITY_IP');
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.city) return null;

    console.log(`Your city is: ${data.city}`);
    return { city: data.city, weather: await getWeather(data.city) };
  } catch {
    return null;
  }
}

// Gemini AI report
async function getAIReport(city, weather, apiKey) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
I am in ${city}.
Weather data: ${JSON.stringify(weather)}.

Write a friendly weather report with emojis.
`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  } catch {
    return null;
  }
}

// Main program
async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log('Welcome to AI Weather App');

  const apiKey = await rl.question('Enter Gemini API key: ');
  if (!apiKey) {
    console.log('API key is required.');
    return rl.close();
  }

  const cityInput = await rl.question(
    'Enter city name (or press Enter / type "na"): '
  );

  let result;

  if (!cityInput.trim() || cityInput.toLowerCase() === 'na') {
    result = await getWeatherFromIP();
  } else {
    result = {
      city: cityInput,
      weather: await getWeather(cityInput)
    };
  }

  if (!result || !result.weather) {
    console.log('Could not get weather data.');
    return rl.close();
  }

  console.log(`Creating weather report for ${result.city}...`);

  const report = await getAIReport(
    result.city,
    result.weather,
    apiKey
  );

  console.log('\n------------------------------');
  if (report) {
    console.log(report);
  } else {
    console.log('AI report failed.');
    console.log('Temperature:', result.weather.temperature);
    console.log('Forecast:', result.weather.forecast);
  }
  console.log('------------------------------\n');

  rl.close();
}

main();
