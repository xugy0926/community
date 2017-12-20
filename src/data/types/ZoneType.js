import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull
} from 'graphql';

const ZoneType = new ObjectType({
  name: 'Zone',
  fields: {
    _id: { type: new NonNull(ID) },
    key: { type: StringType },
    value: { type: StringType },
    template: { type: StringType },
    mustReview: { type: BooleanType },
    enable: { type: BooleanType }
  }
});

export default ZoneType;
