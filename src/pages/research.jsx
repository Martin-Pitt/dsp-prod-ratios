import { useCallback } from 'preact/hooks';
import classNames from 'classnames';
import { Tech } from '../lib/data.js';
import state from '../state.js';


function getGridPosition(tech) {
	let X = tech.position[0];
	let Y = -tech.position[1];
	if(Y > 0) Y += 2;
	if(tech.id < 2000) X -= 4;
	return [X, Y];
}

function pinResearch(tech) {
	if(state.research.value.includes(tech)) return;
	state.research.value = [...state.research.value, tech];
	if(!tech.preTechs) return;
	for(let preTech of tech.preTechs)
	{
		pinResearch(Tech.find(t => t.id === preTech));
	}
}

function unpinResearch(tech) {
	let index = state.research.value.indexOf(tech);
	if(index === -1) return;
	state.research.value = state.research.value.filter(t => t !== tech);
	
	for(let postTech of state.research.value)
	{
		if(postTech.preTechs && postTech.preTechs.includes(tech.id)) unpinResearch(postTech);
	}
}

function toggleResearch(tech) {
	if(state.research.value.includes(tech)) unpinResearch(tech);
	else pinResearch(tech);
}

function resetResearch() {
	state.research.value = [];
}


export default function Research(props) {
	const onResearch = useCallback((event, tech) => {
		event.preventDefault();
		toggleResearch(tech);
	});
	
	
	return (
		<main class="page research">
			<p class="about">
				Select your research progress so far, this tool will then only show recipes available to you.
				{state.research.value.length? <button class="reset" onClick={resetResearch}>Reset research</button> : null}
			</p>
			{Tech.filter(tech => tech.id < 2000).map(tech => {
				if(!tech.preTechs) return;
				// const [X, Y] = getGridPosition(tech);
				
				let links = tech.preTechs.map((id, index) => {
					const preTech = Tech.find(t => t.id === id);
					// const [PX, PY] = getGridPosition(preTech);
					
					let X = tech.position[0];
					let Y = -tech.position[1];
					let PX = preTech.position[0];
					let PY = -preTech.position[1];
					
					PX += 1;
					if(PY >= Y) PY += 1;
					if(PY < Y) Y += 1;
					
					const isActive = state.research.value.includes(preTech);
					const isBelow = PY < Y + 1;
					const isAbove = PY > Y + 1;
					const isMain = PY === 0 & Y === -1;
					
					// Re-align
					if(Y >= 0) Y += 2;
					if(tech.id < 2000) X -= 4;
					if(PY >= 0) PY += 2;
					if(preTech.id < 2000) PX -= 4;
					
					return {
						index,
						PX, PY, X, Y,
						isActive, isMain, isBelow, isAbove,
					};
				});
				
				links = links.sort((a, b) => a.PY - b.PY);
				
				let hasMain = links.findIndex(link => link.isMain);
				if(hasMain !== -1)
				{
					for(let link of links) link.index -= hasMain;
				}
				
				return links.map((tech => {
					return (
						<div
							class={classNames('link', {
								'is-active': tech.isActive,
								'is-main': tech.isMain,
								'is-below': tech.isBelow,
								'is-above': tech.isAbove,
								'in-line': !tech.isBelow && !tech.isAbove,
							})}
							
							style={{
								gridRowStart: tech.PY,
								gridRowEnd: tech.Y,
								gridColumnStart: tech.PX,
								gridColumnEnd: tech.X,
								'--index': tech.index, // tech.isMain? 0 : tech.index,
							}}
						/>
					);
				}))
			})}
			{Tech.filter(tech => tech.id < 2000).map(tech => {
				const [X, Y] = getGridPosition(tech);
				
				return (
					<div
						class={classNames('tech', {
							'is-researched': state.research.value.includes(tech),
							'can-research': tech.preTechs && tech.preTechs.every(id => state.research.value.includes(Tech.find(t => t.id === id)))
						})}
						data-id={tech.id}
						style={{ gridArea: `${Y} / ${X}` }}
						onClick={(event) => onResearch(event, tech)}
					>
						<div class="icon" data-icon={`tech.${tech.id}`}/>
						<span class="name">{tech.name}</span>
					</div>
				);
			})}
		</main>
	);
}

/*
style={{
	gridRowStart: tech.PY, // PY < Y? PY : PY + 1,
	gridRowEnd: tech.Y, // PY < Y? Y + 1 : Y,
	gridColumnStart: tech.PX,
	gridColumnEnd: tech.X,
	'--index': tech.isMain? 0 : tech.index,
	
	// gridArea: `${PY < Y? PY : PY + 1} / ${PX + 1} / ${PY < Y? Y + 1 : Y} / ${X}`,
	// var(--start-y) / var(--start-x) / var(--end-y) / var(--end-x)
	// '--start-x': PX + 1,
	// '--start-y': PY < Y? PY : PY + 1,
	// '--end-x': X,
	// '--end-y': PY < Y? Y + 1 : Y,
}}
*/

{/* <style>
	{`.tech[data-id="${tech.id}"] {
		anchor-name: --tech-${tech.id};
	}`}
	{tech.preTechs && tech.preTechs.map(preTech => (
		`.link[data-start="${tech.id}"][data-end="${preTech}"] {
			top: anchor(--tech-${tech.id} center);
			left: anchor(--tech-${tech.id} right);
			right: anchor(--tech-${preTech} left);
			bottom: anchor(--tech-${preTech} center);
		}`
	))}
</style> */}

// style={{
// 	// '--start': `--tech-${tech.id}`,
// 	// '--end': `--tech-${preTech}`,
// 	top: `anchor(--tech-${tech.id} center)`,
// 	left: `anchor(--tech-${tech.id} right)`,
// 	right: `anchor(--tech-${preTech} left)`,
// 	bottom: `anchor(--tech-${preTech} center)`,
// }}