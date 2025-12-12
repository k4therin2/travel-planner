-- Viator Availability Checker
-- Opens all 3 Viator URLs, waits for you to handle CAPTCHAs, then extracts availability

set viatorURLs to {¬
	"https://www.viator.com/tours/Puerto-Vallarta/Private-Los-Arcos-snorkeling/d630-46209P9", ¬
	"https://www.viator.com/tours/Puerto-Vallarta/Mexican-Cooking-Class-and-Mezcal-Tasting/d630-428665P2", ¬
	"https://www.viator.com/tours/Puerto-Vallarta/Chocolates-and-truffles-workshop/d630-69776P2" ¬
}

set extractScript to "
(async () => {
  const r = {url: location.href, product: document.querySelector('h1')?.textContent?.trim(), dates: [], prices: [], times: []};
  document.querySelector('[data-testid*=\"calendar\"],[class*=\"DatePicker\"],button[aria-haspopup]')?.click();
  await new Promise(r => setTimeout(r, 2000));
  document.querySelectorAll('[role=\"gridcell\"] button,[class*=\"calendar\"] button').forEach(b => {
    const l = b.getAttribute('aria-label') || '';
    if (l.includes('December') || l.includes('15') || l.includes('16') || l.includes('17'))
      r.dates.push({date: l || b.textContent, avail: !b.disabled});
  });
  [...document.querySelectorAll('[class*=\"price\"]')].slice(0,3).forEach(e => {
    if (e.textContent.includes('$')) r.prices.push(e.textContent.trim());
  });
  return JSON.stringify(r);
})();
"

-- Open URLs in Chrome
tell application "Google Chrome"
	activate
	repeat with theURL in viatorURLs
		open location theURL
		delay 1
	end repeat
end tell

-- Prompt user to handle CAPTCHAs
display dialog "Complete any CAPTCHAs in the browser tabs, then click OK to extract availability data." buttons {"Cancel", "OK"} default button "OK"

-- Extract data from each tab
set allResults to ""
tell application "Google Chrome"
	repeat with theWindow in windows
		repeat with theTab in tabs of theWindow
			if URL of theTab contains "viator.com" then
				set tabResult to execute theTab javascript extractScript
				set allResults to allResults & tabResult & return & return
			end if
		end repeat
	end repeat
end tell

-- Show results
display dialog "Results extracted! Check the clipboard." buttons {"OK"} default button "OK"
set the clipboard to allResults
