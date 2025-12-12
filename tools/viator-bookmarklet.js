// Bookmarklet version - minified
// To install: Create a new bookmark and paste this as the URL:

javascript:(async()=>{const r={url:location.href,product:document.querySelector('h1')?.textContent?.trim(),dates:[],prices:[],times:[]};document.querySelector('[data-testid*="calendar"],[class*="DatePicker"],button[aria-haspopup]')?.click();await new Promise(r=>setTimeout(r,1500));document.querySelectorAll('[role="gridcell"] button,[class*="calendar"] button').forEach(b=>{const l=b.getAttribute('aria-label')||'';const d=b.getAttribute('data-date')||b.textContent;if(l.includes('December')||l.includes('15')||l.includes('16')||l.includes('17'))r.dates.push({date:l||d,avail:!b.disabled&&b.getAttribute('aria-disabled')!=='true'})});[...document.querySelectorAll('[class*="price"],[class*="Price"]')].slice(0,3).forEach(e=>{if(e.textContent.includes('$'))r.prices.push(e.textContent.trim())});[...document.querySelectorAll('[class*="time"],[class*="Time"]')].forEach(e=>{if(/\d:\d/.test(e.textContent))r.times.push(e.textContent.trim())});const o=r.product+'\n'+r.prices[0]+'\nDates: '+r.dates.filter(d=>d.avail).map(d=>d.date).join(', ')+'\nTimes: '+r.times.join(', ');alert(o);console.log(JSON.stringify(r,null,2))})();

// ----- READABLE VERSION -----
/*
javascript:(async () => {
  const r = {
    url: location.href,
    product: document.querySelector('h1')?.textContent?.trim(),
    dates: [], prices: [], times: []
  };

  // Open date picker
  document.querySelector('[data-testid*="calendar"],[class*="DatePicker"],button[aria-haspopup]')?.click();
  await new Promise(r => setTimeout(r, 1500));

  // Get dates
  document.querySelectorAll('[role="gridcell"] button,[class*="calendar"] button').forEach(b => {
    const l = b.getAttribute('aria-label') || '';
    const d = b.getAttribute('data-date') || b.textContent;
    if (l.includes('December') || l.includes('15') || l.includes('16') || l.includes('17'))
      r.dates.push({ date: l || d, avail: !b.disabled && b.getAttribute('aria-disabled') !== 'true' });
  });

  // Get prices
  [...document.querySelectorAll('[class*="price"],[class*="Price"]')].slice(0, 3).forEach(e => {
    if (e.textContent.includes('$')) r.prices.push(e.textContent.trim());
  });

  // Get times
  [...document.querySelectorAll('[class*="time"],[class*="Time"]')].forEach(e => {
    if (/\d:\d/.test(e.textContent)) r.times.push(e.textContent.trim());
  });

  const o = r.product + '\n' + r.prices[0] + '\nDates: ' + r.dates.filter(d => d.avail).map(d => d.date).join(', ') + '\nTimes: ' + r.times.join(', ');
  alert(o);
  console.log(JSON.stringify(r, null, 2));
})();
*/
