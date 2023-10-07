import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { startStandaloneServer } from '@apollo/server/standalone';
import typeDefs from './schema.js';
import resolvers from './resolver.js';
import './dbInit.js';

// Construction du schéma fédéré
// const federatedSchema = buildFederatedSchema([
//     {
//         typeDefs,
//         resolvers,
//     },
// ]);

// Création du serveur Apollo
const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`)
