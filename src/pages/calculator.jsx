import ComboSelector from '../components/combo-selector.jsx';
import state from '../state.js';


export default function Calculator(props) {
    return (
        <main class="page calculator">
            <ComboSelector/>
            <pre>
                recipe: {JSON.stringify(state.recipe.value, null, '\t')}<br/>
                factor: {state.factor.value}<br/>
                per: {state.per.value}<br/>
                timeScale: {state.timeScale.value}<br/>
            </pre>
        </main>
    );
}
