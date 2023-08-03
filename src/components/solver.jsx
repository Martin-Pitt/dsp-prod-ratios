import { useState, useMemo, useCallback, useEffect } from 'preact/hooks';
import classNames from 'classnames';
import {
	Recipes, Items, StringFromTypes,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	BeltTransportSpeed,
	Proliferator,
	RecipesUnlocked,
	ItemsUnlocked,
	RecipesIgnored,
} from '../lib/data.js';
import state from '../state.js';
import Item from './item.jsx';
import Recipe from './recipe.jsx';




function renderNumber(factor) {
	// let string = factor.toString();
	let string = factor.toFixed(3);
	if(!/\d\.\d/.test(string)) return string;
	let repeats = string.toString().match(/(\d+?)\1+\d$/);
	// if(!repeats || !repeats[1]) return +factor;//.toFixed(6);
	if(!repeats || !repeats[1]) return +factor.toFixed(3);
	
	let left = string.substr(0, repeats.index);
	let right = repeats[1];
	if(right === '0') return left.slice(0, -1);
	return <>{left}{right}&#773;</>
}

function renderTime(time) {
	if(state.timeScale.value === 'second') time /= 60;
	return renderNumber(time);
}


function onCustomProliferator(event, solve) {
	let type = event.target.value;
	
	if(state.proliferator.value !== 'custom')
	{
		state.proliferator.value = 'custom';
		state.proliferatorCustom.value = new Map();
	}
	
	state.proliferatorCustom.value.set(solve.id, type);
	state.proliferatorCustom.value = new Map(state.proliferatorCustom.value);
}


function Juice(props) {
	let points = props.points || state.proliferatorPoints.value;
	
	if(!props.solve)
	{
		return (
			<div class="icon" data-icon={`ui.inc-${props.proliferated? points : 0}`}/>
		);
	}
	
	let index = Proliferator.Ability.indexOf(points);
	let type = Proliferator.Types[props.type];
	let { canProduceExtra, canSpeedupProduction } = Proliferator.RecipeBonuses(props.solve.recipe);
	let percents = { none: 'none' };
	if(canSpeedupProduction) percents.speedup = `+${(Proliferator.ProductionSpeed[index]*100 - 100)}% speed`;
	if(canProduceExtra) percents.extra = `+${(Proliferator.ExtraProducts[index]*100 - 100)}% extra`;
	let percent = percents[props.type];
	
	return (
		<div
			class="icon"
			data-icon={`ui.inc-${props.proliferated? points : 0}`}
			data-count=""
			data-inc={props.type}
			title={props.type !== 'none'? `${type}: ${percent}` : type}
		>
			{props.solve? (
				<select class="count" onInput={(event) => onCustomProliferator(event, props.solve)}>
					{Object.entries(percents).map(([key, label]) =>
						<option value={key} selected={key === props.type}>{label}</option>
					)}
				</select>
			) : (
				<span class="count">{percent}</span>
			)}
		</div>
	);
}



function SolveTree({ solve, depth = 0, output, ingredient = null, hasProliferators = false, proliferated = null }) {
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
					{hasProliferators && (
						<div class="proliferator">
							{proliferated && <Juice proliferated={proliferated}/>}
						</div>
					)}
					<div class="logistics">
						<span class="belt"><span class="factor">{renderNumber(output / BeltTransportSpeed.get(state.preferred.belt.value))}</span>&times;</span>
					</div>
					<ul class="products">
						<li class={classNames('output', 'is-ingredient')}>
							<span class="perMinute">{renderTime(output)}</span>&times;
							<Item item={item}/>
							<span class="timeScale">per {state.timeScale.value}</span>
						</li>
					</ul>
				</div>
			</div>
		);
	}
	
	else
	{
		let { recipe, children } = solve;
		
		let modifier = 1.0;
		switch(recipe.type) {
			case 'ASSEMBLE': modifier = AssemblerProductionSpeed.get(state.preferred.assembler.value); break;
			case 'SMELT': modifier = SmelterProductionSpeed.get(state.preferred.smelter.value); break;
			case 'CHEMICAL': modifier = ChemicalProductionSpeed.get(state.preferred.chemical.value); break;
		}
		
		
		
		if(!ingredient) ingredient = recipe.results[0];
		let ingredientIndex = recipe.results.findIndex(result => result === ingredient);
		let count = recipe.resultCounts[ingredientIndex];
		let ingredientPerMinute = count * (60/recipe.timeSpend*60);
		
		
		// let points = state.proliferatorPoints.value;
		// let proliferator = state.proliferator.value;
		// if(points)
		// {
		// 	if(proliferator === 'mixed') proliferator = Proliferator.BestPracticeMix(recipe);
		// 	else if(proliferator === 'custom') proliferator = state.proliferatorCustom.value.find(set => set.id === solve.id).type;
		// 	else
		// 	{
		// 		let { canProduceExtra, canSpeedupProduction } = Proliferator.RecipeBonuses(recipe);
		// 		if((proliferator === 'speedup' && !canSpeedupProduction)
		// 		|| (proliferator === 'extra' && !canProduceExtra)) proliferator = 'none';
		// 	}
			
			
		// 	let index = Proliferator.Ability.indexOf(points);
		// 	switch(proliferator)
		// 	{
		// 		case 'speedup': modifier *= Proliferator.ProductionSpeed[index]; break;
		// 		case 'extra': ingredientPerMinute *= Proliferator.ExtraProducts[index]; break;
		// 	}
		// }
		
		let points = state.proliferatorPoints.value;
		let proliferator = state.proliferatorCustom.value.has(solve.id)? state.proliferatorCustom.value.get(solve.id) : state.proliferatorPreset.value.get(solve.id);
		if(points)
		{
			let index = Proliferator.Ability.indexOf(points);
			switch(proliferator)
			{
				case 'speedup': modifier *= Proliferator.ProductionSpeed[index]; break;
				case 'extra': ingredientPerMinute *= Proliferator.ExtraProducts[index]; break;
			}
		}
		
		
		
		if(recipe.type === 'FRACTIONATE')
		{
			return (
				<div class="node solve" style={{ '--depth': depth }}>
					<div class="node-header">
						<div class="meta">
							<Recipe recipe={recipe} named/>
						</div>
						{hasProliferators && (
							<div class="proliferator">
								{(proliferator || proliferated) && <Juice type={proliferator} proliferated={proliferated} solve={solve}/>}
							</div>
						)}
						<div class="logistics">
							{recipe.results.map((result, index) =>
								<span class="belt"><span class="factor">{renderNumber(output / BeltTransportSpeed.get(state.preferred.belt.value))}</span>&times;</span>
							)}
						</div>
						<ul class="products">
							{recipe.results.map((result, index) =>
								<li class={classNames('output', { 'is-ingredient': !ingredient || result === ingredient })}>
									<span class="perMinute">{renderTime(output * (recipe.resultCounts[index] / recipe.resultCounts[ingredientIndex]))}</span>&times;
									<Item id={result}/>
									<span class="timeScale">per {state.timeScale.value}</span>
								</li>
							)}
						</ul>
					</div>
				</div>
			);
		}
		
		
		
		let factor = output / ingredientPerMinute / modifier;
		
		return (
			<details key={recipe.id} class="node solve" style={{ '--depth': depth }} open={depth === 0}>
				<summary>
					<div class="node-header">
						<div class="meta">
							{/* <span class="factor">{renderNumber(factor)}</span>&times; <span class="process">{StringFromTypes.get(recipe.type)}</span> <Recipe recipe={recipe} named/> */}
							<span title={`${+factor.toFixed(6)}× ${StringFromTypes.get(recipe.type)}`}>
								<span class="factor">{renderNumber(factor)}</span>&times;
							</span> <Recipe recipe={recipe} named/>
						</div>
						{hasProliferators && (
							<div class="proliferator">
								{(proliferator || proliferated) && <Juice type={proliferator} proliferated={proliferated} solve={solve}/>}
							</div>
						)}
						<div class="logistics">
							{recipe.results.map((result, index) =>
								<span class="belt"><span class="factor">{renderNumber(output / BeltTransportSpeed.get(state.preferred.belt.value))}</span>&times;</span>
							)}
						</div>
						<ul class="products">
							{recipe.results.map((result, index) =>
								<li class={classNames('output', { 'is-ingredient': !ingredient || result === ingredient })}>
									<span class="perMinute">{renderTime(output * (recipe.resultCounts[index] / recipe.resultCounts[ingredientIndex]))}</span>&times;
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
					
					let count = recipe.itemCounts[index];
					let itemPerMinute = count * (60/recipe.timeSpend*60);
					return (
						<SolveTree
							solve={child}
							depth={depth + 1}
							output={factor * itemPerMinute * modifier}
							ingredient={recipe.items[index]}
							hasProliferators={hasProliferators}
							proliferated={proliferator !== 'none'}
						/>
					);
				})}
			</details>
		);
	}
}







export default function Solver(props) {
	if(!state.recipe.value) return <div class="solver"/>;
	
	const recipesUnlocked = useMemo(() => RecipesUnlocked(state.research.value), [state.research.value]);
	const itemsUnlocked = useMemo(() => ItemsUnlocked(state.research.value), [state.research.value]);
	
	const [solve, solveNodes] = useMemo(() => {
		let recipesUsed = new Set();
		let typesUsed = new Set();
		let solveNodes = new Set();
		
		function solve(recipe, depth = 0, cyclic = new Map(), node = {}) {
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
					
					let subRecipes = recipesUnlocked.filter(subRecipe => recipe !== subRecipe && subRecipe.results.includes(id) && !RecipesIgnored.has(subRecipe.id));
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
			
			solveNodes.add(node);
			return node;
		}
		
		let solved = solve(state.recipe.value);
		state.recipesUsed.value = recipesUsed;
		state.typesUsed.value = typesUsed;
		
		return [solved, solveNodes];
	}, [
		state.research.value,
		state.recipe.value,
		// ...Object.values(state.preferred).map(pref => pref.value)
	]);
	
	window.solve = solve;
	
	
	const [unlockedProliferators, hasProliferators] = useMemo(() => {
		let unlocked = [];
		for(let id of Proliferator.Items)
		{
			if(!itemsUnlocked.some(item => item.id === id)) break;
			unlocked.push(id);
		}
		
		return [unlocked, unlocked.length > 0];
	}, [itemsUnlocked]);
	
	useEffect(() => {
		const preset = new Map();
		state.proliferatorCustom.value = new Map();
		
		let points = state.proliferatorPoints.value;
		if(!points) return state.proliferatorPreset.value = preset;
		
		let id = 0;
		for(let solve of solveNodes)
		{
			solve.id = ++id;
			
			if(solve.item) continue;
			
			let proliferator = state.proliferator.value;
			if(proliferator === 'mixed') proliferator = Proliferator.BestPracticeMix(solve.recipe);
			else if(proliferator === 'custom') proliferator = Proliferator.BestPracticeMix(solve.recipe);
			else
			{
				let { canProduceExtra, canSpeedupProduction } = Proliferator.RecipeBonuses(solve.recipe);
				if((proliferator === 'speedup' && !canSpeedupProduction)
				|| (proliferator === 'extra' && !canProduceExtra)) proliferator = 'none';
			}
			
			preset.set(solve.id, proliferator);
		}
		
		return state.proliferatorPreset.value = preset;
	}, [solveNodes]);
	
	useEffect(() => {
		if(state.proliferator.value === 'custom') return;
		
		const preset = new Map();
		state.proliferatorCustom.value = new Map();
		
		let points = state.proliferatorPoints.value;
		if(!points) return state.proliferatorPreset.value = preset;
		
		let id = 0;
		for(let solve of solveNodes)
		{
			solve.id = ++id;
			
			if(solve.item) continue;
			
			let proliferator = state.proliferator.value;
			if(proliferator === 'mixed') proliferator = Proliferator.BestPracticeMix(solve.recipe);
			else
			{
				let { canProduceExtra, canSpeedupProduction } = Proliferator.RecipeBonuses(solve.recipe);
				if((proliferator === 'speedup' && !canSpeedupProduction)
				|| (proliferator === 'extra' && !canProduceExtra)) proliferator = 'none';
			}
			
			preset.set(solve.id, proliferator);
		}
		
		return state.proliferatorPreset.value = preset;
	}, [state.proliferator.value]);
	
	
	return (
		<div class={classNames('solver', { 'has-proliferators': hasProliferators })}>
			<div class="solver-header node-header">
				<div>
					Buildings &times; Recipe
				</div>
				{hasProliferators && (
					<div>
						Proliferator
					</div>
				)}
				<div>
					Belts
				</div>
				<div>
					Throughput
				</div>
			</div>
			<SolveTree
				solve={solve}
				output={state.per.value}
				hasProliferators={hasProliferators}
			/>
			
			{/* <pre>
				{JSON.stringify(solve, (() => {
					const cache = new Set();
					return (key, value) => {
						if(key === 'recipe')
							return {
								name: value.name,
								timeSpend: value.timeSpend,
								items: value.items.map((id, index) => `${value.itemCounts[index]} x ${Items.find(item => item.id === id).name}`).join(', '),
								results: value.results.map((id, index) => `${value.resultCounts[index]} x ${Items.find(item => item.id === id).name}`).join(', '),
							};
						
						else if(key === 'item')
							return value.name;
						
						
						
						if(key === 'heatValue')
						{
							if(value < 1000000n)
								return `${Number(value) / 1000} KJ`;
							if(value < 1000000000n)
								return `${Number(value) / 1000000} MJ`;
							// if(value < 1000000000000n)
								return `${Number(value) / 1000000000} GJ`;
						}
						
						if(typeof value === 'bigint')
							return { type: 'BigInt', value: value.toString() };
						if(value instanceof Map)
							return { type: 'Map', value: Array.from(value.entries()) };
						
						if(typeof value === 'object' && value !== null) {
							if(cache.has(value)) return value?.recipe?.name? `[Circular‹${value.recipe.name}›]` : '[Circular]';
							cache.add(value);
						}
						
						// if(['items', 'results'].includes(key))
						// 	return value.map(id => Items.find(item => item.id === id).name).join(', ');
						
						// if(['itemCounts', 'resultCounts'].includes(key))
						// 	return value.join('x, ') + 'x';
						
						return value;
					};
				})(), '\t')}
			</pre> */}
		</div>
	);
}


