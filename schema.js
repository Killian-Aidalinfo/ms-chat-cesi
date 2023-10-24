import { gql } from 'graphql-tag';

const typeDefs = gql`
    # Définir une clé pour la fédération. 
    type RequestResponse @key(fields: "id") {
        id: ID!
        location: String!
        personality: String!
        response: String!
        timestamp: String!
    }
`;

export default typeDefs;
