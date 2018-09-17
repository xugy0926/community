import R from "ramda";
import { postListCount } from "../config";

const pagesCount = R.divide(R.__, postListCount);

export default R.curry(async function(fn, query) {
  try {
    let count = await fn(query)({});
    return pagesCount(count);
  } catch (err) {
    return 0;
  }
});
