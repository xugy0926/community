import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import test from './queries/test';
import zones from './queries/zones';
import profile from './queries/profile';

import createZone from './mutations/createZone';
import updateZone from './mutations/updateZone';
import deleteZone from './mutations/deleteZone';

import createProfile from './mutations/createProfile';
import updateProfile from './mutations/updateProfile';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      test,
      zones,
      profile
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createZone,
      updateZone,
      deleteZone,
      createProfile,
      updateProfile
    }
  })
});

export default schema;
