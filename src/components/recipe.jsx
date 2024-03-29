import { Recipes, Locale } from '../lib/data';


export default function Recipe(props) {
	const recipe = props.recipe || Recipes.find(recipe => recipe.id === props.id);
	const primaryItem = Items.find(i => i.id === recipe.results[0]);
	const icon = recipe.explicit? `recipe.${recipe.id}` : `item.${primaryItem.id}`;
	const name = recipe.explicit? recipe.name : primaryItem.name;
	const points = props.points || state.proliferatorPoints.value;
	
	if(props.name) return (
		<span class="recipe named" lang={Locale.locale}>
			<span class="name">{name}</span>
		</span>
	);
	
	if(props.named) return (
		<span class="recipe" lang={Locale.locale}>
			<span class="icon" data-icon={icon} data-count={props.count}>
				{props.proliferated && <div class="icon proliferated" data-icon={`ui.inc-${props.proliferated? points : 0}`}/>}
			</span> <span class="name">{name}</span>
		</span>
	);
	
	return (
		<span class="recipe icon" data-icon={icon} data-count={props.count} title={name} lang={Locale.locale}>
			{props.proliferated && <div class="icon proliferated" data-icon={`ui.inc-${props.proliferated? points : 0}`}/>}
		</span>
	);
}