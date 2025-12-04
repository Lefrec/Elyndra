import weaviate, { type WeaviateClient, dataType, generativeParameters, vectors } from 'weaviate-client';

// Step 1.1: Connect to your local Weaviate instance
const client: WeaviateClient = await weaviate.connectToLocal();

// //Creating the collection and adding some content, should not be done twice
// const gods = await client.collections.create({
//   name: 'God',
//   vectorizers: vectors.text2VecOllama({  // Configure the Ollama embedding integration
//     apiEndpoint: 'http://ollama:11434',  // If using Docker you might need: http://host.docker.internal:11434
//     model: 'nomic-embed-text',           // The model to use
//   }),
//   properties: [
//     {
//       name: 'name',
//       dataType: dataType.TEXT,
//     },
//     {
//       name: 'description',
//       dataType: dataType.TEXT,
//     }
//   ]
// });

// const dataObjects = [
//   {name: "Solarys", description: "God of the Sun and of light, embodies power and enlightenment"},
//   {name: "Lunara", description: "Goddess of the ice-cold Moon and mysteries of the night, keeper of dark magic"},
//   {name: "Sylphéra", description: "Goddess of the forests and winds, master of nature and change"},
//   {name: "Aelyon", description: "God of wisdom and destiny, guide of souls and prophetesses"},
//   {name: "Vorathys", description: "God of the deep and burried secrets, protector of sailors and fishermen"},
// ];

// const godCollection = client.collections.get('God');
// const response = await godCollection.data.insertMany(dataObjects);

// console.log(`Imported & vectorized ${dataObjects.length} objects into the Movie collection`);

const gods = client.collections.use("God");

const result = await gods.query.nearText("Who is the sun god ?");
console.log(result);

for (let object of result.objects) {
  console.log(JSON.stringify(object.properties, null, 2))
};

var exists = await client.collections.exists("God");
console.log("Collection God exists : "+exists);

await client.close(); // Free up resources