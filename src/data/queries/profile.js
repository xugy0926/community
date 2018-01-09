import { GraphQLList as List, GraphQLBoolean } from 'graphql';
import Profile from '../../data/models/profile';
import ProfileType from '../types/ProfileType';

const profile = {
  name: 'get profile.',
  type: ProfileType,
  resolve: (obj, {}, { db }) => db.findOne(Profile)({}, {})
};

export default profile;
