import { useState, useCallback, useMemo } from 'preact/hooks';
import {
	Items,
	Buildings,
	Recipes,
	findRecipeByOutput,
} from './recipes.js';
import { Produce, Chain } from './prod.js';

window.Items = Items;
window.Buildings = Buildings;
window.Recipes = Recipes;
window.findRecipeByOutput = findRecipeByOutput;
window.Produce = Produce;

// let Names = new Set(Recipes.flatMap(recipe => Object.keys(recipe.output)));
let Processes = new Set(Items.map(item => item.process));
let Types = new Set(Buildings.map(recipe => recipe.type));


function renderNumber(factor) {
	let string = factor.toString();
	// let repeats = string.match(/[0-9]\.([0-9]*?)\1[0-9]$/);
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
		console.log(+event.target.value);
		setFactor(+event.target.value);
	});
	
	
	const processesSkipped = [
		'Mining Facility',
		'Factionation Facility',
		'Ray Receiver',
	];
	const production = useMemo(() => {
		if(!selected) return null;
		else return Chain(selected, factor)
			.filter(recipe => !processesSkipped.includes(recipe.process))
	}, [selected, factor]);
	
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
										.flatMap(recipe => Object.keys(recipe.output))
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
					<ul class="chain">
						{production.map(recipe => recipe.process === 'Mining Facility'? (
							<li class="link" style={{ '--depth': recipe.depth }}>
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
							<li class="link" style={{ '--depth': recipe.depth }}>
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
				)}
				
				{/* {production && (
					<pre>
						{JSON.stringify(production, null, '\t')}
					</pre>
				)} */}
			</main>
		</>
	)
}
