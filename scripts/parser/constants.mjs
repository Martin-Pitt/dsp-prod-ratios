export const RuntimePlatform = new Map([
	[0, 'OSXEditor'],
	[1, 'OSXPlayer'],
	[2, 'WindowsPlayer'],
	[3, 'OSXWebPlayer'],
	[4, 'OSXDashboardPlayer'],
	[5, 'WindowsWebPlayer'],
	[7, 'WindowsEditor'],
	[8, 'IPhonePlayer'],
	[9, 'PS3'],
	[10, 'XBOX360'],
	[11, 'Android'],
	[12, 'NaCl'],
	[13, 'LinuxPlayer'],
	[15, 'FlashPlayer'],
	[17, 'WebGLPlayer'],
	[18, 'MetroPlayerX86'],
	[18, 'WSAPlayerX86'],
	[19, 'MetroPlayerX64'],
	[19, 'WSAPlayerX64'],
	[20, 'MetroPlayerARM'],
	[20, 'WSAPlayerARM'],
	[21, 'WP8Player'],
	[22, 'BB10Player'],
	[22, 'BlackBerryPlayer'],
	[23, 'TizenPlayer'],
	[24, 'PSP2'],
	[25, 'PS4'],
	[26, 'PSM'],
	[26, 'PSMPlayer'],
	[27, 'XboxOne'],
	[28, 'SamsungTVPlayer'],
]);

export const ItemTypes = new Map([
	[ 0, 'UNKNOWN'],
	[ 1, 'RESOURCE'],
	[ 2, 'MATERIAL'],
	[ 3, 'COMPONENT'],
	[ 4, 'PRODUCT'],
	[ 5, 'LOGISTICS'],
	[ 6, 'PRODUCTION'],
	[ 7, 'DECORATION'],
	[ 8, 'WEAPON'],
	[ 9, 'MATRIX'],
	[10, 'MONSTER'],
]);

export const RecipeType = new Map([
	[ 0, 'NONE'],
	[ 1, 'SMELT'],
	[ 2, 'CHEMICAL'],
	[ 3, 'REFINE'],
	[ 4, 'ASSEMBLE'],
	[ 5, 'PARTICLE'],
	[ 6, 'EXCHANGE'],
	[ 7, 'PHOTON_STORE'],
	[ 8, 'FRACTIONATE'],
	[15, 'RESEARCH'],
]);