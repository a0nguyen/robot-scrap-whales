const puppeteer = require('puppeteer')

async function run () {
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage()
  page.setDefaultTimeout(0)
  await page.goto('https://cis.whoi.edu/science/B/whalesounds/fullCuts.cfm')
  await page.waitFor(2000)
  console.log('getting species')
  let selectSpeciesValues = await page.evaluate(() => {
    let elements = [...document.querySelectorAll('#getSpecies option')]
    return elements.map(x => x.value)
  })
  await page.waitFor(2000)
  console.log('selecting species')
  for (let speciesValue of selectSpeciesValues.splice(3,5)) {
    try {
      await page.select('#getSpecies', speciesValue)
      await page.waitFor(3000)
      console.log('getting years')
      const selectYearValues = await page.evaluate(() => {
        let elements = [...document.querySelectorAll('#pickYear option')]
        return elements.map(x => x.value)
      })
      await page.waitFor(3000)
      for (let yearValue of selectYearValues.splice(1)) {
        try {
          console.log('selecting years')
          await page.click('#pickYear')
          await page.waitFor(3000)
          await page.select('#pickYear', yearValue)
          await page.waitFor(3000)
          let speciesName = await page.evaluate(() => {
            let element = document.querySelector('h3 i').textContent
            return element
          })
          speciesName = speciesName.replace(/\s/g, '')
          console.log('species is:::::::', speciesName)
          await page.evaluate((speciesName) => {
            let elements = [...document.querySelectorAll('.database table a[target="_blank"]')]
            elements.forEach((x, i) => {
              x.setAttribute('download', `${speciesName}-${i}`)
              x.removeAttribute('target')
            })
          }, speciesName)
          await page.waitFor(3000)
          const files = await page.$$('.database table a[download]');
          for (let file of files) {
            await file.click()
            await page.waitFor(3000)
          }
          await page.waitFor(20000)
        } catch (err) {
          console.error(err)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
  browser.close()
}


run();