import classNames from 'classnames';
import {
	Recipes, Items, Tech, StringFromTypes,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	BeltTransportSpeed,
	RecipesUnlocked,
	ItemsUnlocked,
} from '../lib/data.js';
import state from '../state.js';


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
	// const separator = ' / ';
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
	
	
	// switch(recipe.type) {
	// 	case 'ASSEMBLE': values = Array.from(AssemblerProductionSpeed.values(), modifier => amount * modifier); break;
	// 	case 'SMELT': values = Array.from(SmelterProductionSpeed.values(), modifier => amount * modifier); break;
	// 	case 'CHEMICAL': values = Array.from(ChemicalProductionSpeed.values(), modifier => amount * modifier); break;
	// 	default: values = [amount];
	// }
	
	// return values.map(value => renderNumber(value)).join(separator);
}


function onTimeScale(event) {
	state.timeScale.value = event.target.value;
}

function onPreferred(event) {
	state.preferred[event.target.name].value = +event.target.value;
}

export default function Reference(props) {
	return (
		<main class="page reference">
			<p>
				Numbers below items are in <select
					class="timescale"
					onChange={onTimeScale}
				>
					{['minute', 'second'].map(scale =>
						<option value={scale} selected={scale === state.timeScale.value}>per {scale}</option>
					)}
				</select> units. Quantity &gt;1 is shown in bottom right in blue.
			</p>
			
			{/*
				Reference sheets are directly based on the Quick Reference images created by reddit.com/user/oldshavingfoam
				https://dsp-wiki.com/images/d/d9/Recipe_Quick_Reference.jpg
				https://dsp-wiki.com/images/8/88/Building_Quick_Reference.jpg
			*/}
			<div class="sheet">
				<table>
					<thead>
						<tr>
							<th class="preferred" colspan="2">
								<span class={'name'}>
									{StringFromTypes.get('ASSEMBLE')}
								</span>
								{Items.find(item => item.id === state.preferred.assembler.value)
								.upgrades.map(upgrade => Items.find(item => item.id === upgrade))
								.map(item =>
									<label>
										<input
											type="radio"
											name={'assembler'}
											value={item.id}
											title={item.name}
											checked={item.id === state.preferred.assembler.value}
											onClick={onPreferred}
										/>
										<div class="icon" data-icon={`item.${item.id}`}/>
									</label>
								)}
							</th>
						</tr>
					</thead>
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
			</div>
			{/*
				TODO: Add other item production reference sheets such as Smelter, Chemical Plant, Oil Refinery, Miniature Particle Collider, Matrix Lab.
				TODO: Add tabbed interface to switch between item and building recipes
				TODO: Are there other reference sheets that can be added?
					Perhaps the Vein Utilisation chart with list of notable VU#'s
				TODO: Better background visual would be nice
				TODO: Filter based on research?
			*/}
		</main>
	);
}