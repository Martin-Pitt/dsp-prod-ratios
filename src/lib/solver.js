import {
	Techs,
	Recipes,
	Items,
	Locale,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	FractionationProductionSpeed,
	BeltTransportSpeed,
	Proliferator,
	RecipesIgnored,
} from '../lib/data.js';
import state from '../state.js';


export function SolverTree(recipe) {
	const recipesUnlocked = state.recipesUnlocked.value;
	const itemsUnlocked = state.itemsUnlocked.value;
	const recipesUsed = new Set();
	const typesUsed = new Set();
	const solveNodes = new Set();
	
	function recurse(recipe, depth = 0, cyclic = new Map(), node = {}) {
		if(depth > 10) throw new 'Hit max depth'; // return null;
		
		node.recipe = recipe;
		if(depth) recipesUsed.add(recipe.id);
		typesUsed.add(recipe.type);
		
		if(recipe.items.length)
		{
			// node.children = {};
			node.children = [];
			
			for(let id of recipe.items)
			{
				let item = itemsUnlocked.find(item => item.id === id);
				let subNodes = [];
				
				let subRecipes = recipesUnlocked.filter(subRecipe => recipe !== subRecipe && subRecipe.results.includes(id) && !RecipesIgnored.has(subRecipe.id));
				// if(!subRecipes.length)
				
				if(!subRecipes.length || item.miningFrom)
				{
					let subNode = { item };
					solveNodes.add(subNode);
					subNodes.push(subNode);
					// node.children.push({ item });
				}
				
				// else
				if(subRecipes.length)
				{
					for(let iter = 0; iter < subRecipes.length; ++iter)
					{
						let subRecipe = subRecipes[iter];
						
						if(cyclic.has(subRecipe))
						{
							let subNode = cyclic.get(subRecipe);
							subNodes.push(subNode);
						}
						
						else
						{
							let subNode = {};
							cyclic.set(subRecipe, subNode);
							recurse(subRecipe, depth + 1, cyclic, subNode);
							solveNodes.add(subNode);
							subNodes.push(subNode);
						}
					}
				}
				
				if(subNodes.length === 1) subNodes = subNodes[0];
				node.children.push(subNodes);
			}
		}
		
		solveNodes.add(node);
		return node;
	}
	
	const solved = recurse(recipe);
	
	let id = 0;
	for(let solve of solveNodes) solve.id = ++id;
	
	return {
		tree: solved,
		list: solveNodes,
		recipesUsed,
		typesUsed,
	};
}


export function RecipeTree(solverTree) {
	const recipesUnlockedSet = state.recipesUnlockedSet.value;
	const recipesUsed = new Set();
	const typesUsed = new Set();
	const nodes = new Set();
	
	function recurse({ solve, depth = 0, ingredient = null }) {
		if(!solve) return null;
		
		if('item' in solve)
		{
			if(!solve.item) return {
				_: 'Locked: Item not available due to research',
				depth,
			};
			
			return {
				_: 'Item',
				depth,
				item: solve.item,
			};
		}
		
		let { recipe, children } = solve;
		
		if(children) children = children.map((child, index) => {
			if(Array.isArray(child))
			{
				let item = Items.find(item => item.id === recipe.items[index]);
				let preferredAltRecipe = state.preferred[item.id]?.value;
				const hasMiningFrom = preferredAltRecipe === item.id && item.miningFrom;
				if(!hasMiningFrom && !recipesUnlockedSet.has(preferredAltRecipe)) return {
					_: 'Locked: Alternative recipe for item locked due to research',
					depth,
					alternatives: Recipes.filter(recipe => recipe.results.includes(item.id) && (state.showHiddenUpgrades.value || recipesUnlockedSet.has(recipe.id)))
				};
				
				let preferredChild = child.find(d => d.recipe?.id === preferredAltRecipe);
				if(!preferredChild && hasMiningFrom) preferredChild = child.find(d => d.item === item);
				child = preferredChild;
			}
			
			if(!child) return {
				_: 'Error: No child', // ?? Hit max depth?
				depth,
			};
			
			let node = recurse({
				solve: child,
				depth: depth + 1,
				ingredient: recipe.items[index],
			});
			nodes.add(node);
			return node;
		});
		
		
		if(depth) recipesUsed.add(recipe.id);
		typesUsed.add(recipe.type);
		
		return {
			_: 'Recipe',
			depth,
			recipe,
			children,
			ingredient
		};
	}
	
	let node = recurse({ solve: solverTree.tree });
	nodes.add(node);
	
	let id = nodes.size;
	for(let node of nodes) node.id = --id;
	
	return {
		tree: node,
		list: nodes,
		recipesUsed,
		typesUsed,
	};
}


export function CalcTree(recipeTree, throughput, proliferator = null) {
	const nodes = new Set();
	
	function recurse(root, throughput) {
		if(!root) return null;
		if(root._.startsWith('Error')) return Object.assign({}, root);
		if(root._.startsWith('Locked')) return Object.assign({}, root);
		if(root._ === 'Item')
		{
			return Object.assign({}, root, {
				calc: {
					throughput,
					belts: throughput / BeltTransportSpeed.get(state.preferred.belt.value),
				},
			});
		}
		
		if(root._ === 'Recipe')
		{
			let { recipe, children, ingredient } = root;
			
			let modifier = 1.0;
			switch(recipe.type) {
				case 'ASSEMBLE': modifier = AssemblerProductionSpeed.get(state.preferred.assembler.value); break;
				case 'SMELT': modifier = SmelterProductionSpeed.get(state.preferred.smelter.value); break;
				case 'CHEMICAL': modifier = ChemicalProductionSpeed.get(state.preferred.chemical.value); break;
				case 'FRACTIONATE': modifier = FractionationProductionSpeed(state.research.value) / 60 / 60; break;
			}
			
			if(!ingredient) ingredient = recipe.results[0];
			let ingredientIndex = recipe.results.findIndex(result => result === ingredient);
			let ingredientsPerMinute = recipe.resultCounts[ingredientIndex] * (60/recipe.timeSpend*60);
			
			// let proliferatorPoints = state.proliferatorPoints.value;
			// let proliferatorType = state.proliferatorCustom.value.has(solve.id)? state.proliferatorCustom.value.get(solve.id) : state.proliferatorPreset.value.get(solve.id);
			let proliferatorType = proliferator? proliferator.mix.get(recipe.id) : undefined;
			if(proliferator)
			{
				let proliferatorPoints = proliferator.points;
				let index = Proliferator.Ability.indexOf(proliferatorPoints);
				switch(proliferatorType)
				{
					case 'speedup': modifier *= Proliferator.ProductionSpeed[index]; break;
					case 'extra': ingredientsPerMinute *= Proliferator.ExtraProducts[index]; break;
				}
			}
			
			let facilities = throughput / ingredientsPerMinute / modifier;
			
			if(children) children = children.map((child, index) => {
				let itemsPerMinute = recipe.itemCounts[index] * (60/recipe.timeSpend*60);
				let node = recurse(child, facilities * itemsPerMinute * modifier);
				nodes.add(node);
				return node;
			});
			
			return Object.assign({}, root, {
				calc: {
					throughput,
					modifier,
					ingredientsPerMinute,
					facilities,
					sorters: facilities * (recipe.results.length + recipe.items.length),
					// footprint: 
				},
				proliferatorType,
				results: recipe.results.map((result, index) => ({
					item: Items.find(item => item.id === result),
					isIngredient: !ingredient || result === ingredient,
					throughput: throughput * (recipe.resultCounts[index] / recipe.resultCounts[ingredientIndex]),
					belts: (throughput * (recipe.resultCounts[index] / recipe.resultCounts[ingredientIndex])) / BeltTransportSpeed.get(state.preferred.belt.value),
				})),
				children,
			});
		}
	}
	
	let node = recurse(recipeTree.tree, throughput);
	nodes.add(node);
	
	let id = nodes.size;
	for(let node of nodes) node.id = --id;
	
	return {
		tree: node,
		list: nodes,
		isProliferated: !!proliferator
	};
}









/*
// Simple usage:
let recipe = Recipes.find(recipe => recipe.name === 'Proliferator Mk.III');
let solverTree = SolverTree(recipe);
let recipeTree = RecipeTree(solverTree);
let targetItemsPerMinute = 90;
let calcTree = CalcTree(recipeTree, targetItemsPerMinute);
*/


/*
// If you want to figure out some stats on calcTree:
let stats = Array.from(calcTree.list).reduce((accumulator, current) => {
	accumulator.facilities += current.calc.facilities || 0;
	accumulator.sorters += current.calc.sorters || 0;
	return accumulator;
}, {
	get total() { return this.facilities + this.sorters },
	facilities: 0,
	sorters: 0,
});
*/

/*
// With proliferator settings:
let recipe = Recipes.find(recipe => recipe.name === 'Proliferator Mk.III');
let solverTree = SolverTree(recipe);
let recipeTree = RecipeTree(solverTree);

// Set the whole mix to speedup
let proliferator = {
	points: 4,
	mix: new Map(
		Array.from(recipeTree.list)
		.filter(node => node._ === 'Recipe')
		.map(node => [node.recipe.id, 'speedup'])
	)
};
let calcTree = CalcTree(recipeTree, 90, proliferator);
*/

/*
let recipe = Recipes.find(recipe => recipe.name === 'Titanium Alloy');
let solverTree = SolverTree(recipe);
let recipeTree = RecipeTree(solverTree);

let recipesWithBonuses = Array.from(recipeTree.list, node => node._ === 'Recipe'? node.recipe : null)
	.filter(Boolean)
	.map(recipe => Object.assign({ recipe }, Proliferator.RecipeBonuses(recipe)));

// let MaxPermutations = Math.pow(2, recipesWithBonuses.length);
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

// Reference values from https://discord.com/channels/750553061369577492/868196064900038766/1072046140737982515
// Of course the numbers in reality are sketchy, but a relevant comparison can be drawn to eachother and seem to make sense in that context
let Lag = {
	Sorter: 0.025339674,
	Facility: 0.028362772,
};

let possibilities = permutations.map(mix => {
	let calcTree = CalcTree(recipeTree, 1800*1000, { points: 4, mix });
	let stats = Array.from(calcTree.list).reduce((accumulator, current) => {
		if(!current.recipe) return accumulator;
		let { facilities, sorters } = current.calc;
		accumulator.facilities += facilities;
		accumulator.sorters += sorters;
		switch(current.recipe?.type) {
			case 'ASSEMBLE': accumulator.assembler += facilities; break;
			case 'SMELT': accumulator.smelter += facilities; break;
			case 'CHEMICAL': accumulator.chemical += facilities; break;
			case 'FRACTIONATE': accumulator.fractionator += facilities; break;
		}
		accumulator.lag += Lag.Facility * facilities;
		accumulator.lag += Lag.Sorter * sorters;
		return accumulator;
	}, {
		get total() { return this.facilities + this.sorters },
		facilities: 0,
		sorters: 0,
		assembler: 0,
		smelter: 0,
		chemical: 0,
		fractionator: 0,
		lag: 0,
	});
	return { calcTree, stats };
});

let minPossibility = possibilities[0];
for(let possibility of possibilities)
{
	if(possibility.stats.lag < minPossibility.stats.lag) minPossibility = possibility;
}

console.group(
	recipe.explicit? Items.find(item => item.id === recipe.results[0]).name : recipe.name,
	'—', 'Permutations | Lag',
);
for(let possibility of possibilities) console.log(
	possibility === minPossibility? '[' : ' ',
	Array.from(possibility.calcTree.list)
		.filter(node => node._ === 'Recipe')
		.map(node => node.proliferatorType[0].toUpperCase()).join(' '),
	'|', possibility.stats.lag,
	possibility === minPossibility? '] <---' : ' ',
);
console.groupEnd();
minPossibility.stats
*/