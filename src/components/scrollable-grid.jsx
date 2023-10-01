import { useState, useEffect, useCallback, useRef } from 'preact/hooks';

const ZoomLevels = [4, 3, 2, 1.5, 1.25, 1, 1/1.25, 1/1.5, 1/2, 1/3, 1/4]
const DefaultZoomLevel = ZoomLevels.findIndex(level => level === 1);


export default function ScrollableGrid(props) {
	const Tag = props.tag || 'div';
	const name = 'scrollable' || props.name;
	const root = useRef(null);
	
	useEffect(() => {
		if(`${name}ScrollTop` in sessionStorage)
		{
			root.current.scrollLeft = parseInt(sessionStorage.getItem(`${name}ScrollLeft`), 10);
			root.current.scrollTop = parseInt(sessionStorage.getItem(`${name}ScrollTop`), 10);
		}
		
		else
		{
			root.current.scrollLeft = 500 - 40;
			root.current.scrollTop = 500 - 40;
		}
		
		return () => {
			sessionStorage.setItem(`${name}ScrollLeft`, root.current.scrollLeft);
			sessionStorage.setItem(`${name}ScrollTop`, root.current.scrollTop);
		};
	}, [root.current]);
	
	const saveScroll = useCallback(() => {
		sessionStorage.setItem(`${name}ScrollLeft`, root.current.scrollLeft);
		sessionStorage.setItem(`${name}ScrollTop`, root.current.scrollTop);
	}, [root.current]);
	
	const [isMouseDown, setMouseDown] = useState(false);
	const [isDragging, setDragging] = useState(false);
	const [pos, setPos] = useState({ top: 0, left: 0, x: 0, y: 0 });
	const onMouseMoveScrollDrag = useCallback(event => {
		let dx = event.clientX - pos.x;
		let dy = event.clientY - pos.y;
		root.current.scrollLeft = pos.left - dx;
		root.current.scrollTop = pos.top - dy;
		
		if(!isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) setDragging(true);
	}, [root.current, setDragging, pos]);
	
	const onMouseUpScrollDrag = useCallback(event => {
		setDragging(false);
		setMouseDown(false);
		sessionStorage.setItem(`${name}ScrollLeft`, root.current.scrollLeft);
		sessionStorage.setItem(`${name}ScrollTop`, root.current.scrollTop);
	}, [root.current, setDragging, setMouseDown]);
	
	const onMouseDownScrollDrag = useCallback(event => {
		setPos({
			left: root.current.scrollLeft,
			top: root.current.scrollTop,
			x: event.clientX,
			y: event.clientY,
		});
		
		setMouseDown(true);
	}, [root.current, setMouseDown, setPos]);
	
	
	const [zoomLevel, setZoomLevel] = useState(`${name}ZoomLevel` in sessionStorage? parseInt(sessionStorage.getItem(`${name}ZoomLevel`), 10) : DefaultZoomLevel);
	const zoom = ZoomLevels[zoomLevel];
	
	const zoomOut = useCallback(() => {
		setZoomLevel(oldZoomLevel => {
			if(oldZoomLevel === ZoomLevels.length - 1) return oldZoomLevel;
			const newZoomLevel = oldZoomLevel + 1;
			let newZoom = ZoomLevels[newZoomLevel];
			let oldZoom = ZoomLevels[oldZoomLevel];
			let change = 1 / (oldZoom / newZoom);
			
			let oldLeft = root.current.scrollLeft + root.current.offsetWidth * 0.5;
			let oldTop = root.current.scrollTop + root.current.offsetHeight * 0.5;
			
			let newLeft = oldLeft * change;
			let newTop = oldTop * change;
			
			root.current.scrollLeft += newLeft - oldLeft;
			root.current.scrollTop += newTop - oldTop;
			
			sessionStorage.setItem(`${name}ZoomLevel`, newZoomLevel);
			
			return newZoomLevel;
		});
	}, []);
	const zoomIn = useCallback(() => {
		setZoomLevel(oldZoomLevel => {
			if(oldZoomLevel === 0) return oldZoomLevel;
			const newZoomLevel = oldZoomLevel - 1;
			let newZoom = ZoomLevels[newZoomLevel];
			let oldZoom = ZoomLevels[oldZoomLevel];
			let change = 1 / (oldZoom / newZoom);
			
			let oldLeft = root.current.scrollLeft + root.current.offsetWidth * 0.5;
			let oldTop = root.current.scrollTop + root.current.offsetHeight * 0.5;
			
			let newLeft = oldLeft * change;
			let newTop = oldTop * change;
			
			root.current.scrollLeft += newLeft - oldLeft;
			root.current.scrollTop += newTop - oldTop;
			
			sessionStorage.setItem(`${name}ZoomLevel`, newZoomLevel);
			
			return newZoomLevel;
		});
	}, []);
	
	
	return (
		<Tag
			class={props.class}
			onMouseDown={onMouseDownScrollDrag}
			onMouseMove={isMouseDown? onMouseMoveScrollDrag : null}
			onMouseUp={isMouseDown? onMouseUpScrollDrag : null}
			onScroll={saveScroll}
			ref={root}
		>
			<div style={{zoom}}>{props.children}</div>
			<div class="zoom">
				<button title="Make research smaller" onClick={zoomOut}>-</button>
				<output>{(Math.round(zoom * 1000) / 10)}%</output>
				<button title="Make research bigger" onClick={zoomIn}>+</button>
			</div>
		</Tag>
	);
}