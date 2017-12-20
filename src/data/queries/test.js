import { GraphQLString } from 'graphql';
import expressGraphQL from 'express-graphql';

const test = {
  type: GraphQLString,
  args: {
    id: {
      name: 'id',
      type: GraphQLString
    }
  },
  resolve(parentValue, { id }, req) {
    return 'i got id = ' + id;
  }
};

export default test;
