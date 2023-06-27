import { useState, useCallback, useMemo, useRef } from 'preact/hooks';
import { signal } from '@preact/signals';
import {
	Tech, Recipes, Items, Strings,
	supportedLocales, locale,
	translateableKeys, translate
} from './lib/data.js';

import iconGithub from './images/github-mark-white.svg';
import logo from './images/logo.svg';



window.Tech = Tech;
window.Recipes = Recipes;
window.Items = Items;
window.Strings = Strings;

window.supportedLocales = supportedLocales;
window.locale = locale;
window.translateableKeys = translateableKeys;
window.translate = translate;







const state = {
	recipe: signal(null),
	factor: signal(1),
	per: signal(60),
	timeScale: signal('minute'),
};

window.state = state;


function Header(props) {
	return (
		<header class="app-header">
			<h1 class="title">
				<img class="logo" src={logo} alt=""/>
				DSP Production Ratio Calculator
			</h1>
			{props.children}
			<a class="link github" target="_blank" href="https://github.com/Martin-Pitt/dsp-prod-ratios">
				<img class="icon" src={iconGithub} alt=""/>
			</a>
		</header>
	);
}

function ComboSelector(props) {
	const onRecipe = useCallback(event => {
		let id = +event.target.value;
		let recipe = Recipes.find(recipe => recipe.id === id);
		state.recipe.value = recipe;
		
		// setPer w/ recipe throughput (check timeScale)
	});
	
	const refRecipeWindow = useRef(null);
	const onSelectRecipe = useCallback(event => {
		event.preventDefault();
		refRecipeWindow.current.showModal();
	});
	
	const onFactor = useCallback(event => {
		// setFactor w/ event.target.value
		state.factor.value = event.target.value;
		// find recipe
		// setFactor w/ event.target.value / recipe's perMinute
	});
	
	const onPer = useCallback(event => {
		// setPer w/ event.target.value (check timeScale)
		state.per.value = event.target.value;
		// find recipe
		// setFactor w/ event.target.value / recipe's perMinute
	});
	
	const onTimeScale = useCallback(event => {
		// setTimeScale w/ event.target.value
		state.timeScale.value = event.target.value;
	});
	
	
	return (
		<div class="combo-selector">
			<input
				class="factor"
				type="number"
				value={state.factor.value}
				min="0"
				onInput={onFactor}
				disabled={!state.recipe.value}
			/>
			<select
				class="recipe"
				onChange={onRecipe}
				onMouseDown={onSelectRecipe}
				onTouchEnd={onSelectRecipe}
			>
				<option disabled selected>Please select a recipe</option>
				{Recipes.map(recipe => <option value={recipe.id}>{recipe.name}</option>)}
			</select>
			<dialog class="window recipes" ref={refRecipeWindow}>
				<header>
					Select a recipe
					Items
					Buildings
				</header>
				<ul class="recipe-grid">
					{Recipes.map(recipe => {
						let icon;
						
						let primaryResult = recipe.results[0];
						
						if(Items.find(i => i.id === primaryResult).name !== recipe.name)
							icon = `recipe.${recipe.id}`;
						
						else
							icon = `item.${primaryResult}`;
						
						let gridIndex = recipe.gridIndex.toString();
						let Z = parseInt(gridIndex.at(0), 10);
						let Y = parseInt(gridIndex.at(1), 10);
						let X = parseInt(gridIndex.at(2) + gridIndex.at(3), 10);
						
						if(Z !== 1) return null;
						
						return (
							<li
								key={recipe.id}
								class="icon"
								data-icon={icon}
								style={{
									gridArea: `${Y} / ${X}`
								}}
							/>
						);
					})}
				</ul>
			</dialog>
			<input
				class="per"
				type="number"
				value={state.timeScale.value === 'minute'? state.per.value : state.per.value / 60}
				min="0"
				step={state.timeScale.value === 'minute'? 5 : 1}
				onInput={onPer}
				disabled={!state.recipe.value}
			/>
			<select
				class="timescale"
				onChange={onTimeScale}
				disabled={!state.recipe.value}
			>
				<option value="minute" selected>per minute</option>
				<option value="second">per second</option>
			</select>
		</div>
	);
}



export function App(props) {
	return (
		<>
			<Header>
				<ComboSelector/>
			</Header>
			<main>
				<pre>
					recipe: {JSON.stringify(state.recipe.value, null, '\t')}<br/>
					factor: {state.factor.value}<br/>
					per: {state.per.value}<br/>
					timeScale: {state.timeScale.value}<br/>
				</pre>
				
				{/*production && (
					<>
						<div class="production-header">
							<div><span class="factor">Facility</span>&times; <span class="process">Process</span> <span class="item">Recipe</span></div>
							<div>
								<div class="output"><span class="perMinute">Throughput</span>&times; <span class="item">Product</span></div>
								<div class="byproduct"><span class="perMinute">Throughput</span>&times; <span class="item">Byproduct</span></div>
							</div>
						</div>
						{renderProduction(production)}
					</>
				)*/}
			</main>
		</>
	);
};



/*

window.Items = Items;
window.Buildings = Buildings;
window.Recipes = Recipes;
window.findRecipeByOutput = findRecipeByOutput;
window.Production = Production;
window.Chain = Chain;

// let Names = new Set(Recipes.flatMap(recipe => Object.keys(recipe.output)));
let Processes = new Set(Items.map(item => item.process));
let Types = new Set(Buildings.map(recipe => recipe.type));


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

export function App(props) {
	const [selected, setSelected] = useState(null);
	const [recipe, setRecipe] = useState(null);
	const [factor, setFactor] = useState(1);
	const [per, setPer] = useState(60);
	const [timeScale, setTimeScale] = useState('minute');
	
	const onItem = useCallback(event => {
		setSelected(event.target.value);
		const recipe = Recipes.find(recipe => recipe.name === event.target.value || event.target.value in recipe.output);
		setRecipe(recipe);
		
		const output = recipe.output[Object.keys(recipe.output)[0]];
		if(output === true) return;
		const [produced, perMinute] = output;
		
		let per = perMinute * factor;
		if(timeScale === 'second') per *= 60.0;
		setPer(per);
	});
	
	const onFactor = useCallback(event => {
		let value = +event.target.value;
		setFactor(value);
		
		const output = recipe.output[Object.keys(recipe.output)[0]];
		if(output === true) return;
		const [produced, perMinute] = output;
		
		setPer(perMinute * value);
	});
	
	const onPer = useCallback(event => {
		let value = +event.target.value;
		if(timeScale === 'second') value *= 60.0;
		setPer(value);
		
		const output = recipe.output[Object.keys(recipe.output)[0]];
		if(output === true) return;
		const [produced, perMinute] = output;
		
		setFactor(value / perMinute);
	});
	
	const onTimeScale = useCallback(event => {
		setTimeScale(event.target.value);
	});
	
	
	
	const processesSkipped = [
		'Mining Facility',
		'Factionation Facility',
		'Ray Receiver',
	];
	
	const production = useMemo(() => {
		if(!selected) return null;
		let prod = Production(selected, factor);
		
		let filterSkippedProcesses = recipe => {
			// if(recipe.input) recipe.input = recipe.input.filter(filterSkippedProcesses);
			return !processesSkipped.includes(recipe.process);
		};
		
		// if(prod.input) prod.input = prod.input.filter(filterSkippedProcesses);
		
		return prod;
	}, [selected, factor]);
	
	function renderThroughput(perMinute, product) {
		if(timeScale === 'second') perMinute /= 60;
		return (
			<>
				<span class="perMinute">{renderNumber(perMinute)}</span>&times; <span class="item">{product}</span> per {timeScale}
			</>
		);
	}
	
	// function renderFactor() {
	// 	&nbsp;&nbsp; <span class="process">{recipe.process}</span> <span class="item">{recipe.name || Object.keys(recipe.output).pop()}</span>
	// 	<span class="factor">{renderNumber(recipe.factor)}</span>&times; <span class="process">{recipe.process}</span> <span class="item">{recipe.name || Object.keys(recipe.output).pop()}</span>
	// 	<span class="factor">{renderNumber(recipe.factor)}</span>&times; <span class="process">{recipe.process}</span> <span class="item">{recipe.name || Object.keys(recipe.output).pop()}</span>
	// }
	
	function renderProduction(recipe) {
		function renderOutput(recipe, ) {
			let { process, output, factor } = recipe;
			if(!output) return null;
			
			return Object.entries(output).map(([product, throughput]) => {
				if(!throughput || throughput === true)
				{
					return <li class="output">{renderThroughput(factor, product)}</li>;
					// return <li class="output"><span class="perMinute">{renderNumber(factor)}</span>&times; <span class="item">{product}</span> per minute</li>;
				}
				else
				{
					let [amount, perMinute] = throughput;
					return <li class="output">{renderThroughput(perMinute * factor, product)}</li>;
					// return <li class="output"><span class="perMinute">{renderNumber(perMinute * factor)}</span>&times; <span class="item">{product}</span> per minute</li>;
				}
			});
		}
		function renderByproduct(recipe) {
			let { process, byproduct, factor } = recipe;
			if(!byproduct) return null;
			
			return Object.entries(byproduct).map(([product, throughput]) => {
				if(!throughput || throughput === true || throughput === 1)
				{
					// TODO: compute how many miners we would need to achieve this?
					return <li class="byproduct">{renderThroughput(factor, product)}</li>;
					// return <li class="byproduct"><span class="perMinute">{renderNumber(factor)}</span>&times; <span class="item">{product}</span> per minute</li>;
				}
				else if (Array.isArray(throughput) && throughput.length >= 2)
				{
					let [amount, perMinute] = throughput;
					return <li class="byproduct">{renderThroughput(perMinute * factor, product)}</li>
					// return <li class="byproduct"><span class="perMinute">{renderNumber(perMinute * factor)}</span>&times; <span class="item">{product}</span> per minute</li>;
				}
				else 
				{
					return <h1>failed to compute, byproduct contents are unexpected: {JSON.stringify({ throughput, product, factor })}</h1>
				}
			});
		}
		
		if(recipe.process === 'Mining Facility') return (
			<div key={Object.keys(recipe.output).join('-')} class="node" style={{ '--depth': recipe.depth }}>
				<div class="node-header">
					<div class="meta">
						&nbsp;&nbsp; <span class="process">{recipe.process}</span> <span class="item">{recipe.name || Object.keys(recipe.output).pop()}</span>
					</div>
					<ul class="products">
						{renderOutput(recipe)}
						{renderByproduct(recipe)}
					</ul>
				</div>
			</div>
		);
		
		let input = recipe.input && Object.entries(recipe.input);
		if(input && input.length) return (
			<details
				key={Object.keys(recipe.output).join('-')}
				class="node"
				style={{ '--depth': recipe.depth }}
				open={recipe.depth === 0}
				title={`${+recipe.factor.toFixed(6)}× ${recipe.process} producing: ${recipe.name || Object.keys(recipe.output).pop()}`}
			>
				<summary>
					<div className="node-header">
						<div class="meta">
							<span class="factor">{renderNumber(recipe.factor)}</span>&times; <span class="process">{recipe.process}</span> <span class="item">{recipe.name || Object.keys(recipe.output).pop()}</span>
						</div>
						<ul class="products">
							{renderOutput(recipe)}
							{renderByproduct(recipe)}
						</ul>
					</div>
				</summary>
				{Object.entries(recipe.input).map(([name, input]) => input !== true && renderProduction(input))}
			</details>
		);
		
		else return (
			<div key={Object.keys(recipe.output).join('-')} class="node" style={{ '--depth': recipe.depth }}>
				<div className="node-header">
					<div class="meta">
						<span class="factor">{renderNumber(recipe.factor)}</span>&times; <span class="process">{recipe.process}</span> <span class="item">{recipe.name || Object.keys(recipe.output).pop()}</span>
					</div>
					<ul class="products">
						{renderOutput(recipe)}
						{renderByproduct(recipe)}
					</ul>
				</div>
			</div>
		);
	}
	
	
	return (
		<>
			<header>
				<h1 class="title">
					<img class="logo" src={logo} alt=""/>
					DSP Production Ratio Calculator
				</h1>
				<div class="combo-selector">
					<input
						class="factor"
						type="number"
						value={factor}
						min="0"
						onInput={onFactor}
						disabled={!selected}
					/>
					<select
						class="recipe"
						onChange={onItem}
					>
						<option disabled selected> -- select an item to produce -- </option>
						{Array.from(Processes)
						.filter(process => !processesSkipped.includes(process))
						.map(process => 
							<optgroup label={process}>
								{Array.from(
									new Set(
										Items
											.filter(item => item.process === process)
											.flatMap(recipe => recipe.name || Object.keys(recipe.output))
									)
								).map(name => <option value={name}>{name}</option>)}
							</optgroup>
						)}
						
						{Array.from(Types).map(type => 
							<optgroup label={type}>
								{Array.from(
									new Set(
										Buildings
											.filter(building => building.type === type)
											.flatMap(recipe => Object.keys(recipe.output))
									)
								).map(name => <option value={name}>{name}</option>)}
							</optgroup>
						)}
					</select>
					<input
						class="per"
						type="number"
						value={timeScale === 'minute'? per : per / 60}
						min="0"
						step={timeScale === 'minute'? 5 : 1}
						onInput={onPer}
						disabled={!selected}
					/>
					<select
						class="timescale"
						onChange={onTimeScale}
						disabled={!selected}
					>
						<option value="minute" selected>per minute</option>
						<option value="second">per second</option>
					</select>
				</div>
				<a class="link github" target="_blank" href="https://github.com/Martin-Pitt/dsp-prod-ratios">
					<img class="icon" src={iconGithub} alt=""/>
				</a>
			</header>
			<main>
				{production && (
					<>
						<div class="production-header">
							<div><span class="factor">Facility</span>&times; <span class="process">Process</span> <span class="item">Recipe</span></div>
							<div>
								<div class="output"><span class="perMinute">Throughput</span>&times; <span class="item">Product</span></div>
								<div class="byproduct"><span class="perMinute">Throughput</span>&times; <span class="item">Byproduct</span></div>
							</div>
						</div>
						{renderProduction(production)}
					</>
				)}
			</main>
		</>
	)
}

*/