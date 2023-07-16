import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import classNames from 'classnames';
import { Tabs, Tab } from './tabs.jsx';
import { ListBox, ListBoxOption } from './listbox.jsx';
import { Recipes, Items, RecipesUnlocked } from '../lib/data.js';
import state from '../state.js';


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
		
		let primaryItem = Items.find(i => i.id === recipe.results[0]);
		let icon = recipe.explicit? `recipe.${recipe.id}` : `item.${primaryItem.id}`;
		let name = recipe.explicit? recipe.name : primaryItem.name;
		
		return (
			<ListBoxOption
				key={recipe.id}
				class={classNames('icon', { 'is-selected': props.selected === recipe })}
				data-icon={icon}
				style={{ gridArea: `${Y} / ${X}` }}
				onSelect={() => onRecipe(recipe)}
				title={name}
			/>
		);
	}, [onRecipe]);
	
	const recipes = useMemo(() => RecipesUnlocked(state.research.value), [state.research.value]);
	
	return (
		<dialog class="window recipes" ref={refRecipeWindow} onClose={onDismiss}>
			<header>
				Select a recipe
			</header>
			<Tabs label="Select a recipe group">
				<Tab label="Items">
					<ListBox class="recipe-grid" label="Select an item recipe">
						{recipes.map(recipe => renderRecipeGrid(1, recipe))}
					</ListBox>
				</Tab>
				<Tab label="Buildings">
					<ListBox class="recipe-grid" label="Select a building recipe">
						{recipes.map(recipe => renderRecipeGrid(2, recipe))}
					</ListBox>
				</Tab>
			</Tabs>
		</dialog>
	);
}