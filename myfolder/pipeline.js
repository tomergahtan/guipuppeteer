const readline = require("readline");
const puppeteer = require("puppeteer");
const browserConfig = {
  headless: false,
  args: [
    "--no-sandbox",
    "--start-maximized",
    // '--window-position=-5000,0',
    "--disable-blink-features=AutomationControlled", // פחות “בוטי”
  ],
};
async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}
async function session() {
  const browser = await puppeteer.launch(browserConfig);
  const page = (await browser.pages())[0];
  await page.goto("https://hit.cma.gov.il/sso/current-state");
  if ((await page.url()).startsWith("https://login.gov.il")) {
    const success = await goForLogin(page);
    browser.close();

    return success;
  }
}
async function goForLogin(page) {
  await page.waitForSelector("#userId", { visible: true });

  await page.type("#userId", "205389992"); // 🔹 תחליף למספר ת"ז שלך
  // סיסמה
  await page.waitForSelector("#userPass", { visible: true });
  await page.type("#userPass", "SYTjul20."); // 🔹 תחליף בסיסמה שלך

  await page.waitForSelector("#loginSubmit", { visible: true });

  await sleep(1000);
  // ללחוץ
  await page.click("#loginSubmit");
  console.log("loginSubmit clicked");
  await page.waitForSelector("#smsOtp", { visible: true });
  let otp = await ask("הכנס/י קוד אימות (6 ספרות): ");
  await page.type("#smsOtp", otp);
  await page.click("#loginOtpSubmit");
  await page.waitForNavigation({ waitUntil: "load" });
  // לחכות לניווט (אם יש הפניה אחרי הלחיצה)

  return "wait for otp";
}

module.exports = {
  session,
};
