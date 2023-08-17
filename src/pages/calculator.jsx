import { useState, useMemo, useCallback, useEffect } from 'preact/hooks';
import classNames from 'classnames';
import {
	Recipes, Items, Techs, StringFromTypes, t,
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
import {
	SolverTree,
	RecipeTree,
	CalcTree,
} from '../lib/solver.js';
import state from '../state.js';
import Item from '../components/item.jsx';
import Recipe from '../components/recipe.jsx';
import Tech from '../components/tech.jsx';
import ComboSelector from '../components/combo-selector.jsx';
import Solver from '../components/solver.jsx';






export default function Calculator(props) {
	// let recipe = state.recipe.value;
	// let solverTree = useMemo(() => recipe && SolverTree(recipe), [recipe]);
	// let recipeTree = useMemo(() => solverTree && RecipeTree(solverTree), [solverTree]);
	
	return (
		<main class="page calculator">
			<ComboSelector/>
			<Solver/>
			
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
		</main>
	);
}
