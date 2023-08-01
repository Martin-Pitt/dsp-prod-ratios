import { useState, useCallback, useMemo } from 'preact/hooks';
import classNames from 'classnames';
import {
	Recipes, Items, StringFromTypes,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	RecipesUnlocked,
	ItemsUnlocked,
	Proliferator,
} from '../lib/data.js';
import state from '../state.js';
import RecipeSelector from './recipe-selector.jsx';
import Item from './item.jsx';
import Recipe from './recipe.jsx';





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

function calcPerStep() {
	if(state.timeScale.value === 'minute')
	{
		let recipePerMinute = state.recipe.value.resultCounts[0] * (60/state.recipe.value.timeSpend*60);
		let modifier = 1.0;
		switch(state.recipe.value.type) {
			case 'ASSEMBLE': modifier = AssemblerProductionSpeed.get(state.preferred.assembler.value); break;
			case 'SMELT': modifier = SmelterProductionSpeed.get(state.preferred.smelter.value); break;
			case 'CHEMICAL': modifier = ChemicalProductionSpeed.get(state.preferred.chemical.value); break;
		}
		
		return recipePerMinute * modifier;
	}
	else return 60;
}

function onPerInc() {
	let step = calcPerStep();
	
	let value = state.per.value + step;
	value = Math.round(value / step) * step;
	state.per.value = value;
	
	recalculateFactor();
}

function onPerDec() {
	let step = calcPerStep();
	
	let value = state.per.value - step;
	value = Math.round(value / step) * step;
	state.per.value = Math.max(0, value);
	
	recalculateFactor();
}


function onTimeScale(event) {
	state.timeScale.value = event.target.value;
}

function onPreferred(event) {
	state.preferred[event.target.name].value = +event.target.value;
	
	recalculatePer();
}

function onProliferator(event) {
	state.proliferator.value = event.target.value;
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
	});
	
	const onRecipe = useCallback(recipe => {
		state.recipe.value = recipe;
		if(state.proliferator.value === 'custom') state.proliferator.value = 'none';
		recalculatePer();
		setSelectorOpen(false);
	}, [state.recipe.value, state.proliferator.value, setSelectorOpen]);
	
	
	if(!state.recipe.value)
	{
		return (
			<div class="combo-selector">
				<div class="recipe-picker" onClick={onSelectRecipe}>
					<div class="icon" data-icon="ui.select-recipe" title="Select a recipe"/>
					<span class="hint">Please select a recipe</span>
				</div>
				<RecipeSelector
					isOpen={isSelectorOpen}
					onRecipe={onRecipe}
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
	].filter(building => !building.type || state.typesUsed.value.has(building.type))
	.filter(row => itemsUnlocked.has(row.baseBuilding) && (state.showHiddenUpgrades.value || Items.find(item => item.id === row.baseBuilding)?.upgrades?.some(upgrade => row.baseBuilding !== upgrade && itemsUnlocked.has(upgrade))))
	
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
				       .filter(recipe => state.showHiddenUpgrades.value || recipesUnlocked.has(recipe.id))
			])
			.filter(([item, recipes]) => recipes.length > 1);
		
		let hasDisabledPreferredRecipe = preferredRecipes.some(([item, recipes]) => recipes.some(recipe => !recipesUnlocked.has(recipe.id)));
		
		preferredRecipes = preferredRecipes.filter(([item, recipes]) => recipes.some(recipe => state.recipesUsed.value.has(recipe.id)));
		
		return [
			preferredRecipes,
			hasDisabledPreferredRecipe
		];
	}, [state.research.value, state.recipesUsed.value]);
	const usesPreferredRecipe = preferredRecipes.some(([item, recipes]) => recipes.some(recipe => state.recipesUsed.value.has(recipe.id)));
	
	const perStep = useMemo(() => {
		if(state.timeScale.value === 'minute') return calcPerStep();
		return 1;
	}, [state.recipe.value, state.timeScale.value]);
	
	const [unlockedProliferators, hasProliferators] = useMemo(() => {
		let unlocked = [];
		for(let id of Proliferator.Items)
		{
			if(!itemsUnlocked.has(id)) break;
			unlocked.push(id);
		}
		
		state.proliferatorPoints.value = unlocked.length? Proliferator.Ability[unlocked.length - 1] : 0;
		
		return [unlocked, unlocked.length > 0];
	}, [itemsUnlocked]);
	
	return (
		<>
			<div class="combo-selector">
				<div class="recipe-picker" onClick={onSelectRecipe}>
					<Recipe recipe={state.recipe.value}/>
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
						<button class="increment" onClick={onFactorInc}/>
						<button class="decrement" onClick={onFactorDec}/>
					</div> <span class="text">&times; {StringFromTypes.get(state.recipe.value.type)}</span>
				</label>
				
				<label class="specific">
					<input
						class="per"
						type="number"
						value={state.timeScale.value === 'minute'? state.per.value : state.per.value / 60}
						min="0"
						step={perStep}
						onInput={onPer}
						disabled={!state.recipe.value}
					/><div class="steppers">
						<button class="increment" onClick={onPerInc}/>
						<button class="decrement" onClick={onPerDec}/>
					</div> <span class="text">items <select
						class="timescale"
						onChange={onTimeScale}
						disabled={!state.recipe.value}
					>
						{['minute', 'second'].map(scale =>
							<option value={scale} selected={scale === state.timeScale.value}>per {scale}</option>
						)}
					</select></span>
				</label>
				
				{hasProliferators && (
					<label class={classNames('proliferator', `is-${state.proliferator.value}`)} data-new>
						<span title={`Highest unlocked tier will be used: ${Items.find(item => item.id === unlockedProliferators[unlockedProliferators.length - 1]).name}`}>
							Proliferator:
						</span>
						<select
							onChange={onProliferator}
							title={{
								'none': 'No proliferator to be used',
								'mixed': 'High-end materials are better with extra products and everything else on production speed',
								'speedup': 'Every recipe to promote production speed where possible',
								'extra': 'Every recipe to promote extra products where possible',
								'custom': 'Proliferation customised for calculation',
							}[state.proliferator.value]}
						>
							{Array.from(
								Object.entries(Proliferator.Types)
							).map(([key, label]) =>
								<option value={key} selected={key === state.proliferator.value}>{label}</option>
							)}
							{state.proliferator.value === 'custom' && <option value="custom" selected disabled>Customised</option>}
						</select>
					</label>
				)}
				
				{preferredBuildings.length > 0 && (
					<details key="preferred-buildings" class="preferred preferred-buildings">
						<summary>Preferred Buildings</summary>
						{/* {usesPreferredBuilding && <p class="note">Highlighted are used in current recipe.</p>} */}
						{state.showHiddenUpgrades.value && hasDisabledPreferredBuilding && <p class="note">Disabled are due to current research progress.</p>}
						<div class="fields">
							{preferredBuildings
							.map(({ name, label, type, baseBuilding }, index) =>
								<>
									<span
										class={classNames('name', type && {
											// 'is-used': state.typesUsed.value.has(type),
										})}
										style={`grid-row: ${index + 1}/${index + 2}`}
									>
										{label}
									</span>
									{Items.find(item => item.id === state.preferred[name].value)
									.upgrades.filter(upgrade => upgrade === baseBuilding || (state.showHiddenUpgrades.value || itemsUnlocked.has(upgrade)))
									.map(upgrade => Items.find(item => item.id === upgrade))
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
											<Item item={item}/>
										</label>
									)}
								</>
							)}
						</div>
					</details>
				)}
				
				{preferredRecipes.length > 0 && (
					<details key="preferred-recipes" class="preferred preferred-recipes">
						<summary>Alternate Recipes</summary>
						<p class="note"><i>(advanced)</i> recipes are better but make sure to save special resources towards advanced buildings</p>
						{/* {usesPreferredRecipe && <p class="note">Highlighted are used in current recipe.</p>} */}
						{state.showHiddenUpgrades.value && hasDisabledPreferredRecipe && <p class="note">Disabled are due to current research progress.</p>}
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
												// 'is-used': recipes.some(recipe => state.recipesUsed.value.has(recipe.id)),
											})}
											style={{ gridArea: `${row} / ${column} / ${row + 1} / ${column + 1}` }}
										>
											{item.name}
										</span>
										{recipes
										.filter(recipe => state.showHiddenUpgrades.value || recipesUnlocked.has(recipe.id))
										.map((recipe, index) =>
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
												<Recipe recipe={recipe}/>
											</label>
										)}
									</>
								);
							})}
						</div>
					</details>
				)}
			</div>
			
			<RecipeSelector
				isOpen={isSelectorOpen}
				onRecipe={onRecipe}
				onDismiss={() => setSelectorOpen(false)}
				selected={state.recipe.value}
			/>
		</>
	);
}