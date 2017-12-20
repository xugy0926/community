import { GraphQLList as List, GraphQLBoolean } from 'graphql';
import * as db from '../db';
import Zone from '../../data/models/zone';
import ZoneType from '../types/ZoneType';

const zones = {
  name: 'get zones.',
  type: new List(ZoneType),
  args: {
    all: {
      name: 'all',
      type: GraphQLBoolean
    }
  },
  resolve(parentValu, { all = false }, req) {
    const conditions = { deleted: false };

    if (!all) {
      conditions.enable = true;
    }

    const options = { sort: '-weight' };
    return db.find(Zone)(conditions, options);
  }
};

export default zones;
