import {
	Recipes, Items,
	Proliferator,
} from '../src/lib/data';
import {
	SolverTree,
	RecipeTree,
	CalcTree,
} from '../src/lib/solver';
import state from '../src/state';

state.preferred[1003].value = 34;
state.preferred[1109].value = 17;
state.preferred[1112].value = 61;
state.preferred[1113].value = 62;
state.preferred[1114].value = 16;
state.preferred[1116].value = 1116;
state.preferred[1117].value = 1117;
state.preferred[1120].value = 1120;
state.preferred[1121].value = 1121;
state.preferred[1123].value = 32;
state.preferred[1124].value = 35;
state.preferred[1126].value = 29;
state.preferred[1206].value = 100;
state.preferred[1210].value = 78;
state.preferred[1404].value = 68;
state.preferred.assembler.value = 2305; // 2303;
state.preferred.smelter.value = 2315; // 2302;
state.preferred.chemical.value = 2317; // 2309;
state.preferred.belt.value = 2003; // 2001;

////////////////////////////////////


function calcOptimalProliferator(recipe, optimiseStat = 'total') {
	let atStart = performance.now();
	
	
	let atPreTree = performance.now();
	let solverTree = SolverTree(recipe);
	let recipeTree = RecipeTree(solverTree);
	let recipesWithBonuses = Array.from(recipeTree.list, node => node._ === 'Recipe'? node.recipe : null)
		.filter(Boolean)
		.map(recipe => Object.assign({ recipe }, Proliferator.RecipeBonuses(recipe)));
	let atPostTree = performance.now();
	
	// function maxPermutator(list) {
	// 	let permutations = 0;
	// 	function permutate(array) {
	// 		if(!array.length) return ++permutations;
	// 		let node = array[0];
	// 		if(node.canProduceExtra) permutate(array.slice(1));
	// 		if(node.canSpeedupProduction) permutate(array.slice(1));
	// 	}
	// 	permutate(list);
	// 	return permutations;
	// }
	
	
	let atPrePermutation = performance.now();
	function permutator(list) {
		let permutations = [];
		function permutate(array, memo = []) {
			if(!array.length) return permutations.push(new Map(memo));
			let node = array[0];
			if(node.canProduceExtra) permutate(array.slice(1), memo.concat([[node.recipe.id, 'extra']]));
			if(node.canSpeedupProduction) permutate(array.slice(1), memo.concat([[node.recipe.id, 'speedup']]));
		}
		permutate(list);
		return permutations;
	}
	
	let permutations = permutator(recipesWithBonuses);
	let atPostPermutation = performance.now();
	console.log('Permutations:', permutations.length);
	
	
	let atPreOptimal = performance.now();
	// Reference values from https://discord.com/channels/750553061369577492/868196064900038766/1072046140737982515
	// Of course the numbers in reality are sketchy, but a relevant comparison can be drawn to eachother and seem to make sense in that context
	let Lag = {
		Sorter: 0.025339674,
		Facility: 0.028362772,
	};
	
	let minPossibility;
	for(let mix of permutations)
	{
		let possibility = {
			calcTree: CalcTree(recipeTree, 1800*1000, { points: 4, mix }),
			stats: {
				total: 0,
				facilities: 0,
				sorters: 0,
				assembler: 0,
				smelter: 0,
				chemical: 0,
				fractionator: 0,
				lag: 0,
			},
		};
		
		let stats = possibility.stats;
		let list = possibility.calcTree.list;
		for(let node of list)
		{
			if(!node.recipe) continue;
			let { facilities, sorters } = node.calc;
			stats.facilities += facilities;
			stats.sorters += sorters;
			switch(node.recipe?.type) {
				case 'ASSEMBLE': stats.assembler += facilities; break;
				case 'SMELT': stats.smelter += facilities; break;
				case 'CHEMICAL': stats.chemical += facilities; break;
				case 'FRACTIONATE': stats.fractionator += facilities; break;
			}
		}
		
		stats.lag = Lag.Facility * stats.facilities + Lag.Sorter * stats.sorters;
		stats.total = stats.facilities + stats.sorters;
		
		
		if(!minPossibility) minPossibility = possibility;
		if(possibility.stats[optimiseStat] < minPossibility.stats[optimiseStat]) minPossibility = possibility;
	}
	let atPostOptimal = performance.now();
	
	// console.log(
	// 	'[',
	// 	Array.from(minPossibility.calcTree.list)
	// 		.filter(node => node._ === 'Recipe')
	// 		.map(node => node.proliferatorType[0].toUpperCase()).join(' '),
	// 	'|', minPossibility.stats[optimiseStat],
	// 	'] <---'
	// );
	
	// console.log(minPossibility.stats);
	
	let atEnd = performance.now();
	
	return {
		...minPossibility,
		performance: {
			total: atEnd - atStart,
			tree: atPostTree - atPreTree,
			permutation: atPostPermutation - atPrePermutation,
			optimal: atPostOptimal - atPreOptimal,
		}
	};
}



let recipe = Recipes.find(recipe => recipe.name === 'Gravity Matrix');
let mix = calcOptimalProliferator(recipe, 'total');

console.log(
	Array.from(mix.calcTree.list)
	.filter(node => node._ === 'Recipe')
	.map(node => node.proliferatorType[0].toUpperCase()).join(' '),
	mix.stats,
	Object.fromEntries(
		Object.entries(mix.performance)
		.map(([key, value]) =>
			[key, +value.toFixed(2)]
			// [key, +value.toFixed(2) + 'ms']
		)
	),
);


