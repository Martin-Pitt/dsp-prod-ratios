import { useState, useCallback, useMemo } from 'preact/hooks';
import {
	Items,
	Buildings,
	Recipes,
	findRecipeByOutput,
} from './recipes.js';
import { Production, Chain } from './prod.js';

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
	const onSelect = useCallback(event => {
		setSelected(event.target.value);
	});
	const [factor, setFactor] = useState(1);
	const onFactor = useCallback(event => {
		setFactor(+event.target.value);
	});
	
	
	const processesSkipped = [
		'Mining Facility',
		'Factionation Facility',
		'Ray Receiver',
	];
	
	// const production = useMemo(() => {
	// 	if(!selected) return null;
	// 	else return Chain(selected, factor)
	// 		.filter(recipe => !processesSkipped.includes(recipe.process))
	// }, [selected, factor]);
	
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
	
	function renderProduction(recipe) {
		function renderOutput(recipe, ) {
			let { process, output, factor } = recipe;
			if(!output) return null;
			
			return Object.entries(output).map(([product, throughput]) => {
				if(!throughput || process === 'Mining Facility' || throughput === true)
				{
					<li class="output"><span class="perMinute">{renderNumber(factor)}</span>&times; <span class="item">{product}</span> per minute</li>;
				}
				else
				{
					let [amount, perMinute] = throughput;
					return <li class="output"><span class="perMinute">{renderNumber(perMinute * factor)}</span>&times; <span class="item">{product}</span> per minute</li>;
				}
			});
		}
		function renderByproduct(recipe) {
			let { process, byproduct, factor } = recipe;
			if(!byproduct) return null;
			
			return Object.entries(byproduct).map(([product, throughput]) => {
				if(!throughput || process === 'Mining Facility' || throughput === true)
				{
					<li class="byproduct"><span class="perMinute">{renderNumber(factor)}</span>&times; <span class="item">{product}</span> per minute</li>;
				}
				else
				{
					let [amount, perMinute] = throughput;
					return <li class="byproduct"><span class="perMinute">{renderNumber(perMinute * factor)}</span>&times; <span class="item">{product}</span> per minute</li>;
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
				<h1>DSP Production Ratio Calculator</h1>
				<input type="number" value={factor} min="1" onInput={onFactor}/>
				<select onChange={onSelect}>
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
					
					{/* {Array.from(Names).map(name => <option>{name}</option>)} */}
				</select>
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
				
				{/* {production && (
					<ul class="list">
						{production.map(recipe => recipe.process === 'Mining Facility'? (
							<li class="list-item" style={{ '--depth': recipe.depth }}>
								<div class="meta">
									<span class="factor">{renderNumber(recipe.factor)}</span>&times; <span class="process">{recipe.process}</span> <span class="item">{recipe.name || Object.keys(recipe.output).pop()}</span>
								</div>
								<ul class="output">
									{Object.entries(recipe.output).map(([product]) =>
										<li><span class="item">{product}</span>/min</li>
									)}
								</ul>
							</li>
						) : (
							<li class="list-item" style={{ '--depth': recipe.depth }}>
								<div class="meta">
									<span class="factor">{renderNumber(recipe.factor)}</span>&times; <span class="process">{recipe.process}</span> <span class="item">{recipe.name || Object.keys(recipe.output).pop()}</span>
								</div>
								<ul class="output">
									{Object.entries(recipe.output).map(([product, [amount, perMinute]]) =>
										<li><span class="perMinute">{renderNumber(perMinute * recipe.factor)}</span>&times; <span class="item">{product}</span> per minute</li>
									)}
								</ul>
							</li>
						))}
					</ul>
				)} */}
				
				{/* {production && (
					<pre>
						{JSON.stringify(production, null, '\t')}
					</pre>
				)} */}
			</main>
		</>
	)
}
