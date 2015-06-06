var fs = require('fs');
var Parser = require('./parser');

var parser = new Parser();

fs.readFile('rfull_unformatted.txt', function (err, logData){
	if(err) throw error;
	var text = logData.toString();
	var uft = parser.parse_unformattedText(text);
	var results = [];
	var capitalizeNext = false;
	for(var v = 0; v < uft.length; v++){
		if(!results[v]) results.push([]);
		for(var w = 0; w < uft[v].length; w++){
			if(w == 0){
				var verseNumber = uft[v][w].match(/[0-9]+(?=\})/g);
				results[v][w] = '  ' + verseNumber + '  ';
			}
			else if(w == 1 || uft[v][w] === "jesus" || uft[v][w] === "christ" || capitalizeNext){
				results[v][w] = capitalize(uft[v][w]);
			}
			else{
				results[v][w] = uft[v][w];
			}
			capitalizeNext = false;
			if(results[v][w].match(/\./)) capitalizeNext = true;
		}
	}
	writeResults(results);
});

var writestream = fs.createWriteStream("rfull_formatted.txt");

function writeResults(text){
	console.log('Writing results');
	for(var v = 0; v < text.length; v++){
		for(var w = 0; w < text[v].length; w++){
			writestream.write(text[v][w] + ' ');
		}
		writestream.write('\r\n');
	}
	writestream.end();
}

writestream.on('finish', function (){
	console.log("Finished writing");
})

function capitalize(word){
	var chars = word.split('');
	if(!chars[0]) return word;
	chars[0] = chars[0].toUpperCase();
	var result = '';
	for(var i = 0; i < chars.length; i++){
		result += chars[i];
	}
	return result;
}