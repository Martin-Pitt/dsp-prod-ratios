// const { readFileSync } = require('fs');
// const { writeFile } = require('fs/promises');
// const BufferStream = require('unity-parser/BufferStream');

import { readFile, writeFile } from 'fs/promises';
import BufferStream from './buffer.mjs';





const RuntimePlatform = new Map([
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

class TypeMetadata {
	unityVersion = "";
	targetPlatform = null;
	types = [];
	hasTypeTrees = false;
	
	load() {
		this.unityVersion = stream.readString().toString();
		
		if(file.format >= 17) this.targetPlatform = RuntimePlatform.get(stream.readUInt32());
		else this.targetPlatform = RuntimePlatform.get(stream.readUInt8());
		
		this.hasTypeTrees = stream.readUInt8();
		
		let count = stream.readUInt32();
		for(let iter = 0; iter < count; ++iter) {
			let type = new Type_0D();
			this.types.push(type);
		}
	}
}

class Type_0D {
	classID;
	unknown;
	scriptIndex;
	scriptHash;
	typeHash;
	
	constructor(secondaryTypeTree = false) {
		this.classID = stream.readInt32();
		
		if(file.format >= 16) this.unknown = stream.readUInt8();
		this.scriptIndex = file.format >= 17? stream.readUInt16() : 0xFFFF;
		
		if(this.classID < 0 || this.classID == 0x72 || this.classID == 0x7C90B5B3 || /*this.scriptIndex > 0*/ this.scriptIndex <= 0x7FFF) // MonoBehaviour
			this.scriptHash = stream.read(16);
		
		this.typeHash = stream.read(16);
		
		if(file.tree.hasTypeTrees)
		{
			throw new Error('Type Tree parsing not implemented!');
			// Refer to https://github.com/SeriousCache/UABE/blob/edc33b430f58acfd5501535731a22edfc7440ec9/AssetsTools/AssetsFileFormat.cpp#L510
		}
	}
}

class AssetFile {
	format = 0;
	metadataSize = 0;
	fileSize = 0;
	offsetFirstFile = 0;
	endianness = false;
	
	tree = new TypeMetadata();
	assetCount = 0;
	assetTablePos = 0;
	preloads = [];
	dependencies = [];
	secondaryTypeList = [];
	
	load() {
		/// Read header
		stream.isBigEndian = true;
		stream.pos += 8;
		let format = stream.readUInt32();
		stream.pos += 4;
		
		if(format >= 22)
		{
			this.format = format;
			this.metadataSize = Number(stream.readUInt64());
			this.fileSize = Number(stream.readUInt64());
			this.offsetFirstFile = Number(stream.readUInt64());
			this.endianness = stream.readUInt32();
			stream.read(4); // Padding
		}
		
		else
		{
			stream.pos -= 16;
			this.metadataSize = stream.readUInt32();
			this.fileSize = stream.readUInt32();
			this.format = stream.readUInt32();
			this.offsetFirstFile = stream.readUInt32();
			this.endianness = stream.readUInt32();
		}
		
		stream.isBigEndian = !!this.endianness;
		
		
		
		/// Read body
		
		// TypeTree
		this.tree.load();
		
		// Skip asset file list
		this.assetTablePos = stream.pos;
		let tempList = new AssetFileList();
		this.assetCount = stream.readUInt32();
		if(this.format >= 14 && this.assetCount > 0) stream.align(); // Align to byte packing
		stream.pos += AssetFileList.getSizeBytes();
		
		// Preload table
		this.readPreloadTable();
		
		// Dependencies
		this.readDependencies();
		
		// Secondary Type List
		this.readSecondaryTypeList();
	}
	
	readPreloadTable() {
		if(this.format >= 11)
		{
			let count = stream.readUInt32();
			if(count > 2000) throw new Error(`Ridiculous amount of preloads (${count})`);
			
			for(let index = 0; index < count; ++index)
			{
				let preload = { fileID: stream.readUInt32(), pathID: null, };
				
				if(this.format >= 14)
				{
					stream.align();
					preload.pathID = stream.readUInt64();
				}
				else
				{
					preload.pathID = stream.readUInt32();
				}
				
				this.preloads.push(preload);
			}
		}
	}
	
	readDependencies() {
		let count = stream.readUInt32();
		if(count <= 0) return;
		
		for(let index = 0; index < count; ++index)
		{
			let dependency = {};
			dependency.bufferedPath = stream.readString().toString();
			dependency.guid = {
				mostSignificant: stream.read(8),
				leastSignificant: stream.read(8),
			};
			dependency.type = stream.readUInt32();
			dependency.assetPath = stream.readString().toString();
			this.dependencies.push(dependency);
		}
	}
	
	readSecondaryTypeList() {
		if(this.format < 20) return;
		
		let count = stream.readUInt32();
		if(!count) return;
		
		for(let iter = 0; iter < count; ++iter)
		{
			let type = new Type_0D();
			this.secondaryTypeList.push(type);
		}
	}
}

class AssetFileList {
	static getSizeBytes() {
		if(file.format < 15 || file.format > 16)
		{
			return file.assetCount * AssetFileInfo.getSize();
		}
		
		else if(file.assetCount === 0) return 0;
		
		else
		{
			let sizePerObject = AssetFileInfo.getSize();
			return ( (sizePerObject+3)&(~3) ) * (file.assetCount - 1) + sizePerObject;
		}
	}
}

class AssetFileInfo {
	static getSize() {
		if(file.format >= 22) return 24;
		else if(file.format >= 17) return 20;
		else if(file.format >= 16) return 23;
		else if(file.format >= 15) return 25;
		else if(file.format == 14) return 24;
		else if(file.format >= 11) return 20;
		else return 20;
	}
	
	// Data
	index;
	offsetCurFile;
	curFileSize;
	curFileIndex;
	
	// Extended
	absolutePos;
	curFileType;
	name;
	
	load() {
		/// Parse binary data
		stream.align();
		let size = AssetFileInfo.getSize();
		let data = new BufferStream(stream.read(size));
		data.isBigEndian = stream.isBigEndian;
		
		this.index = file.format >= 14? data.readUInt64() : data.readUInt32();
		this.offsetCurFile = file.format >= 22? data.readUInt64() : data.readUInt32();
		// if(this.offsetCurFile > file.fileSize) throw new Error(`AssetFileInfo parsed with a file offset bigger than fileSize! ${this.offsetCurFile} > ${file.fileSize}`);
		this.curFileSize = data.readUInt32();
		this.curFileIndex = data.readUInt32();
		if(file.format < 16) this.inheritedUnityClass = data.read(2);
		if(file.format < 11) data.pos += 2;
		if(file.format >= 11 && file.format <= 16)
			this.scriptIndex = data.read(2);
		if(file.format >= 15 && file.format <= 16)
			this.unknown = data.read(1);
		
		
		/// Extension
		this.absolutePos = file.offsetFirstFile + this.offsetCurFile;
		
		if(file.format < 16)
		{
			this.curFileType = this.curFileIndex;
			return;
		}
		
		if(this.curFileIndex >= file.tree.types.length)
		{
			this.curFileType = 0x80000000;
			this.inheritedUnityClass = 0xFFFF;
			this.scriptIndex = -1; // 0xFFFF
			return;
		}
		
		let type = file.tree.types[this.curFileIndex];
		if(/*type.scriptIndex >= 0*/ type.scriptIndex <= 0x7FFF)
		{
			// pFileInfoEx[i].curFileType = (int)(-1 - (int)pFile->typeTree.pTypes_Unity5[pFileInfoEx[i].curFileTypeOrIndex].scriptIndex);
			let scriptIndex = type.scriptIndex;
			if(scriptIndex > 0x7FFF) scriptIndex -= 0xFFFF;
			this.curFileType = -1 - scriptIndex;
			
			// pFileInfoEx[i].inheritedUnityClass = (uint16_t)classId;
			
			// pFileInfoEx[i].scriptIndex = pFile->typeTree.pTypes_Unity5[pFileInfoEx[i].curFileTypeOrIndex].scriptIndex;
			this.scriptIndex = type.scriptIndex;
		}
		
		else
		{
			this.curFileType = type.classID;
			// this.inheritedUnityClass = type.classID;
			this.scriptIndex = 0xFFFF
		}
		
		this.name = this.readName();
	}
	
	static hasName(type) {
		switch (type)
		{
			case 21:
			case 27:
			case 28:
			case 43:
			case 48:
			case 49:
			case 62:
			case 72:
			case 74:
			case 83:
			case 84:
			case 86:
			case 89:
			case 90:
			case 91:
			case 93:
			case 109:
			case 115:
			case 117:
			case 121:
			case 128:
			case 134:
			case 142:
			case 150:
			case 152:
			case 156:
			case 158:
			case 171:
			case 184:
			case 185:
			case 186:
			case 187:
			case 188:
			case 194:
			case 200:
			case 207:
			case 213:
			case 221:
			case 226:
			case 228:
			case 237:
			case 238:
			case 240:
			case 258:
			case 271:
			case 272:
			case 273:
			case 290:
			case 319:
			case 329:
			case 363:
			case 850595691:
			case 1480428607:
			case 687078895:
			case 825902497:
			case 2083778819:
			case 1953259897:
			case 2058629509:
				return true;
			default:
				return false;
		}
	}
	
	readName() {
		if(!AssetFileInfo.hasName(this.curFileType)) return undefined;
		
		let lastPos = stream.pos;
		stream.pos = this.absolutePos;
		
		let nameSize = stream.readUInt32();
		if(nameSize + 4 >= this.curFileSize || nameSize >= 4092)
		{
			stream.pos = lastPos;
			return undefined;
		}
		
		let name = stream.read(nameSize);
		for(const byte of name)
			if(byte < 32) {
				stream.pos = lastPos;
				return undefined;
			}
		
		stream.pos = lastPos;
		return name.toString();
	}
}

class AssetsFileTable {
	table = [];
	
	constructor() {
		stream.pos = file.assetTablePos;
		
		let count = stream.readUInt32();
		if(!count) return;
		
		stream.align();
		
		for(let iter = 0; iter < count; ++iter)
		{
			let assetInfo = new AssetFileInfo();
			assetInfo.load();
			this.table.push(assetInfo);
		}
	}
}




let buf = await readFile('resources.assets');
let stream = new BufferStream(buf);




let file = new AssetFile();
file.load();


let assetsTable = new AssetsFileTable();

console.log(assetsTable.table);

let asset = assetsTable.table.find(asset => asset.index === 40943n);
console.log(asset);

stream.pos = asset.absolutePos;
console.log(stream.read(64));

// let nameSize = stream.readUInt32();
// let name = stream.read(nameSize);
// console.log(name);

// let ItemProtoSetAsset = assetsTable.table.find(asset => asset.name === 'ItemProtoSet');
// console.log(ItemProtoSetAsset);

// ItemProtoSet.dat




/*

class TypeTree {
	children = [];
	version = 0;
	is_array = false;
	size = 0;
	index = 0;
	flags = 0;
	type = null;
	name = null;
	
	load() {
		let num_nodes = stream.readUInt32();
		this.buffer_bytes = stream.readUInt32();
		let node_bytes = layout.format >= 19? 32 : 24;
		let node_data = new BufferStream(stream.read(node_bytes * num_nodes));
		this.data = stream.read(this.buffer_bytes);
		
		let curr;
		let parents = [this];
		for(let index = 0; index < num_nodes; ++index)
		{
			let version = node_data.readInt16();
			let depth = node_data.readUInt8();
			
			if(depth === 0) curr = this;
			else
			{
				while(parents.length > depth) parents.pop();
				curr = new TypeTree();
				parents[parents.length - 1].children.push(curr);
				parents.push(curr);
			}
			
			curr.version = version;
			curr.is_array = node_data.readUInt8();
			curr.type = node_data.readString().toString('ascii');
			curr.name = node_data.readString().toString('ascii');
			curr.size = node_data.readInt32();
			curr.index = node_data.readUInt32();
			curr.flags = node_data.readInt32();
			node_data.read(node_bytes - 24);
		}
	}
}

class ObjectInfo {
	load() {
		this.path_id = stream.read(8);
		this.data_offset = stream.readUInt32();
		this.size = [stream.readUInt32(), stream.read(4) ];
		this.type_id = stream.readUInt32();
		
		// console.log(stream.read(20));
		// console.log(object);
		
		// this.path_id = layout.format >= 14? stream.read(8) : stream.read(4);
		// this.data_offset = stream.readUInt32() + layout.data_offset;
		// this.size = stream.readUInt32();
		// if(layout.format < 17)
		// {
		// 	this.type_id = stream.readInt32();
		// 	this.class_id = stream.readInt16();
		// }
		// else
		// {
		// 	let type_id = stream.readInt32();
		// 	let class_id = file.tree.classIDs[type_id];
		// 	this.type_id = class_id;
		// 	this.class_id = class_id;
		// }
		
		// if(layout.format <= 10) this.is_destroyed = stream.readInt16();
		// if(layout.format >= 11 && layout.format <= 16) this.unk0 = stream.readInt16();
		// if(layout.format >= 15 && layout.format <= 16) this.unk1 = stream.read(1);
	}
}

class AssetRef {
	load() {
		if(layout.format >= 6)
		{
			this.bufferedPath = stream.readString().toString();
		}
		
		if(layout.format >= 5)
		{
			this.type = stream.readInt32();
		}
		
		this.assetPath = stream.readString().toString();
	}
}

// console.log(layout);



let file = {
	preloads: [],
	asset_refs: [],
	types: {},
	typenames: {},
	name: '',
	long_object_ids: false,
	tree: new TypeMetadata(),
};

file.tree.load();


// console.log(file.tree);


let asset_table_pos = stream.read(2);
let num_objects = stream.readUInt32();
// console.log({ num_objects });
// console.log(stream.read(32));


if(num_objects > 2000) return console.log('Ridiculous amount of objects');

const SKIP_OBJECTS = true;

if(SKIP_OBJECTS)
{
	if(layout.format >= 14 && num_objects > 0) stream.pos = (stream.pos + 3) & -4; // Align to byte packing
	
	let sizeBytes, size;
	
	if(layout.format >= 22) size = 24;
	else if(layout.format >= 17) size = 20;
	else if(layout.format >= 16) size = 23;
	else if(layout.format >= 15) size = 25;
	else if(layout.format == 14) size = 24;
	else if(layout.format >= 11) size = 20;
	else size = 20;
	
	if(layout.format < 15 || layout.format > 16)
	{
		sizeBytes = num_objects * size;
	}
	
	else
	{
		if(num_objects === 0) sizeBytes = 0;
		else
		{
			let sizePerObject = size;
			sizeBytes = ((sizePerObject+3)&(~3)) * (num_objects - 1) + sizePerObject;
		}
	}
	
	stream.pos += sizeBytes;
}

else
{
	for(let index = 0; index < num_objects; ++index)
	{
		if(layout.format >= 14) stream.pos = (stream.pos + 3) & -4; // Align to byte packing
		
		let obj = new ObjectInfo();
		obj.load();
		
		// register object??
	}
}







if(layout.format >= 11)
{
	let num_preloads = stream.readUInt32();
	if(num_preloads > 2000) return console.log(`Ridiculous amount of preloads (${num_preloads})`);
	
	for(let index = 0; index < num_preloads; ++index)
	{
		let preload = {
			fileID: stream.read(4),
			pathID: null,
		};
		
		if(layout.format >= 14)
		{
			stream.pos = (stream.pos + 3) & -4; // Align to byte packing
			preload.pathID = stream.read(8);
		}
		else
		{
			preload.pathID = stream.read(4);
		}
		
		file.preloads.push(preload);
		
		// let pathID = layout.format >= 14? stream.read(8) : stream.read(4);
		// file.preloads.push([fileID, pathID]);
	}
}


// console.log(stream.readUInt16()); // ??

// stream.read(4 * 26);
// console.log(stream.read(4 * 64));


if(layout.format >= 6)
{
	let num_refs = stream.readUInt32();
	if(num_refs > 100000) return console.log(`Ridiculous amount of refs (${num_refs})`);
	
	for(let index = 0; index < num_refs; ++index)
	{
		let ref = new AssetRef();
		ref.load();
		file.asset_refs.push(ref);
		
		console.log(ref);
		if(index > 6) return;
	}
}

// let unk_string = stream.readString().toString('ascii');


// console.log(file);



// let signature = stream.readString().toString("ascii");

// console.log({ signature });

// for(let iter = 0; iter < 20; ++iter)
// {
//     console.log(iter.toString().padStart(2), stream.readString().toString("ascii"));
// }

// let parsed = load(buf);
// let json = JSON.stringify(parsed, null, '\t');
// writeFile('resources.json', json);

// let layout = {
// 	metadata_size: null,
// 	file_size: null,
// 	assets_start: null,
// 	file_endianness: null,
// };
// let file = {
// 	types: new Map(),
// 	assets: [],
// 	references: [],
// 	previews: [],
// 	format: null,
// 	magic_int_2: null,
// 	magic_int_3: null,
// 	unity_version: null,
// 	layout,
// };


/*
/// Parse

/// Parse Header
parse_header(stream);
console.log(file);

file.magic_int_2 = stream.readInt32();
parse_types(stream);

if(file.magic_int_2 !== -2) {
	// fallback_types.add(1, std::unique_ptr<unity_type>(new unity_type(create_release_gameobject_type())));
	// fallback_types.add(114, std::unique_ptr<unity_type>(new unity_type(create_release_monobehaviour_type())));
	// fallback_types.add(115, std::unique_ptr<unity_type>(new unity_type(create_release_monoscript_type())));
}

file.magic_int_3 = stream.readInt32();
if(file.magic_int_3 !== 0) throw 'magic_int_3 should be zero';




function parse_header(stream) {
	layout.metadata_size = stream.readUInt32();
	layout.previews_start = stream.readUInt32();
	file.format = stream.readInt32();
	
	// if(file.format !== 9) throw 'format should be 9'; // Came out as 17?
	layout.assets_start = stream.readUInt32();
	layout.file_endianness = stream.readUInt32();
	file.unity_version = stream.readString().toString('ascii');
}


function parse_types(stream) {
	let types_count = stream.readUInt32();
	console.log({ types_count });
	for(let iter = 0; iter < types_count; ++iter) {
		let type_id = stream.readInt32();
		
		let expected_definition_index = { value: 0 };
		let type_member = parse_type_member(stream, expected_definition_index);
		if(type_member.name !== 'Base') throw 'Unexpected name for base type';
		file.types.set(type_id, type_member.type);
	}
}

function parse_type_member(stream, expected_definition_index) {
	let type_member = {
		type: {
			name: null,
			size: null,
			is_array: null,
			magic_int_1: null,
			magic_bitset_2: null,
			children: [],
		},
		name: null,
	};
	
	type_member.type.name = stream.readString().toString('ascii');
	type_member.name = stream.readString().toString('ascii');
	type_member.type.size = stream.readInt32();
	let definition_index = stream.readInt32();
	
	console.log(type_member, definition_index);
	
	if(definition_index !== expected_definition_index.value) throw `Unexpected definition index; ${definition_index} !== ${expected_definition_index.value}`;
	++expected_definition_index.value;
	type_member.type.is_array = stream.readInt32();
	type_member.type.magic_int_1 = stream.readInt32();
	type_member.type.magic_bitset_2 = stream.readUInt32();
	let children_count = stream.readUInt32();
	if(children_count > 0) {
		for(let index = 0; index < children_count; ++index) {
			type_member.type.children.push(parse_type_member(stream, expected_definition_index));
		}
	}
	return type_member;
}
*/

/*	
const std::uint32_t types_count(parser.parse<std::uint32_t>());
for (std::uint32_t index = 0; index < types_count; ++index) {
	std::int32_t type_id(parser.parse<std::int32_t>());
	std::int32_t expected_definition_index(0);
	unity_type_member type_member(parse_type_member(parser, expected_definition_index));
	if (type_member.name != "Base")
		throw parser_exception("unexpected name for base type");
	file.types.add(type_id, std::unique_ptr<unity_type>(new unity_type(type_member.type)));
}

*/

// file.file_layout.file_endianness = big_endian_parser.parse<bool>() ? endianness::big_endian : endianness::little_endian;
// big_endian_parser.align(4);
// file.unity_version = big_endian_parser.parse_string();







