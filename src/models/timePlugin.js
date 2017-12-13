const distanceInWordsToNow = require('date-fns/distance_in_words_to_now')

export default function(schema) {
  schema.methods.createAtAgo = function() {
    return distanceInWordsToNow(this.createAt);
  };

  schema.methods.updateAtAgo = function() {
    return distanceInWordsToNow(this.updateAt);
  };
}