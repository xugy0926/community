import R from 'ramda';

export default R.curry(function(value, list) {
  return R.find(R.propEq('_id', value))(list);
});
