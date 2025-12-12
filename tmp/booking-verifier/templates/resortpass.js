/**
 * ResortPass Booking Verifier Template
 *
 * API Discovery: ResortPass exposes a clean JSON API at:
 *   https://shop-api.resortpass.com/api/hotels/{hotelId}/products?date={MM/DD/YYYY}
 *
 * No authentication required. Low bot detection.
 *
 * Known Hotel IDs:
 *   - Casa Velas (Puerto Vallarta): 1825
 */

const https = require('https');

const RESORTPASS_API_BASE = 'https://shop-api.resortpass.com/api/hotels';

/**
 * Check availability for a ResortPass hotel
 * @param {Object} params
 * @param {string} params.hotelId - ResortPass hotel ID
 * @param {string} params.date - Date in MM/DD/YYYY format
 * @param {number} params.partySize - Number of guests
 * @returns {Promise<Object>} AvailabilityResult
 */
async function checkAvailability({ hotelId, date, partySize }) {
  const url = `${RESORTPASS_API_BASE}/${hotelId}/products?date=${encodeURIComponent(date)}`;

  const result = {
    request_id: `resortpass_${hotelId}_${date.replace(/\//g, '-')}`,
    observed_at_iso: new Date().toISOString(),
    status: 'unknown',
    options: [],
    evidence: [{ type: 'api_endpoint', url }],
    failure_modes: [],
    next_best_action: null
  };

  try {
    const response = await httpGet(url);

    if (response.products && response.products.length > 0) {
      result.status = 'success';
      result.options = response.products.map(product => ({
        product_name: product.name,
        product_id: product.product_id,
        date: date,
        price_per_person_usd: product.adult_price,
        pricing_model: product.individual_billing ? 'per-person' : 'per-group',
        total_price_for_party_usd: product.adult_price * partySize,
        available_units: product.adult_available_unit,
        availability_status: product.availability,
        confidence: 'high',
        hours: product.pool_hours_details,
        includes: parseIncludes(product.description),
        booking_url: `https://www.resortpass.com/hotels/${hotelId}`
      }));
    } else {
      result.status = 'unavailable';
      result.failure_modes.push('No products returned for this date');
      result.next_best_action = 'Try adjacent dates or check directly on website';
    }
  } catch (error) {
    result.status = 'error';
    result.failure_modes.push(error.message);
    result.next_best_action = 'Check network connectivity or try browser verification';
  }

  return result;
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

function parseIncludes(description) {
  // Extract bullet points from HTML description
  const matches = description.match(/<li[^>]*>([^<]+)<\/li>/gi) || [];
  return matches.map(m => m.replace(/<[^>]+>/g, '').trim());
}

module.exports = { checkAvailability, RESORTPASS_API_BASE };
