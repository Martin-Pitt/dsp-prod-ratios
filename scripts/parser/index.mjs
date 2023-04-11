/*
	Parser for Unity .assets and .dat files
	
	Referenced multiple different other resources and projects
	Most notably ported, sharing code from the following references:
	- [d0sboots/dyson-sphere-program](https://github.com/d0sboots/dyson-sphere-program/) (Apache 2.0)
		how to parse the .dat file
	- [SeriousCache/UABE](https://github.com/SeriousCache/UABE) (EPL 2.0)
		great help in understanding how to parse the .assets file
	- [snack-x/unity-parser](https://github.com/snack-x/unity-parser) (MIT)
		used this for the initial BufferStream implementation
		unity-parser then also references:
			https://github.com/marcan/deresuteme/blob/master/decode.py (Apache 2.0)
			https://github.com/RaduMC/UnityStudio (MIT)
*/



import { readFile, writeFile, mkdir } from 'fs/promises';
import { BufferStreamAssets, BufferStreamData, isValidUnityDataHeader } from './buffer.mjs';
import { AssetFile, AssetsFileTable, parseDataFile, TYPE } from './parser.mjs';


let buf = await readFile('resources.assets');
let ResourcesStream = new BufferStreamAssets(buf);
let file = new AssetFile(ResourcesStream);
let assetsTable = new AssetsFileTable(file, ResourcesStream);



function getDataFile(name) {
	let assetInfo = assetsTable.table.find(asset => asset.name === name);
	
	ResourcesStream.pos = assetInfo.absolutePos;
	let assetRaw = ResourcesStream.read(assetInfo.curFileSize);
	
	
	let assetStream = new BufferStreamData(assetRaw, false);
	if(!isValidUnityDataHeader(assetStream)) throw 'Unity Header bits not as expected!';
	
	return assetStream;
}




const ItemProtoSetData = getDataFile('ItemProtoSet');
const RecipeProtoSetData = getDataFile('RecipeProtoSet');
const StringProtoSetData = getDataFile('StringProtoSet');
const TechProtoSetData = getDataFile('TechProtoSet');

// await writeFile('ItemProtoSet.dat', ItemProtoSetData);
// await writeFile('RecipeProtoSet.dat', RecipeProtoSetData);
// await writeFile('StringProtoSet.dat', StringProtoSetData);
// await writeFile('TechProtoSet.dat', TechProtoSetData);


const ItemProtoSet = parseDataFile(ItemProtoSetData, {
	[TYPE]: 'object',
	fileName: 'string',
	tableName: 'string',
	signature: 'string',
	data: {
		[TYPE]: 'array',
		shape: {
			[TYPE]: 'object',
			name: 'string',
			id: 'int32',
			sid: 'string',
			type: 'ItemType',
			subId: 'int32',
			miningFrom: 'string',
			produceFrom: 'string',
			stackSize: 'int32',
			grade: 'int32',
			upgrades: { [TYPE]: 'array', shape: 'int32' },
			isFluid: 'bool',
			isEntity: 'bool',
			canBuild: 'bool',
			buildInGas: 'bool',
			iconPath: 'string',
			modelIndex: 'int32',
			modelCount: 'int32',
			hpMax: 'int32',
			ability: 'int32',
			heatValue: 'int64',
			potential: 'int64',
			reactorInc: 'float',
			fuelType: 'int32',
			buildIndex: 'int32',
			buildMode: 'int32',
			gridIndex: 'int32',
			unlockKey: 'int32',
			preTechOverride: 'int32',
			produce: 'bool',
			mechaMaterialId: 'int32',
			dropRate: 'float',
			_unknown1: { [TYPE]: 'byte', size: 4 },
			_unknown2: { [TYPE]: 'byte', size: 4 },
			descFields: { [TYPE]: 'array', shape: 'int32' },
			description: 'string',
		}
	}
});

const RecipeProtoSet = parseDataFile(RecipeProtoSetData, {
	[TYPE]: 'object',
	fileName: 'string',
	tableName: 'string',
	signature: 'string',
	data: {
		[TYPE]: 'array',
		shape: {
			[TYPE]: 'object',
			name: 'string',
			id: 'int32',
			sid: 'string',
			type: 'RecipeType',
			handcraft: 'bool',
			explicit: 'bool',
			timeSpend: 'int32',
			items: { [TYPE]: 'array', shape: 'int32' },
			itemCounts: { [TYPE]: 'array', shape: 'int32' },
			results: { [TYPE]: 'array', shape: 'int32' },
			resultCounts: { [TYPE]: 'array', shape: 'int32' },
			gridIndex: 'int32',
			iconPath: 'string',
			description: 'string',
			nonProductive: 'bool',
		}
	}
});

const StringProtoSet = parseDataFile(StringProtoSetData, {
	[TYPE]: 'object',
	fileName: 'string',
	tableName: 'string',
	signature: 'string',
	data: {
		[TYPE]: 'array',
		shape: {
			[TYPE]: 'object',
			name: 'string',
			id: 'int32',
			sid: 'string',
			zh_cn: 'string',
			en_us: 'string',
			fr_fr: 'string',
		}
	}
});

const TechProtoSet = parseDataFile(TechProtoSetData, {
	[TYPE]: 'object',
	fileName: 'string',
	tableName: 'string',
	signature: 'string',
	data: {
		[TYPE]: 'array',
		shape: {
			[TYPE]: 'object',
			name: 'string',
			id: 'int32',
			sid: 'string',
			description: 'string',
			conclusion: 'string',
			published: 'bool',
			level: 'int32',
			maxLevel: 'int32',
			levelCoef1: 'int32',
			levelCoef2: 'int32',
			iconPath: 'string',
			isLabTech: 'bool',
			preTechs: { [TYPE]: 'array', shape: 'int32' },
			preTechsImplicit: { [TYPE]: 'array', shape: 'int32' },
			preTechsMax: 'bool',
			items: { [TYPE]: 'array', shape: 'int32' },
			itemPoints: { [TYPE]: 'array', shape: 'int32' },
			propertyOverrideItems: { [TYPE]: 'array', shape: 'int32' },
			propertyItemCounts: { [TYPE]: 'array', shape: 'int32' },
			hashNeeded: 'int64',
			_unknown: { [TYPE]: 'byte', size: 4 }, // Probably related to repeatable tech?
			unlockRecipes: { [TYPE]: 'array', shape: 'int32' },
			unlockFunctions: { [TYPE]: 'array', shape: 'int32' },
			unlockValues: { [TYPE]: 'array', shape: { [TYPE]: 'byte', size: 8} },
			addItems: { [TYPE]: 'array', shape: 'int32' },
			addItemCounts: { [TYPE]: 'array', shape: 'int32' },
			position: 'vector2',
		}
	}
});


// await writeFile('ItemProtoSet.json', JSON.stringify(ItemProtoSet, null, '\t'));
// await writeFile('RecipeProtoSet.json', JSON.stringify(RecipeProtoSet, null, '\t'));
// await writeFile('StringProtoSet.json', JSON.stringify(StringProtoSet, null, '\t'));
// await writeFile('TechProtoSet.json', JSON.stringify(TechProtoSet, null, '\t'));






const Strings = new Map(
	StringProtoSet.data.map(StringProto => [
		StringProto.name,
		{
			zh_cn: StringProto.zh_cn,
			en_us: StringProto.en_us,
			fr_fr: StringProto.fr_fr,
		}
	])
);

function translate(string) {
	if(!string) return '';
	let translation = Strings.get(string);
	if(!translation) throw new Error(`Cant find translation for: ${string} [${string.length}]`);
	return translation.en_us;
}

const TranslateKeys = [
	'name', 'description', 'conclusion', 'miningFrom', 'produceFrom'
];
const SkipKeys = [
	'modelIndex', 'modelCount', 'hpMax', 'dropRate', 'descFields',
	'subId', 'buildIndex', 'buildMode', 'unlockKey', 'productive',
];

function parseRaw(ElementProto) {
	const element = { id: null, name: null, description: null };
	
	for(let [key, value] of Object.entries(ElementProto))
	{
		// Skip defaults
		if(typeof value === 'bigint' && !value) continue;
		if(typeof value === 'number' && !value) continue;
		if(typeof value === 'boolean' && !value) continue;
		if(typeof value === 'string' && !value) continue;
		if(Array.isArray(value) && !value.length) continue;
		
		// Skip over unknown & unneeded
		if(key.startsWith('_')) continue;
		if(SkipKeys.includes(key)) continue;
		
		// Translate any specific text strings
		if(TranslateKeys.includes(key)) value = translate(value);
		
		element[key] = value;
	}
	
	return element;
}


let itemsMap = new Map(ItemProtoSet.data.map(item => [item.id, item.unlockKey === 0]));
let recipes = RecipeProtoSet.data;
let recipesMap = new Map();
const StartingRecipes = [1, 2, 3, 4, 5, 6, 50];
function setValid(itemsMap, recipeEntry) {
	recipeEntry.disabled = false;
	for(let itemId of recipeEntry.recipe.results) itemsMap.set(itemId, false);
}

for(let recipe of recipes)
{
	let recipeEntry = { recipe, disabled: true };
	recipesMap.set(recipe.id, recipeEntry);
	if(StartingRecipes.includes(recipe.id)) setValid(itemsMap, recipeEntry);
}

let techs = TechProtoSet.data;
for(let tech of techs)
{
	if(!tech.published) continue;
	for(let recipeId of tech.unlockRecipes) setValid(itemsMap, recipesMap.get(recipeId));
}

const Items = ItemProtoSet.data.filter(itemProto => !itemsMap.get(itemProto.id)).map(parseRaw);
const Recipes = RecipeProtoSet.data.filter(recipeProto => !recipesMap.get(recipeProto.id).disabled).map(parseRaw);
const Tech = TechProtoSet.data.filter(techProto => techProto.published).map(parseRaw);


console.log(`Disabled ${ItemProtoSet.data.length - Items.length} in Items[${Items.length}], ${RecipeProtoSet.data.length - Recipes.length} in Recipes[${Recipes.length}], ${TechProtoSet.data.length - Tech.length} Tech[${Tech.length}]`);


try { await mkdir('data'); } catch {}

await writeFile('data/Items.json', JSON.stringify(Items, null, '\t'));
await writeFile('data/Recipes.json', JSON.stringify(Recipes, null, '\t'));
// await writeFile('data/Strings.json', JSON.stringify(StringProtoSet.data, null, '\t'));
await writeFile('data/Tech.json', JSON.stringify(Tech, null, '\t'));

console.log('Written JSON files into data folder');


