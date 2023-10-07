import fetch from 'node-fetch';
import mongoose from 'mongoose';

const RequestResponseSchema = new mongoose.Schema({
    location: String,
    personality: String,
    response: String,
    timestamp: { type: Date, default: Date.now }
});

const RequestResponse = mongoose.model('RequestResponse', RequestResponseSchema);

const resolvers = {
    Query: {
        getRequestResponse: async (_, { location, personality }) => {
            // Check ms-cache first
            let cacheResponse = await fetch('http://ms-cache:4000', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `
                        query ExampleQuery($location: String!, $personality: String!) {
                            getCacheChat(location: $location, personality: $personality)
                        }
                    `,
                    variables: { location, personality }
                })
            });

            const cacheData = await cacheResponse.json();
            const cachedResult = cacheData.data.getCacheChat;

            // If ms-cache has a valid response, return that
            if (cachedResult !== 'Pas de réponse trouvée pour cette combinaison de localisation et de personnalité.') {
                return cachedResult;
            }

            // Else, continue to ms-gptlink
            const prompt = `Salut Guide ! Je suis en vacances à ${location}. J’aime les sorties de type : ${personality}. Que me proposes-tu ? Inclus moi un lien Google de l’établissement ou du lieux pour être sûr qu’il est bien ouvert. Tu peux étendre la zone à quelques kilomètres autour si il y a des trucs sympa à faire !`;

            const gptResponse = await fetch('http://ms-gptlink:4000', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `
                        query ExampleQuery($prompt: String!) {
                            getCompletion(prompt: $prompt)
                        }
                    `,
                    variables: { prompt }
                })
            });

            const gptData = await gptResponse.json();
            const gptResult = gptData.data.getCompletion;

            // Save the message and response to MongoDB
            const requestResponseEntry = new RequestResponse({
                location: location,
                personality: personality,
                response: gptResult
            });

            try {
                await requestResponseEntry.save();
            } catch (error) {
                console.error("Erreur lors de la sauvegarde:", error);
            }

            return gptResult;
        },
    },
};

export default resolvers;
