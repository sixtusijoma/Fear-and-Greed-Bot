
/* 
 BACKGROUND: The Cryptocurrency Fear and Greed Index is a number that displays the current
 sentiment towards Bitcoin and other cryptocurrencies. The number ranges from 0-100, as 0 being
 extreme fear and 100 being extreme greed. Extreme fear can be a sign that investors are too worried.
 That could be a buying opportunity. When Investors are getting too greedy, that means the market
 is due for a correction.

 The website "https://alternative.me/crypto/fear-and-greed-index/" calculates and posts the 
 Fear and Greed Index for the cryptocurrency market once daily.
 This bot finds the Fear and Greed Index information from the site 
 and tweets them out (@FearAndGreedBot) everyday, a couple hours after they are updated.
 "FG" is an abbreviation for Fear and Greed in variable names.
*/

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var Twit = require('twit');
var config = require('./config');
var T = new Twit(config);


var SEARCH_WORD = "now";
var bodyText= "";
var ranking="";
var FGIndex="0";
var url = "https://alternative.me/crypto/fear-and-greed-index/";

//tweets once every 24 hours
setInterval(sendTweet , 86400000);

 //Parses the website for the Fear and Greed Index information and then tweets it.
 function sendTweet(url, callback ){
	 var FGIRoughStartIndex=0; //index number for where the FGIndex information starts in the bodyText
	 var FGRoughIndex="";//Gets the substring of the FGIndex information (the index number and ranking)

	 //Accesses the website
	 request("https://alternative.me/crypto/fear-and-greed-index/", function(error, response, body) {
	 if(error) {
    	 console.log("Error: " + error);
  	 }
	 console.log("Status code: " + response.statusCode);
	 //Checks the Status code. (200 is HTTP Ok)
	 if(response.statusCode !== 200){
 		//Parses the document body
		callback();
		return;
	 }
	 //Gets the entire text from the website assigns to "bodyText" 
	 var $ = cheerio.load(body);
	 bodyText = $('html > body').text().toLowerCase();

	 //Extracts the FGI information from the website and trims it down to the Ranking and FGIndex number
	 FGIRoughStartIndex =SearchForWord(bodyText, SEARCH_WORD);
	 FGRoughIndex= bodyText.substr((FGIRoughStartIndex+3), 20);
	 ranking= FGRoughIndex.trim();
	 FGIndex= bodyText.substr((FGIRoughStartIndex+3), 45);
	 FGIndex =FGIndex.trim();
	 FGIndex=FGIndex.substr(ranking.length,(FGIndex.length- ranking.length ));
	 FGIndex =FGIndex.trim();
	 if(ranking == "extreme greed"){
	 	 ranking = "Extreme Greed";
	 }else if(ranking == "greed" ){
	 	 ranking ="Greed";
	 }else if(ranking =="extreme fear"){
	 	 ranking= "Extreme Fear";
	 }else if(ranking== "fear" ){
	 	 ranking= "Fear";
	 }else if(ranking == "neutral"){
	 	 ranking ="Neutral";
	 }
 
	 console.log("TWEET:");
	 console.log("Today's Cryptocurrency Fear And Greed Index: " + FGIndex + "\n\nRanking: "+ ranking+ "\n\n\n#Crypto #Bitcoin #Ethereum");
	 //Tweets the FGI
	 
	 var tweet = {
		status: "Today's Cryptocurrency Fear And Greed Index: " + FGIndex + "\n\nRanking: "+ ranking+ "\n\n\n#Crypto #Bitcoin #Ethereum"

	 }
 
	 T.post('statuses/update', tweet, tweeted);
	 function tweeted(err, data, response) {
		 if(err) {
  			 console.log("Something went wrong! Will attempt to tweet again... ");
  			 sendTweet();
  		 }else {
  			 console.log("Tweeted!");

  		 }
	 }
 			
	 });

 }
 function SearchForWord($, word){
	return(bodyText.indexOf(word.toLowerCase()));

 }
