import weaviate, { type WeaviateClient, dataType, vectors } from 'weaviate-client';

//connect to local Weaviate DB
const client: WeaviateClient = await weaviate.connectToLocal();

//Creating the lore collection, should be done only 1 time
const lore = await client.collections.create({
  name: 'Lore',
  vectorizers: vectors.text2VecOllama({
    apiEndpoint: 'http://ollama:11434',
    model: 'nomic-embed-text',
  }),
properties: [
	{
	    name: 'type',
		dataType: dataType.TEXT,
	},
	{
		name: 'name',
		dataType: dataType.TEXT,
	},
	{
		name: 'desc',
		dataType: dataType.TEXT,
	},
    ]
});

//sets of objects based on type
const Histoire = [
	{
		type : "Histoire",
		name : "Élyndra",
		desc : "Élyndra est un pays de fantaisie séparé en 4 régions et où reignait autrefois la joie, sous la protection des ses 5 dieux.",
	},
	{
		type : "Histoire",
		name : "Mythologie",
		desc : "Le monde d'Élyndra était autrefois sous la protection de 5 dieux : Solarys, Lunara, Sylphéra, Aelyon et Vorathys"
	},
	{
		type : "Histoire",
		name : "Brèche",
		desc : "Un jour, une ancienne brèche cosmique s'ouvrit dans les abysses que Vorathys protégeait, libérant la corruption. Vorathys fut submergé et fusionna à cette froce dévorante, transformant le gardien fidèle en un dieu déformé par le chaos inévitable",
	},
	{
		type : "Histoire",
		name : "Corruption de Vorathys",
		desc : "Consumé par la puissance incontrôlable de la corruption, Vorathys s'empara du pouvoir des 4 autres dieux. Dans un hurlement cosmique il entoura chaque région d'Élyndra de ses créations monstrueuses",
	},
	{
		type : "Histoire",
		name : "La prophétie d'Aelyon",
		desc : "Voyent le royaume au bord de l'anéantissement, Aelyon prononça la prophétie fatidique : Les étoiles s'aligneront pour l'Élu qui brisera les chaînes. Il révéla aux autres dieux que toute tentative de vaincre Vorathys entraînerait la destruction d'Élyndra",
	},
	{
		type : "Histoire",
		name : "Les dieux scellés",
		desc : "Solarys, Lunara, Sylphéra et Aelyon choisir de se sceller volontairement dans des sanctuaires profonds, protégeant ainsi le pays de la destruction en attendant le jour de leur libération par l'Élu",
	},
	{
		type : "Histoire",
		name : "L'Élu",
		desc : "L'Élu annoncé par la prophétie d'Aelyon est le seul espoir d'Élyndra face à la corruption de Vorathys. Il est dit qu'il est porteur d'une force pure et inédite",
	},
];

const Personnage = [
	{
		type : "Personnage",
		name : "Solarys",
		desc : "Solarys est le dieu du soleil et de la lumière, symbole de puissance et de révélation",
	},
	{
		type : "Personnage",
		name : "Lunara",
		desc : "Lunara est la déesse de la lune glaciale et des mystères nocturnes, guardienne des secrets et de la magie cachée",
	},
	{
		type : "Personnage",
		name : "Sylphéra",
		desc : "Sylphéra est la déesse des forêts et des vents, maîtresse de la nature sauvage et des changements",
	},
	{
		type : "Personnage",
		name : "Aelyon",
		desc : "Aelyon est le dieu de la sagesse et du destin, guide des âmes et prophéte des temps futurs",
	},
	{
		type : "Personnage",
		name : "Vorathys",
		desc : "Vorathys était autrefois le dieu des profondeurs et des secrests enfouis, guardien silencieux des abysses. Après la brèche, il est devenu le dieu de la corruption, des ombres rampantes et de la trahison. Il incarne désormais la jalousie destructrice, semant la discorde et la pourriture dans les coeurs et la nature",
	},
];

const Groupe = [
	{
		type : "Groupe",
		name : "Culte de Vorathys",
		desc : "Le culte du dieu corrompu, une secte secrète infiltré dans les 4 coins d'Élyndra, attire les âmes perdues via des rituels sombres célébrés dans les ruines ou les forêts maudites. Ses membres s'oppose aux retours des 4 dieux et craignent l'arrivé de l'Élu annoncé par Aelyon",
	},
];

const Lieu = [
	{
		type : "Lieu",
		name : "Les Ruines Oubliées d'Élyndra",
		desc : "Ancienne capitale du royaume au centre du pays, aujourd'hui déchue. Jonché de vestiges, ponts effondrés, sanctuaires en ruine et colonnes brisées. Les lieux sont plongés dans une obscurité permanente. Un épais brouillard éternel sature l'air pour dissimulée la vérité cachée en ces lieux",
	},
	{
		type : "Lieu",
		name : "La montagne d'Auralis",
		desc : "Montagne situé au nord-est du pays, la région est un desert de neige et de glace. Une ambiance glaciale règne en permanence, accentuée par des vents mordants. Les fréquentes tempêtes de neige réduisent drastiquement la visibilité. La région abrite un réseau de grottes"
	},
	{
		type : "Lieu",
		name : "Le Village Gelé d'Auralis",
		desc : "Hameau isolé établi au pied de la grande montagne d'Auralis et au bord d'une mer de glace. Il se compose de petites maisons en bois aux toits chargés de givre et d'une auberge centrale. Chaque habitation est équipée d'une lanterne pour éclairer les rues perpétuellement enneigées",
	},
	{
		type : "Lieu",
		name : "Le Coœur Sylvestre de Lunel",
		desc : "Une forêt ancienne et magique, isolée du reste du monde par un grand fleuve. En son centre se dresse un puissant et énigmatique arbre-mémoire. C'est un labyrinthe naturel et magique, ses nombreux sentiers sont trompeurs et éloignent quiconque tente de suivre une destination précise. L'atmosphère est lourde, tropicale et humide, la végétation est si dense que la lumière du jour peine à percer le feuillage.",
	},
	{
		type : "Lieu",
		name : "Lunel",
		desc : "Caché dans le Coœur Sylvestre, une communauté dont l'architecture est entièrement arboricole. Les habitations sont des cabanes perchées, chaque endroit est relié par un réseau complexe de passerelles en bois afin d'échapper aux dangers de la terre ferme",
	},
	{
		type : "Lieu",
		name : "Les Dunes Ardentes de Solarys",
		desc : "Un vaste désert où la disparition du dieu solaire a transformé la terre en une fournaise hostile. Une immensité de dunes vertigineuses et de rochers colossaux parsemée de rares cactus et palmiers. La vie s'organise autour d'un unique point d'eau. La chaleur est accablante et le sol si brûlant qu'il en devient une barrière naturelle. L'air sec et suffocant rappelle que la surface n'est plus faite pour les mortels qui se sont réfugiés sous terre dans la cité de Kalem",
	},
	{
		type : "Lieu",
		name : "Kalem la Cité Souterraine",
		desc : "L'ancien village de Kalem a dû abandonner la surface devenue invivable. Les habitants ont creusé un refuge sous terre, créant un réseau d'habitations troglodytes. Peu à peu, tous les survivants du désert ont convergé vers Kalem, la transformant en véritable cité souterraine",
	},
];

//adding the objects sets into the DB
const loreCol = client.collections.get('Lore');
const histoire = await loreCol.data.insertMany(Histoire);
console.log(`Imported & vectorized ${Histoire.length} objects into the Lore collection`);
const personnage = await loreCol.data.insertMany(Personnage);
console.log(`Imported & vectorized ${Personnage.length} objects into the Lore collection`);
const groupe = await loreCol.data.insertMany(Groupe);
console.log(`Imported & vectorized ${Groupe.length} objects into the Lore collection`);
const lieu = await loreCol.data.insertMany(Lieu);
console.log(`Imported & vectorized ${Lieu.length} objects into the Lore collection`);

//close the client
await client.close();