import {
	Recipes, Items, Tech, StringFromTypes,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	BeltTransportSpeed,
	RecipesUnlocked,
	ItemsUnlocked,
} from '../../lib/data.js';
import state from '../../state.js';


function renderNumber(factor) {
	let string = factor.toString();
	if(!/\d\.\d/.test(string)) return string;
	let repeats = string.toString().match(/(\d+?)\1+\d$/);
	if(!repeats || !repeats[1]) return +factor;//.toFixed(6);
	
	let left = string.substr(0, repeats.index);
	let right = repeats[1];
	if(right === '0') return left;
	return left + right + right + right;
}

function renderTimeSpend(recipe, amount = 1) {
	let timeSpend = (60/recipe.timeSpend*60);
	if(state.timeScale.value === 'second') timeSpend /= 60;
	let per;
	switch(recipe.type) {
		case 'ASSEMBLE': per = amount * timeSpend * AssemblerProductionSpeed.get(state.preferred.assembler.value); break;
		case 'SMELT': per = amount * timeSpend * SmelterProductionSpeed.get(state.preferred.smelter.value); break;
		case 'CHEMICAL': per = amount * timeSpend * ChemicalProductionSpeed.get(state.preferred.chemical.value); break;
		default: per = amount * timeSpend; break;
	}
	return renderNumber(per);
}



export default function ReferenceAssemble(props) {
    return (
        <table class="assemble">
            {[
                { contents: [5, 6, 97, 98, 103], label: 'Magnetics' },
                { contents: [11, 12, [68, 69]], label: 'Photonics' },
                { contents: [26, [28, 29], 30, 38], label: 'Quantum' },
                { contents: [19, 41, 44], label: 'Fuel' },
                { contents: [106, 107, 108], label: 'Proliferator' },
                { contents: [50, 53, 51, 52], label: 'Computing' },
                { contents: [[99, 100], 42, 101, 78, 79, 36], label: 'Advanced Materials' },
                { contents: [123, 20, 94, 21, 96], label: 'Logistics' },
                { contents: [70, 80, 81, 83], label: 'Dyson Sphere' },
                { contents: [62, 112], label: 'Misc' },
            ].map(bucket =>
                <tbody data-label={bucket.label}>
                    {bucket.contents.map(recipe => {
                        let alternates = [];
                        let common = [];
                        if(Array.isArray(recipe))
                        {
                            // TODO: Double check that the shared recipes have the same output & timeSpend, otherwise bucket them as separate rows above
                            let recipes = recipe.map(r => Recipes.find(d => d.id === r));
                            recipe = recipes[0];
                            
                            alternates = recipes.map(a => a.items
                                .filter(item => !recipes.some(b => a !== b && b.items.includes(item)))
                                .map(id => Items.find(d => d.id === id))
                            );
                            common = recipes[0].items
                                .filter(item => recipes.every(recipe => recipe.items.includes(item)))
                                .map(id => Items.find(d => d.id === id));
                        }
                        
                        else
                        {
                            recipe = Recipes.find(d => d.id === recipe);
                            common = recipe.items.map(id => Items.find(d => d.id === id));
                        }
                        
                        
                        return (
                            <tr>
                                <th>
                                    <div class="node">
                                        <div
                                            class="icon"
                                            title={recipe.explicit? recipe.name : Items.find(d => d.id === recipe.results[0]).name}
                                            data-icon={recipe.explicit? `recipe.${recipe.id}` : `item.${recipe.results[0]}`}
                                            data-count={recipe.resultCounts[0] > 1? recipe.resultCounts[0] : null}
                                        />
                                        <span class="per">{renderTimeSpend(recipe, recipe.resultCounts[0])}</span>
                                    </div>
                                </th>
                                <td>
                                    {alternates && (
                                        <div class="alternates">
                                            {alternates.map(alternate =>
                                                <div class="alternate">
                                                    {alternate.map((item, index) => {
                                                        let count = recipe.itemCounts[index];
                                                        return (
                                                            <div class="node">
                                                                <div
                                                                    class="icon"
                                                                    title={item.name}
                                                                    data-icon={`item.${item.id}`}
                                                                    data-count={count > 1? count : null}
                                                                />
                                                                <span class="per">{renderTimeSpend(recipe, count)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {common.map((item, index) =>
                                        <div class="node">
                                            <div
                                                class="icon"
                                                title={item.name}
                                                data-icon={`item.${item.id}`}
                                                data-count={recipe.itemCounts[index] > 1? recipe.itemCounts[index] : null}
                                            />
                                            <span class="per">{renderTimeSpend(recipe, recipe.itemCounts[index])}</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            )}
        </table>
    );
}