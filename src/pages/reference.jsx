import classNames from 'classnames';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
}


function onTimeScale(event) {
	state.timeScale.value = event.target.value;
}

function onPreferred(event) {
	state.preferred[event.target.name].value = +event.target.value;
}

export default function Reference(props) {
	const navigate = useNavigate();
	const viewNavigate = (newRoute) => {
		if(!document.startViewTransition) return navigate(newRoute);
		return document.startViewTransition(() => {
			navigate(newRoute);
		});
	};
	
	return (
		<main class="page reference">
			<p class="instruction">
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
									<div class="icon" data-icon={`item.${item.id}`}/>
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
									<div class="icon" data-icon={`item.${item.id}`}/>
								</label>
							)}
						</div>
					</div>
				</header>
				<Outlet/>
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