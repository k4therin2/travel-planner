// ==UserScript==
// @name         Viator Availability Extractor
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Auto-extract availability data from Viator tour pages
// @match        https://www.viator.com/tours/*
// @grant        GM_setClipboard
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';

    // Add extract button to page
    const btn = document.createElement('button');
    btn.textContent = '📋 Extract Availability';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;padding:12px 20px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    document.body.appendChild(btn);

    btn.onclick = async () => {
        btn.textContent = '⏳ Extracting...';

        const result = {
            url: location.href,
            product: document.querySelector('h1')?.textContent?.trim(),
            extractedAt: new Date().toISOString(),
            dates: [],
            prices: [],
            timeSlots: []
        };

        // Click date picker
        const datePicker = document.querySelector('[data-testid*="calendar"], [class*="DatePicker"], button[aria-haspopup="dialog"]');
        if (datePicker) {
            datePicker.click();
            await new Promise(r => setTimeout(r, 2000));
        }

        // Extract calendar dates
        document.querySelectorAll('[role="gridcell"] button, [class*="calendar"] button, [class*="Calendar"] button').forEach(day => {
            const label = day.getAttribute('aria-label') || '';
            const dataDate = day.getAttribute('data-date') || '';
            const isAvailable = !day.disabled && day.getAttribute('aria-disabled') !== 'true';
            const hasAvailClass = !day.className.includes('unavailable') && !day.className.includes('disabled');

            if (label.includes('December') || label.includes('2025')) {
                result.dates.push({
                    label: label,
                    date: dataDate,
                    available: isAvailable && hasAvailClass
                });
            }
        });

        // Extract prices
        document.querySelectorAll('[class*="price"], [class*="Price"], [data-testid*="price"]').forEach(el => {
            const text = el.textContent.trim();
            if (text.includes('$') && !result.prices.includes(text)) {
                result.prices.push(text);
            }
        });
        result.prices = result.prices.slice(0, 5);

        // Extract time slots
        document.querySelectorAll('[class*="time"], [class*="Time"], [data-testid*="time"], [class*="slot"], [class*="Slot"]').forEach(el => {
            const text = el.textContent.trim();
            if (/\d{1,2}:\d{2}\s*(AM|PM)?/i.test(text) && !result.timeSlots.includes(text)) {
                result.timeSlots.push(text);
            }
        });

        // Format output
        const availDates = result.dates.filter(d => d.available).map(d => d.label || d.date);
        const output = `
=== ${result.product} ===
URL: ${result.url}
Prices: ${result.prices.join(' | ')}
Times: ${result.timeSlots.join(', ') || 'Select date to see times'}
Available dates: ${availDates.join(', ') || 'Navigate calendar to Dec 2025'}

JSON:
${JSON.stringify(result, null, 2)}
        `.trim();

        // Copy to clipboard
        if (typeof GM_setClipboard !== 'undefined') {
            GM_setClipboard(output);
        } else {
            navigator.clipboard.writeText(output);
        }

        console.log(output);
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = '📋 Extract Availability'; }, 2000);

        // Show notification
        if (typeof GM_notification !== 'undefined') {
            GM_notification({
                title: 'Viator Data Extracted',
                text: result.product,
                timeout: 3000
            });
        }
    };
})();
