import { useState, useMemo, useCallback, useEffect } from 'preact/hooks';
import classNames from 'classnames';
import {
	Recipes, Items, StringFromTypes, t,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	FractionationProductionSpeed,
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



function SolveTree({ solve, depth = 0, throughput, ingredient = null, hasProliferators = false, proliferated = null }) {
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
						<Item item={item} proliferated={proliferated} named/>
						{item.miningFrom && (
							<>
								  {t('采集自' /* Gathered From */)} <span class="item" dangerouslySetInnerHTML={{ __html: item.miningFrom }}/>
							</>
						)}
					</div>
					{hasProliferators && (
						<div class="proliferator">
							{proliferated && <Juice proliferated={proliferated}/>}
						</div>
					)}
					<div class="logistics">
						<span class="belt"><span class="factor">{renderNumber(throughput / BeltTransportSpeed.get(state.preferred.belt.value))}</span>&times;</span>
					</div>
					<ul class="products">
						<li class={classNames('throughput', 'is-ingredient')}>
							<span class="perMinute">{renderTime(throughput)}</span>&times;
							<Item item={item} proliferated={proliferated}/>
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
			case 'FRACTIONATE': modifier = FractionationProductionSpeed(state.research.value) / 60 / 60; break;
		}
		
		if(!ingredient) ingredient = recipe.results[0];
		let ingredientIndex = recipe.results.findIndex(result => result === ingredient);
		let ingredientsPerMinute = recipe.resultCounts[ingredientIndex] * (60/recipe.timeSpend*60);
		
		let proliferatorPoints = state.proliferatorPoints.value;
		let proliferatorType = state.proliferatorCustom.value.has(solve.id)? state.proliferatorCustom.value.get(solve.id) : state.proliferatorPreset.value.get(solve.id);
		if(proliferatorPoints)
		{
			let index = Proliferator.Ability.indexOf(proliferatorPoints);
			switch(proliferatorType)
			{
				case 'speedup': modifier *= Proliferator.ProductionSpeed[index]; break;
				case 'extra': ingredientsPerMinute *= Proliferator.ExtraProducts[index]; break;
			}
		}
		
		let facitilies = throughput / ingredientsPerMinute / modifier;
		
		
		return (
			<details key={recipe.id} class="node solve" style={{ '--depth': depth }} open={depth === 0}>
				<summary>
					<div class="node-header">
						<div class="meta">
							{/* <span class="factor">{renderNumber(facitilies)}</span>&times; <span class="process">{StringFromTypes.get(recipe.type)}</span> <Recipe recipe={recipe} named/> */}
							<span title={`${+factor.toFixed(6)}× ${StringFromTypes.get(recipe.type)}`}>
								<span class="factor">{renderNumber(facitilies)}</span>&times;
							</span> <Recipe recipe={recipe} proliferated={proliferated} named/>
						</div>
						{hasProliferators && (
							<div class="proliferator">
								{(proliferatorType || proliferated) && <Juice type={proliferatorType} proliferated={proliferated} solve={solve}/>}
							</div>
						)}
						<div class="logistics">
							{recipe.results.map((result, index) =>
								<span class="belt"><span class="factor">{renderNumber(throughput / BeltTransportSpeed.get(state.preferred.belt.value))}</span>&times;</span>
							)}
						</div>
						<ul class="products">
							{recipe.results.map((result, index) =>
								<li class={classNames('throughput', { 'is-ingredient': !ingredient || result === ingredient })}>
									<span class="perMinute">{renderTime(throughput * (recipe.resultCounts[index] / recipe.resultCounts[ingredientIndex]))}</span>&times;
									<Item id={result} proliferated={proliferated}/>
									<span class="timeScale">per {state.timeScale.value}</span>
								</li>
							)}
						</ul>
					</div>
				</summary>
				{children && children.map((child, index) => {
					if(Array.isArray(child))
					{
						let item = Items.find(item => item.id === recipe.items[index]);
						let preferredAltRecipe = state.preferred[item.id]?.value;
						
						const hasMiningFrom = preferredAltRecipe === item.id && item.miningFrom;
						
						if(!hasMiningFrom && !state.recipesUnlockedSet.value.has(preferredAltRecipe)) return (
							<div class="node solve" style={{ '--depth': depth }}>
								<div class="node-header">
									<div class="meta">
										<span class="item">(Alternative Recipe for <Item item={item}/> locked due to research)</span>
										{Recipes.filter(recipe => recipe.results.includes(item.id))
										.filter(recipe => state.showHiddenUpgrades.value || state.recipesUnlockedSet.value.has(recipe.id))
										.map((recipe, index) =>
											<label>
												<input
													type="radio"
													name={item.id}
													value={recipe.id}
													title={recipe.explicit? recipe.name : item.name}
													checked={recipe.id === state.preferred[item.id]?.value}
													onClick={event => state.preferred[event.target.name].value = +event.target.value}
													disabled={!state.recipesUnlockedSet.value.has(recipe.id)}
												/>
												<Recipe recipe={recipe}/>
											</label>
										)}
									</div>
								</div>
							</div>
						);
						
						let preferredChild = child.find(d => d.recipe?.id === preferredAltRecipe);
						if(!preferredChild && hasMiningFrom) preferredChild = child.find(d => d.item === item);
						child = preferredChild;
					}
					
					if(!child) return 'Error, no child'; // ??
					
					let itemsPerMinute = recipe.itemCounts[index] * (60/recipe.timeSpend*60);
					return (
						<SolveTree
							solve={child}
							depth={depth + 1}
							throughput={facitilies * itemsPerMinute * modifier}
							ingredient={recipe.items[index]}
							hasProliferators={hasProliferators}
							proliferated={proliferatorType !== 'none'}
						/>
					);
				})}
			</details>
		);
	}
}







export default function Solver(props) {
	if(!state.recipe.value) return <div class="solver"/>;
	
	const recipesUnlocked = state.recipesUnlocked.value; // Array.from(state.recipesUnlocked.value, id => Recipes.find(recipe => recipe.id === id)); // useMemo(() => RecipesUnlocked(state.research.value), [state.research.value]);
	const itemsUnlocked = state.itemsUnlocked.value; // Array.from(state.itemsUnlocked.value, id => Items.find(item => item.id === id)); // useMemo(() => ItemsUnlocked(state.research.value), [state.research.value]);
	
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
					let subNodes = [];
					
					let subRecipes = recipesUnlocked.filter(subRecipe => recipe !== subRecipe && subRecipe.results.includes(id) && !RecipesIgnored.has(subRecipe.id));
					// if(!subRecipes.length)
					
					if(!subRecipes.length || item.miningFrom)
					{
						subNodes.push({ item });
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
								solve(subRecipe, depth + 1, cyclic, subNode);
								subNodes.push(subNode);
							}
						}
						
						// if(subNodes.length === 1) subNodes = subNodes[0];
						// node.children.push(subNodes);
					}
					
					if(subNodes.length === 1) subNodes = subNodes[0];
					node.children.push(subNodes);
				}
			}
			
			solveNodes.add(node);
			return node;
		}
		
		let solved = solve(state.recipe.value);
		state.recipesUsed.value = recipesUsed;
		state.typesUsed.value = typesUsed;
		
		let id = 0;
		for(let solve of solveNodes) solve.id = ++id;
		
		return [solved, solveNodes];
	}, [
		state.research.value,
		state.recipe.value,
		// ...Object.values(state.preferred).map(pref => pref.value)
	]);
	
	window.solve = solve;
	window.solveNodes = Array.from(solveNodes);
	
	
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
		
		for(let solve of solveNodes)
		{
			if(solve.item) continue;
			
			let proliferator = state.proliferator.value;
			if(proliferator.startsWith('mixed'))
			{
				if(proliferator === 'mixed.tsp' || proliferator === 'mixed')
					proliferator = Proliferator.Mix.TheSuperiorTentacle(solve.recipe);
				else if(proliferator === 'mixed.fh')
					proliferator = Proliferator.Mix.FlameHaze(solve.recipe);
			}
			else if(proliferator === 'custom') proliferator = Proliferator.Mix.TheSuperiorTentacle(solve.recipe);
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
		
		for(let solve of solveNodes)
		{
			if(solve.item) continue;
			
			
			let proliferator = state.proliferator.value;
			if(proliferator.startsWith('mixed'))
			{
				if(proliferator === 'mixed.tsp' || proliferator === 'mixed')
					proliferator = Proliferator.Mix.TheSuperiorTentacle(solve.recipe);
				else if(proliferator === 'mixed.fh')
					proliferator = Proliferator.Mix.FlameHaze(solve.recipe);
			}
			
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
				throughput={state.per.value}
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


