import fetch from 'node-fetch';
import mongoose from 'mongoose';

// Définir le schéma pour la collection MongoDB
const RequestResponseSchema = new mongoose.Schema({
    location: String,
    personality: String,
    response: String,
    timestamp: { type: Date, default: Date.now }
});

// Créer un modèle basé sur le schéma
const RequestResponse = mongoose.model('RequestResponse', RequestResponseSchema);

const resolvers = {
    Query: {
        // Résolveur pour obtenir une réponse basée sur la localisation et la personnalité
        getRequestResponse: async (_, { location, personality }) => {
            const prompt = `Salut Guide ! Je suis en vacances à ${location}. J’aime les sorties de type : ${personality}. Que me propose tu ? Inclus moi un lien Google de l’établissement ou du lieux pour être sûr qu’il est bien ouvert. Tu peux étendre la zone à quelques kilomètres autour si il y a des trucs sympa à faire !`;

            const response = await fetch('http://ms-gptlink:4000', {
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

            const data = await response.json();
            const gptResponse = data.data.getCompletion;
            console.log(location, personality);
            // Enregistrez le message et la réponse dans MongoDB
            const requestResponseEntry = new RequestResponse({
                location: location,
                personality: personality,
                response: gptResponse
            });

            try {
                await requestResponseEntry.save();
            } catch (error) {
                console.error("Erreur lors de la sauvegarde:", error);
            }

            return gptResponse;
        },
    },
};

export default resolvers;
