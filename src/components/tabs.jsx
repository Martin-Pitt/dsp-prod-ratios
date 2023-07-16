import { useState, useCallback } from 'preact/hooks';

export function Tabs(props) {
	let [activeTab, setActiveTab] = useState(0);
	
	const onKeyDown = useCallback(event => {
		let target = event.currentTarget;
		let doPrevent = true;
		
		switch(event.key) {
			case 'ArrowLeft':
				if(target.previousElementSibling)
					target.previousElementSibling.focus();
				else
				{
					while(target.nextElementSibling) target = target.nextElementSibling;
					target.focus();
				}
				break;
			
			case 'ArrowRight':
				if(target.nextElementSibling)
					target.nextElementSibling.focus();
				else
				{
					while(target.previousElementSibling) target = target.previousElementSibling;
					target.focus();
				}
				break;
			
			case 'Home':
				while(target.nextElementSibling) target = target.nextElementSibling;
				target.focus();
				break;
			
			case 'End':
				while(target.previousElementSibling) target = target.previousElementSibling;
				target.focus();
				break;
			
			default:
				doPrevent = false;
				break;
		}
		
		if(doPrevent)
		{
			event.stopPropagation();
			event.preventDefault();
		}
	}, []);
	
	
	return (
		<>
			<div
				class="tablist"
				role="tablist"
				aria-label={props.label}
			>
				{props.children.map((child, index) => (
					<button
						class="tab"
						id={`tab-${index}`}
						type="button"
						role="tab"
						aria-selected={activeTab === index? 'true' : 'false'}
						aria-controls={`tabpanel-${index}`}
						tabindex={activeTab === index? 0 : -1}
						onClick={() => setActiveTab(index)}
						onKeyDown={onKeyDown}
					>
						{child.props.label}
					</button>
				))}
			</div>
			{props.children.map((child, index) => (
				<div
					id={`tabpanel-${index}`}
					role="tabpanel"
					aria-labelledby={`tab-${index}`}
					class={'tabpanel ' + (activeTab === index? 'is-visible' : 'is-hidden')}
				>
					{child.props.children}
				</div>
			))}
		</>
	);
}

export function Tab(props) { return props.children; }