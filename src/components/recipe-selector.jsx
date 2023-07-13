import { useCallback, useEffect, useRef } from 'preact/hooks';
import classNames from 'classnames';
import { Tabs, Tab } from './tabs.jsx';
import { ListBox, ListBoxOption } from './listbox.jsx';
import { Recipes, Items } from '../lib/data.js';


export default function RecipeSelector(props) {
	const { isOpen, onRecipe, onDismiss } = props;
	const refRecipeWindow = useRef(null);
	
	useEffect(() => {
		if(isOpen)
			refRecipeWindow.current.showModal();
		
		else
			refRecipeWindow.current.close();
	}, [isOpen]);
	
	const renderRecipeGrid = useCallback((grid, recipe) => {
		let gridIndex = recipe.gridIndex.toString();
		let X = parseInt(gridIndex.at(2) + gridIndex.at(3), 10);
		let Y = parseInt(gridIndex.at(1), 10);
		let Z = parseInt(gridIndex.at(0), 10);
		if(Z !== grid) return null;
		
		let primaryResult = recipe.results[0];
		let primaryItem = Items.find(i => i.id === primaryResult);
		let icon = primaryItem.name !== recipe.name? `recipe.${recipe.id}` : `item.${primaryResult}`;
		
		return (
			<ListBoxOption
				key={recipe.id}
				class={classNames('icon', { 'is-selected': props.selected === recipe })}
				data-icon={icon}
				style={{ gridArea: `${Y} / ${X}` }}
				onSelect={() => onRecipe(recipe)}
				title={recipe.name}
			/>
		);
	}, [onRecipe]);
	
	return (
		<dialog class="window recipes" ref={refRecipeWindow} onClose={onDismiss}>
			<header>
				Select a recipe
			</header>
			<Tabs label="Select a recipe group">
				<Tab label="Items">
					<ListBox class="recipe-grid" label="Select an item recipe">
						{Recipes.map(recipe => renderRecipeGrid(1, recipe))}
					</ListBox>
				</Tab>
				<Tab label="Buildings">
					<ul
						class="recipe-grid"
						role="listbox"
						aria-label="Select a building recipe"
					>
						{Recipes.map(recipe => renderRecipeGrid(2, recipe))}
					</ul>
				</Tab>
			</Tabs>
		</dialog>
	);
}