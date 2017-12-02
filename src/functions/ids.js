import _ from 'lodash';

export default function ids(prop) {
  return function (items) {
    let list = items
      ? items.map(item => item[prop].toString())
      : [];
    return _.uniq(list);
  }
}