
export function ListBox(props) {
	// const [activeDescendant, setActiveDescendant] = useState(null);
	// const listbox = useRef(null);
	
	// const allOptions = props.children
	// const currentItem = document.getElementById(activeDescendant) || (listbox.current?  : null)
	
	// const onKeyDown = useCallback(event => {
	// 	switch(event.key) {
	// 		case 'ArrowUp':
	// 		case 'ArrowDown':
	// 			if(!activeDescendant)
	// 	}
		
		
	// }, [activeDescendant]);
	
	
	return (
		<ul
			class={props.class}
			role="listbox"
			aria-label={props.label}
			// onKeyDown={onKeyDown}
		>
			{props.children}
		</ul>
	);
}

export function ListBoxOption(props) {
	const { onSelect, ...passthrough } = props;
	
	return (
		<li
			role="option"
			onClick={onSelect}
			{...passthrough}
		/>
	)
}
