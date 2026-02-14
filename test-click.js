const { chromium } = require('playwright');

async function runDiagnostic() {
    console.log('🔍 NC-19400: Starting headless click-blocker diagnostic...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        console.log('📡 Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });

        console.log('⏱️  Waiting 6 seconds for boot screen and animations...');
        await page.waitForTimeout(6000);

        console.log('📸 Taking full-page screenshot...');
        await page.screenshot({
            path: 'diagnostic-shot.png',
            fullPage: true
        });
        console.log('✅ Screenshot saved to diagnostic-shot.png\n');

        // Check for OVERLAYS with high z-index
        console.log('🔎 Searching for overlay elements with z-index > 100...\n');
        const overlays = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const found = [];

            elements.forEach((el) => {
                const styles = window.getComputedStyle(el);
                const zIndex = parseInt(styles.zIndex);
                const position = styles.position;

                if (zIndex > 100 || position === 'fixed') {
                    const className = el.className || '';
                    const id = el.id || '';
                    const display = styles.display;
                    const opacity = styles.opacity;
                    const visibility = styles.visibility;
                    const pointerEvents = styles.pointerEvents;

                    found.push({
                        tag: el.tagName,
                        id: id || 'NO_ID',
                        className: className.toString().substring(0, 100), // Limit length
                        zIndex: zIndex || 'auto',
                        position,
                        display,
                        opacity,
                        visibility,
                        pointerEvents,
                        isVisible: display !== 'none' && visibility !== 'hidden' && opacity !== '0'
                    });
                }
            });

            return found;
        });

        // Filter only VISIBLE overlays
        const visibleOverlays = overlays.filter(o => o.isVisible && o.zIndex > 100);

        console.log(`Found ${overlays.length} total high-z or fixed elements`);
        console.log(`Found ${visibleOverlays.length} VISIBLE overlays blocking interaction:\n`);

        if (visibleOverlays.length > 0) {
            console.log('🚨 POTENTIAL CLICK BLOCKERS:');
            visibleOverlays.forEach((overlay, idx) => {
                console.log(`\n[${idx + 1}] ${overlay.tag} (z-index: ${overlay.zIndex})`);
                console.log(`    ID: ${overlay.id}`);
                console.log(`    Class: ${overlay.className}`);
                console.log(`    Position: ${overlay.position}`);
                console.log(`    Pointer Events: ${overlay.pointerEvents}`);
                console.log(`    Display: ${overlay.display}, Opacity: ${overlay.opacity}`);
            });
        } else {
            console.log('✅ No visible high-z overlays found!');
        }

        // Check specifically for SystemBootScreen
        console.log('\n\n🔍 Checking for SystemBootScreen presence...');
        const bootScreenExists = await page.evaluate(() => {
            const allDivs = Array.from(document.querySelectorAll('div'));
            return allDivs.some(div => {
                const className = div.className || '';
                return className.includes('z-[9999]') && (div.textContent || '').includes('NEURAL CORE');
            });
        });

        if (bootScreenExists) {
            console.log('🚨 FOUND IT! SystemBootScreen is STILL IN THE DOM!');
            console.log('    The boot screen did NOT remove itself properly.');
            console.log('    This is blocking all clicks.');
        } else {
            console.log('✅ SystemBootScreen is NOT in the DOM.');
        }


    } catch (error) {
        console.error('❌ Diagnostic failed:', error.message);
    } finally {
        await browser.close();
        console.log('\n🏁 Diagnostic complete. Check diagnostic-shot.png for visual confirmation.');
    }
}

runDiagnostic().catch(console.error);
