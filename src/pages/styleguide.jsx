/*
Would be good to make a styleguide of all the DSP-like components.

Components…
	Item
	Recipe
	Button
	Keyboard Button (see starmap ESC button)
	Dropdown
	Checkbox
	Tabs
	Popups/Modals
		Frame
			Shaped frame holders in corners, can have window controls in top right
	Slider
	Range (decrement and increment buttons on side)
	Tooltip
		Frame
			like when hovering on toolbar or starmap stats; can have yellow title
		Recipe or Item
			Simple rounded frame; dark cyan background
		Hint
			Simple rounded with dark cyan background but has pointed arrow
		Starmap?
			When hovering over stars in starmap; edge has scifi deco
		Simple Rect
			When hovering a segment of the statistics pie
		Contents
			Simple drop shape from top left
			When hovering a rock, tree, vein, etc. Shows simple item icon with quantity
		Facility
			Shows a rect with header of facility icon+name
			Show inventory contents or yield
			Shows power generation/usage vs max gen/use
	Research tree (specifically the tech nodes and all their different styles)
	








Items and recipe rendering:
	<Item id={1203}/><br/>
	<Item id={1201} named/><br/>
	<Recipe id={31}/><br/>
	<Recipe id={20} named/><br/>
	<Recipe id={52} named/><br/>
	<Item id={1201} count={100}/><br/>
*/