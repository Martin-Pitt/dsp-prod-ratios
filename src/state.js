import { signal } from '@preact/signals';
import { Items, Recipes } from './lib/data.js';


export default {
	recipe: signal(null),
	factor: signal(1),
	per: signal(60),
	timeScale: signal('minute'),
	
	research: signal([]),
	
	preferred: {
		assembler: signal(2303 /* Assembling Machine Mk.I */),
		smelter: signal(2302 /* Arc Smelter */),
		chemical: signal(2309 /* Chemical Plant */),
		belt: signal(2001 /* Conveyor Belt MK.I */),
		...Items.map(item => {
			let recipes = Recipes.filter(recipe => recipe.results.includes(item.id));
			return [item, recipes]
		})
		.filter(([item, recipes]) => recipes.length > 1)
		.reduce((accumulator, [item, recipes]) => {
			let recipe = recipes[0]; // Should be fine with first recipe as default
			accumulator[item.id] = signal(recipe.id);
			return accumulator;
		}, {})
	},
	
	recipesUsed: signal(new Set()),
	typesUsed: signal(new Set()),
};