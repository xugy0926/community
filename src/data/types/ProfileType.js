import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull
} from 'graphql';

const ProfileType = new ObjectType({
  name: 'Profile',
  fields: {
    _id: { type: new NonNull(ID) },
    guide: { type: StringType },
    isHtml: { type: BooleanType },
  }
});

export default ProfileType;
