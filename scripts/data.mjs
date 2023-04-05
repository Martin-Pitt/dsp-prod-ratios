import { readFile, writeFile } from 'fs/promises';
import BufferStream from './buffer.mjs';



const [
	ItemProtoSetData,
	RecipeProtoSetData,
	StringProtoSetData,
	TechProtoSetData,
] = await Promise.all([
	readFile('data/bin/ItemProtoSet.dat'),
	readFile('data/bin/RecipeProtoSet.dat'),
	readFile('data/bin/StringProtoSet.dat'),
	readFile('data/bin/TechProtoSet.dat'),
]);

const Streams = [
	new BufferStream(ItemProtoSetData),
	new BufferStream(RecipeProtoSetData),
	new BufferStream(StringProtoSetData),
	new BufferStream(TechProtoSetData),
].map(buffer => {
	buffer.isBigEndian = false;
	return buffer;
});
const [
	ItemProtoSetStream,
	RecipeProtoSetStream,
	StringProtoSetStream,
	TechProtoSetStream,
] = Streams;

function readUnityHeader(stream) {
	// Unity header bits
	// 12-byte PPtr, 1-byte enabled field of true, 3 padding bytes
	// [00 00 00 00 00 00 00 00 00 00 00 00] [01] [00 00 00]
	const UnityHeaderBitsExpected = Buffer.from(new Uint8Array([
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00
	]));
	const UnityHeaderBits = stream.read(16);
	stream.read(12); // Skip another PPtr and more
	return Buffer.compare(
		UnityHeaderBitsExpected,
		UnityHeaderBits,
	) === 0;
}

let filenames = [];
for(const stream of Streams)
{
	const isValidUnityHeader = readUnityHeader(stream);
	if(!isValidUnityHeader) throw 'Unity Header bits not as expected!';
	const filename = stream.readString().toString();
	filenames.push(filename);
}

// console.log('Loaded and checked:', filenames.join(', '));





const RecipeType = new Map([
	[ 0, 'NONE'],
	[ 1, 'SMELT'],
	[ 2, 'CHEMICAL'],
	[ 3, 'REFINE'],
	[ 4, 'ASSEMBLE'],
	[ 5, 'PARTICLE'],
	[ 6, 'EXCHANGE'],
	[ 7, 'PHOTON_STORE'],
	[ 8, 'FRACTIONATE'],
	[15, 'RESEARCH'],
])

const ItemTypes = new Map([
	[ 0, 'UNKNOWN'],
	[ 1, 'RESOURCE'],
	[ 2, 'MATERIAL'],
	[ 3, 'COMPONENT'],
	[ 4, 'PRODUCT'],
	[ 5, 'LOGISTICS'],
	[ 6, 'PRODUCTION'],
	[ 7, 'DECORATION'],
	[ 8, 'WEAPON'],
	[ 9, 'MATRIX'],
	[10, 'MONSTER'],
]);

const ItemProtoSet = {
	table_name: ItemProtoSetStream.readString().toString(),
	signature: ItemProtoSetStream.readString().toString(),
	data_array: ItemProtoSetStream.readArray((index, length) => ({
		name: ItemProtoSetStream.readString().toString(),
		id: ItemProtoSetStream.readInt32(),
		sid: ItemProtoSetStream.readString().toString(),
		type: ItemTypes.get(ItemProtoSetStream.readInt32()),
		sub_id: ItemProtoSetStream.readInt32(),
		mining_from: ItemProtoSetStream.readString().toString(),
		produce_from: ItemProtoSetStream.readString().toString(),
		stack_size: ItemProtoSetStream.readInt32(),
		grade: ItemProtoSetStream.readInt32(),
		upgrades: ItemProtoSetStream.readArray(() => ItemProtoSetStream.readInt32()),
		is_fluid: !!ItemProtoSetStream.readBool(),
		is_entity: !!ItemProtoSetStream.readBool(),
		can_build: !!ItemProtoSetStream.readBool(),
		build_in_gas: !!ItemProtoSetStream.readBool(),
		icon_path: ItemProtoSetStream.readString().toString(),
		model_index: ItemProtoSetStream.readInt32(),
		model_count: ItemProtoSetStream.readInt32(),
		hp_max: ItemProtoSetStream.readInt32(),
		ability: ItemProtoSetStream.readInt32(),
		heat_value: ItemProtoSetStream.readInt64(),
		potential: ItemProtoSetStream.readInt64(),
		reactor_inc: ItemProtoSetStream.readFloat(),
		fuel_type: ItemProtoSetStream.readInt32(),
		build_index: ItemProtoSetStream.readInt32(),
		build_mode: ItemProtoSetStream.readInt32(),
		grid_index: ItemProtoSetStream.readInt32(),
		unlock_key: ItemProtoSetStream.readInt32(),
		pre_tech_override: ItemProtoSetStream.readInt32(),
		productive: !!ItemProtoSetStream.readBool(),
		mecha_material_id: ItemProtoSetStream.readInt32(),
		drop_rate: ItemProtoSetStream.readFloat(),
		_unknown1: ItemProtoSetStream.read(4),
		_unknown2: ItemProtoSetStream.read(4),
		desc_fields: ItemProtoSetStream.readArray(() => ItemProtoSetStream.readInt32()),
		description: ItemProtoSetStream.readString().toString(),
	})),
};

const RecipeProtoSet = {
	table_name: RecipeProtoSetStream.readString().toString(),
	signature: RecipeProtoSetStream.readString().toString(),
	data_array: RecipeProtoSetStream.readArray((index, length) => ({
		name: RecipeProtoSetStream.readString().toString(),
		id: RecipeProtoSetStream.readInt32(),
		sid: RecipeProtoSetStream.readString().toString(),
		type: RecipeType.get(RecipeProtoSetStream.readInt32()),
		handcraft: RecipeProtoSetStream.readBool(),
		explicit: RecipeProtoSetStream.readBool(),
		time_spend: RecipeProtoSetStream.readInt32(),
		items: RecipeProtoSetStream.readArray(() => RecipeProtoSetStream.readInt32()),
		item_counts: RecipeProtoSetStream.readArray(() => RecipeProtoSetStream.readInt32()),
		results: RecipeProtoSetStream.readArray(() => RecipeProtoSetStream.readInt32()),
		result_counts: RecipeProtoSetStream.readArray(() => RecipeProtoSetStream.readInt32()),
		grid_index: RecipeProtoSetStream.readInt32(),
		icon_path: RecipeProtoSetStream.readString().toString(),
		description: RecipeProtoSetStream.readString().toString(),
		non_productive: RecipeProtoSetStream.readBool(),
	})),
};

const StringProtoSet = {
	table_name: StringProtoSetStream.readString().toString(),
	signature: StringProtoSetStream.readString().toString(),
	data_array: StringProtoSetStream.readArray((index, length) => ({
		name: StringProtoSetStream.readString().toString(),
		id: StringProtoSetStream.readInt32(),
		sid: StringProtoSetStream.readString().toString(),
		zh_cn: StringProtoSetStream.readString().toString(),
		en_us: StringProtoSetStream.readString().toString(),
		fr_fr: StringProtoSetStream.readString().toString(),
	})),
};

const TechProtoSet = {
	table_name: TechProtoSetStream.readString().toString(),
	signature: TechProtoSetStream.readString().toString(),
	data_array: TechProtoSetStream.readArray((index, length) => ({
		name: TechProtoSetStream.readString().toString(),
		id: TechProtoSetStream.readInt32(),
		sid: TechProtoSetStream.readString().toString(),
		description: TechProtoSetStream.readString().toString(),
		conclusion: TechProtoSetStream.readString().toString(),
		published: TechProtoSetStream.readBool(),
		level: TechProtoSetStream.readInt32(),
		max_level: TechProtoSetStream.readInt32(),
		level_coef1: TechProtoSetStream.readInt32(),
		level_coef2: TechProtoSetStream.readInt32(),
		icon_path: TechProtoSetStream.readString().toString(),
		is_lab_tech: TechProtoSetStream.readBool(),
		pre_techs: TechProtoSetStream.readArray(() => TechProtoSetStream.readInt32()),
		pre_techs_implicit: TechProtoSetStream.readArray(() => TechProtoSetStream.readInt32()),
		pre_techs_max: TechProtoSetStream.readBool(),
		items: TechProtoSetStream.readArray(() => TechProtoSetStream.readInt32()),
		item_points: TechProtoSetStream.readArray(() => TechProtoSetStream.readInt32()),
		property_override_items: TechProtoSetStream.readArray(() => TechProtoSetStream.readInt32()),
		property_item_counts: TechProtoSetStream.readArray(() => TechProtoSetStream.readInt32()),
		hash_needed: TechProtoSetStream.readInt64(),
		_unknown: TechProtoSetStream.read(4), // Probably related to repeatable tech?
		unlock_recipes: TechProtoSetStream.readArray(() => TechProtoSetStream.readInt32()),
		unlock_functions: TechProtoSetStream.readArray(() => TechProtoSetStream.readInt32()),
		unlock_values: TechProtoSetStream.readArray(() => TechProtoSetStream.read(8)),
		add_items: TechProtoSetStream.readArray(() => TechProtoSetStream.readInt32()),
		add_item_counts: TechProtoSetStream.readArray(() => TechProtoSetStream.readInt32()),
		position: [TechProtoSetStream.readFloat(), TechProtoSetStream.readFloat()],
	})),
};

console.log(`Parsed binary data: ItemProtoSet[${ItemProtoSet.data_array.length}], RecipeProtoSet[${RecipeProtoSet.data_array.length}], StringProtoSet[${StringProtoSet.data_array.length}], TechProtoSet[${TechProtoSet.data_array.length}]`);



await writeFile('data/raw/ItemProtoSet.json', JSON.stringify(ItemProtoSet, null, '\t'));
await writeFile('data/raw/RecipeProtoSet.json', JSON.stringify(RecipeProtoSet, null, '\t'));
await writeFile('data/raw/StringProtoSet.json', JSON.stringify(StringProtoSet, null, '\t'));
await writeFile('data/raw/TechProtoSet.json', JSON.stringify(TechProtoSet, null, '\t'));

// console.log(ItemProtoSet);
// console.log(RecipeProtoSet);
// console.log(StringProtoSet);
// console.log(TechProtoSet);

const Strings = new Map(
	StringProtoSet.data_array.map(StringProto => [
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
	'name', 'description', 'conclusion', 'mining_from', 'produce_from'
];
const SkipKeys = [
	'model_index', 'model_count', 'hp_max', 'drop_rate', 'desc_fields',
	'sub_id', 'build_index', 'build_mode', 'unlock_key', 'productive',
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
		if(TranslateKeys.includes(key))
		{
			value = translate(value);
		}
		
		element[key] = value;
	}
	
	return element;
}


let itemsMap = new Map(ItemProtoSet.data_array.map(item => [item.id, item.unlock_key === 0]));
let recipes = RecipeProtoSet.data_array;
let recipesMap = new Map();
const StartingRecipes = [1, 2, 3, 4, 5, 6, 50];
function setValid(itemsMap, recipeEntry) {
	recipeEntry.disabled = false;
	for(let itemId of recipeEntry.recipe.results)
	{
		itemsMap.set(itemId, false);
	}
}

for(let recipe of recipes)
{
	let recipeEntry = { recipe, disabled: true };
	recipesMap.set(recipe.id, recipeEntry);
	if(StartingRecipes.includes(recipe.id)) setValid(itemsMap, recipeEntry);
}

let techs = TechProtoSet.data_array;
for(let tech of techs)
{
	if(!tech.published) continue;
	for(let recipeId of tech.unlock_recipes) setValid(itemsMap, recipesMap.get(recipeId));
}

const Items = ItemProtoSet.data_array.filter(itemProto => !itemsMap.get(itemProto.id)).map(parseRaw);
const Recipes = RecipeProtoSet.data_array.filter(recipeProto => !recipesMap.get(recipeProto.id).disabled).map(parseRaw);
const Tech = TechProtoSet.data_array.filter(techProto => techProto.published).map(parseRaw);


console.log(`Disabled ${ItemProtoSet.data_array.length - Items.length} in Items[${Items.length}], ${RecipeProtoSet.data_array.length - Recipes.length} in Recipes[${Recipes.length}], ${TechProtoSet.data_array.length - Tech.length} Tech[${Tech.length}]`);


await writeFile('data/Items.json', JSON.stringify(Items, null, '\t'));
await writeFile('data/Recipes.json', JSON.stringify(Recipes, null, '\t'));
// await writeFile('data/Strings.json', JSON.stringify(StringProtoSet.data_array, null, '\t'));
await writeFile('data/Tech.json', JSON.stringify(Tech, null, '\t'));

console.log('Written JSON files into data folder');
