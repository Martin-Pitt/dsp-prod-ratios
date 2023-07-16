import { JSONReviver } from '../data/reviver.js';
import tech from '../data/tech.json';
import recipes from '../data/recipes.json';
import items from '../data/items.json';
import strings from '../data/strings.json';


function JSONRecurse(key, value, depth = 0) {
	if(Array.isArray(value))
		value = value.map((item, index) => JSONRecurse(index, item, depth + 1));
	
	else if(typeof value === 'object')
		for(let subKey in value)
			value[subKey] = JSONRecurse(subKey, value[subKey], depth + 1);
	
	return JSONReviver(key, value);
}


export const Strings = JSONRecurse(undefined, strings);

const supportedLocales = Intl.getCanonicalLocales(
	Object.keys(Strings.entries().next().value[1])
	.map(locale => locale.replace('_', '-'))
);

const locale = (() => {
	for(const preferred of navigator.languages)
	{
		const match = supportedLocales.find(supported =>
			supported.startsWith(preferred) || preferred.startsWith(supported)
		);
		if(match) return match;
	}
	return 'en-US';
})();
const internalLocale = locale.replace('-', '_').toLowerCase();
const translateableKeys = ['name', 'description', 'conclusion', 'miningFrom', 'produceFrom'];
function translate(input) {
	if(typeof input === 'string') return Strings.get(input)[internalLocale];
	else if(Array.isArray(input)) return input.map(translate);
	else if(typeof input === 'object')
	{
		input = { ...input };
		for(let key in input)
		{
			if(!translateableKeys.includes(key)) continue;
			input[key] = translate(input[key]);
		}
		return input;
	}
	else throw new Error('Undefined behaviour for translate');
}

export const Tech = translate(JSONRecurse(undefined, tech));
export const Recipes = translate(JSONRecurse(undefined, recipes));
export const Items = translate(JSONRecurse(undefined, items));





export const AssemblerProductionSpeed = new Map([[2303, 0.75], [2304, 1], [2305, 1.5]]);
export const SmelterProductionSpeed = new Map([[2302, 1], [2315, 2]]);
export const ChemicalProductionSpeed = new Map([[2309, 1], [2317, 2]]);
export const BeltTransportSpeed = new Map([[2001, 6], [2002, 12], [2003, 30]]);
export const StringFromTypes = new Map(
    Object.entries({
        // Item Types
        'RESOURCE': '自然资源',
        'MATERIAL': '材料',
        'COMPONENT': '组件',
        'PRODUCT': '成品',
        'LOGISTICS': '物流运输',
        'PRODUCTION': '生产设备',
        'MATRIX': '科学矩阵',
        
        // Recipe Types
        'SMELT': '冶炼设备',
        'ASSEMBLE': '制造台',
        'RESEARCH': '科研设备',
        'REFINE': '精炼设备',
        'CHEMICAL': '化工设备',
        'PARTICLE': '粒子对撞机',
        'FRACTIONATE': '分馏设备',
    })
    .map(([type, key]) => [type, Strings.get(key)[internalLocale]])
);



const StartingRecipes = [1, 2, 3, 4, 5, 6, 50];
export function RecipesUnlocked(research, returnSet = false) {
	if(!research || !research.length) research = Tech;
	
	let unlocked = new Set(StartingRecipes);
	for(let tech of research)
		if(tech.unlockRecipes)
			for(let unlock of tech.unlockRecipes)
				unlocked.add(unlock);
	
	if(returnSet) return unlocked;
	return Recipes.filter(recipe => unlocked.has(recipe.id));
}

export function ItemsUnlocked(research, returnSet = false) {
	if(!research || !research.length) research = Tech;
	
	let unlocked = new Set();
	for(let tech of research)
		if(tech.items)
			for(let item of tech.items)
				unlocked.add(item);
	
	for(let recipe of RecipesUnlocked(research))
	{
		if(recipe.items)
			for(let item of recipe.items)
				unlocked.add(item);
		if(recipe.results)
			for(let item of recipe.results)
				unlocked.add(item);
	}
	
	if(returnSet) return unlocked;
	return Items.filter(item => unlocked.has(item.id));
}