import { useState, useCallback, useMemo } from 'preact/hooks';
import classNames from 'classnames';
import RecipeSelector from './recipe-selector.jsx';
import {
	Recipes, Items, StringFromTypes,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	RecipesUnlocked,
	ItemsUnlocked,
} from '../lib/data.js';
import state from '../state.js';



function RecipeIcon(props) {
	let recipe = props.recipe;
	let primaryResult = recipe.results[0];
	let primaryItem = Items.find(i => i.id === primaryResult);
	let icon = primaryItem.name !== recipe.name? `recipe.${recipe.id}` : `item.${primaryResult}`;
	
	return (
		<div
			key={recipe.id}
			class={classNames('icon', { 'is-selected': props.isSelected })}
			data-icon={icon}
			style={props.style}
			title={recipe.name}
		/>
	);
}


function onRecipe(event) {
	let id = +event.target.value;
	let recipe = Recipes.find(recipe => recipe.id === id);
	state.recipe.value = recipe;
	
	// setPer w/ recipe throughput (check timeScale)
	// let recipePerMinute = recipe.resultCounts[0] * 60 * (60 / recipe.timeSpend);
	let recipePerMinute = state.recipe.value.resultCounts[0] * (60/state.recipe.value.timeSpend*60);
	
	let modifier = 1.0;
	switch(state.recipe.value.type) {
		case 'ASSEMBLE': modifier = AssemblerProductionSpeed.get(state.preferred.assembler.value); break;
		case 'SMELT': modifier = SmelterProductionSpeed.get(state.preferred.smelter.value); break;
		case 'CHEMICAL': modifier = ChemicalProductionSpeed.get(state.preferred.chemical.value); break;
	}
	
	state.per.value = state.factor.value * recipePerMinute * modifier;
}

function onFactor(event) {
	// setFactor w/ event.target.value
	state.factor.value = event.target.valueAsNumber;
	
	// setFactor w/ event.target.value / recipe's perMinute
	// let recipePerMinute = state.recipe.value.resultCounts[0] * 60 * (60 / state.recipe.value.timeSpend);
	recalculatePer();
}

function onFactorInc() {
	state.factor.value = Math.round(state.factor.value + 1);
	recalculatePer();
}

function onFactorDec() {
	state.factor.value = Math.max(0, Math.round(state.factor.value - 1));
	recalculatePer();
}



function onPer(event) {
	// setPer w/ event.target.value (check timeScale)
	let value = event.target.valueAsNumber;
	if(state.timeScale.value === 'second') value *= 60;
	state.per.value = value;
	
	// setFactor w/ event.target.value / recipe's perMinute
	// let recipePerMinute = state.recipe.value.resultCounts[0] * 60 * (60 / state.recipe.value.timeSpend);
	recalculateFactor();
}

function onPerInc() {
	let step = state.timeScale.value === 'minute'? 5 : 1;
	state.per.value = Math.round(state.per.value + step);
	recalculateFactor();
}

function onPerDec() {
	let step = state.timeScale.value === 'minute'? 5 : 1;
	state.per.value = Math.max(0, Math.round(state.per.value - step));
	recalculateFactor();
}


function onTimeScale(event) {
	// setTimeScale w/ event.target.value
	state.timeScale.value = event.target.value;
}

function onPreferred(event) {
	state.preferred[event.target.name].value = +event.target.value;
	
	recalculatePer();
}

function recalculatePer() {
	let recipePerMinute = state.recipe.value.resultCounts[0] * (60/state.recipe.value.timeSpend*60);
	let modifier = 1.0;
	switch(state.recipe.value.type) {
		case 'ASSEMBLE': modifier = AssemblerProductionSpeed.get(state.preferred.assembler.value); break;
		case 'SMELT': modifier = SmelterProductionSpeed.get(state.preferred.smelter.value); break;
		case 'CHEMICAL': modifier = ChemicalProductionSpeed.get(state.preferred.chemical.value); break;
	}
	state.per.value = state.factor.value * recipePerMinute * modifier;
}

function recalculateFactor() {
	let recipePerMinute = state.recipe.value.resultCounts[0] * (60/state.recipe.value.timeSpend*60);
	let modifier = 1.0;
	switch(state.recipe.value.type) {
		case 'ASSEMBLE': modifier = AssemblerProductionSpeed.get(state.preferred.assembler.value); break;
		case 'SMELT': modifier = SmelterProductionSpeed.get(state.preferred.smelter.value); break;
		case 'CHEMICAL': modifier = ChemicalProductionSpeed.get(state.preferred.chemical.value); break;
	}
	state.factor.value = (state.per.value / recipePerMinute) / modifier;
}


export default function ComboSelector(props) {
	const [isSelectorOpen, setSelectorOpen] = useState(false);
	
	const onSelectRecipe = useCallback(event => {
		event.preventDefault();
		setSelectorOpen(true);
		// refRecipeWindow.current.showModal();
	});
	
	
	
	if(!state.recipe.value)
	{
		return (
			<div class="combo-selector">
				<div class="recipe"  onClick={onSelectRecipe}>
					<div class="icon" data-icon="ui.select-recipe" title="Select a recipe"/>
					<span class="hint">Please select a recipe</span>
				</div>
				<RecipeSelector
					isOpen={isSelectorOpen}
					onRecipe={(recipe) => {
						state.recipe.value = recipe;
						recalculatePer();
						setSelectorOpen(false);
					}}
					onDismiss={() => setSelectorOpen(false)}
					selected={state.recipe.value}
					/>
			</div>
		);
	}
	
	const recipesUnlocked = useMemo(() => RecipesUnlocked(state.research.value, true), [state.research.value]);
	const itemsUnlocked = useMemo(() => ItemsUnlocked(state.research.value, true), [state.research.value]);
	
	const preferredBuildings = [
		{ name: 'assembler', label: StringFromTypes.get('ASSEMBLE'), baseBuilding: 2303, type: 'ASSEMBLE' },
		{ name: 'smelter', label: StringFromTypes.get('SMELT'), baseBuilding: 2302, type: 'SMELT' },
		{ name: 'chemical', label: StringFromTypes.get('CHEMICAL'), baseBuilding: 2309, type: 'CHEMICAL' },
		{ name: 'belt', label: StringFromTypes.get('LOGISTICS'), baseBuilding: 2001 },
	];
	
	const usesPreferredBuilding = preferredBuildings.some(building => building.type && state.typesUsed.value.has(building.type));
	const hasDisabledPreferredBuilding = preferredBuildings.some(building =>
		Items.find(item => item.id === state.preferred[building.name].value)
			.upgrades.map(upgrade => Items.find(item => item.id === upgrade))
			.some(item => !itemsUnlocked.has(item.id))
	);
	
	const [preferredRecipes, hasDisabledPreferredRecipe] = useMemo(() => {
		let preferredRecipes = Items
			.filter(item => itemsUnlocked.has(item.id))
			.map(item => [
				item,
				Recipes.filter(recipe => recipe.results.includes(item.id))
			])
			.filter(([item, recipes]) => recipes.length > 1);
		
		let hasDisabledPreferredRecipe = preferredRecipes.some(([item, recipes]) => recipes.some(recipe => !recipesUnlocked.has(recipe.id)));
		
		return [
			preferredRecipes,
			hasDisabledPreferredRecipe
		];
	}, [state.research.value]);
	const usesPreferredRecipe = preferredRecipes.some(([item, recipes]) => recipes.some(recipe => state.recipesUsed.value.has(recipe.id)));
	
	
	return (
		<>
			<div class="combo-selector">
				<div class="recipe" onClick={onSelectRecipe}>
					<RecipeIcon recipe={state.recipe.value}/>
				</div>
				
				<label class="ratio">
					<input
						class="factor"
						type="number"
						value={state.factor.value}
						min="0"
						onInput={onFactor}
						disabled={!state.recipe.value}
					/><div class="steppers">
						<button class="increment" aria-label="Increment factor by 1" onClick={onFactorInc}/>
						<button class="decrement" aria-label="Decrement factor by 1" onClick={onFactorDec}/>
					</div> <span class="text">&times; {StringFromTypes.get(state.recipe.value.type)}</span>
				</label>
				
				<label class="specific">
					<input
						class="per"
						type="number"
						value={state.timeScale.value === 'minute'? state.per.value : state.per.value / 60}
						min="0"
						step={state.timeScale.value === 'minute'? 5 : 1}
						onInput={onPer}
						disabled={!state.recipe.value}
					/><div class="steppers">
						<button class="increment" aria-label="Increment factor by 1" onClick={onPerInc}/>
						<button class="decrement" aria-label="Decrement factor by 1" onClick={onPerDec}/>
					</div> <span class="text">items <select
						class="timescale"
						onChange={onTimeScale}
						disabled={!state.recipe.value}
					>
						<option value="minute" selected>per minute</option>
						<option value="second">per second</option>
					</select></span>
				</label>
				
				<details class="preferred preferred-buildings">
					<summary>Preferred Buildings</summary>
					{usesPreferredBuilding && <p class="note">Highlighted are used in current recipe.</p>}
					{hasDisabledPreferredBuilding && <p class="note">Disabled are due to current research progress.</p>}
					<div class="fields">
						{preferredBuildings
						.filter(row => itemsUnlocked.has(row.baseBuilding))
						.map(({ name, label, type }, index) =>
							<>
								<span
									class={classNames('name', type && {
										'is-used': state.typesUsed.value.has(type),
										// 'is-unused': !state.typesUsed.value.has(type),
									})}
									style={`grid-row: ${index + 1}/${index + 2}`}
								>
									{label}
								</span>
								{Items.find(item => item.id === state.preferred[name].value)
								.upgrades.map(upgrade => Items.find(item => item.id === upgrade))
								.map(item =>
									<label style={`grid-row: ${index + 1}/${index + 2}`}>
										<input
											type="radio"
											name={name}
											value={item.id}
											title={item.name}
											checked={item.id === state.preferred[name].value}
											onClick={onPreferred}
											disabled={!itemsUnlocked.has(item.id)}
										/>
										<div class="icon" data-icon={`item.${item.id}`}/>
									</label>
								)}
							</>
						)}
					</div>
				</details>
				<details class="preferred preferred-recipes">
					<summary>Preferred Recipes</summary>
					{usesPreferredRecipe && <p class="note">Highlighted are used in current recipe.</p>}
					{hasDisabledPreferredRecipe && <p class="note">Disabled are due to current research progress.</p>}
					<div class="fields">
						{preferredRecipes.map(([item, recipes], index, array) => {
							const MaxRows = window.outerWidth <= 640? Infinity : (window.outerWidth <= 920? 8 : 5);
							const MinColumnWidth = 1 + array.reduce((previous, current) => Math.min(previous, current[1].length, 0));
							const row = 1 + index % MaxRows;
							const column = 1 + Math.floor(index / MaxRows) * 5;
							
							return (
								<>
									<span
										class={classNames('name', {
											'is-used': recipes.some(recipe => state.recipesUsed.value.has(recipe.id)),
											// 'is-unused': !recipes.some(recipe => state.recipesUsed.value.has(recipe.id)),
										})}
										style={{ gridArea: `${row} / ${column} / ${row + 1} / ${column + 1}` }}
									>
										{item.name}
									</span>
									{recipes.map((recipe, index) =>
										<label style={{ gridArea: `${row} / ${column + index + 1} / ${row + 1} / ${column + index + 2}` }}>
											<input
												type="radio"
												name={item.id}
												value={recipe.id}
												title={recipe.explicit? recipe.name : item.name}
												checked={recipe.id === state.preferred[item.id].value}
												onClick={onPreferred}
												disabled={!recipesUnlocked.has(recipe.id)}
											/>
											<div class="icon" data-icon={recipe.explicit? `recipe.${recipe.id}` : `item.${item.id}`}/>
										</label>
									)}
								</>
							);
						})}
					</div>
				</details>
				
			</div>
			
			<RecipeSelector
				isOpen={isSelectorOpen}
				onRecipe={(recipe) => {
					state.recipe.value = recipe;
					recalculatePer();
					setSelectorOpen(false);
				}}
				onDismiss={() => setSelectorOpen(false)}
				selected={state.recipe.value}
			/>
		</>
		
		
		/*
		
		Recipe Picker
		# x Facility
		# items per [minute]
		
		Preferred Buildings
		Assembling Machine [Mk.I, Mk.II, Mk.III]
		Smelter [Arc, Plane]
		Chemical Plant [Chemical, Quantum]
		Conveyor Belt [Mk.I, Mk.II, Mk.III]
		
		
		*/
		
		
		
		
		
		/*<div class="combo-selector">
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
				<option disabled selected={!state.recipe.value}>Please select a recipe</option>
				{Recipes.map(recipe => <option value={recipe.id} selected={state.recipe.value === recipe}>{recipe.name}</option>)}
			</select>
			<RecipeSelector
				isOpen={isSelectorOpen}
				onRecipe={(recipe) => {
					state.recipe.value = recipe;
					let recipePerMinute = recipe.resultCounts[0] * 60 * (60 / recipe.timeSpend);
					state.per.value = state.factor.value * recipePerMinute;
					setSelectorOpen(false);
				}}
				onDismiss={() => setSelectorOpen(false)}
				selected={state.recipe.value}
			/>
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
		</div>*/
	);
}