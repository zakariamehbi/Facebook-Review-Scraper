const axios = require("axios");
const uuid = require("uuid");
const cheerio = require("cheerio");
const fs = require("fs");

let pageId = 7264103028; // The facebook page ID
let maxFetchCount = 1; // Number of review to return

// Construct the url to fetch
const constructUrl = (pageId, maxFetchCount, cursor = "") => {
	return `https://www.facebook.com/ajax/pages/review/spotlight_reviews_tab_pager/?cursor=${cursor}&max_fetch_count=${maxFetchCount}&page_id=${pageId}&sort_order=most_helpful&__a=1`;
};

// Get the data with axios and save the reviews into HTML files
const getData = async url => {
	return await axios
		.get(url)
		.then(response => {
			const cleanString = response.data.replace("for (;;);", ""); // clean the JSON
			const newJSON = JSON.parse(cleanString); // From String to JSON
			return newJSON.domops; // Return usefull object
		})
		.then(domops => {
			const htmlReview = domops[0][3].__html;
			const $ = cheerio.load(htmlReview);
			const uniqId = uuid.v1();

			const name = $("a[class=profileLink]")
				.first()
				.text(); // The name of the reviewer
			const message = $("div[data-ad-preview=message]").text(); // The message of the reviwer
			const rating = $(
				"i[class='_51mq img sp_moQfnZWXOJc sx_f455ab']"
			).text(); // The rating of the reviewer

			console.log("---> name : ", name);
			console.log("---> message : ", message);
			console.log("---> rating : ", rating);

			// Save every review into an HTML file
			generateHTML(
				`C:\\Users\\Sky\\Desktop\\Studymapper\\reviews\\${uniqId}.html`,
				htmlReview
			);

			return domops;
		})
		.then(domops => {
			const htmlNextCursor = domops[1][3].__html;
			const $ = cheerio.load(htmlNextCursor);

			// Get the next cursor
			const url = $("a").attr("href");
			let explode = url.split("?cursor=");
			const cursor = explode[1].split("&")[0];

			console.log("---> cursor : ", cursor);

			return cursor;
		})
		.catch(error => {
			console.log(error);
		});
};

const generateHTML = (path, input) => {
	fs.writeFile(path, input, function(err) {
		if (err) {
			return console.log(err);
		}

		// console.log("File saved");
	});
};

const run = async cursor => {
	let url = constructUrl(pageId, maxFetchCount, cursor);
	console.log(url);

	cursor = await getData(url).then(response => {
		return response;
	});

	return run(cursor);
};

run();
