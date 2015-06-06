var Q = require ('q');
var fs = require('fs');
var http = require("http");
var Parser = require('./parser');
var Fucker = require('./fucker');
var WordSwap = require('./wordSwap');

var API = "b7e4ea6d2a4405573300b0166030681fb62421a34b5c36bf1";
var rhymeURL1 = 'http://api.wordnik.com:80/v4/word.json/';
var rhymeURL2 = '/relatedWords?useCanonical=false&relationshipTypes=rhyme&limitPerRelationshipType=20&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
var catRhymeURL = 'http://api.wordnik.com:80/v4/word.json/cats/relatedWords?useCanonical=false&relationshipTypes=rhyme&limitPerRelationshipType=20&api_key=' + API;
var getNounsURL = "http://api.wordnik.com/v4/words.json/randomWords?" +
                  "minCorpusCount=1000&minDictionaryCount=10&" +
                  "excludePartOfSpeech=proper-noun,proper-noun-plural,proper-noun-posessive,suffix,family-name,idiom,affix&" +
                  "hasDictionaryDef=true&includePartOfSpeech=noun&limit=2&maxLength=12&" +
                  "api_key=" + API;

url2 = "http://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";

var writeStream = fs.createWriteStream('output.txt');

//Acess returned text like this   >> text[verse][word]
//For number of verses 			  >> text.length
//For number of words in a verse  >> text[verse].length
function readTest(){
	var deferred = Q.defer();
	fs.readFile('revelations1-6.txt', function (err, logData) {
		if(err) throw err;
		var text = logData.toString();
		var parser = new Parser();
		deferred.resolve(parser.parse_verse(text));
	});
	return deferred.promise;
}

function randomWord(verseIndex, wordIndex){
	var deferred = Q.defer();
	http.get(url2, function(response){
		var buffer = '',
			data,
			route;
		response.on("data", function(chunk){
			buffer += chunk;
		});

		response.on("end", function(err){
			data = JSON.parse(buffer);
			console.log("Response: " + data.word);
			var res = [data.word, verseIndex, wordIndex];
			deferred.resolve(res);
		});
	});
	return deferred.promise;
}

function rhymeWord(verseIndex, wordIndex, wordToRhyme){
	var deferred = Q.defer();
	var frontChar = wordToRhyme.match(/^\W/);
	if(frontChar) frontChar = frontChar[0];
	else frontChar = '';
	var backChar = wordToRhyme.match(/\W+$/);
	if(backChar) backChar = backChar[0];
	else backChar = '';
	var wordOnlyArray = wordToRhyme.split(/\W/g);
	var wordOnly = '';
	for(var i = 0; i < wordOnlyArray.length; i++){
		if(wordOnlyArray[i] !== ''){
			wordOnly = wordOnlyArray[i];
		}
	}
	wordOnly = wordOnly.toLowerCase();
	http.get(rhymeURL1 + wordOnly + rhymeURL2, function(response){
		var buffer = '',
			data,
			route;
		response.on("data", function(chunk){
			buffer += chunk;
		});

		response.on("end", function(err){
			console.log(verseIndex + " : " + wordIndex);
			if(!buffer){
				var res = [wordOnly, verseIndex, wordIndex];
				deferred.resolve(res);
				return;
			}
			data = JSON.parse(buffer);
			if(!data[0]){
				var res = [wordOnly, verseIndex, wordIndex];
				deferred.resolve(res);
				return;
			}
			var randomIndex = Math.floor(Math.random() * (data[0].words.length - 1));
			var rhymedWord = data[0].words[randomIndex];
			rhymedWord = rhymedWord.toLowerCase();
			var res = [frontChar + rhymedWord + backChar, verseIndex, wordIndex];
			deferred.resolve(res);
		});
	});
	return deferred.promise;
}

function writeOutResults(text){
	console.log('Writing results');
	for(var v = 0; v < text.length; v++){
		for(var w = 0; w < text[v].length; w++){
			writeStream.write(text[v][w] + ' ');
		}
	}
	writeStream.end();
}

readTest().then(function(res){
	return res;
}).then(function(textFile){
	var deferred = Q.defer();
	var promises = [];
	var newText = [];
	for(var v = 0; v < textFile.length; v++){
		if(!newText[v]) newText.push([]);
		for(var w = 0; w < textFile[v].length; w++){
			newText[v][w] = textFile[v][w];
		}
	}
	for(var v = 0; v < textFile.length; v++){
		for(var w = 1; w < textFile[v].length; w++){
			promises.push(rhymeWord(v, w, textFile[v][w]).then(function(res){
				newText[res[1]][res[2]] = res[0];
			}));
		}
	}
	Q.all(promises).then(function(){
		writeOutResults(newText);
	});
});


writeStream.on('finish', function(){
	console.log('Write stream finished writing.');
});