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

// Show Worldwide statistics on default
showStatistics()

// Listen for selections
document.querySelector('#submit').addEventListener('click', showStatistics)
   
function showStatistics() {
    let location = document.querySelector('#selection').value
    let urlMain = `https://covid19.mathdro.id/api/countries/${location}`
    if (location === 'Worldwide') {
        urlMain = 'https://covid19.mathdro.id/api'
    }
    fetch(urlMain)
        .then(res => res.json())
        .then(current => {
        // Get current data and show in dom
        let confCurrent = current.confirmed.value
        let diedCurrent = current.deaths.value
        let dateCurrent = current.lastUpdate
        showStatisticsMainDOM(confCurrent, diedCurrent, dateCurrent)
        // Show loading in dom
        showLoading()
        // Get past data and show in dom
        showStatisticsSub(location, dateCurrent, 1, confCurrent, diedCurrent)
        showStatisticsSub(location, dateCurrent, 7, confCurrent, diedCurrent)
        showStatisticsSub(location, dateCurrent, 30, confCurrent, diedCurrent)
        showStatisticsSub(location, dateCurrent, 90, confCurrent, diedCurrent)
        })
}    

function showStatisticsMainDOM(confCurrent, diedCurrent, updateDate) {
    document.querySelector('#conf').innerHTML = num(confCurrent)
    document.querySelector('#died').innerHTML = num(diedCurrent)
    document.querySelector('#date').innerHTML = date(updateDate)  
}
function showStatisticsSubDOM(confCurrent, confPast, diedCurrent, diedPast, daysBefore) {
    let confId = '#confYesterday'
    let diedId = '#diedYesterday'
    if (daysBefore === 7) {
        confId = '#confWeekago'
        diedId = '#diedWeekago'
    } else if (daysBefore === 30) {
        confId = '#confMonthago'
        diedId = '#diedMonthago'
    } else if (daysBefore === 90) {
        confId = '#confQuarterago'
        diedId = '#diedQuarterago'
    }
    document.querySelector(confId).innerHTML = change(confCurrent, confPast) + '% (+ ' + diff(confCurrent, confPast) + ')'
    document.querySelector(diedId).innerHTML = change(diedCurrent, diedPast) + '% (+ ' + diff(diedCurrent, diedPast) + ')'
}

function showStatisticsSub(location, dateCurrent, daysBefore, confCurrent, diedCurrent) {
    fetch(`https://covid19.mathdro.id/api/daily/${calcDaysAgo(dateCurrent, daysBefore)}`)
        .then(res => res.json())
        .then(data => {
            if (location !== 'Worldwide') {
                data = data.filter(a => a.countryRegion === location)
            }
            let confPast = data.reduce((acc, a) => acc + +a['confirmed'], 0) 
            let diedPast = data.reduce((acc, a) => acc + +a['deaths'], 0) 
            showStatisticsSubDOM(confCurrent, confPast, diedCurrent, diedPast, daysBefore)
        })
}

function showLoading() {
    document.querySelector('#confYesterday').innerHTML = 'Loading...'
    document.querySelector('#diedYesterday').innerHTML = 'Loading...'
    document.querySelector('#confWeekago').innerHTML = 'Loading...'
    document.querySelector('#diedWeekago').innerHTML = 'Loading...'
    document.querySelector('#confMonthago').innerHTML = 'Loading...'
    document.querySelector('#diedMonthago').innerHTML = 'Loading...'
    document.querySelector('#confQuarterago').innerHTML = 'Loading...'
    document.querySelector('#diedQuarterago').innerHTML = 'Loading...'
}

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

function date(x) {
    return x.split('T')[0]
}

function change(current, past) {
    let pos = current - past < 0 ? false : true
    return (pos ? '+' : '-') + Math.abs(((current - past)/past * 100)).toFixed(2)
}

function diff(current, past) {
    return num(current - past)
}

function calcDaysAgo(current, num) {
    return new Date(new Date(current) - (num + 1)*24*60*60*1000).toISOString().split('T')[0]
}