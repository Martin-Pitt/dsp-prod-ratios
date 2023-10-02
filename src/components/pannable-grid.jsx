import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import classNames from 'classnames';

const ZoomLevels = [4, 3, 2, 1.5, 1.25, 1, 1/1.25, 1/1.5, 1/2, 1/3, 1/4];
// const DefaultZoomLevel = ZoomLevels.findIndex(level => level === 1);


export default function PannableGrid(props) {
	const Tag = props.tag || 'div';
	const name = 'pannable' || props.name;
	const referenceRoot = useRef(null);
	const referenceTarget = useRef(null);
	const referenceZoom = useRef(null);
	const referenceZoomOut = useRef(null);
	const referenceZoomIn = useRef(null);
	
	
	
	useEffect(() => {
		let root = referenceRoot.current;
		let target = referenceTarget.current;
		let zoom = referenceZoom.current;
		let zoomOut = referenceZoomOut.current;
		let zoomIn = referenceZoomIn.current;
		
		let x = 0;
		let y = 0;
		let z = 1;
		
		if(`${name}ScrollTop` in sessionStorage)
		{
			x = -parseInt(sessionStorage.getItem(`${name}ScrollLeft`), 10) || 0;
			y = -parseInt(sessionStorage.getItem(`${name}ScrollTop`), 10) || 0;
			z = parseFloat(sessionStorage.getItem(`${name}Zoom`)) || 1;
		}
		
		else
		{
			x = -(500 - 40);
			y = -(500 - 40);
			z = 1;
		}
		
		
		function updateTransform() {
			let screenWidth = root.offsetWidth;
			let screenHeight = root.offsetHeight;
			let targetWidth = target.offsetWidth;
			let targetHeight = target.offsetHeight;
			z = Math.max(ZoomLevels[ZoomLevels.length - 1], Math.min(ZoomLevels[0], z));
			
			if(targetWidth * z > screenWidth)
			{
				x = Math.min(screenWidth * (1-(1/z))/2, Math.max(-targetWidth + (screenWidth * (1-(1/z))/2) + screenWidth/z, x));
			}
			else
			{
				x = (-targetWidth * 0.5) + (screenWidth * (1-(1/z))/2) + (screenWidth/z) * 0.5;
			}
			
			if(targetHeight * z > screenHeight)
			{
				y = Math.min(screenHeight * (1-(1/z))/2, Math.max(-targetHeight + (screenHeight * (1-(1/z))/2) + screenHeight/z, y));
			}
			else
			{
				y = (-targetHeight * 0.5) + (screenHeight * (1-(1/z))/2) + (screenHeight/z) * 0.5;
			}
			
			target.style.transform = `translate(50vw, 50vh) scale(${z}) translate(-50vw, -50vh) translate(${x}px, ${y}px)`;
			target.style.transformOrigin = 'left top';
			
			zoom.firstChild.nodeValue = (Math.round(z * 1000) / 10) + '%'; //{}%
			
			sessionStorage.setItem(`${name}ScrollLeft`, Math.round(-x));
			sessionStorage.setItem(`${name}ScrollTop`, Math.round(-y));
			sessionStorage.setItem(`${name}Zoom`, z);
		}
		
		function onScroll(event) {
			event.preventDefault();
		}
		
		// Move around with your trackpad
		// Supports pinch-zoom via wheel in Chrome & Firefox on macOS, and with most Windows trackpads
		// Supports pinch-zoom via non-standard gesturestart/gesturechange/gestureend events on Safari
		function onWheel(event) {
			event.preventDefault();
			
			root.classList.add('has-wheel');
			
			
			// Trackpad pinch-zoom
			if (event.ctrlKey)
			{
				let s = Math.exp(-event.deltaY/100);
				// z *= s;
				
				let newZoom = Math.max(ZoomLevels[ZoomLevels.length - 1], Math.min(ZoomLevels[0], z * s));
				s = newZoom / z;
				
				let dx = event.pageX - root.offsetWidth/2;
				let dy = event.pageY - root.offsetHeight/2;
				x += dx/(newZoom*s) - dx/newZoom;
				y += dy/(newZoom*s) - dy/newZoom;
				z = newZoom;
			}
			
			// Otherwise, handle trackpad panning
			else
			{
				var direction = -1; // natural.checked ? -1 : 1;
				x += (event.deltaX * direction) / z;
				y += (event.deltaY * direction) / z;
			}
			
			updateTransform();
		}
		
		// Track gesture state as we need it to compute the relative values to affect target state
		let lastGestureX = 0;
		let lastGestureY = 0;
		let lastGestureZ = 1;
		
		// Handle multi-touch gestures for pan/zoom
		function onGesture(event) {
			event.preventDefault();
			
			// Capture initial gesture state for next gesture event
			if(event.type === 'gesturestart')
			{
				lastGestureX = event.screenX;
				lastGestureY = event.screenY;
				lastGestureZ = event.scale;
			}
			
			// Now we can compute the differences
			else if(event.type === 'gesturechange')
			{
				let dx = event.screenX - lastGestureX;
				let dy = event.screenY - lastGestureY;
				x += dx / z;
				y += dy / z;
			}
			
			z *= 1.0 + (event.scale - lastGestureZ);
			
			// Capture gesture state for next offfset
			lastGestureX = event.screenX;
			lastGestureY = event.screenY;
			lastGestureZ = event.scale;
			
			updateTransform();
		}
		
		// Multi-touch
		let pointerState = 'none';
		let pointers = [];
		let panStart = { x: 0, y: 0, z: 0 };
		let panEnd = { x: 0, y: 0, z: 0 };
		let panDelta = { x: 0, y: 0, z: 0 };
		let panHasMoved = false;
		let mouse = { x: 0, y: 0, at: 0 };
		
		function onPointerDown(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			
			if(pointers.length === 0)
			{
				panHasMoved = false;
				root.setPointerCapture(event.pointerId);
				root.addEventListener('pointermove', onPointerMove, { capture: true });
				root.addEventListener('pointerup', onPointerUp, { capture: true });
			}
			
			pointers.push({
				identifier: event.pointerId,
				x: event.clientX,
				y: event.clientY,
			});
			
			switch(event.pointerType)
			{
				case 'touch': onTouchStart(event); break;
				case 'mouse': onMouseDown(event); break;
			}
		}
		
		function onPointerMove(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			
			let pointer = pointers.find(p => p.identifier === event.pointerId);
			if(pointer)
			{
				pointer.x = event.clientX;
				pointer.y = event.clientY;
			}
			
			switch(event.pointerType)
			{
				case 'touch': onTouchMove(event); break;
				case 'mouse': onMouseMove(event); break;
			}
		}
		
		function onPointerUp(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			
			let index = pointers.findIndex(p => p.identifier === event.pointerId);
			let pointer = pointers[index];
			if(pointer)
			{
				pointer.X = event.clientX;
				pointer.y = event.clientY;
			}
			pointers.splice(index, 1);
			
			switch(pointerState)
			{
				case 'pan':
					if(!panHasMoved)
					{
						let hit = document.elementFromPoint(event.clientX, event.clientY);
						// let click = new MouseEvent('click', {
						// 	bubbles: true,
						// 	cancelable: true,
						// 	clientX: event.clientX,
						// 	clientY: event.clientY,
						// });
						// hit.dispatchEvent(click);
						// hit.click();
						props.onTap?.({
							type: 'tap',
							timeStamp: performance.now(),
							target: hit,
						});
					}
					break;
			}
			
			props.onEnd?.();
			
			if(!pointers.length)
			{
				root.releasePointerCapture(event.pointerId);
				root.removeEventListener('pointermove', onPointerMove, { capture: true });
				root.removeEventListener('pointerup', onPointerUp, { capture: true });
				pointerState = 'none';
			}
			
			else
			{
				switch(event.pointerType)
				{
					case 'touch': onTouchStart(event); break;
					case 'mouse': onMouseDown(event); break;
				}
			}
		}
		
		function onTouchStart(event) {
			switch(pointers.length) {
				case 1:
				case 2:
					pointerState = 'pan';
					handleTouchStartPan(event);
					break;
				default:
					pointerState = 'none';
			}
			
			if(pointerState !== 'none') props.onStart?.();
		}
		
		function onTouchMove(event) {
			switch(pointerState)
			{
				case 'pan': handleTouchMovePan(event); break;
			}
		}
		
		function onMouseDown(event) {
			switch(event.button)
			{
				case 0: pointerState = 'pan'; break;
			}
			
			switch(pointerState)
			{
				case 'pan': handleMouseDownPan(event); break;
			}
		}
		
		function onMouseMove(event) {
			switch(pointerState)
			{
				case 'pan': handleMouseMovePan(event); break;
			}
		}
		
		
		function handleMouseDownPan(event) {
			panStart.x = event.clientX;
			panStart.y = event.clientY;
		}
		
		function handleMouseMovePan(event) {
			panEnd.x = event.clientX;
			panEnd.y = event.clientY;
			
			panDelta.x = panEnd.x - panStart.x;
			panDelta.y = panEnd.y - panStart.y;
			
			x += panDelta.x / z;
			y += panDelta.y / z;
			
			updateTransform();
			
			panStart.x = panEnd.x;
			panStart.y = panEnd.y;
			
			if(Math.abs(panDelta.x) > 1.5 || Math.abs(panDelta.y) > 1.5)
				panHasMoved = true;
		}
		
		function handleTouchStartPan(event) {
			switch(pointers.length)
			{
				case 1:
					panStart.x = pointers[0].x;
					panStart.y = pointers[0].y;
					panStart.z = 0;
					break;
				case 2:
					panStart.x = (pointers[0].x + pointers[1].x) * 0.5;
					panStart.y = (pointers[0].y + pointers[1].y) * 0.5;
					const dx = pointers[0].x - pointers[1].x;
					const dy = pointers[0].y - pointers[1].y;
					panStart.z = Math.sqrt(dx * dx + dy * dy);
					break;
			}
		}
		
		function handleTouchMovePan(event) {
			switch(pointers.length)
			{
				case 1:
					panEnd.x = pointers[0].x;
					panEnd.y = pointers[0].y;
					panEnd.z = 0;
					break;
				case 2:
					panEnd.x = (pointers[0].x + pointers[1].x) * 0.5;
					panEnd.y = (pointers[0].y + pointers[1].y) * 0.5;
					const dx = pointers[0].x - pointers[1].x;
					const dy = pointers[0].y - pointers[1].y;
					panEnd.z = Math.sqrt(dx * dx + dy * dy);
					break;
			}
			
			panDelta.x = panEnd.x - panStart.x;
			panDelta.y = panEnd.y - panStart.y;
			panDelta.z = (panEnd.z / panStart.z) || 1;
			
			x += panDelta.x / z;
			y += panDelta.y / z;
			z *= panDelta.z;
			
			updateTransform();
			
			panStart.x = panEnd.x;
			panStart.y = panEnd.y;
			panStart.z = panEnd.z;
			
			if(Math.abs(panDelta.x) > 1.5 || Math.abs(panDelta.y) > 1.5)
				panHasMoved = true;
			
			if(Math.abs(panDelta.z - 1) > 0.005)
				panHasMoved = true;
		}
		
		
		
		
		
		
		function handleZoomOut(event) {
			if(event.defaultPrevented) return;
			
			let targetLevel = z;
			for(let level of ZoomLevels)
			{
				if(level < z)
				{
					targetLevel = level
					break;
				}
			}
			
			z = targetLevel;
			updateTransform();
		}
		function handleZoomIn(event) {
			if(event.defaultPrevented) return;
			
			let targetLevel = z;
			let iter = ZoomLevels.length;
			while(iter --> 0)
			{
				let level = ZoomLevels[iter];
				if(level > z)
				{
					targetLevel = level
					break;
				}
			}
			
			z = targetLevel;
			updateTransform();
		}
		
		function onClick(event) {
			// if(event instanceof PointerEvent && event.pointerType === '')
			// {
			// 	event.preventDefault();
			// 	event.stopImmediatePropagation();
			// }
			
			console.log('[onClick]', {
				time: Math.round(event.timeStamp),
				prev: event.defaultPrevented,
				type: event instanceof PointerEvent? `PointerEvent.${event.pointerType}` : 'MouseEvent',
				target: event.target,
				event,
			});
		}
		
		
		function onMouseTrack(event) {
			mouse.at = event.timeStamp;
			mouse.x = event.screenX;
			mouse.y = event.screenY;
		}
		
		
		root.addEventListener('scroll', onScroll, { passive: false });
		document.addEventListener('wheel', onWheel, { passive: false });
		document.addEventListener('gesturestart', onGesture);
		document.addEventListener('gesturechange', onGesture);
		document.addEventListener('gestureend', onGesture);
		root.addEventListener('pointerdown', onPointerDown, { capture: true });
		root.addEventListener('pointercancel', onPointerUp, { capture: true });
		root.addEventListener('click', onClick, { capture: true });
		zoomOut.addEventListener('click', handleZoomOut);
		zoomIn.addEventListener('click', handleZoomIn);
		root.addEventListener('mousemove', onMouseTrack);
		
		updateTransform();
		
		return () => {
			root.removeEventListener('scroll', onScroll, { passive: false });
			document.removeEventListener('wheel', onWheel, { passive: false });
			document.removeEventListener('gesturestart', onGesture);
			document.removeEventListener('gesturechange', onGesture);
			document.removeEventListener('gestureend', onGesture);
			root.removeEventListener('pointerdown', onPointerDown, { capture: true });
			root.removeEventListener('pointercancel', onPointerUp, { capture: true });
			root.removeEventListener('click', onClick, { capture: true });
			zoomOut.removeEventListener('click', handleZoomOut);
			zoomIn.removeEventListener('click', handleZoomIn);
			
			sessionStorage.setItem(`${name}ScrollLeft`, -x);
			sessionStorage.setItem(`${name}ScrollTop`, -y);
			sessionStorage.setItem(`${name}Zoom`, z);
			
			target.style.transform = '';
			target.style.transformOrigin = '';
		};
	}, [
		referenceRoot.current,
		referenceTarget.current,
		referenceZoom.current,
		referenceZoomOut.current,
		referenceZoomIn.current
	]);
	
	return (
		<Tag
			class={classNames('pannable-grid', props.class)}
			ref={referenceRoot}
		>
			<div class="pan" ref={referenceTarget}>{props.children}</div>
			
			{/* <div style={{zoom}}>{props.children}</div> */}
			<div class="zoom">
				<button ref={referenceZoomOut} title="Make research smaller">-</button>
				{/* <output>{(Math.round(z * 1000) / 10)}%</output> */}
				<output ref={referenceZoom}>100%</output>
				<button ref={referenceZoomIn} title="Make research bigger">+</button>
			</div>
		</Tag>
	);
}