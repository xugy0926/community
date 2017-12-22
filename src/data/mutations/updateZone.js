import R from 'ramda';
import {
  GraphQLList,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull
} from 'graphql';
import Zone from '../../data/models/zone';
import ZoneType from '../types/ZoneType';

const updateZone = {
  type: ZoneType,
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID)
    },
    key: {
      name: 'key',
      type: GraphQLString
    },
    value: {
      name: 'value',
      type: GraphQLString
    },
    template: {
      name: 'value',
      type: GraphQLString
    },
    enable: {
      name: 'value',
      type: GraphQLBoolean
    },
    mustReview: {
      name: 'value',
      type: GraphQLBoolean
    }
  },
  resolve: (obj, { id, ...data }, { db }) => db.updateById(Zone)(id, data)
};

export default updateZone;
