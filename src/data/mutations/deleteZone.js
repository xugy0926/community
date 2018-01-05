import { GraphQLID, GraphQLNonNull, GraphQLBoolean } from 'graphql';
import Zone from '../../data/models/zone';
import ZoneType from '../types/ZoneType';
import { adminRequired } from '../../core/auth';

const deleteZone = {
  type: GraphQLBoolean,
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: ({ req }, { id }, { db }) => {
    adminRequired(req);
    db
      .remove(Zone)({ _id: id })
      .then(result => {
        return result.ok ? true : false;
      });
    
    return true;
  }
};

export default deleteZone;
