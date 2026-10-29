"""Live-preview regression: delayed canvas mount, DPR sizing, ink and replay.

Run with python3 tests/free-draw-browser.py while the preview is running.
Screenshots stay outside the project under /tmp/browser/free-draw.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path('/tmp/browser/free-draw')
OUT.mkdir(parents=True, exist_ok=True)


async def check_size(canvas):
    result = await canvas.evaluate('''c => {
      const r = c.getBoundingClientRect(), d = window.devicePixelRatio;
      const t = c.getContext('2d').getTransform();
      return {w:c.width, h:c.height, expectedW:Math.round(r.width*d),
        expectedH:Math.round(r.height*d), scaleX:t.a, scaleY:t.d, d};
    }''')
    assert result['w'] == result['expectedW'], result
    assert result['h'] == result['expectedH'], result
    assert result['scaleX'] == result['d'] == result['scaleY'], result


async def alpha(canvas, x, y):
    return await canvas.evaluate('''(c, p) => c.getContext('2d')
      .getImageData(Math.round(p[0]*devicePixelRatio),
        Math.round(p[1]*devicePixelRatio),1,1).data[3]''', [x, y])


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for width, height in [(360, 800), (1024, 1366)]:
            context = await browser.new_context(
                viewport={'width': width, 'height': height}, device_scale_factor=2)
            page = await context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            await page.goto('http://localhost:8080/game/free-draw')
            english = page.get_by_role('button', name='English', exact=True)
            await english.wait_for()
            await english.click()
            canvas = page.get_by_role('img', name='Blank page to draw on')
            await canvas.wait_for()
            await page.wait_for_timeout(300)
            await check_size(canvas)
            rect = await canvas.bounding_box()
            assert rect
            # Draw at the bottom-right, beyond the original 300x150 backing store.
            x, y = rect['width'] - 20, rect['height'] - 25
            await page.mouse.move(rect['x'] + x - 50, rect['y'] + y)
            await page.mouse.down()
            await page.mouse.move(rect['x'] + x, rect['y'] + y, steps=20)
            await page.mouse.up()
            assert await alpha(canvas, x - 20, y) > 0, 'Ink missing under pointer'
            assert await alpha(canvas, x - 20, y - 20) == 0, 'Ink displaced'
            await canvas.screenshot(path=str(OUT / f'{width}-ink.png'))
            await page.wait_for_timeout(700)
            await page.reload()
            await canvas.wait_for()
            await page.wait_for_timeout(400)
            await check_size(canvas)
            assert await alpha(canvas, x - 20, y) > 0, 'Saved drawing not replayed'
            await page.get_by_role('button', name='Undo last stroke').click()
            assert await alpha(canvas, x - 20, y) == 0, 'Undo did not clear ink'
            await page.set_viewport_size({'width': width + 40, 'height': height})
            await page.wait_for_timeout(300)
            await check_size(canvas)
            await canvas.screenshot(path=str(OUT / f'{width}-resized.png'))
            assert not errors, errors
            print(f'PASS {width}px: DPR sizing, lower-right ink alignment, replay, undo, resize')
            await context.close()
        await browser.close()


asyncio.run(main())