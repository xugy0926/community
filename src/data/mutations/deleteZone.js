import { GraphQLID, GraphQLNonNull } from 'graphql';
import Zone from '../../data/models/zone';
import ZoneType from '../types/ZoneType';

const deleteZone = {
  type: ZoneType,
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: (obj, { id }, { db }) => db.remove(Zone)({ _id: id })
};

export default deleteZone;
