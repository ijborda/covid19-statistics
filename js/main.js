// Helper function: Format numbers with comma
function num(x) {
  return x.toString()
    .split('')
    .reverse()
    .map((a, i) => {
      if (i % 3 === 0 && i !== 0) {
        return `${a}, `;
      }
      return a;
    })
    .reverse()
    .join('')
    .trim();
}

// Helper function: Format dates in YYYY-MM-DD format
function date(x) {
  return x.split('T')[0];
}

// Helper function: Calculate percent of change between current and past cases/deaths
function change(current, past) {
  const pos = !(current - past < 0);
  return (pos ? '+' : '-') + Math.abs((((current - past) / past) * 100)).toFixed(2);
}

// Helper function: Calculate number of change between current and past cases/deaths
function diff(current, past) {
  return num(current - past);
}

// Helper function: Calculate date minus some `n` number of days
function calcDaysAgo(current, n) {
  return new Date(new Date(current) - (n + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}
async function getCountries() {
  try {
    // Fetch list of available countries
    const response = await fetch('https://covid19.mathdro.id/api/countries');
    const data = await response.json();
    // Render countries in dropdown
    const dropdown = document.querySelector('#selection');
    data.countries.forEach((country) => {
      const option = document.createElement('option');
      option.value = country.name;
      option.innerHTML = country.name;
      dropdown.appendChild(option);
    });
  } catch (err) {
    throw new Error(err);
  }
}

async function showStatistics() {
  try {
    // Get country and render in DOM as title
    const location = document.querySelector('#selection').value;
    document.querySelector('#location').innerHTML = location;
    // Show loading
    Array.from(document.querySelectorAll('.loading')).forEach((a) => {
      a.innerHTML = 'Loading...';
    });
    // Fetch total data
    const urlTotal = location === 'Worldwide' ? 'https://covid19.mathdro.id/api' : `https://covid19.mathdro.id/api/countries/${location}`;
    const responseTotal = await fetch(urlTotal);
    const dataTotal = await responseTotal.json();
    // Fetch change data
    const urlChange = [`https://covid19.mathdro.id/api/daily/${calcDaysAgo(dataTotal.lastUpdate, 1)}`,
      `https://covid19.mathdro.id/api/daily/${calcDaysAgo(dataTotal.lastUpdate, 7)}`,
      `https://covid19.mathdro.id/api/daily/${calcDaysAgo(dataTotal.lastUpdate, 30)}`,
      `https://covid19.mathdro.id/api/daily/${calcDaysAgo(dataTotal.lastUpdate, 90)}`];
    const responseChange = await Promise.all(urlChange.map((url) => fetch(url)));
    const dataChange = await Promise.all(responseChange.map((res) => res.json()));
    // Render total data in DOM
    document.querySelector('#conf').innerHTML = num(dataTotal.confirmed.value);
    document.querySelector('#died').innerHTML = num(dataTotal.deaths.value);
    document.querySelector('#date').innerHTML = date(dataTotal.lastUpdate);
    // Rednder change data in DOM
    dataChange.forEach((data, i) => {
      // Filter data
      if (location !== 'Worldwide') {
        data = data.filter((dataPoint) => dataPoint.countryRegion === location);
      }
      // Sum the cases/deaths in the country
      const confirmedPast = data.reduce((acc, a) => acc + +a.confirmed, 0);
      const diedPast = data.reduce((acc, a) => acc + +a.deaths, 0);
      // Show result (changes) in dom
      let confId = '';
      let diedId = '';
      if (i === 0) {
        confId = '#confYesterday';
        diedId = '#diedYesterday';
      } else if (i === 1) {
        confId = '#confWeekago';
        diedId = '#diedWeekago';
      } else if (i === 2) {
        confId = '#confMonthago';
        diedId = '#diedMonthago';
      } else if (i === 3) {
        confId = '#confQuarterago';
        diedId = '#diedQuarterago';
      }
      document.querySelector(confId).innerHTML = `${change(dataTotal.confirmed.value, confirmedPast)}% (+ ${diff(dataTotal.confirmed.value, confirmedPast)})`;
      document.querySelector(diedId).innerHTML = `${change(dataTotal.deaths.value, diedPast)}% (+ ${diff(dataTotal.deaths.value, diedPast)})`;
    });
  } catch (err) {
    throw new Error(err);
  }
}

// Use Animation on Scroll
// eslint-disable-next-line no-undef
AOS.init();

// Show statistics on load (deafult: Worldwide)
showStatistics();

// Render list of countries in dropdown
getCountries();

// Render statistics of specific country
document.querySelector('#submit').addEventListener('click', showStatistics);
