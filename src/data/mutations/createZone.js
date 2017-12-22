import { GraphQLNonNull, GraphQLString } from 'graphql';
import Zone from '../../data/models/zone';
import ZoneType from '../types/ZoneType';

const createZone = {
  type: ZoneType,
  args: {
    key: {
      name: 'key',
      type: new GraphQLNonNull(GraphQLString)
    },
    value: {
      name: 'value',
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: (obj, { key, value }, { db }) => {
    const conditions = { $or: [{ key }, { value }] };
    return db
      .findOne(Zone)(conditions, {})
      .then(doc => {
        if (doc) {
          throw new Error('已经存在');
        } else {
          return db.create(Zone)({ key, value });
        }
      });
  }
};

export default createZone;
