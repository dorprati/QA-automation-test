const { Builder } = require('selenium-webdriver');

async function openGoogleInChrome() {
    let driver = await new Builder().forBrowser('chrome').build();
    await driver.get('https://the-internet.herokuapp.com/login');
    await driver.manage().window().maximize();
    await driver.sleep(3000);

    const usernameField = await driver.findElement({ xpath: '//*[@id="username"]' });
    await usernameField.sendKeys('tomsmith');

    const passwordField = await driver.findElement({ xpath: '//*[@id="password"]' });
    await passwordField.sendKeys('SuperSecretPassword');

    const loginButton = await driver.findElement({ xpath: '//*[@id="login"]/button' });
    await loginButton.click();

    try{
        const successMessage = await driver.findElement({ css: '.flash.success' }); 
        console.log('Login successful');
        await driver.takeScreenshot().then(
            function(image) {
                require('fs').writeFileSync('login_success.png', image, 'base64');
            }
        );
    } catch (error) {
        console.log('Login failed');
        await driver.takeScreenshot().then(
            function(image) {
                require('fs').writeFileSync('login_failed.png', image, 'base64');
            }
        );
    }

    await driver.sleep(3000);


    //await driver.quit();
}

openGoogleInChrome();