var Parser = function() {

};

Parser.prototype.parse_verse = function(text) {

	var results = [];

	var verses = text.match(/\{((.|\s)(?!\{))+/g);

	verses.forEach(function(verse) {
		var unFormattedWords = verse.split(' ');
		var words = [];
		unFormattedWords.forEach(function(word){
			var newWord = word.split(/\r|\n/g);

			for(var i = 0; i < newWord.length; i++){
				if(newWord[i].length > 0) words[words.length] = newWord[i];
			}
		});

		results[results.length] = words;
	});
	return results;
};

Parser.prototype.parse_normal = function(text){
	var results = {};

	var sentences = text.match(/[A-Z]((.|\s)(?![A-Z]))+/g);

	sentences.forEach(function(sentence) {
		var words = sentence.split(' ');

		if(!results[words]){
			results[words] = 0;
		}

		results[words] += words.length;
	});

	return results;
}

Parser.prototype.parse_unformattedText = function(text){
	var results = [];
	var sentences = text.match(/\{((.|\s)(?!\{))+/g);
	if(!sentences) return 'No Sentences.';
	var count = 0;
	sentences.forEach(function(sentence){
		var words = sentence.split(' ');
		if(!results[count]) results.push([]);
		var wordCount = 0;
		words.forEach(function (word){
			results[results.length-1][wordCount] = word;
			wordCount++;
		});
		count++;
	});

	return results;
}

module.exports = Parser;