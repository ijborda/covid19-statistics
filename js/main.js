// Use strict
"use strict";

// Initialize Animation on Scroll
AOS.init();

// Fetch countries and insert in options 
fetch('https://covid19.mathdro.id/api/countries')
    .then(res => res.json())
    .then(data => {
        let selection = document.querySelector('#selection')
        data.countries.forEach(a => {
            let option = document.createElement('option')
            option.value = a.name
            option.innerHTML = a.name
            selection.appendChild(option)
        })
    })

// Show statistics on load (deafult: Worldwide)
showStatistics()

// Listen for selections
document.querySelector('#submit').addEventListener('click', showStatistics)
async function showStatistics() {

    // Get location selection and show in DOM
    let location = document.querySelector('#selection').value
    document.querySelector('#location').innerHTML = location

    // Get total data and show in dom
    let url = location === 'Worldwide' ? 'https://covid19.mathdro.id/api' : `https://covid19.mathdro.id/api/countries/${location}`
    let response = await fetch(url)
    let data = await response.json() 
    let confCurrent = data.confirmed.value
    let diedCurrent = data.deaths.value
    let dateCurrent = data.lastUpdate
    document.querySelector('#conf').innerHTML = num(confCurrent)
    document.querySelector('#died').innerHTML = num(diedCurrent)
    document.querySelector('#date').innerHTML = date(dateCurrent) 

    // Show loading
    showLoading()

    // Get change data and show in dom
    let yesterday   = fetch(`https://covid19.mathdro.id/api/daily/${calcDaysAgo(dateCurrent, 1)}`).then(res => res.json())
    let weekagao    = fetch(`https://covid19.mathdro.id/api/daily/${calcDaysAgo(dateCurrent, 7)}`).then(res => res.json())
    let monthagao   = fetch(`https://covid19.mathdro.id/api/daily/${calcDaysAgo(dateCurrent, 30)}`).then(res => res.json())
    let quarterago  = fetch(`https://covid19.mathdro.id/api/daily/${calcDaysAgo(dateCurrent, 90)}`).then(res => res.json())
    Promise.all([yesterday, weekagao, monthagao, quarterago])
        .then( changes => {
            changes.forEach((data, i) => {
                // Filter data for selections that are country level
                if (location !== 'Worldwide') {
                    data = data.filter(a => a.countryRegion === location)
                }
                // Sum the cases/deaths in the country
                let confPast = data.reduce((acc, a) => acc + +a['confirmed'], 0) 
                let diedPast = data.reduce((acc, a) => acc + +a['deaths'], 0) 
                // Show result (changes) in dom
                let confId = ''
                let diedId = ''
                if (i === 0) {
                    confId = '#confYesterday'
                    diedId = '#diedYesterday'
                } else if (i === 1) {
                    confId = '#confWeekago'
                    diedId = '#diedWeekago'
                } else if (i === 2) {
                    confId = '#confMonthago'
                    diedId = '#diedMonthago'
                } else if (i === 3) {
                    confId = '#confQuarterago'
                    diedId = '#diedQuarterago'
                }
                document.querySelector(confId).innerHTML = `${change(confCurrent, confPast)}% (+ ${diff(confCurrent, confPast)})`
                document.querySelector(diedId).innerHTML = `${change(diedCurrent, diedPast)}% (+ ${diff(diedCurrent, diedPast)})`
            })
        }
    )
}

// Helper function: Show loading while waiting for fetch
function showLoading() {
    Array.from(document.querySelectorAll('.loading')).forEach(a => a.innerHTML = 'Loading...')
}

// Helper function: Format numbers with comma
function num(x) {
    return x.toString()
            .split('')
            .reverse()
            .map((a, i) => {
                if ( i % 3 === 0 && i !== 0) {
                    return `${a}, `
                } else {
                    return a
                }
            })
            .reverse()
            .join('')
            .trim()
}

// Helper function: Format dates in YYYY-MM-DD format
function date(x) {
    return x.split('T')[0]
}

// Helper function: Calculate percent of change between current and past cases/deaths
function change(current, past) {
    let pos = current - past < 0 ? false : true
    return (pos ? '+' : '-') + Math.abs(((current - past)/past * 100)).toFixed(2)
}

// Helper function: Calculate number of change between current and past cases/deaths
function diff(current, past) {
    return num(current - past)
}

// Helper function: Calculate date minus some `past` number of days
function calcDaysAgo(current, num) {
    return new Date(new Date(current) - (num + 1)*24*60*60*1000).toISOString().split('T')[0]
}