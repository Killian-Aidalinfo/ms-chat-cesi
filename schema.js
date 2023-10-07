import { gql } from 'apollo-server-express';

const typeDefs = gql`
    # Définir une clé pour la fédération. 
    # Ici, je suppose que "id" est unique et peut être utilisé pour référencer une entrée RequestResponse.
    type RequestResponse @key(fields: "id") {
        id: ID!
        location: String!
        personality: String!
        response: String!
        timestamp: String!
    }

    extend type Query {
        getRequestResponse(location: String!, personality: String!): String!
    }

    extend type Mutation {
        saveRequestResponse(location: String!, personality: String!, response: String!): RequestResponse!
    }
`;

export default typeDefs;
