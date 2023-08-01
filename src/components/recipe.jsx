import { Recipes, locale } from '../lib/data';


export default function Recipe(props) {
	const recipe = props.recipe || Recipes.find(recipe => recipe.id === props.id);
	const primaryItem = Items.find(i => i.id === recipe.results[0]);
	const icon = recipe.explicit? `recipe.${recipe.id}` : `item.${primaryItem.id}`;
	const name = recipe.explicit? recipe.name : primaryItem.name;
	
	if(props.named) return (
		<span class="recipe" lang={locale}>
			<span class="icon" data-icon={icon} data-count={props.count}/> <span class="name">{name}</span>
		</span>
	);
	
	else return (
		<span class="recipe icon" data-icon={icon} data-count={props.count} title={name} lang={locale}/>
	);
}