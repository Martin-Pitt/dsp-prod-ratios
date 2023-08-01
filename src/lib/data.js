import { JSONReviver } from '../data/reviver.js';
import meta from '../data/meta.json';
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


export const Meta = JSONRecurse(undefined, meta);
export const Strings = JSONRecurse(undefined, strings);

export const locale = (() => {
	// TODO: I'd prefer a proper 'best fit' or 'lookup' algorithm here, but also how do we prioritise navigator.languages?
	for(const Preferred of navigator.languages)
	{
		let preferred = Preferred.toLowerCase();
		const match = Meta.supportedCanonicalLocales.find(Supported => {
			let supported = Supported.toLowerCase();
			return supported.startsWith(preferred)
			    || preferred.startsWith(supported)
			    || supported.split('-')[0] === preferred.split('-')[0]
		});
		if(match) return match;
	}
	return 'en-US';
})();
export const internalLocale = locale.replace('-', '_').toLowerCase();
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

// TODO: Preferred language can potentially change, see 'languagechange' event
export const Tech = translate(JSONRecurse(undefined, tech));
export const Recipes = translate(JSONRecurse(undefined, recipes));
export const Items = translate(JSONRecurse(undefined, items));





export const AssemblerProductionSpeed = new Map([[2303, 0.75], [2304, 1], [2305, 1.5]]);
export const SmelterProductionSpeed = new Map([[2302, 1], [2315, 2]]);
export const ChemicalProductionSpeed = new Map([[2309, 1], [2317, 2]]);
export const BeltTransportSpeed = new Map([[2001, 6*60], [2002, 12*60], [2003, 30*60]]);
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
export const Proliferator = {
	Types: {
		'none': 'None',
		'mixed': 'Best Practices Mix',
		'speedup': 'Production Speedup',
		'extra': 'Extra Products',
	},
	Items: [1141, 1142, 1143],
	Ability: [1, 2, 4],
	ProductionSpeed: [1.25, 1.5, 2.0],
	ExtraProducts: [1.125, 1.20, 1.25],
	EnergyConsumption: [1.3, 1.7, 2.5],
	Sprays: [12, 24, 60],
	RecipeBonuses(recipe) {
		let canProduceExtra = false, canSpeedupProduction = false;
		switch(recipe.type) {
			// All production categories
			case 'SMELT':
			case 'ASSEMBLE':
			case 'REFINE':
			case 'CHEMICAL':
			case 'PARTICLE':
				const hasBuilding = recipe.items.some(id => id >= 2000);
				const isOtherException = [1122, 1803].includes(recipe.results[0]) || [58].includes(recipe.id); // Antimatter cannot be extra'd and neither can X-Ray Cracking
				canProduceExtra = !(hasBuilding || isOtherException);
				canSpeedupProduction = true;
				break;
			case 'RESEARCH':
				canProduceExtra = true;
				canSpeedupProduction = true;
				break;
			case 'FRACTIONATE':
				canSpeedupProduction = true;
				break;
		}
		return { canProduceExtra, canSpeedupProduction };
	},
	BestPracticeMix(recipe) {
		const ExtraProducts = new Set([
			83, // Small Carrier Rocket
			81, // Dyson Sphere Component
			80, // Frame Material
			41, // Deuteron Fuel Rod
			52, // Quantum Chip
			51, // Processor
			50, // Circuit Board
			103, // Super-magnetic Ring
			98, // Electromagnetic Turbine
			97, // Electric Motor
			6, // Magnetic Coil
			108, // Proliferator Mk.III
			66, // Titanium Alloy
			75, // Universe Matrix
			102, // Gravity Matrix
			55, // Information Matrix
			101, // Graviton Lens
			99, // Particle Container
		]);
		
		const { canProduceExtra, canSpeedupProduction } = this.RecipeBonuses(recipe);
		const isExtraProduct = ExtraProducts.has(recipe.id);
		
		if(canProduceExtra && isExtraProduct) return 'extra';
		else if(canSpeedupProduction) return 'speedup';
		else return 'none';
	}
	
	/*
	Confirmed Product Materials per The Superior Tentacle:
	
	Small Carrier Rocket (obviously)
	Dyson Sphere Component
	Frame Material (0.3% difference, negligible aside from material cost)
	Deuteron Fuel Rod
	Super Magnetic Rings
	Electromagnetic Turbine
	Electric Motor (0.1% difference, negligible aside from material cost)
	Quantum Chips
	Proliferator Mk.III
	Processors
	Titanium Alloy
	Circuit Boards (0.02% difference, negligible aside from material cost)
	Magnetic Ring (0.1% difference, negligible aside from material cost)

	Universe Matrix (Obviously)
	Information Matrix
	Gravitational Matrix
	Graviton Lens
	Particle Container

	Notables:
	Electromagnetic Matrix (0.65% difference in favor of speed, negligible aside from material cost)
	Structure Matrix (1.84% difference in favor of speed, negligible aside from material cost)
	Particle Container favors speed using Unipolar Magnets
	*/
	
	
	
	
	
};



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