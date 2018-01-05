import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType
} from 'graphql';

const ZoneType = new ObjectType({
  name: 'Zone',
  fields: {
    _id: { type: new NonNull(ID) },
    key: { type: StringType },
    value: { type: StringType },
    template: { type: StringType },
    mustReview: { type: BooleanType },
    enable: { type: BooleanType },
    weight: { type: IntType },
    icon: { type: StringType },
    createText: { type: StringType }
  }
});

export default ZoneType;
