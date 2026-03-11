const fs = require('fs');
const { Builder, By } = require('selenium-webdriver');

async function scrapeBooks() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://books.toscrape.com/');
        let titles = [];
        let prices = [];

        for (let page = 1; page <= 2; page++) {
            await driver.sleep(2000); // Wait for the page to load

            let books = await driver.findElements(By.css('article.product_pod'));

            for (let book of books) {
                let titleElement = await book.findElement(By.css('h3 > a'));
                let title = await titleElement.getAttribute('title');
                let priceElement = await book.findElement(By.css('p.price_color'));
                let price = await priceElement.getText();
                titles.push(title);
                prices.push(price);
            }

            if(page < 2) {
                let nextButton = await driver.findElement(By.css('li.next > a'));
                await nextButton.click();
            }
        }

        for (let i = 0; i < titles.length; i++) {
            console.log(`Title: ${titles[i]}, Price: ${prices[i]}`);
        }

        let csvContent = 'Title,Price\n';
        for (let i = 0; i < titles.length; i++) {
            csvContent += `"${titles[i]}","${prices[i]}"\n`;
        }
        fs.writeFileSync('books.csv', csvContent);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await driver.quit();
    }
}

scrapeBooks();