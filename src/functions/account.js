import R from 'ramda';

function hasStr(own) {
  return function(spec) {
    if (spec.indexOf(own) !== -1) return true;
    else return false;
  };
}

function build(prop) {
  return function(value) {
    let obj = {};
    obj[prop] = value;
    return obj;
  };
}

export default R.ifElse(hasStr('@'), build('email'), build('loginname'));
