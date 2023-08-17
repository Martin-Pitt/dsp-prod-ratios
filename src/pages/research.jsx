import { useState, useCallback, useMemo, useRef, useEffect } from 'preact/hooks';
import classNames from 'classnames';
import { Techs } from '../lib/data.js';
import state from '../state.js';


function pinResearch(tech) {
	if(state.research.value.includes(tech)) return;
	if(tech.items) for(let item of tech.items) {
		let itemRecipe = Recipes.find(recipe => recipe.results.includes(item));
		let itemTech = Techs.find(tech => tech.unlockRecipes?.includes(itemRecipe.id));
		if(itemTech) pinResearch(itemTech);
	}
	if(tech.preTechs) for(let preTech of tech.preTechs) pinResearch(Techs.find(t => t.id === preTech));
	if(tech.preTechsImplicit) for(let preTech of tech.preTechsImplicit) pinResearch(Techs.find(t => t.id === preTech));
	state.research.value = [...state.research.value, tech];
}

function unpinResearch(tech) {
	let index = state.research.value.indexOf(tech);
	if(index === -1) return;
	state.research.value = state.research.value.filter(t => t !== tech);
	
	for(let postTech of state.research.value)
	{
		if(postTech.preTechs?.includes(tech.id)) unpinResearch(postTech);
		if(postTech.preTechsImplicit?.includes(tech.id)) unpinResearch(postTech);
	}
}

function hoverResearch(tech, set = new Set()) {
	if(state.research.value.includes(tech)) return set;
	set.add(tech);
	if(tech.preTechs) for(let preTech of tech.preTechs) hoverResearch(Techs.find(t => t.id === preTech), set);
	if(tech.preTechsImplicit) for(let preTech of tech.preTechsImplicit) hoverResearch(Techs.find(t => t.id === preTech), set);
	if(tech.items) for(let item of tech.items) {
		let itemRecipe = Recipes.find(recipe => recipe.results.includes(item));
		let itemTech = Techs.find(tech => tech.unlockRecipes?.includes(itemRecipe.id));
		if(itemTech) hoverResearch(itemTech, set);
	}
	return set;
}


function toggleResearch(tech) {
	if(state.research.value.includes(tech)) unpinResearch(tech);
	else pinResearch(tech);
}
function onResearch(event, tech) {
	event.preventDefault();
	toggleResearch(tech);
}

function resetResearch() {
	state.research.value = [];
}



export default function Research(props) {
	const root = useRef(null);
	
	useEffect(() => {
		if('researchScrollTop' in sessionStorage)
		{
			root.current.scrollLeft = parseInt(sessionStorage.researchScrollTop, 10);
			root.current.scrollTop = parseInt(sessionStorage.researchScrollLeft, 10);
		}
		
		else
		{
			root.current.scrollLeft = 300 - 40;
			root.current.scrollTop = 300 - 40;
		}
		
		return () => {
			sessionStorage.researchScrollTop = root.current.scrollLeft;
			sessionStorage.researchScrollLeft = root.current.scrollTop;
		};
	}, [root.current]);
	
	const saveScroll = useCallback(() => {
		sessionStorage.researchScrollTop = root.current.scrollLeft;
		sessionStorage.researchScrollLeft = root.current.scrollTop;
	}, [root.current]);
	
	const [isMouseDown, setMouseDown] = useState(false);
	const [isDragging, setDragging] = useState(false);
	let pos = { top: 0, left: 0, startX: 0, startY: 0, x: 0, y: 0 };
	const onMouseMoveScrollDrag = useCallback(event => {
		let dx = event.clientX - pos.x;
		let dy = event.clientY - pos.y;
		root.current.scrollLeft = pos.left - dx;
		root.current.scrollTop = pos.top - dy;
		
		if(!isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) setDragging(true);
	}, [root.current, setDragging]);
	
	const onMouseUpScrollDrag = useCallback(event => {
		setDragging(false);
		setMouseDown(false);
		sessionStorage.researchScrollTop = root.current.scrollLeft;
		sessionStorage.researchScrollLeft = root.current.scrollTop;
	}, [root.current, setDragging, setMouseDown]);
	
	const onMouseDownScrollDrag = useCallback(event => {
		pos.left = root.current.scrollLeft;
		pos.top = root.current.scrollTop;
		pos.x = event.clientX;
		pos.y = event.clientY;
		setMouseDown(true);
	}, [root.current, setMouseDown]);
	
	
	const [hovered, setHovered] = useState(null);
	const hoveredTech = useMemo(() => hovered? hoverResearch(hovered) : new Set(), [hovered]);
	
	
	const mainLinePosition = Techs.find(tech => tech.isMain).y;
	
	return (
		<main
			class={classNames('page research', { 'is-dragging': isDragging })}
			onMouseDown={onMouseDownScrollDrag}
			onMouseMove={isMouseDown? onMouseMoveScrollDrag : null}
			onMouseUp={isMouseDown? onMouseUpScrollDrag : null}
			onScroll={saveScroll}
			ref={root}
		>
			<div class="canvas">
				<p class="about">
					Select your research progress so far, this tool will then only show recipes available to you.
					{state.research.value.length? <button class="reset" onClick={resetResearch}>Reset research</button> : <><br/><br/>With nothing selected, all recipes are available.</>}
				</p>
				{Techs.filter(tech => tech.id < 2000).map(tech => {
					if(!tech.preTechs) return [];
					
					const isResearched = state.research.value.includes(tech);
					const hasPreTechs = !tech.preTechs || tech.preTechs.every(id => state.research.value.includes(Techs.find(t => t.id === id)));
					const hasImplicitPreTechs = !tech.preTechsImplicit || tech.preTechsImplicit.every(id => state.research.value.includes(Techs.find(t => t.id === id)));
					
					let links = tech.preTechs.map((id, index) => {
						const preTech = Techs.find(t => t.id === id);
						const hasPreRequisite = state.research.value.includes(preTech);
						
						return {
							toIndex: index,
							tech,
							preTech,
							isActive: hasPreRequisite && hasPreTechs && hasImplicitPreTechs,
							isBelow: preTech.y < tech.y,
							isAbove: preTech.y > tech.y,
							inLine: preTech.y === tech.y,
							aboveMain: preTech.y < mainLinePosition,
							belowMain: preTech.y > mainLinePosition,
						};
					});
					
					links = links.sort((a, b) => a.preTech.y - b.preTech.y);
					links.forEach((link, index) => link.toIndex = index);
					
					const inMainLine = links.findIndex(link => link.inLine && link.tech.isMain);
					if(inMainLine !== -1 && links.length > 1)
					{
						const inMainLinePos = links[inMainLine].toIndex;
						for(let link of links) link.toIndex -= inMainLinePos;
					}
					
					return links;
				})
				.flat()
				.sort((a, b) => a.isActive === b.isActive? 0 : a.isActive? 1 : -1)
				.map(link => (
					<div
						key={`${link.preTech.id}-${link.tech.id}`}
						class={classNames('link', {
							'is-active': link.isActive,
							'is-main': link.inLine && link.tech.isMain,
							'is-below': link.isBelow,
							'is-above': link.isAbove,
							'in-line': link.inLine,
							'above-main': link.aboveMain,
							'below-main': link.belowMain,
							'from-main': link.preTech.isMain,
							'to-main': link.tech.isMain,
							'hovered': hoveredTech.has(link.tech),
						})}
						
						style={{
							gridRowStart: link.isAbove? link.preTech.y + 1 : link.preTech.y,
							gridRowEnd: link.isBelow? link.tech.y + 1 : link.tech.y,
							gridColumnStart: link.preTech.x,
							gridColumnEnd: link.tech.x + 1,
							'--to': link.toIndex,
						}}
					>
						{link.inLine? (
							<div class="line">
								{!link.tech.isMain && (
									<>
										<div class="base"/>
										<div class="arrow"/>
									</>
								)}
							</div>
						) : (
							<div class="before">
								{!link.preTech.isMain && <div class="base"/>}
							</div>
						)}
						{((link.isBelow && !(link.aboveMain && link.tech.isMain)) || (link.isAbove && !(link.belowMain && link.tech.isMain))) && (
							<div class="after">
								<div class="arrow"/>
							</div>
						)}
					</div>
				))}
				{Techs.filter(tech => tech.id < 2000).map(tech => {
					const isResearched = state.research.value.includes(tech);
					const hasPreTechs = !tech.preTechs || tech.preTechs.every(id => state.research.value.includes(Techs.find(t => t.id === id)));
					const hasImplicitPreTechs = !tech.preTechsImplicit || tech.preTechsImplicit.every(id => state.research.value.includes(Techs.find(t => t.id === id)));
					
					return (
						<div
							key={tech.id}
							class={classNames('tech', {
								'is-researched': isResearched,
								'can-research': hasPreTechs && hasImplicitPreTechs,
								'hovered': hoveredTech.has(tech),
							})}
							data-id={tech.id}
							style={{ gridArea: `${tech.y} / ${tech.x}` }}
							// onClick={event => onResearch(event, tech)}
							onClick={!isDragging? (event => onResearch(event, tech)) : null}
							onPointerEnter={event => setHovered(tech)}
							onPointerLeave={event => setHovered(null)}
						>
							<div class="icon" data-icon={`tech.${tech.id}`}/>
							<span class="name">{tech.name}</span>
						</div>
					);
				})}
			</div>
		</main>
	);
}