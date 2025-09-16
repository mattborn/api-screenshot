const functions = require('@google-cloud/functions-framework')
const puppeteer = require('puppeteer')

functions.http('screenshot', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
    return
  }

  const { url } = req.body
  if (!url) {
    res.status(400).send('URL is required')
    return
  }

  let browser
  try {
    browser = await puppeteer.launch()

    const page = await browser.newPage()
    // deviceScaleFactor: 2 would give retina quality but 4x file size
    await page.setViewport({ height: 720, width: 1280 })
    await page.goto(url, { waitUntil: 'domcontentloaded' })

    // Wait for animations like ScrollReveal
    await new Promise(resolve => setTimeout(resolve, 3000))

    const screenshot = await page.screenshot({
      encoding: 'base64',
      type: 'png',
    })

    res.status(200).json({ image: `data:image/png;base64,${screenshot}` })
  } catch (error) {
    console.error('Screenshot failed:', error)
    res.status(500).send(error.message)
  } finally {
    if (browser) await browser.close()
  }
})
