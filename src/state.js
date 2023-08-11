import { signal, effect, computed } from '@preact/signals';
import { Items, ItemsUnlocked, Recipes } from './lib/data.js';
import { Techs } from './lib/data.js';

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

function temporarySignal(name, fallback, fn) {
	if(!'sessionStorage' in window) return signal(fallback);
	
	let value = fallback;
	
	if(sessionStorage[name])
	{
		let restored = JSON.parse(sessionStorage[name]);
		if(fn?.restore) restored = fn.restore(restored);
		value = restored;
	}
	
	let sig = signal(value);
	
	effect(() => {
		let value = sig.value;
		if(fn?.persist) value = fn.persist(value);
		sessionStorage[name] = JSON.stringify(value);
	});
	
	return sig;
}



const state = {
	recipe: temporarySignal('recipe', null), // signal(null),
	factor: temporarySignal('factor', 1), // signal(1),
	per: temporarySignal('per', 60), // signal(60),
	timeScale: persistentSignal('timeScale', 'minute'),
	
	research: persistentSignal('research', [], {
		restore: array => array.map(id => Techs.find(tech => tech.id === id)),
		persist: array => array.map(tech => tech.id)
	}),
	
	proliferator: temporarySignal('proliferator', 'none'),
	proliferatorPoints: temporarySignal('proliferatorPoints', 1),
	proliferatorPreset: temporarySignal('proliferatorPreset', new Map(), {
		restore: map => new Map(map),
		persist: map => Array.from(map.entries()),
	}),
	proliferatorCustom: temporarySignal('proliferatorCustom', new Map(), {
		restore: map => new Map(map),
		persist: map => Array.from(map.entries()),
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
		.filter(([item, recipes]) => recipes.length > (item.miningFrom? 0 : 1))
		.reduce((accumulator, [item, recipes]) => {
			let recipe = recipes[0]; // Should be fine with first recipe as default
			accumulator[item.id] = persistentSignal(`preferred.${item.id}`, recipe.id);
			return accumulator;
		}, {})
	},
	
	recipesUsed: signal(new Set()),
	typesUsed: signal(new Set()),
	showHiddenUpgrades: signal(false),
	
	recipesUnlocked: computed(() => RecipesUnlocked(state.research.value)),
	itemsUnlocked: computed(() => ItemsUnlocked(state.research.value)),
	recipesUnlockedSet: computed(() => RecipesUnlocked(state.research.value, true)),
	itemsUnlockedSet: computed(() => ItemsUnlocked(state.research.value, true)),
	// hasRecipeUnlocked(id) { state.recipesUnlocked.value }
};


export default state;



