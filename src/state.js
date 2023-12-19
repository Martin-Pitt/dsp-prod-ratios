import { signal, effect, computed } from '@preact/signals';
import {
	Items, ItemsUnlocked,
	Recipes, RecipesUnlocked,
	TechsByID,
	Locale,
} from './lib/data.js';
import { persistentSignal, temporarySignal } from './lib/persistent-signal.js';


// If there is a conflicting change we might need to reset localStorage
const StateFormat = '1';
if('localStorage' in globalThis && localStorage.format !== StateFormat)
{
	localStorage.clear();
	localStorage.format = StateFormat;
}


const state = {
	recipe: temporarySignal('recipe', null), // signal(null),
	factor: temporarySignal('factor', 1), // signal(1),
	per: temporarySignal('per', 60), // signal(60),
	timeScale: persistentSignal('timeScale', 'minute'),
	
	research: persistentSignal('research', [], {
		restore: array => array.map(id => TechsByID.get(id)),
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
	showHiddenUpgrades: temporarySignal('showHiddenUpgrades', false),
	showMatrixEpoch: temporarySignal('showMatrixEpoch', false),
	nativeScroll: temporarySignal('nativeScroll', false),
	
	recipesUnlocked: computed(() => RecipesUnlocked(state.research.value)),
	itemsUnlocked: computed(() => ItemsUnlocked(state.research.value)),
	recipesUnlockedSet: computed(() => RecipesUnlocked(state.research.value, true)),
	itemsUnlockedSet: computed(() => ItemsUnlocked(state.research.value, true)),
	// hasRecipeUnlocked(id) { state.recipesUnlocked.value }
	
	news: signal(null),
	
	lastVisit: localStorage.getItem('last-visit')? new Date(localStorage.getItem('last-visit')) : new Date(),
};

localStorage.setItem('last-visit', new Date());



(async () => {
	// Fetch the latest news, or cached network request if still fresh
	let language = 'english';
	if(Locale.locale === 'zh-CN') language = 'schinese';
	let response = await fetch(`https://steam-news-proxy.vercel.app/api/feed?l=${language}`, { mode: 'cors', credentials: 'omit', });
	let content = await response.json();
	
	// Convert pubData to Date
	content.item.pubDate = new Date(content.item.pubDate);
	
	// Clean the description
	content.item.description = content.item.description.trim().replaceAll(/(<br>)*?$/gm, '');
	
	// Create a snippet preview from the description
	let paragraphs = content.item.description.split('<br>');
	let snippet = [], length = 0;
	while(length < 200)
	{
		let paragraph = paragraphs.shift();
		length += paragraph.length;
		snippet.push(paragraph);
	}
	if(paragraphs.length)
	{
		content.item.snippet = snippet.join('<br>'); // .replaceAll(/(<\/?)iframe/g, '$1not-iframe');
	}
	
	// Mark as new if so
	content.item.isNew = state.lastVisit < content.item.pubDate;

	// Add locale to link
	content.item.link += `?l=${language}`;
	
	state.news.value = content;
})();



export default state;



