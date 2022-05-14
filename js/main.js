// Use strict
"use strict";

AOS.init();

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

fetch('https://covid19.mathdro.id/api')
    .then(res => res.json())
    .then(current => {
        // Get current data
        let confCurrent = current.confirmed.value
        let diedCurrent = current.deaths.value
        let dateCurrent = current.lastUpdate
        document.querySelector('#conf').innerHTML = num(confCurrent)
        document.querySelector('#died').innerHTML = num(diedCurrent)
        document.querySelector('#date').innerHTML = date(current.lastUpdate)

        
        // Get yesterday data
        let dateYesterday = calcDaysAgo(dateCurrent, 1)
        fetch(`https://covid19.mathdro.id/api/daily/${dateYesterday}`)
            .then(res => res.json())
            .then(yesterday => {
                let confYesterday = yesterday.reduce((acc, a) => acc + +a['confirmed'], 0) 
                let diedYesterday = yesterday.reduce((acc, a) => acc + +a['deaths'], 0) 
                document.querySelector('#confYesterday').innerHTML = change(confCurrent, confYesterday) + '% (+ ' + diff(confCurrent, confYesterday) + ')'
                document.querySelector('#diedYesterday').innerHTML = change(diedCurrent, diedYesterday) + '% (+ ' + diff(diedCurrent, diedYesterday) + ')'
            })

        // Get 7 days ago data
        let dateWeekago = calcDaysAgo(dateCurrent, 7)
        fetch(`https://covid19.mathdro.id/api/daily/${dateWeekago}`)
            .then(res => res.json())
            .then(weekago => {
                let confWeekago = weekago.reduce((acc, a) => acc + +a['confirmed'], 0) 
                let diedWeekago = weekago.reduce((acc, a) => acc + +a['deaths'], 0) 
                document.querySelector('#confWeekago').innerHTML = change(confCurrent, confWeekago) + '% (+ ' + diff(confCurrent, confWeekago) + ')'
                document.querySelector('#diedWeekago').innerHTML = change(diedCurrent, diedWeekago) + '% (+ ' + diff(diedCurrent, diedWeekago) + ')'
            })
        
        // Get a month ago data
        let dateMonthago = calcDaysAgo(dateCurrent, 30)
        fetch(`https://covid19.mathdro.id/api/daily/${dateMonthago}`)
            .then(res => res.json())
            .then(monthago => {
                let confMonthago = monthago.reduce((acc, a) => acc + +a['confirmed'], 0) 
                let diedMonthago = monthago.reduce((acc, a) => acc + +a['deaths'], 0) 
                document.querySelector('#confMonthago').innerHTML = change(confCurrent, confMonthago) + '% (+ ' + diff(confCurrent, confMonthago) + ')'
                document.querySelector('#diedMonthago').innerHTML = change(diedCurrent, diedMonthago) + '% (+ ' + diff(diedCurrent, diedMonthago) + ')'
            })
        
        // Get a month ago data
        let dateQuarterago = calcDaysAgo(dateCurrent, 90)
        fetch(`https://covid19.mathdro.id/api/daily/${dateQuarterago}`)
            .then(res => res.json())
            .then(quarterago => {
                let confQuarterago = quarterago.reduce((acc, a) => acc + +a['confirmed'], 0) 
                let diedQuarterago = quarterago.reduce((acc, a) => acc + +a['deaths'], 0) 
                document.querySelector('#confQuarterago').innerHTML = change(confCurrent, confQuarterago) + '% (+ ' + diff(confCurrent, confQuarterago) + ')'
                document.querySelector('#diedQuarterago').innerHTML = change(diedCurrent, diedQuarterago) + '% (+ ' + diff(diedCurrent, diedQuarterago) + ')'
            })
    })



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


document.querySelector('#submit').addEventListener('click', function() {
    let location = document.querySelector('#selection').value

    fetch(`https://covid19.mathdro.id/api/countries/${location}`)
    .then(res => res.json())
    .then(current => {
        // Get current data
        let confCurrent = current.confirmed.value
        let diedCurrent = current.deaths.value
        let dateCurrent = current.lastUpdate
        document.querySelector('#conf').innerHTML = num(confCurrent)
        document.querySelector('#died').innerHTML = num(diedCurrent)
        document.querySelector('#date').innerHTML = date(current.lastUpdate)
        document.querySelector('#location').innerHTML = location

        // Initialize fields
        document.querySelector('#confYesterday').innerHTML = 'Loading...'
        document.querySelector('#diedYesterday').innerHTML = 'Loading...'
        document.querySelector('#confWeekago').innerHTML = 'Loading...'
        document.querySelector('#diedWeekago').innerHTML = 'Loading...'
        document.querySelector('#confMonthago').innerHTML = 'Loading...'
        document.querySelector('#diedMonthago').innerHTML = 'Loading...'
        document.querySelector('#confQuarterago').innerHTML = 'Loading...'
        document.querySelector('#diedQuarterago').innerHTML = 'Loading...'

        // Get yesterday data
        let dateYesterday = calcDaysAgo(dateCurrent, 1)
        fetch(`https://covid19.mathdro.id/api/daily/${dateYesterday}`)
            .then(res => res.json())
            .then(yesterday => {
                yesterday = yesterday.filter(a => a.countryRegion === location)
                let confYesterday = yesterday.reduce((acc, a) => acc + +a['confirmed'], 0) 
                let diedYesterday = yesterday.reduce((acc, a) => acc + +a['deaths'], 0) 
                document.querySelector('#confYesterday').innerHTML = change(confCurrent, confYesterday) + '% (+ ' + diff(confCurrent, confYesterday) + ')'
                document.querySelector('#diedYesterday').innerHTML = change(diedCurrent, diedYesterday) + '% (+ ' + diff(diedCurrent, diedYesterday) + ')'
            })

        // Get 7 days ago data
        let dateWeekago = calcDaysAgo(dateCurrent, 7)
        fetch(`https://covid19.mathdro.id/api/daily/${dateWeekago}`)
            .then(res => res.json())
            .then(weekago => {
                weekago = weekago.filter(a => a.countryRegion === location)
                let confWeekago = weekago.reduce((acc, a) => acc + +a['confirmed'], 0) 
                let diedWeekago = weekago.reduce((acc, a) => acc + +a['deaths'], 0) 
                document.querySelector('#confWeekago').innerHTML = change(confCurrent, confWeekago) + '% (+ ' + diff(confCurrent, confWeekago) + ')'
                document.querySelector('#diedWeekago').innerHTML = change(diedCurrent, diedWeekago) + '% (+ ' + diff(diedCurrent, diedWeekago) + ')'
            })
        
        // Get a month ago data
        let dateMonthago = calcDaysAgo(dateCurrent, 30)
        fetch(`https://covid19.mathdro.id/api/daily/${dateMonthago}`)
            .then(res => res.json())
            .then(monthago => {
                monthago = monthago.filter(a => a.countryRegion === location)
                let confMonthago = monthago.reduce((acc, a) => acc + +a['confirmed'], 0) 
                let diedMonthago = monthago.reduce((acc, a) => acc + +a['deaths'], 0) 
                document.querySelector('#confMonthago').innerHTML = change(confCurrent, confMonthago) + '% (+ ' + diff(confCurrent, confMonthago) + ')'
                document.querySelector('#diedMonthago').innerHTML = change(diedCurrent, diedMonthago) + '% (+ ' + diff(diedCurrent, diedMonthago) + ')'
            })
        
        // Get a month ago data
        let dateQuarterago = calcDaysAgo(dateCurrent, 90)
        fetch(`https://covid19.mathdro.id/api/daily/${dateQuarterago}`)
            .then(res => res.json())
            .then(quarterago => {
                quarterago = quarterago.filter(a => a.countryRegion === location)
                let confQuarterago = quarterago.reduce((acc, a) => acc + +a['confirmed'], 0) 
                let diedQuarterago = quarterago.reduce((acc, a) => acc + +a['deaths'], 0) 
                document.querySelector('#confQuarterago').innerHTML = change(confCurrent, confQuarterago) + '% (+ ' + diff(confCurrent, confQuarterago) + ')'
                document.querySelector('#diedQuarterago').innerHTML = change(diedCurrent, diedQuarterago) + '% (+ ' + diff(diedCurrent, diedQuarterago) + ')'
            })
    })

})