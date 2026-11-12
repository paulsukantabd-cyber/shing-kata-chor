/**
 * Browser smoke test.
 *
 * Drives the real game in headless Chrome: welcome → setup → preparation →
 * village, moves the character with the keyboard, walks up to the house and
 * plays the "সিঁধ কাটা" challenge. Fails on any console error or page error.
 *
 * Usage: node scripts/smoke.mjs [--url http://localhost:4173] [--shots <dir>]
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import puppeteer from 'puppeteer-core'

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]

const args = process.argv.slice(2)
const urlFlag = args.indexOf('--url')
const baseUrl = urlFlag >= 0 ? args[urlFlag + 1] : 'http://localhost:4173'
const shotFlag = args.indexOf('--shots')
const shotDir = shotFlag >= 0 ? args[shotFlag + 1] : resolve('smoke-shots')

const chromePath = CHROME_PATHS.find((candidate) => existsSync(candidate))
if (!chromePath) {
  console.error('No Chrome/Edge binary found — cannot run the browser smoke test.')
  process.exit(2)
}

if (!existsSync(shotDir)) {
  mkdirSync(shotDir, { recursive: true })
}

const consoleErrors = []
const pageErrors = []
const failedRequests = []
const results = []

function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail })
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms))
}

async function clickByText(page, text, tag = 'button') {
  const handle = await page.evaluateHandle(
    (needle, selector) => {
      const nodes = Array.from(document.querySelectorAll(selector))
      return nodes.find((node) => node.textContent?.includes(needle)) ?? null
    },
    text,
    tag,
  )

  const element = handle.asElement()
  if (!element) {
    throw new Error(`Could not find a ${tag} containing "${text}"`)
  }

  await element.evaluate((node) => node.scrollIntoView({ block: 'center' }))
  await element.click()
  await sleep(450)
}

async function textOf(page) {
  return page.evaluate(() => document.body.innerText)
}

/** Grabs a square crop around the player so the rig can be inspected. */
async function capturePlayer(page, path) {
  const info = await page.evaluate(() => {
    const game = window.__SHING_GAME__
    const scene = game?.scene?.getScene?.('VillageScene')
    const canvas = document.querySelector('canvas')
    if (!game || !scene || !canvas) {
      return null
    }
    const rect = canvas.getBoundingClientRect()
    return {
      x: scene.playerX ?? 0,
      y: 436,
      left: rect.left,
      top: rect.top,
      scale: rect.width / game.scale.width,
    }
  })

  if (!info) {
    return
  }

  const size = 200
  await page.screenshot({
    path,
    clip: {
      x: Math.max(0, info.left + (info.x - size / 2) * info.scale),
      y: Math.max(0, info.top + (info.y - size) * info.scale),
      width: size * info.scale,
      height: size * info.scale,
    },
  })
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=swiftshader',
      '--enable-unsafe-swiftshader',
      '--window-size=1280,800',
      '--autoplay-policy=no-user-gesture-required',
    ],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    pageErrors.push(error.stack || String(error))
  })
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? 'failed'}`)
  })
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`)
    }
  })

  await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 60000 })
  await sleep(1200)

  // ---------------------------------------------------------------- welcome
  let body = await textOf(page)
  check('welcome screen renders the title', body.includes('সিঁধেল চোর'), body.slice(0, 60))
  check('welcome screen renders the tagline', body.includes('সিঁধ কাটবি'))
  await page.screenshot({ path: resolve(shotDir, '01-welcome.png') })

  // ------------------------------------------------------------------ setup
  await clickByText(page, 'খেলা শুরু করো')
  body = await textOf(page)
  check('player setup screen appears', body.includes('চোরের নাম ঠিক করো'))
  check('setup screen shows the lungi options', body.includes('নীল চেক') && body.includes('লাল চেক'))

  const nameInput = await page.$('input[type="text"]')
  await page.$eval('input[type="text"]', (element) => {
    element.value = ''
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await nameInput.type('রফিক')
  await sleep(300)

  await clickByText(page, 'লাল চেক')
  await sleep(300)
  await page.screenshot({ path: resolve(shotDir, '02-setup.png') })

  // ------------------------------------------------------------ preparation
  await clickByText(page, 'প্রস্তুতি নাও')
  body = await textOf(page)
  check('preparation screen appears', body.includes('রাতের প্রস্তুতি'))
  check('preparation screen lists the oils', body.includes('সরিষার তেল') && body.includes('মবিল'))
  await clickByText(page, 'সয়াবিন তেল')
  await sleep(250)
  await page.screenshot({ path: resolve(shotDir, '03-preparation.png') })

  // ------------------------------------------------------------------ game
  await clickByText(page, 'চলো, গ্রামে যাই!')
  await sleep(3500)

  const canvas = await page.$('canvas')
  check('phaser canvas is mounted', Boolean(canvas))

  const sceneState = await page.evaluate(() => {
    const game = window.__SHING_GAME__
    const manager = game?.scene
    return {
      exists: Boolean(game),
      scenes: manager ? manager.getScenes(true).map((scene) => scene.scene.key) : [],
    }
  })
  check('game instance is exposed for diagnostics', sceneState.exists)
  check('village scene is running', sceneState.scenes.includes('VillageScene'), sceneState.scenes.join(', '))

  await page.screenshot({ path: resolve(shotDir, '04-village.png') })
  await capturePlayer(page, resolve(shotDir, '04b-player.png'))

  // ------------------------------------------------------- character moves
  const readPlayerX = () =>
    page.evaluate(() => {
      const game = window.__SHING_GAME__
      const scene = game?.scene?.getScene?.('VillageScene')
      const rig = scene?.rig
      return rig ? rig.root.x : null
    })

  const before = await readPlayerX()
  await page.keyboard.down('KeyD')
  await sleep(900)
  await page.keyboard.up('KeyD')
  await sleep(200)
  const after = await readPlayerX()

  check('character moves right with the keyboard', before !== null && after !== null && after > before, `${before} → ${after}`)

  await page.keyboard.down('KeyA')
  await sleep(600)
  await page.keyboard.up('KeyA')
  const back = await readPlayerX()
  check('character moves left with the keyboard', back !== null && back < after, `${after} → ${back}`)

  // running
  await page.keyboard.down('ShiftLeft')
  await page.keyboard.down('KeyD')
  await sleep(700)
  await page.keyboard.up('KeyD')
  await page.keyboard.up('ShiftLeft')
  const afterRun = await readPlayerX()
  check('running covers more ground than walking', afterRun > back + 40, `${back} → ${afterRun}`)

  await page.screenshot({ path: resolve(shotDir, '05-walking.png') })

  // ------------------------------------------------------- house interaction
  await page.evaluate(() => {
    const game = window.__SHING_GAME__
    const scene = game?.scene?.getScene?.('VillageScene')
    if (scene) {
      scene.playerX = 1363
    }
  })
  await sleep(600)

  body = await textOf(page)
  const promptVisible = await page.evaluate(() => {
    const game = window.__SHING_GAME__
    const scene = game?.scene?.getScene?.('VillageScene')
    return Boolean(scene?.promptGroup?.visible)
  })
  check('interaction prompt shows near the house', promptVisible)
  await page.screenshot({ path: resolve(shotDir, '06-prompt.png') })
  await capturePlayer(page, resolve(shotDir, '06b-player-prompt.png'))

  await page.keyboard.press('KeyE')
  await sleep(1200)

  const cutSceneActive = await page.evaluate(() => {
    const game = window.__SHING_GAME__
    return Boolean(game?.scene?.isActive?.('CutScene'))
  })
  check('mini-game scene opens on interact', cutSceneActive)
  await page.screenshot({ path: resolve(shotDir, '07-minigame.png') })

  // Play the challenge: press when the marker is in the calm zone.
  let pressed = 0
  for (let attempt = 0; attempt < 26; attempt += 1) {
    const marker = await page.evaluate(() => {
      const game = window.__SHING_GAME__
      const scene = game?.scene?.getScene?.('CutScene')
      return scene?.state?.marker ?? null
    })

    if (marker !== null && Math.abs(marker - 0.5) < 0.06) {
      await page.keyboard.press('Space')
      pressed += 1
    } else {
      await sleep(60)
    }
  }

  const cutState = await page.evaluate(() => {
    const game = window.__SHING_GAME__
    const scene = game?.scene?.getScene?.('CutScene')
    return scene ? { progress: scene.state?.progress, noise: scene.state?.noise, finished: scene.state?.finished } : null
  })

  check('mini-game responds to input', cutState !== null && pressed > 0, `presses: ${pressed}`)
  check('mini-game progress advanced', cutState !== null && cutState.progress > 0, JSON.stringify(cutState))
  check('mini-game noise meter reacts', cutState !== null && cutState.noise > 0, JSON.stringify(cutState))

  await page.screenshot({ path: resolve(shotDir, '08-minigame-progress.png') })

  // ------------------------------------------------------------ pause/resume
  await page.keyboard.press('Escape')
  await sleep(600)
  body = await textOf(page)
  check('pause overlay appears', body.includes('খেলা থেমে গেছে'))
  await page.screenshot({ path: resolve(shotDir, '09-paused.png') })

  await page.keyboard.press('Escape')
  await sleep(500)

  // ---------------------------------------------------------- back to menu
  await page.click('[aria-label="মূল মেনুতে ফিরে যাও"]')
  await sleep(1200)
  body = await textOf(page)
  check('returns to the welcome screen', body.includes('খেলা শুরু করো'))
  check('phaser canvas is destroyed on exit', (await page.$('canvas')) === null)

  // ------------------------------------------------------------ persistence
  const stored = await page.evaluate(() => window.localStorage.getItem('shing-kata-chor:player'))
  let storedLungi = 'none'
  try {
    storedLungi = JSON.parse(stored ?? '{}').appearance?.lungi ?? 'none'
  } catch {
    storedLungi = 'invalid'
  }
  check('player profile is persisted', storedLungi === 'redCheck', stored ?? 'null')

  await browser.close()

  // --------------------------------------------------------------- summary
  const failed = results.filter((result) => !result.ok)
  console.log('\n--- console errors ---')
  console.log(consoleErrors.length ? consoleErrors.join('\n') : '(none)')
  console.log('\n--- page errors ---')
  console.log(pageErrors.length ? pageErrors.join('\n') : '(none)')
  console.log('\n--- failed requests ---')
  console.log(failedRequests.length ? failedRequests.join('\n') : '(none)')

  writeFileSync(
    resolve(shotDir, 'report.json'),
    JSON.stringify({ results, consoleErrors, pageErrors, failedRequests }, null, 2),
  )

  if (pageErrors.length || consoleErrors.length) {
    console.error('\nBrowser reported errors — treating the run as failed.')
    process.exit(1)
  }

  if (failed.length) {
    console.error(`\n${failed.length} smoke check(s) failed.`)
    process.exit(1)
  }

  console.log(`\nAll ${results.length} smoke checks passed.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
