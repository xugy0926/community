import R from 'ramda';
import {
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull
} from 'graphql';
import Profile from '../../data/models/profile';
import ProfileType from '../types/ProfileType';
import { adminRequired } from '../../core/auth';

const updateProfile = {
  type: ProfileType,
  args: {
    id: {
      name: 'id',
      type: GraphQLID
    },
    guide: {
      name: 'guide',
      type: GraphQLString
    },
    isHtml: {
      name: 'isHtml',
      type: GraphQLBoolean
    }
  },
  resolve: ({ req }, { id, ...data }, { db }) => {
    adminRequired(req);
    id ? db.updateById(Profile)(id, data) : db.create(Profile)(data);
  }
};

export default updateProfile;
