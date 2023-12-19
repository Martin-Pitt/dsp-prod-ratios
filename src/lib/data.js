import { JSONReviver } from '../data/reviver.js';
import meta from '../data/meta.json';
import techs from '../data/tech.json';
import recipes from '../data/recipes.json';
import items from '../data/items.json';
import locale from '../data/locale.json';


function JSONRecurse(key, value, depth = 0) {
	if(Array.isArray(value))
		value = value.map((item, index) => JSONRecurse(index, item, depth + 1));
	
	else if(typeof value === 'object')
		for(let subKey in value)
			value[subKey] = JSONRecurse(subKey, value[subKey], depth + 1);
	
	return JSONReviver(key, value);
}


export const Meta = JSONRecurse(undefined, meta);
export const Locales = JSONRecurse(undefined, locale);

export const Locale = (() => {
	// TODO: I'd prefer a proper 'best fit' or 'lookup' algorithm here, but also how do we prioritise navigator.languages?
	for(const preferred of (navigator?.languages || ['en']))
	{
		const match = Locales.find(supported => {
			return supported.locale.startsWith(preferred)
			    || preferred.startsWith(supported.locale)
			    || supported.locale.split('-')[0] === preferred.split('-')[0]
		});
		
		if(match) return match;
		
		// Try the primary subtags
		else
		{
			match = Locales.find(supported => {
				return supported.locale.split('-')[0] === preferred.split('-')[0]
			});
			if(match) return match;
		}
	}
	
	return Locales.find(language => language.lcid === 1033) || Locales[0];
})();

const translateableKeys = ['name', 'description', 'conclusion', 'miningFrom', 'produceFrom'];
function translate(input) {
	if(typeof input === 'string') return Locale.strings[input];
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

export function t(key) { return Locale.strings[key] }

// TODO: Preferred language can potentially change, see 'languagechange' event
export const Techs = translate(JSONRecurse(undefined, techs));
export const Recipes = translate(JSONRecurse(undefined, recipes));
export const Items = translate(JSONRecurse(undefined, items));

// Quick lookups
export const TechsByID = new Map(Techs.map(tech => [tech.id, tech]));
export const RecipesByID = new Map(Recipes.map(recipe => [recipe.id, recipe]));
export const ItemsByID = new Map(Items.map(item => [item.id, item]));
export const EpochsByTech = new Map(Techs.filter(tech => tech.id < 2000)
	.map(tech => {
		function check(tech, topEpoch = 0) {
			let matrices = tech.items?.filter(item => item >= 6000 && item <= 6099);
			let epoch = matrices?.[matrices.length - 1] || 6000;
			if(epoch > topEpoch) topEpoch = epoch;
			if(tech.preTechs) for(let preTech of tech.preTechs) topEpoch = check(TechsByID.get(preTech), topEpoch);
			if(tech.preTechsImplicit) for(let preTech of tech.preTechsImplicit) topEpoch = check(TechsByID.get(preTech), topEpoch);
			return topEpoch;
		}
		
		return [tech.id, check(tech)];
	})
);


// Mark all tech part of main quest
for(let tech of Techs) if(tech.id < 2000 && tech.position[1] === 1) tech.isMain = true;

// Move tech around, remove gaps etc
let positions = {
	x: Array.from(new Set(Techs.map(tech => tech.position[0]).sort((a, b) => a - b))),
	y: Array.from(new Set(Techs.map(tech => tech.position[1]).sort((a, b) => a - b))),
};

for(let index = 0; index < positions.x.length; ++index)
{
	let x = positions.x[index];
	for(let tech of Techs)
	{
		let tx = tech.position[0];
		if(tx === x) tech.x = index + 1;
	}
}

for(let index = 0; index < positions.y.length; ++index)
{
	let y = positions.y[index];
	for(let tech of Techs)
	{
		let ty = tech.position[1];
		if(ty === y) tech.y = positions.y.length - index;
	}
}

let topResearch = Math.min(...Techs.filter(tech => tech.id < 2000).map(tech => tech.y));
let topUpgrades = Math.min(...Techs.filter(tech => tech.id > 2000).map(tech => tech.y));
for(let tech of Techs) tech.y = 1 + tech.y - (tech.id < 2000? topResearch : topUpgrades);

// Instead of preTechs lets have postTechs, makes some things easier, e.g. rendering lines in research
for(let tech of Techs)
{
	let postTechs = [];
	for(let t of Techs)
	{
		if(t === tech || !t.preTechs) continue;
		if(t.preTechs.includes(tech.id)) postTechs.push(t.id);
	}
	if(postTechs.length)
	{
		// postTechs.sort((a, b) => TechsByID.get(a).y - TechsByID.get(b).y);
		postTechs.sort((a, b) => {
			let ay = TechsByID.get(a).y;
			let by = TechsByID.get(b).y;
			if(ay > by) return 1;
			if(ay < by) return -1;
			return 0;
		});
		tech.postTechs = postTechs;
	}
}






export const AssemblerProductionSpeed = new Map([[2303, 0.75], [2304, 1], [2305, 1.5], [2318, 3]]);
export const SmelterProductionSpeed = new Map([[2302, 1], [2315, 2], [2319, 3]]);
export const ChemicalProductionSpeed = new Map([[2309, 1], [2317, 2]]);
export const BeltTransportSpeed = new Map([[2001, 6*60], [2002, 12*60], [2003, 30*60]]);
export const ResearchSpeed = new Map([[2901, 1], [2902, 3]]);
export const MiningSpeed = new Map([2301, 30], [2316, 60]);
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
    .map(([type, key]) => [type, t(key)])
);
export const Proliferator = {
	Types: {
		'none': 'None',
		// 'mixed': 'Best Practices Mix',
		'mixed.tsp': 'Mix by The Superior Tentacle',
		'mixed.ab': 'Mix by Aaronbog',
		// 'mixed.least': 'Mix Least Facilities',
		'speedup': t('喷涂加速效果' /* Production Speedup */),
		'extra': t('喷涂增产效果' /* Extra Products */),
	},
	TypesTooltips: {
		'none': 'No proliferator to be used',
		// 'mixed': '',
		'mixed.tsp': 'High-end materials are better with extra products and everything else on production speed, proliferator mix by The Superior Tentacle',
		'mixed.ab': 'Spreadsheet calculation by Aaronbog, optimises for entities such as buildings and sorters',
		// 'mixed.least': 'Automatically generated mix for least facilities used on each recipe',
		'speedup': 'Every recipe to promote production speed where possible',
		'extra': 'Every recipe to promote extra products where possible',
		'custom': 'You have customised the proliferator settings yourself',
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
};

export function FractionationProductionSpeed(research) {
	let recipe = Recipes.find(recipe => recipe.id === 115); // Deuterium Fractionation
	let fractionationChance = recipe.resultCounts[0] / recipe.itemCounts[0]; // The 1% chance to produce Deuterium
	let itemsUnlocked = ItemsUnlocked(research, true);
	let fastestBeltSpeed = Array.from(BeltTransportSpeed).filter(([id, speed]) => itemsUnlocked.has(id)).pop()[1];
	let fastestProductionPerMinute = fastestBeltSpeed * fractionationChance;
	// Should pilers be accounted for? Do people use them in fractionation designs?
	return fastestProductionPerMinute;
}


const StartingRecipes = [1, 2, 3, 4, 5, 6, 50];
export function RecipesUnlocked(research, returnSet = false) {
	if(!research || !research.length) research = Techs;
	
	let unlocked = new Set(StartingRecipes);
	for(let tech of research)
		if(tech.unlockRecipes)
			for(let unlock of tech.unlockRecipes)
				unlocked.add(unlock);
	
	if(returnSet) return unlocked;
	return Recipes.filter(recipe => unlocked.has(recipe.id));
}

export function ItemsUnlocked(research, returnSet = false) {
	if(!research || !research.length) research = Techs;
	
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

export const RecipesIgnored = new Set([
	34, /* Silicon Ore from Stone */
]);



Proliferator.Mix = {
	TheSuperiorTentacle(recipe) {
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
		
		const { canProduceExtra, canSpeedupProduction } = Proliferator.RecipeBonuses(recipe);
		const isExtraProduct = ExtraProducts.has(recipe.id);
		
		if(canProduceExtra && isExtraProduct) return 'extra';
		else if(canSpeedupProduction) return 'speedup';
		else return 'none';
		
		
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
	},
	
	Aaronbog(recipe) {
		const ExtraProducts = new Set([
			6, // Magnetic Coil
			// Plasma Exciter
			98, // Electromagnetic Turbine
			51, // Processor
			103, // Super-magnetic Ring
			52, // Quantum Chip
			80, // Frame Material
			101, // Graviton Lens
			81, // Dyson Sphere Component
			41, // Deuteron Fuel Rod
			55, // Information Matrix
			102, // Gravity Matrix
			75, // Universe Matrix
			108, // Proliferator Mk.III
		]);
		
		const { canProduceExtra, canSpeedupProduction } = Proliferator.RecipeBonuses(recipe);
		const isExtraProduct = ExtraProducts.has(recipe.id);
		
		if(canProduceExtra && isExtraProduct) return 'extra';
		else if(canSpeedupProduction) return 'speedup';
		else return 'none';
	},
	
	LeastBuildings: (() => {
		function totalFacilities(proliferatorType, recipe) {
			function calcNormalisedThroughput(recipe) {
				let modifier = 1.0;
				switch(recipe.type) {
					case 'ASSEMBLE': modifier = AssemblerProductionSpeed.get(2303); break;
					case 'SMELT': modifier = SmelterProductionSpeed.get(2302); break;
					case 'CHEMICAL': modifier = ChemicalProductionSpeed.get(2309); break;
					case 'FRACTIONATE': modifier = FractionationProductionSpeed() / 60 / 60; break;
				}
				let resultsPerMinute = recipe.resultCounts[0] * (60/recipe.timeSpend*60);
				let normalisedThroughput = 100 * resultsPerMinute * modifier; // Normalised non-proliferated throughput of 100x facilities
				return normalisedThroughput;
			}
			
			function calcFacilities(proliferatorType, recipe, throughput, ingredient) {
				let modifier = 1.0;
				if(!recipe.type) throw new 'Error, no type?';
				switch(recipe.type) {
					case 'ASSEMBLE': modifier = AssemblerProductionSpeed.get(2303); break;
					case 'SMELT': modifier = SmelterProductionSpeed.get(2302); break;
					case 'CHEMICAL': modifier = ChemicalProductionSpeed.get(2309); break;
					case 'FRACTIONATE': modifier = FractionationProductionSpeed() / 60 / 60; break;
				}
				
				if(!ingredient) ingredient = recipe.results[0];
				let ingredientIndex = recipe.results.findIndex(result => result === ingredient);
				let ingredientsPerMinute = recipe.resultCounts[ingredientIndex] * (60/recipe.timeSpend*60);
				
				let proliferatorPoints = 4;
				if(proliferatorPoints)
				{
					let index = Proliferator.Ability.indexOf(proliferatorPoints);
					switch(proliferatorType)
					{
						case 'speedup': modifier *= Proliferator.ProductionSpeed[index]; break;
						case 'extra': ingredientsPerMinute *= Proliferator.ExtraProducts[index]; break;
					}
				}
				
				let facilities = throughput / ingredientsPerMinute / modifier;
				return [facilities, modifier];
			}
			
			let [facilities, modifier] = calcFacilities(proliferatorType, recipe, calcNormalisedThroughput(recipe));
			let subFacilities = recipe.items.map((id, index) => {
				let item = Items.find(item => item.id === id);
				if(item.miningFrom) return 0; // { console.log('Warning, can be mined from', item); return 0; }
				let itemsPerMinute = recipe.itemCounts[index] * (60/recipe.timeSpend*60);
				let subRecipes = Recipes.filter(r => r.results.includes(item.id));
				if(!subRecipes.length) return 0; // { console.log('no recipes for', item); return 0; }
				// if(subRecipes.length > 1) console.log('Warning multiple recipes for', item);
				let subRecipe = subRecipes.shift();
				let [subFacilities, subModifier] = calcFacilities('none', subRecipe, facilities * itemsPerMinute * modifier, item.id);
				
				// Each result and input requires own sorter/belt which add up to the facilities
				subFacilities *= subRecipe.results.length + subRecipe.items.length;
				
				return subFacilities;
			});
			
			// Each result and input requires own sorter/belt which add up to the facilities
			facilities *= recipe.results.length + recipe.items.length;
			
			// return [facilities, ...subFacilities];
			return facilities + subFacilities.reduce((accumulator, count) => accumulator + count, 0);
		}
		
		/*
		let recipe = Recipes.find(recipe => recipe.name === 'Dyson Sphere Component');
		let extras = totalFacilities('extra', recipe);
		let speedups = totalFacilities('speedup', recipe);
		console.log(
			(Math.abs((extras - speedups) / Math.max(extras, speedups)) * 100).toFixed(2) + '%',
			extras, speedups
		);
		*/
		
		const ExtraProducts = new Set(
			Recipes
			// .filter(recipe => recipe.results.some(id => id < 2000) && recipe.items.some(id => id < 2000))
			.filter(recipe => Proliferator.RecipeBonuses(recipe).canProduceExtra && totalFacilities('extra', recipe) < totalFacilities('speedup', recipe))
			.map(recipe => recipe.id)
		);
		
		// console.log('Least buildings that are extras:',
		// 	Array.from(ExtraProducts, id => Recipes.find(r => r.id === id))
		// 	.filter(recipe => recipe.results.some(id => id < 2000) && recipe.items.some(id => id < 2000))
		// );
		
		// console.groupCollapsed('Least buildings that are extras');
		// Recipes
		// .filter(recipe => recipe.results.some(id => id < 2000) && recipe.items.some(id => id < 2000))
		// .filter(recipe => Proliferator.RecipeBonuses(recipe).canProduceExtra && totalFacilities('extra', recipe) < totalFacilities('speedup', recipe))
		// .map(recipe => {
		// 	let extras = totalFacilities('extra', recipe);
		// 	let speedups = totalFacilities('speedup', recipe);
		// 	let gain = Math.abs((extras - speedups) / Math.max(extras, speedups));
		// 	console.log(
		// 		recipe.explicit? Items.find(item => item.id === recipe.results[0]).name : recipe.name,
		// 		+((gain * 100).toFixed(2)) + '%',
		// 		{ extras: +extras.toFixed(3), speedups: +speedups.toFixed(3) }
		// 	);
		// 	return;
		// });
		// console.groupEnd();
		
		
		return (recipe) => {
			const { canProduceExtra, canSpeedupProduction } = Proliferator.RecipeBonuses(recipe);
			const isExtraProduct = ExtraProducts.has(recipe.id);
			
			if(canProduceExtra && isExtraProduct) return 'extra';
			else if(canSpeedupProduction) return 'speedup';
			else return 'none';
		};
	})(),
};
