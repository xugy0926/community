import { GraphQLNonNull, GraphQLString, GraphQLBoolean } from 'graphql';
import Profile from '../../data/models/profile';
import ProfileType from '../types/ProfileType';
import { adminRequired } from '../../core/auth';

const createProfile = {
  type: ProfileType,
  args: {
    guide: {
      name: 'guide',
      type: new GraphQLNonNull(GraphQLString)
    },
    isHtml: {
      name: 'isHtml',
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  },
  resolve: ({ req }, data, { db }) => {
    adminRequired(req);
    return db
      .findOne(Profile)({}, {})
      .then(doc => {
        if (doc) {
          throw new Error('已经存在');
        } else {
          return db.create(Profile)(data);
        }
      });
  }
};

export default createProfile;
