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

async function sessionStart({ cookies, caseName, username, password }) {
  const browser = await puppeteer.launch(browserConfig);
  if (cookies) await browser.setCookie(...cookies);

  const page = (await browser.pages())[0];
  await page.goto("https://hit.cma.gov.il/sso/current-state");
  if ((await page.url()).startsWith("https://login.gov.il")) {
    await sleep(1000);
    await goForLogin(page);
    const endpoint = browser.wsEndpoint();

    return { endpoint, status: "waiting for otp" };
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
  return;
  await page.type("#smsOtp", otp);
  await page.click("#loginOtpSubmit");
  await page.waitForNavigation({ waitUntil: "load" });
  // לחכות לניווט (אם יש הפניה אחרי הלחיצה)

  return "wait for otp";
}

async function otpProcess(page, OTP) {
  await page.$eval("#smsOtp", (el) => {
    el.value = "";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.type("#smsOtp", OTP);
  await page.click("#loginOtpSubmit");

  try {
    // מחכים לשגיאה (אם יש) עד 2 שניות
    await page.waitForSelector("#errorMessage", { timeout: 2000 });
    console.log("Wrong OTP, retrying...");
    return false;
  } catch (e) {
    // אם לא הופיע errorMessage, ממשיכים כרגיל
    await page.waitForNavigation({ waitUntil: "load" });
    return true;
  }
}

module.exports = {
  session: sessionStart,
  otpProcess: otpProcess,
};
