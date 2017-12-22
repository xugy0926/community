import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import test from './queries/test';
import zones from './queries/zones';

import createZone from './mutations/createZone';
import updateZone from './mutations/updateZone';
import deleteZone from './mutations/deleteZone';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      test,
      zones
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createZone,
      updateZone,
      deleteZone
    }
  })
});

export default schema;
