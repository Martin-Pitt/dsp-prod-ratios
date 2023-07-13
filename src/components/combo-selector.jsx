import { useState, useCallback } from 'preact/hooks';
import RecipeSelector from './recipe-selector.jsx';
import state from '../state.js';


export default function ComboSelector(props) {
	const onRecipe = useCallback(event => {
		let id = +event.target.value;
		let recipe = Recipes.find(recipe => recipe.id === id);
		state.recipe.value = recipe;
		
		// setPer w/ recipe throughput (check timeScale)
		let recipePerMinute = recipe.resultCounts[0] * 60 * (60 / recipe.timeSpend);
		state.per.value = state.factor.value * recipePerMinute;
	});
	
	const [isSelectorOpen, setSelectorOpen] = useState(false);
	
	const onFactor = useCallback(event => {
		// setFactor w/ event.target.value
		state.factor.value = event.target.value;
		
		// setFactor w/ event.target.value / recipe's perMinute
		let recipePerMinute = state.recipe.value.resultCounts[0] * 60 * (60 / state.recipe.value.timeSpend);
		state.per.value = state.factor.value * recipePerMinute;
	});
	
	const onPer = useCallback(event => {
		// setPer w/ event.target.value (check timeScale)
		let value = event.target.valueAsNumber;
		if(state.timeScale.value === 'second') value *= 60;
		state.per.value = value;
		
		// setFactor w/ event.target.value / recipe's perMinute
		let recipePerMinute = state.recipe.value.resultCounts[0] * 60 * (60 / state.recipe.value.timeSpend);
		state.factor.value = state.per.value / recipePerMinute;
	});
	
	const onTimeScale = useCallback(event => {
		// setTimeScale w/ event.target.value
		state.timeScale.value = event.target.value;
	});
	
	const onSelectRecipe = useCallback(event => {
		event.preventDefault();
		setSelectorOpen(true);
		// refRecipeWindow.current.showModal();
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
		</div>
	);
}