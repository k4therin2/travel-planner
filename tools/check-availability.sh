#!/bin/bash
# Quick Viator Availability Check
# Opens all 3 URLs in your default browser

echo "Opening Viator pages..."
echo "1. Complete any CAPTCHAs"
echo "2. Use the bookmarklet OR paste the JS snippet in console"
echo ""

# Viator URLs
open "https://www.viator.com/tours/Puerto-Vallarta/Private-Los-Arcos-snorkeling/d630-46209P9"
sleep 2
open "https://www.viator.com/tours/Puerto-Vallarta/Mexican-Cooking-Class-and-Mezcal-Tasting/d630-428665P2"
sleep 2
open "https://www.viator.com/tours/Puerto-Vallarta/Chocolates-and-truffles-workshop/d630-69776P2"

echo "URLs opened. Check your browser!"
echo ""
echo "Console snippet (paste in DevTools):"
cat << 'SNIPPET'

(async()=>{const r={url:location.href,product:document.querySelector('h1')?.textContent?.trim()};document.querySelector('[data-testid*="calendar"],[class*="DatePicker"]')?.click();await new Promise(r=>setTimeout(r,2000));r.prices=[...document.querySelectorAll('[class*="price"]')].filter(e=>e.textContent.includes('$')).slice(0,2).map(e=>e.textContent.trim());r.times=[...document.querySelectorAll('[class*="time"]')].filter(e=>/\d:\d/.test(e.textContent)).map(e=>e.textContent.trim());console.log(r.product,'\n',r.prices[0],'\nTimes:',r.times.join(', '));})();

SNIPPET
