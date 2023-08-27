import classNames from 'classnames';
import {
	Recipes, Items, Techs, StringFromTypes, t,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	FractionationProductionSpeed,
	BeltTransportSpeed,
	RecipesUnlocked,
	ItemsUnlocked,
} from '../lib/data.js';
import state from '../state.js';
import Item from '../components/item';
import Recipe from '../components/recipe';



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
	let modifier = 1.0;
	switch(recipe.type) {
		case 'ASSEMBLE': modifier = AssemblerProductionSpeed.get(state.preferred.assembler.value); break;
		case 'SMELT': modifier = SmelterProductionSpeed.get(state.preferred.smelter.value); break;
		case 'CHEMICAL': modifier = ChemicalProductionSpeed.get(state.preferred.chemical.value); break;
		case 'FRACTIONATE': modifier = FractionationProductionSpeed(state.research.value) / 60 / 60; break;
	}
    let recipePerMinute = amount * timeSpend;
    let perMinute = recipePerMinute * modifier;
	return renderNumber(perMinute);
}





function onTimeScale(event) {
	state.timeScale.value = event.target.value;
}

function onPreferred(event) {
	state.preferred[event.target.name].value = +event.target.value;
}

function onHideSpoilers(event) {
	state.showHiddenUpgrades.value = !event.target.checked;
}


/*
	Reference sheets are inspired by the Quick Reference images created by reddit.com/user/oldshavingfoam
	Recipe Quick Reference: https://dsp-wiki.com/images/d/d9/Recipe_Quick_Reference.jpg
	Building Quick Reference: https://dsp-wiki.com/images/8/88/Building_Quick_Reference.jpg
*/



export default function Reference(props) {
	return (
		<main class="page reference">
			<p class="instruction">
				Numbers below items are in <select
					class="timescale per"
					onInput={onTimeScale}
				>
					{['minute', 'second'].map(scale =>
						<option value={scale} selected={scale === state.timeScale.value}>per {scale}</option>
					)}
				</select> units.<br/>
				Quantity <span class="quantity">&gt;1</span> is shown in bottom right.<br/>
				{state.research.value && (
					<label class="spoilers">
						Hide items/buildings not researched: <input type="checkbox" checked={!state.showHiddenUpgrades.value} onInput={onHideSpoilers}/>
					</label>
				)}
			</p>
			
			
			<div class={classNames('sheet')}>
				<Assembler/>
				<Smelter/>
			</div>
		</main>
	);
}


function Assembler(props) {
	const recipesUnlocked = state.recipesUnlockedSet.value;
	const itemsUnlocked = state.itemsUnlockedSet.value;
	const name = 'assembler';
	
	return (
		<>
			<header>
					<div class="sheet-tab">
						<span class="name">{StringFromTypes.get('ASSEMBLE')}</span>
						<div class="preferred">
							{Items.find(item => item.id === state.preferred.assembler.value)
							?.upgrades
							.filter(upgrade => state.showHiddenUpgrades.value || itemsUnlocked.has(upgrade))
							.map(upgrade => Items.find(item => item.id === upgrade))
							.map(item => {
								let per, count, title = item.name;
								
								switch(name) {
									case 'assembler': count = renderNumber(AssemblerProductionSpeed.get(item.id)) + '×'; break;
									case 'smelter': count = renderNumber(SmelterProductionSpeed.get(item.id)) + '×'; break;
									case 'chemical': count = renderNumber(ChemicalProductionSpeed.get(item.id)) + '×'; break;
									case 'belt': per = renderTime(BeltTransportSpeed.get(item.id)); break;
								}
								
								switch(name) {
									case 'assembler':
									case 'smelter':
									case 'chemical':
										title += ' — ' + `${t('制造速度' /* Production Speed */)}: ${count}`.replace(/ /g, ' ');
										break;
									
									case 'belt':
										title += ' — ' + `${t('运载速度' /* Transport Speed */)}: ${per} items per ${state.timeScale.value}`.replace(/ /g, ' ');
										break;
								}
								
								return (
									<label>
										<input
											type="radio"
											name={name}
											value={item.id}
											title={title}
											checked={item.id === state.preferred[name].value}
											onClick={onPreferred}
										/>
										<Item item={item} count={count} per={per}/>
									</label>
								);
							})}
						</div>
					</div>
				</header>
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
				]
				.filter(bucket => state.showHiddenUpgrades.value || bucket.contents.some(recipe => recipesUnlocked.has(recipe)))
				.map(bucket =>
					<tbody data-label={bucket.label}>
						{bucket.contents
						.filter(recipe => state.showHiddenUpgrades.value || recipesUnlocked.has(recipe))
						.map(recipe => {
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
											<Recipe recipe={recipe} count={recipe.resultCounts[0] > 1? recipe.resultCounts[0] : null}/>
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
																	<Item item={item} count={count > 1? count : null}/>
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
												<Item item={item} count={recipe.itemCounts[index] > 1? recipe.itemCounts[index] : null}/>
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
		</>
	);
}


function Smelter(props) {
	const recipesUnlocked = state.recipesUnlockedSet.value;
	const itemsUnlocked = state.itemsUnlockedSet.value;
	
	return (
		<>
			<header>
				<div class="sheet-tab">
					<span class="name">{StringFromTypes.get('SMELT')}</span>
					<div class="preferred">
						{Items.find(item => item.id === state.preferred.smelter.value)
						?.upgrades
						.filter(upgrade => state.showHiddenUpgrades.value || itemsUnlocked.has(upgrade))
						.map(upgrade => Items.find(item => item.id === upgrade))
						.map(item =>
							<label>
								<input
									type="radio"
									name={'smelter'}
									value={item.id}
									title={item.name}
									checked={item.id === state.preferred.smelter.value}
									onClick={onPreferred}
								/>
								<Item item={item}/>
							</label>
						)}
					</div>
				</div>
			</header>
			<table class="smelt">
				{[
					{ contents: [2, 1, 63, 3, 65, 66] },
					{ contents: [4, 57, 34, 59, 37] },
					{ contents: [17, 60, 61] },
				].map(bucket =>
					<tbody data-label={bucket.label}>
						{bucket.contents
						.filter(recipe => state.showHiddenUpgrades.value || recipesUnlocked.has(recipe))
						.map(recipe => {
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
		</>
	);
}




/*

export default function Reference(props) {
	return (
		<main class="page reference">
			<p class="instruction">
				Numbers below items are in <select
					class="timescale"
					onInput={onTimeScale}
				>
					{['minute', 'second'].map(scale =>
						<option value={scale} selected={scale === state.timeScale.value}>per {scale}</option>
					)}
				</select> units. Quantity &gt;1 is shown in bottom right in blue.
			</p>
			
			{/ *
				Reference sheets are directly based on the Quick Reference images created by reddit.com/user/oldshavingfoam
				https://dsp-wiki.com/images/d/d9/Recipe_Quick_Reference.jpg
				https://dsp-wiki.com/images/8/88/Building_Quick_Reference.jpg
			* /}
			<div class={classNames('sheet')}>
				<header>
					<div class="sheet-tab">
						<NavLink
							className="name"
							to="/reference/assemble"
							onClick={(event) => { event.preventDefault(); viewNavigate('/reference/assemble') }}
						>{StringFromTypes.get('ASSEMBLE')}</NavLink>
						<div class="preferred">
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
									<Item item={item}/>
								</label>
							)}
						</div>
					</div>
					<div class="sheet-tab">
						<NavLink
							className="name"
							to="/reference/smelt"
							onClick={(event) => { event.preventDefault(); viewNavigate('/reference/smelt') }}
						>{StringFromTypes.get('SMELT')}</NavLink>
						<div class="preferred">
							{Items.find(item => item.id === state.preferred.smelter.value)
							.upgrades.map(upgrade => Items.find(item => item.id === upgrade))
							.map(item =>
								<label>
									<input
										type="radio"
										name={'smelter'}
										value={item.id}
										title={item.name}
										checked={item.id === state.preferred.smelter.value}
										onClick={onPreferred}
									/>
									<Item item={item}/>
								</label>
							)}
						</div>
					</div>
				</header>
				<Outlet/>
			</div>
		</main>
	);
}

*/