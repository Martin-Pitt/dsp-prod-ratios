import { useState, useMemo, useCallback } from 'preact/hooks';
import classNames from 'classnames';
import {
	Recipes, Items, StringFromTypes,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	RecipesUnlocked,
	ItemsUnlocked,
} from '../lib/data.js';
import state from '../state.js';
import { render } from 'preact';
import { JSONReplacer } from '../data/reviver.js';



function renderNumber(factor) {
	let string = factor.toString();
	if(!/\d\.\d/.test(string)) return string;
	let repeats = string.toString().match(/(\d+?)\1+\d$/);
	if(!repeats || !repeats[1]) return +factor;//.toFixed(6);
	
	let left = string.substr(0, repeats.index);
	let right = repeats[1];
	if(right === '0') return left;
	return <>{left}{right}&#773;</>
}



function Solve({ solve, per, depth = 0, ingredient = null, ...props }) {
	if(!solve || depth > 10) return null;
	let { recipe, children } = solve;
	
	
	let recipePerMinute = recipe.resultCounts[0] * (60/recipe.timeSpend*60);
	
	let modifier = 1.0;
	switch(recipe.type) {
		case 'ASSEMBLE': modifier = AssemblerProductionSpeed.get(state.preferred.assembler.value); break;
		case 'SMELT': modifier = SmelterProductionSpeed.get(state.preferred.smelter.value); break;
		case 'CHEMICAL': modifier = ChemicalProductionSpeed.get(state.preferred.chemical.value); break;
	}
	
	let factor = (per / recipePerMinute) / modifier;
	
	
	if(children && children.length)
	{
		return (
			<details key={recipe.id} class="node solve" style={{ '--depth': depth }} open={depth === 0}>
				<summary>
					<div class="node-header">
						<div class="meta">
							<span class="factor">{renderNumber(factor)}</span>&times; <span class="process">{StringFromTypes.get(recipe.type)}</span> <span class="item">{recipe.explicit? recipe.name : Items.find(i => i.id === recipe.results[0]).name}</span>
						</div>
						<ul class="products">
							<li class="output"><span class="perMinute">{renderNumber(state.timeScale.value === 'minute'? per : per / 60)}</span>&times; <span class="item">{Items.find(item => item.id === (ingredient || recipe.results[0]))?.name}</span> <span class="timeScale">per {state.timeScale.value}</span></li>
						</ul>
					</div>
				</summary>
				{children && children.map((child, index) => {
					if(Array.isArray(child))
					{
						let preferredAltRecipe = state.preferred[recipe.items[index]].value;
						child = child.find(d => d.recipe.id === preferredAltRecipe);
					}
					
					if(!child) return 'Error, no child'; // ??
					
					return (
						<Solve
							solve={child}
							depth={depth + 1}
							per={per * recipe.itemCounts[index]}
							ingredient={recipe.items[index]}
						/>
					);
				})}
			</details>
		);
	}
	
	else
	{
		return (
			<div class="node solve" style={{ '--depth': depth }}>
				<div class="node-header">
					<div class="meta">
						<span class="factor">{renderNumber(factor)}</span>&times; <span class="process">{StringFromTypes.get(recipe.type)}</span> <span class="item">{recipe.explicit? recipe.name : Items.find(i => i.id === recipe.results[0]).name}</span>
					</div>
					<ul class="products">
						<li class="output"><span class="perMinute">{renderNumber(state.timeScale.value === 'minute'? per : per / 60)}</span>&times; <span class="item">{Items.find(i => i.id === recipe.results[0]).name}</span> <span class="timeScale">per {state.timeScale.value}</span></li>
					</ul>
				</div>
			</div>
		);
	}
}


export default function Solver(props) {
	if(!state.recipe.value) return <div class="solver"/>;
	
	const recipesUnlocked = useMemo(() => RecipesUnlocked(state.research.value), [state.research.value]);
	const itemsUnlocked = useMemo(() => ItemsUnlocked(state.research.value), [state.research.value]);
	const solve = useMemo(() => {
		let recipesUsed = new Set();
		let typesUsed = new Set();
		
		function solve(recipe, depth = 0, cyclic = new Map(), node = {}) {
			if(depth > 10) throw new 'Hit max depth'; // return null;
			
			node.recipe = recipe;
			recipesUsed.add(recipe.id);
			typesUsed.add(recipe.type);
			
			if(recipe.items.length)
			{
				// node.children = {};
				node.children = [];
				
				for(let id of recipe.items)
				{
					let item = itemsUnlocked.find(item => item.id === id);
					
					let subRecipes = recipesUnlocked.filter(subRecipe => recipe !== subRecipe && subRecipe.results.includes(id));
					if(!subRecipes.length)
					{
						// node.children[item.id] = null;
					}
					
					else
					{
						let subNodes = [];
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
								solve(subRecipe, depth + 1, cyclic, subNode);
								subNodes.push(subNode);
							}
						}
						
						if(subNodes.length === 1) subNodes = subNodes[0];
						// node.children[item.id] = subNodes;
						node.children.push(subNodes);
					}
				}
			}
			
			return node;
		}
		
		let solved = solve(state.recipe.value);
		state.recipesUsed.value = recipesUsed;
		state.typesUsed.value = typesUsed;
		
		return solved;
	}, [
		state.research.value,
		state.recipe.value,
		// ...Object.values(state.preferred).map(pref => pref.value)
	]);
	
	window.solve = solve;
	
	
	return (
		<div class="solver">
			<Solve solve={solve} per={state.per.value}/>
			
			
			{/* <pre>
				{JSON.stringify(solve, (() => {
					const cache = new Set();
					return (key, value) => {
						if(typeof value === 'object' && value !== null) {
							if(cache.has(value)) return value?.recipe?.name? `[Circular‹${value.recipe.name}›]` : '[Circular]';
							cache.add(value);
						}
						return value;
					};
				})(), '\t')}
			</pre> */}
			
			{/* <pre>
				recipe: {JSON.stringify(state.recipe.value, null, '\t')}<br/>
				factor: {state.factor.value}<br/>
				per: {state.per.value}<br/>
				timeScale: {state.timeScale.value}<br/>
				<br/>
				research: {JSON.stringify(state.research.value.map(research => research.name), JSONReplacer, '\t')}<br/>
				<br/>
				preferred: {JSON.stringify(state.preferred, null, '\t')}<br/>
			</pre> */}
		</div>
	);
}






/*function solve(recipe, depth = 0, cyclic = new Map(), node = {}) {
	if(depth > 10) throw new 'Hit max depth'; // return null;
	
	console.groupCollapsed(
		'Recipe',
		recipe.explicit? recipe.name : Items.find(item => item.id === recipe.results[0]).name,
	);

	node.recipe = recipe;
	
	if(recipe.items.length)
	{
		// let ingredients = {};
		// node.ingredients = ingredients;
		
		for(let id of recipe.items)
		{
			let item = Items.find(item => item.id === id);
			
			let subRecipes = Recipes.filter(recipe => recipe.results.includes(id));
			if(!subRecipes.length)
			{
				console.log('Raw', item.name);
				// ingredients.push(item);
				// ingredients[item.id] = null;
				node[item.id] = null;
			}

			else
			{
				console.groupCollapsed('Item', item.name);
				let subNodes = [];
				for(let iter = 0; iter < subRecipes.length; ++iter)
				{
					let subRecipe = subRecipes[iter];
					
					if(cyclic.has(subRecipe))
					{
						console.log('Cyclic', subRecipe.explicit? subRecipe.name : Items.find(item => item.id === subRecipe.results[0]).name);
						let subNode = cyclic.get(subRecipe);
						subNodes.push(subNode);
						// Maybe mark cyclic dependencies more obv?
						// e.g. subNode.cyclic = true or subNode = { cyclic: true, ...subNode } / subNode = { cyclic: true, subNode }
					}
					
					else
					{
						let subNode = {};
						cyclic.set(subRecipe, subNode);
						solve(subRecipe, depth + 1, cyclic, subNode);
						subNodes.push(subNode);
					}
				}
				console.groupEnd();

				if(subNodes.length === 1) subNodes = subNodes[0];
				// ingredients.push(subNodes);
				// ingredients[item.id] = subNodes;
				node[item.id] = subNodes;
			}
		}
	}
	
	console.groupEnd();
	return node;
}


// solve(
// 	Recipes.find(recipe => recipe.id === 83) // 83) // Small Carrier Rocket
// );
*/


