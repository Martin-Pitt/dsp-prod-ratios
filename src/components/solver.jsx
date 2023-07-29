import { useState, useMemo, useCallback } from 'preact/hooks';
import classNames from 'classnames';
import {
	Recipes, Items, StringFromTypes,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	BeltTransportSpeed,
	RecipesUnlocked,
	ItemsUnlocked,
} from '../lib/data.js';
import state from '../state.js';
import Item from './item.jsx';
import Recipe from './recipe.jsx';




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



function Solve({ solve, per, amount = 1, ingredient = null, depth = 0, ...props }) {
	if(!solve || depth > 10) return null;
	
	if('item' in solve)
	{
		if(!solve.item) return (
			<div class="node solve" style={{ '--depth': depth }}>
				<div class="node-header">
					<div class="meta">
						<span class="item">(Locked due to research)</span>
					</div>
				</div>
			</div>
		);
		
		let { item } = solve;
		return (
			<div class="node solve" style={{ '--depth': depth }}>
				<div class="node-header">
					<div class="meta">
						<Item item={item} named/>
					</div>
					<div class="logistics">
						
					</div>
					<ul class="products">
						<li class={classNames('output', 'is-ingredient')}>
							<span class="perMinute">{renderNumber(state.timeScale.value === 'minute'? per : per / 60)}</span>&times;
							<span class="item icon" data-icon={`item.${item.id}`} title={item.name}/>
							<span class="timeScale">per {state.timeScale.value}</span>
						</li>
					</ul>
				</div>
			</div>
		);
	}
	
	
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
							<span class="factor">{renderNumber(factor)}</span>&times; <span class="process">{StringFromTypes.get(recipe.type)}</span> <Recipe recipe={recipe} named/>
						</div>
						<div class="logistics">
							{recipe.results.map((result, index) =>
								<span class="belt"><span class="factor">{renderNumber(per / BeltTransportSpeed.get(state.preferred.belt.value))}</span>&times;</span>
							)}
						</div>
						<ul class="products">
							{recipe.results.map((result, index) =>
								<li class={classNames('output', { 'is-ingredient': !ingredient || result === ingredient })}>
									<span class="perMinute">{renderNumber((state.timeScale.value === 'minute'? per : per / 60))}</span>&times;
									<Item id={result}/>
									<span class="timeScale">per {state.timeScale.value}</span>
								</li>
							)}
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
							amount={recipe.itemCounts[index]}
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
			<details key={recipe.id} class="node solve" style={{ '--depth': depth }} open={depth === 0}>
				<summary>
					<div class="node-header">
						<div class="meta">
							<span class="factor">{renderNumber(factor)}</span>&times; <span class="process">{StringFromTypes.get(recipe.type)}</span> <Recipe recipe={recipe}/>
						</div>
						<div class="logistics">
							
						</div>
						<ul class="products">
							{recipe.results.map((result, index) =>
								<li class={classNames('output', { 'is-ingredient': !ingredient || result === ingredient })}>
									<span class="perMinute">{renderNumber((state.timeScale.value === 'minute'? per : per / 60) * recipe.resultCounts[index])}</span>&times;
									<Item id={result}/>
									<span class="timeScale">per {state.timeScale.value}</span>
								</li>
							)}
						</ul>
					</div>
				</summary>
			</details>
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
						node.children.push({ item });
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
			<div class="solver-header node-header">
				<div>
					Buildings &times; Recipe
				</div>
				<div>
					Belts
				</div>
				<div>
					Throughput
				</div>
			</div>
			<Solve solve={solve} per={state.per.value}/>
		</div>
	);
}


