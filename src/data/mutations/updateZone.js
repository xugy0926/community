import R from 'ramda';
import {
  GraphQLList,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull
} from 'graphql';
import Zone from '../../data/models/zone';
import ZoneType from '../types/ZoneType';
import { adminRequired } from '../../core/auth';

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
    },
    weight: {
      name: 'weight',
      type: GraphQLInt
    },
    icon: {
      name: 'icon',
      type: GraphQLString
    },
    createText: {
      name: 'createText',
      type: GraphQLString
    }
  },
  resolve: ({ req }, { id, ...data }, { db }) => {
    adminRequired(req);
    db.updateById(Zone)(id, data);
  }
};

export default updateZone;
