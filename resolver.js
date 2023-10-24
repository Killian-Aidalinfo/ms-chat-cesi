import mongoose from 'mongoose';
import fetch from 'node-fetch';

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
            // 🚀 Chercher dans la base de données MongoDB en utilisant Mongoose
            console.log("🚀 Recherche dans la base de données...");

            const cachedResult = await RequestResponse.findOne({ location, personality });

            // Si un résultat est trouvé dans la base de données, retournez-le
            if (cachedResult) {
                console.log("🚀 Données trouvées dans la base de données !");
                return cachedResult.response;
            }

            console.log("🚀 Données non trouvées dans la base de données, interrogation de ms-gptlink...");

            // Faire une requête à ms-gptlink
            const prompt = `Salut Guide ! Je suis en vacances à ${location}. J’aime les sorties de type : ${personality}. Peux-tu me donner des recommandations numérotées sur ce que je pourrais faire ? Commence le nom du lieu après le numéro avec le texte Titre : . Commence la description du lieu par Description : . Essaye de proposer une dizaines de lieux. Si nécessaire, tu peux étendre la zone à quelques kilomètres autour pour plus de suggestions. Merci !`;

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

            if (!gptResult) {
                console.error("🚀 Erreur lors de la récupération des données de ms-gptlink");
                return "Erreur lors de la récupération des suggestions. Veuillez réessayer plus tard.";
            }

            // Enregistrez le message et la réponse dans MongoDB
            const requestResponseEntry = new RequestResponse({
                location: location,
                personality: personality,
                response: gptResult
            });

            try {
                console.log("🚀 Enregistrement des données dans la base de données...");
                await requestResponseEntry.save();
                console.log("🚀 Données enregistrées avec succès !");
            } catch (error) {
                console.error("🚀 Erreur lors de la sauvegarde:", error);
            }

            return gptResult;
        },
    },
};

export default resolvers;
