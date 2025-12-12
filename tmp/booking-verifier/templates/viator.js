/**
 * Viator Booking Verifier Template
 *
 * STATUS: HIGH BOT DETECTION
 *
 * Viator aggressively blocks automated access:
 * - Detects Playwright/Puppeteer even in headful mode
 * - CAPTCHA (slide puzzle) triggered immediately
 * - IP-based blocking active
 *
 * FALLBACK: User-assisted verification required
 *
 * Known API endpoints (blocked without session):
 *   - GraphQL: https://www.viator.com/graphql
 *   - Availability: /api/availability/*
 *   - Products: /api/products/*
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Attempt automated verification (likely to be blocked)
 * Returns user-assisted steps if blocked
 */
async function checkAvailability({ url, date, partySize, outputDir }) {
  const result = {
    request_id: `viator_${Date.now()}`,
    url,
    requested_date: date,
    party_size: partySize,
    observed_at_iso: new Date().toISOString(),
    status: 'unknown',
    options: [],
    evidence: [],
    failure_modes: [],
    next_best_action: null
  };

  let browser;
  try {
    browser = await chromium.launch({
      headless: false, // Must be headful
      args: ['--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Check for bot detection
    const blocked = await page.$('text=Access blocked') ||
                   await page.$('text=Verification Required');

    if (blocked) {
      result.status = 'blocked';
      result.failure_modes.push('Viator bot detection triggered');
      result.next_best_action = generateUserSteps(url, date, partySize);

      await page.screenshot({
        path: path.join(outputDir, 'blocked.png'),
        fullPage: true
      });
      result.evidence.push({ type: 'screenshot', path: 'blocked.png' });
    }

    await browser.close();
  } catch (error) {
    result.status = 'error';
    result.failure_modes.push(error.message);
    result.next_best_action = generateUserSteps(url, date, partySize);
  }

  return result;
}

function generateUserSteps(url, date, partySize) {
  return `USER-ASSISTED VERIFICATION:

1. Open URL in regular browser: ${url}

2. Complete CAPTCHA if shown

3. Click "Check Availability" button

4. Select date: ${date}

5. Select travelers: ${partySize} people

6. Record:
   - Available time slots
   - Price displayed
   - Whether price is per-person or per-group
   - Total for ${partySize} people

Alternative: Try Viator mobile app (less aggressive bot detection)`;
}

module.exports = { checkAvailability, generateUserSteps };
