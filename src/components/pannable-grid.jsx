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
				var s = Math.exp(-event.deltaY/100);
				z *= s;
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
		/*
		let pointerState = 'none';
		let pointers = [];
		let pointerPositions = {};
		let panHasMoved = false;
		let panStart = { x: 0, y: 0 };
		let panEnd = { x: 0, y: 0 };
		let panDelta = { x: 0, y: 0 };
		let zoomHasMoved = false;
		let zoomStart = { y: 0 };
		let zoomEnd = { y: 0 };
		let zoomDelta = { y: 0 };
		
		function addPointer(event) {
			pointers.push(event);
		}
		
		function removePointer(event) {
			delete pointerPositions[event.pointerId];
			let iter = pointers.length;
			while(iter --> 0)
			{
				if(pointers[iter].pointerId === event.pointerId) pointers.splice(iter, 1);
			}
		}
		
		function trackPointer(event) {
			let position = pointerPositions[event.pointerId];
			if(!position) position = pointerPositions[event.pointerId] = { x: 0, y: 0 };
			position.x = event.pageX;
			position.y = event.pageY;
		}
		
		function getSecondPointerPosition( event ) {
			const pointer = (event.pointerId === pointers[0].pointerId) ? pointers[1] : pointers[0];
			return pointerPositions[pointer.pointerId];
		}
		
		function onPointerDown(event) {
			event.preventDefault();
			
			if(pointers.length === 0)
			{
				panHasMoved = zoomHasMoved = false;
				root.setPointerCapture(event.pointerId);
				root.addEventListener('pointermove', onPointerMove);
				root.addEventListener('pointerup', onPointerUp);
			}
			
			addPointer(event);
			
			switch(event.pointerType)
			{
				case 'touch':
					onTouchStart(event);
					break;
				default:
					onMouseDown(event);
			}
		}
		
		function onPointerMove(event) {
			switch(event.pointerType)
			{
				case 'touch':
					onTouchMove(event);
					break;
				default:
					onMouseMove(event);
			}
		}
		
		function onPointerUp(event) {
			event.preventDefault();
			
			removePointer(event);
			
			if(pointers.length === 0)
			{
				root.releasePointerCapture(event.pointerId);
				root.removeEventListener('pointermove', onPointerMove);
				root.removeEventListener('pointerup', onPointerUp);
			}
			
			props.onEnd?.();
			
			switch(pointerState)
			{
				case 'pan':
					if(!panHasMoved)
					{
						let hit = document.elementFromPoint(event.clientX, event.clientY);
						let click = new MouseEvent('click', {
							bubbles: true,
							cancelable: true,
							clientX: event.clientX,
							clientY: event.clientY,
						});
						hit.dispatchEvent(click);
						props.onTap?.(event);
					}
					break;
				case 'zoom':
					if(!zoomHasMoved)
					{
						let hit = document.elementFromPoint(event.clientX, event.clientY);
						let click = new MouseEvent('click', {
							bubbles: true,
							cancelable: true,
							clientX: event.clientX,
							clientY: event.clientY,
						});
						hit.dispatchEvent(click);
						props.onTap?.(event);
					}
					break;
			}
			
			pointerState = 'none';
			// zoom.firstChild.nodeValue = pointerState;
		}
		
		function onTouchStart(event) {
			trackPointer(event);
			
			switch(pointers.length) {
				case 1:
					pointerState = 'pan';
					// zoom.firstChild.nodeValue = pointerState;
					handleTouchStartPan();
					break;
				case 2:
					pointerState = 'zoom';
					// zoom.firstChild.nodeValue = pointerState;
					handleTouchStartZoom();
					break;
				default:
					pointerState = 'none';
					// zoom.firstChild.nodeValue = pointerState;
			}
			
			if(state !== 'none') props.onStart?.();
		}
		function onTouchMove(event) {
			trackPointer(event);
			
			switch(pointerState) {
				case 'pan':
					handleTouchMovePan(event);
					break;
				case 'zoom':
					handleTouchMoveZoom(event);
					break;
				default:
					pointerState = 'none';
					// zoom.firstChild.nodeValue = pointerState;
			}
		}
		
		function onMouseDown(event) {
			switch(event.button) {
				case 0:
					pointerState = 'pan';
					// zoom.firstChild.nodeValue = pointerState;
					handleMouseDownPan(event);
					break;
				default:
					pointerState = 'none';
					// zoom.firstChild.nodeValue = pointerState;
			}
			
			if(state !== 'none') props.onStart?.();
		}
		function onMouseMove(event) {
			switch(pointerState) {
				case 'pan':
					handleMouseMovePan(event);
					break;
			}
		}
		
		function handleTouchStartPan() {
			if(pointers.length === 1)
			{
				panStart.x = pointers[0].pageX;
				panStart.y = pointers[0].pageY;
			}
			else
			{
				panStart.x = (pointers[0].pageX + pointers[1].pageX) * 0.5;
				panStart.y = (pointers[0].pageY + pointers[1].pageY) * 0.5;
			}
		}
		function handleTouchMovePan(event) {
			if(pointers.length === 1)
			{
				panEnd.x = event.pageX;
				panEnd.y = event.pageY;
			}
			else
			{
				let position = getSecondPointerPosition(event);
				panEnd.x = (event.pageX + position.x) * 0.5;
				panEnd.y = (event.pageY + position.y) * 0.5;
			}
			
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
		
		function handleTouchStartZoom() {
			zoomStart.y = Math.abs(pointers[0].pageY - pointers[1].pageY);
			zoom.firstChild.nodeValue = `${zoomStart.y.toFixed(1)}`;
			
			// if(pointers.length === 1)
			// {
			// 	zoomStart.y = pointers[0].pageY;
			// }
			
			// else
			// {
			// 	zoomStart.y = (pointers[0].pageY + pointers[1].pageY) * 0.5;
			// }
		}
		function handleTouchMoveZoom(event) {
			const position = getSecondPointerPosition(event);
			
			
			zoomEnd.y = Math.abs(event.pageY - position.y);
			zoomDelta.y = zoomEnd.y / zoomStart.y;
			// zoom.firstChild.nodeValue = `${zoomEnd.y.toFixed(2)} / ${zoomStart.y.toFixed(2)}`;
			
			z *= zoomDelta.y;
			updateTransform();
			
			zoomStart.y = zoomEnd.y;
			
			if(Math.abs(zoomDelta.y - 1) > 0.005)
				zoomHasMoved = true;
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
		*/
		
		let pointerState = 'none';
		let pointers = [];
		let panStart = { x: 0, y: 0, z: 0 };
		let panEnd = { x: 0, y: 0, z: 0 };
		let panDelta = { x: 0, y: 0, z: 0 };
		let panHasMoved = false;
		
		function onPointerDown(event) {
			// console.log('[onPointerDown]', event.pointerId, event.pointerType);
			event.preventDefault();
			
			if(pointers.length === 0)
			{
				panHasMoved = false;
				root.setPointerCapture(event.pointerId);
				root.addEventListener('pointermove', onPointerMove);
				root.addEventListener('pointerup', onPointerUp);
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
			// console.log('[onPointerMove]');
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
			// console.log('[onPointerUp]', event.pointerId, event.pointerType);
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
						let click = new MouseEvent('click', {
							bubbles: true,
							cancelable: true,
							clientX: event.clientX,
							clientY: event.clientY,
						});
						hit.dispatchEvent(click);
						props.onTap?.(event);
					}
					break;
			}
			
			props.onEnd?.();
			
			if(!pointers.length)
			{
				root.releasePointerCapture(event.pointerId);
				root.removeEventListener('pointermove', onPointerMove);
				root.removeEventListener('pointerup', onPointerUp);
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
			// console.log('[onTouchStart]');
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
			// console.log('[onTouchMove]');
			switch(pointerState)
			{
				case 'pan': handleTouchMovePan(event); break;
			}
		}
		
		function onMouseDown(event) {
			// console.log('[onMouseDown]');
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
			// console.log('[onMouseMove]');
			switch(pointerState)
			{
				case 'pan': handleMouseMovePan(event); break;
			}
		}
		
		
		function handleMouseDownPan(event) {
			// console.log('[handleMouseDownPan]');
			panStart.x = event.clientX;
			panStart.y = event.clientY;
		}
		
		function handleMouseMovePan(event) {
			// console.log('[handleMouseMovePan]');
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
			// console.log('[handleTouchStartPan]');
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
			// console.log('[handleTouchMovePan]');
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
			if(event instanceof PointerEvent) event.preventDefault();
		}
		
		
		root.addEventListener('scroll', onScroll, { passive: false });
		document.addEventListener('wheel', onWheel, { passive: false });
		document.addEventListener('gesturestart', onGesture);
		document.addEventListener('gesturechange', onGesture);
		document.addEventListener('gestureend', onGesture);
		root.addEventListener('pointerdown', onPointerDown);
		root.addEventListener('pointercancel', onPointerUp);
		root.addEventListener('click', onClick, { capture: true });
		zoomOut.addEventListener('click', handleZoomOut);
		zoomIn.addEventListener('click', handleZoomIn);
		
		updateTransform();
		
		return () => {
			root.removeEventListener('scroll', onScroll, { passive: false });
			document.removeEventListener('wheel', onWheel, { passive: false });
			document.removeEventListener('gesturestart', onGesture);
			document.removeEventListener('gesturechange', onGesture);
			document.removeEventListener('gestureend', onGesture);
			root.removeEventListener('pointerdown', onPointerDown);
			root.removeEventListener('pointercancel', onPointerUp);
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