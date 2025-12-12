#!/usr/bin/env node
/**
 * Viator Affiliate API - Availability Checker
 */

const PARTNER_ID = 'P00280585';
const API_KEY = process.env.VIATOR_API_KEY || 'ba5f2b2d-9924-43ff-8d54-0e27850372bc';
const USE_PROD = process.env.VIATOR_PROD === '1';
const BASE_URL = USE_PROD
  ? 'https://api.viator.com/partner'
  : 'https://api.sandbox.viator.com/partner';

// Product codes from Viator URLs
const TOURS = [
  {
    name: 'Private Los Arcos Snorkeling',
    productCode: '46209P9',
    date: '2025-12-15',
    day: 'Sunday'
  },
  {
    name: 'Mexican Cooking Class & Mezcal',
    productCode: '428665P2',
    date: '2025-12-16',
    day: 'Monday'
  },
  {
    name: 'Chocolate & Truffles Workshop',
    productCode: '69776P2',
    date: '2025-12-17',
    day: 'Tuesday'
  }
];

async function checkAvailability(tour) {
  const url = `${BASE_URL}/availability/check`;

  const payload = {
    productCode: tour.productCode,
    travelDate: tour.date,
    paxMix: [{ ageBand: 'ADULT', numberOfTravelers: 2 }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;version=2.0',
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US',
        'exp-api-key': API_KEY,
        'Viator-API-Key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return { tour, status: response.status, data };
  } catch (error) {
    return { tour, status: 'error', error: error.message };
  }
}

async function getProductDetails(productCode) {
  const url = `${BASE_URL}/products/${productCode}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'exp-api-key': API_KEY
      }
    });

    const data = await response.json();

    // Log full response for debugging
    if (process.env.DEBUG) {
      console.log('\n--- FULL RESPONSE ---');
      console.log(JSON.stringify(data, null, 2));
      console.log('--- END ---\n');
    }

    return data;
  } catch (error) {
    return { error: error.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('VIATOR PRODUCT INFO - Puerto Vallarta Dec 2025');
  console.log('='.repeat(60));
  console.log(`Partner ID: ${PARTNER_ID}`);
  console.log(`Environment: ${USE_PROD ? 'PRODUCTION' : 'Sandbox'}`);
  console.log(`API Key: ${API_KEY.substring(0,8)}...`);
  console.log(`Base URL: ${BASE_URL}\n`);

  // Try product details endpoint (usually available with basic access)
  for (const tour of TOURS) {
    console.log(`\n📍 ${tour.name}`);
    console.log(`   Target Date: ${tour.day}, ${tour.date}`);
    console.log(`   Product: ${tour.productCode}`);
    console.log('   Fetching product info...');

    const details = await getProductDetails(tour.productCode);

    if (details.productCode) {
      console.log('   ✅ PRODUCT FOUND');
      console.log(`      Title: ${details.title || 'N/A'}`);

      // Get duration from itinerary
      const duration = details.itinerary?.duration?.fixedDurationInMinutes;
      if (duration) {
        const hours = Math.floor(duration / 60);
        const mins = duration % 60;
        console.log(`      Duration: ${hours}h${mins > 0 ? ` ${mins}m` : ''}`);
      }

      // Pricing info (type)
      if (details.pricingInfo) {
        console.log(`      Pricing: Per ${details.pricingInfo.unitType || details.pricingInfo.type}`);
      }

      // Booking settings
      if (details.bookingConfirmationSettings) {
        console.log(`      Confirmation: ${details.bookingConfirmationSettings.confirmationType}`);
        const cutoff = details.bookingConfirmationSettings.bookingCutoffInMinutes;
        if (cutoff) {
          const cutoffHours = Math.floor(cutoff / 60);
          console.log(`      Book by: ${cutoffHours}h before start`);
        }
      }

      // Cancellation
      if (details.cancellationPolicy) {
        console.log(`      Cancel: ${details.cancellationPolicy.description?.substring(0, 60) || details.cancellationPolicy.type}`);
      }

      // Meeting point
      const meetingPoint = details.logistics?.start?.[0]?.description;
      if (meetingPoint) {
        console.log(`      Meet: ${meetingPoint.substring(0, 80)}...`);
      }
    } else if (details.code === 'FORBIDDEN') {
      console.log('   ⚠️  Product endpoint also restricted');

      // Try availability schedules as alternative
      console.log('   Trying /availability/schedules...');
      const schedUrl = `${BASE_URL}/availability/schedules/${tour.productCode}`;
      try {
        const schedResp = await fetch(schedUrl, {
          headers: {
            'Accept': 'application/json;version=2.0',
            'exp-api-key': API_KEY
          }
        });
        const schedData = await schedResp.json();
        console.log(`   Schedules status: ${schedResp.status}`);
        if (schedResp.status === 200) {
          console.log(`   ${JSON.stringify(schedData).substring(0, 300)}`);
        }
      } catch (e) {
        console.log(`   Schedules error: ${e.message}`);
      }
    } else {
      console.log(`   ⚠️  Error: ${JSON.stringify(details).substring(0, 300)}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Note: Basic affiliate access may not include real-time availability.');
  console.log('Use the manual verification workflow at data/schedules/verify-availability.html');
  console.log('='.repeat(60));
}

main();
