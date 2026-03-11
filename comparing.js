const fs = require('fs');
const csv = require('csv-parser');
const { Builder, By } = require('selenium-webdriver');

let savedData = [];
fs.createReadStream('books.csv')
    .pipe(csv())
    .on('data', (row) => {
        savedData.push(row);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        runPriceVerificationTest();
    });

async function runPriceVerificationTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        let currentData = [];
        for (let page = 1; page <= 2; page++) {
            if (page === 1) {
                await driver.get('http://books.toscrape.com/');
            }
            else {
                await driver.get(`http://books.toscrape.com/catalogue/page-${page}.html`);
            }

            await driver.sleep(2000); // Wait for the page to load
            let books = await driver.findElements(By.css('article.product_pod'));

            for (let book of books) {
                let titleElement = await book.findElement(By.css('h3 > a'));
                let title = await titleElement.getAttribute('title');
                let priceElement = await book.findElement(By.css('p.price_color'));
                let price = await priceElement.getText();
                currentData.push({ Title: title, Price: price });
            }
        }

        let discrepancies = [];
        for (let i=0; i < savedData.length; i++) {
            let savedBook = savedData[i];
            let currentBook = currentData.find(book => book.Title === savedBook.Title);
            if (currentBook) {
                if (currentBook.Price !== savedBook.Price) {
                    discrepancies.push({
                        Title: savedBook.Title,
                        SavedPrice: savedBook.Price,
                        CurrentPrice: currentBook.Price
                    });
                    console.log(
                        `Price discrepancy for "${savedBook.Title}": Saved Price = ${savedBook.Price}, Current Price = ${currentBook.Price}`
                    );
                } else {
                    console.log(`Price for "${savedBook.Title}" is consistent: ${savedBook.Price}`);
                }
            } else {
                console.log(`Book "${savedBook.Title}" not found in current data.`);
            }
        }

        if (discrepancies.length > 0) {
            console.log('Discrepancies found:');
            discrepancies.forEach(discrepancy => {
                console.log(`Title: ${discrepancy.Title}, Saved Price: ${discrepancy.SavedPrice}, Current Price: ${discrepancy.CurrentPrice}`);
            });
        } else {
            console.log('No discrepancies found. All prices are consistent.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await driver.quit();
    }}