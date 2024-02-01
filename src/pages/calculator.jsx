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
