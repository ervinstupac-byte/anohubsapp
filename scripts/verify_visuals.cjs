const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('[VisualVerify] Launching Puppeteer on Localhost...');
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        // Optimize viewport
        await page.setViewport({ width: 1280, height: 720 });

        console.log('[VisualVerify] Navigating to http://localhost:3000/ ...');
        // Increase timeout for cold boot
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 15000 });

        // Allow time for redirect and React render
        await new Promise(r => setTimeout(r, 2000));

        console.log('[VisualVerify] Extracting Computed Styles...');
        const bodyMetrics = await page.evaluate(() => {
            const body = document.body;
            const style = window.getComputedStyle(body);
            return {
                height: style.height,
                backgroundColor: style.backgroundColor,
                overflow: style.overflow,
                url: window.location.href,
                hasContent: document.body.innerText.length > 0
            };
        });

        console.log('------------------------------------------------');
        console.log('URL:', bodyMetrics.url);
        console.log('Body Height:', bodyMetrics.height);
        console.log('Background:', bodyMetrics.backgroundColor);
        console.log('Overflow:', bodyMetrics.overflow);
        console.log('Has Content:', bodyMetrics.hasContent);
        console.log('------------------------------------------------');

        const screenshotPath = path.resolve(process.cwd(), 'visual_proof_nc25300.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`[VisualVerify] Screenshot captured: ${screenshotPath}`);

        await browser.close();

        // Assertions
        if (bodyMetrics.height === '0px') throw new Error('Body height is 0px!');

        // RGB(17, 17, 17) is #111
        if (bodyMetrics.backgroundColor !== 'rgb(17, 17, 17)') {
            console.warn('WARNING: Background color mismatch. Expected rgb(17, 17, 17) (#111). Got: ' + bodyMetrics.backgroundColor);
        } else {
            console.log('✅ Background Color Verified (#111)');
        }

    } catch (error) {
        console.error('[VisualVerify] FATAL ERROR:', error);
        process.exit(1);
    }
})();
