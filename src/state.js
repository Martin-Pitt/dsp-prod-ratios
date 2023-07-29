import { signal, effect } from '@preact/signals';
import { Items, Recipes } from './lib/data.js';
import { Tech } from './lib/data.js';

// If there is a conflicting change we might need to reset localStorage
const StateFormat = '1';
if('localStorage' in window && localStorage.format !== StateFormat)
{
	localStorage.clear();
	localStorage.format = StateFormat;
}



function persistentSignal(name, fallback, fn) {
	if(!'localStorage' in window) return signal(fallback);
	
	let value = fallback;
	
	if(localStorage[name])
	{
		let restored = JSON.parse(localStorage[name]);
		if(fn?.restore) restored = fn.restore(restored);
		value = restored;
	}
	
	let sig = signal(value);
	
	effect(() => {
		let value = sig.value;
		if(fn?.persist) value = fn.persist(value);
		localStorage[name] = JSON.stringify(value);
	});
	
	return sig;
}



const state = {
	recipe: signal(null),
	factor: signal(1),
	per: signal(60),
	timeScale: persistentSignal('timeScale', 'minute'),
	
	research: persistentSignal('research', [], {
		restore: array => array.map(id => Tech.find(tech => tech.id === id)),
		persist: array => array.map(tech => tech.id)
	}),
	
	preferred: {
		assembler: persistentSignal('preferred.assembler', 2303 /* Assembling Machine Mk.I */),
		smelter: persistentSignal('preferred.smelter', 2302 /* Arc Smelter */),
		chemical: persistentSignal('preferred.chemical', 2309 /* Chemical Plant */),
		belt: persistentSignal('preferred.belt', 2001 /* Conveyor Belt MK.I */),
		...Items.map(item => {
			let recipes = Recipes.filter(recipe => recipe.results.includes(item.id));
			return [item, recipes]
		})
		.filter(([item, recipes]) => recipes.length > 1)
		.reduce((accumulator, [item, recipes]) => {
			let recipe = recipes[0]; // Should be fine with first recipe as default
			accumulator[item.id] = persistentSignal(`preferred.${item.id}`, recipe.id);
			return accumulator;
		}, {})
	},
	
	recipesUsed: signal(new Set()),
	typesUsed: signal(new Set()),
};


export default state;



