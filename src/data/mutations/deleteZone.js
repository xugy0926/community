import { GraphQLID, GraphQLNonNull } from 'graphql';
import Zone from '../../data/models/zone';
import ZoneType from '../types/ZoneType';
import { adminRequired } from '../../core/auth';

const deleteZone = {
  type: ZoneType,
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: (obj, { id }, { req, db }) => {
    adminRequired(req);
    db.remove(Zone)({ _id: id });
  }
};

export default deleteZone;
