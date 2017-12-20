import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import test from './queries/test';
import zones from './queries/zones';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      test,
      zones
    }
  })
});

export default schema;
