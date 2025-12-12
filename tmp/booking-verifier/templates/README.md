# Booking Verifier Site Templates

Reusable patterns for extracting availability from common booking sites.

## Template Index

| Site | Template | API Available | Bot Detection | Notes |
|------|----------|--------------|---------------|-------|
| ResortPass | `resortpass.js` | YES | Low | Direct JSON API works |
| Viator | `viator.js` | YES (blocked) | HIGH | CAPTCHA/bot detection active |

## Usage

```javascript
const template = require('./templates/resortpass');
const result = await template.checkAvailability({
  hotelId: '1825',
  date: '12/17/2025',
  partySize: 2
});
```
