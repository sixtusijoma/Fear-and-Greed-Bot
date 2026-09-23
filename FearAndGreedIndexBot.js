
/*
 The Cryptocurrency Fear and Greed Index is a number that displays the current
 sentiment towards Bitcoin and other cryptocurrencies. The number ranges from 0-100,
 as 0 being extreme fear and 100 being extreme greed. Extreme fear can be a sign that
 investors are too worried. That could be a buying opportunity. When Investors are
 getting too greedy, that means the market is due for a correction.

 The website "https://alternative.me/crypto/fear-and-greed-index/" calculates and posts the
 Fear and Greed Index for the cryptocurrency market once daily.
 This bot reads the index from that site's API, along with current Bitcoin and
 Ethereum prices and their 24-hour changes, and tweets them out.

 The tweet runs once per invocation and then exits.
*/

const { TwitterApi } = require("twitter-api-v2");

const FNG_URL = "https://api.alternative.me/fng/";
// usd_24h_change is the percent move versus USD over the last 24 hours.
const PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";

const CREDENTIAL_VARS = ["CONSUMER_KEY", "CONSUMER_SECRET", "ACCESS_TOKEN", "ACCESS_TOKEN_SECRET"];

sendTweet();

async function sendTweet() {
	try {
		const [fngRes, priceRes] = await Promise.all([
			fetch(FNG_URL),
			fetch(PRICE_URL)
		]);

		if (!fngRes.ok) {
			throw new Error("Fear and Greed Index fetch failed: " + fngRes.status);
		}
		if (!priceRes.ok) {
			throw new Error("Price fetch failed: " + priceRes.status);
		}

		const fng = await fngRes.json();
		const prices = await priceRes.json();

		const tweet = "Today's Cryptocurrency Fear And Greed Index: " + fng.data[0].value +
			"\n\nRanking: " + fng.data[0].value_classification +
			"\n\nBitcoin Price: " + formatPriceWithDailyChange(prices.bitcoin.usd, prices.bitcoin.usd_24h_change, false) +
			"\nEthereum Price: " + formatPriceWithDailyChange(prices.ethereum.usd, prices.ethereum.usd_24h_change, true) +
			"\n\n$BTC $ETH";

		console.log(tweet);

		const missing = CREDENTIAL_VARS.filter(name => !process.env[name]);
		if (missing.length > 0) {
			throw new Error("Missing environment variables: " + missing.join(", "));
		}

		const client = new TwitterApi({
			appKey: process.env.CONSUMER_KEY,
			appSecret: process.env.CONSUMER_SECRET,
			accessToken: process.env.ACCESS_TOKEN,
			accessSecret: process.env.ACCESS_TOKEN_SECRET,
		});

		const result = await client.v2.tweet(tweet);
		console.log("Tweeted:", result.data.id);
	} catch (err) {
		const detail = err.data ? JSON.stringify(err.data) : err.message;
		console.log("Could not build or post tweet:", detail);
		process.exitCode = 1;
	}
}

function formatPriceWithDailyChange(usd, changePercent, roundPrice) {
	const amount = roundPrice ? Math.round(usd) : usd;
	const roundedChange = Number(changePercent.toFixed(2));
	const sign = roundedChange > 0 ? "+" : roundedChange < 0 ? "-" : "";
	const percent = sign + Math.abs(roundedChange).toFixed(2);

	return "$" + amount.toLocaleString("en-US") + " (" + percent + "%)";
}
