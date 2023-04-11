import { BufferStreamAssets, BufferStreamData, isValidUnityDataHeader } from './buffer.mjs';
import { RuntimePlatform, ItemTypes, RecipeType } from './constants.mjs';


export class TypeMetadata {
	unityVersion = "";
	targetPlatform = null;
	types = [];
	hasTypeTrees = false;
	
	constructor(file, stream) {
		this.unityVersion = stream.readString().toString();
		
		if(file.format >= 17) this.targetPlatform = RuntimePlatform.get(stream.readUInt32());
		else this.targetPlatform = RuntimePlatform.get(stream.readUInt8());
		
		this.hasTypeTrees = stream.readUInt8();
		
		let count = stream.readUInt32();
		for(let iter = 0; iter < count; ++iter)
		{
			let type = new Type_0D(file, stream, this, false);
			this.types.push(type);
		}
	}
}

export class Type_0D {
	classID;
	unknown;
	scriptIndex;
	scriptHash;
	typeHash;
	
	constructor(file, stream, tree, secondaryTypeTree = false) {
		this.classID = stream.readInt32();
		
		if(file.format >= 16) this.unknown = stream.readUInt8();
		this.scriptIndex = file.format >= 17? stream.readUInt16() : 0xFFFF;
		
		if(this.classID < 0 || this.classID == 0x72 || this.classID == 0x7C90B5B3 || /*this.scriptIndex > 0*/ this.scriptIndex <= 0x7FFF) // MonoBehaviour
			this.scriptHash = stream.read(16);
		
		this.typeHash = stream.read(16);
		
		if(tree.hasTypeTrees)
		{
			throw new Error('Type Tree parsing not implemented!');
			// Refer to https://github.com/SeriousCache/UABE/blob/edc33b430f58acfd5501535731a22edfc7440ec9/AssetsTools/AssetsFileFormat.cpp#L510
		}
	}
}

export class AssetFile {
	format = 0;
	metadataSize = 0;
	fileSize = 0;
	offsetFirstFile = 0;
	endianness = false;
	
	tree = null;
	assetCount = 0;
	assetTablePos = 0;
	preloads = [];
	dependencies = [];
	secondaryTypeList = [];
	
	constructor(stream) {
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
		this.tree = new TypeMetadata(this, stream);
		
		// Skip the asset file list for now
		this.assetTablePos = stream.pos;
		this.assetCount = stream.readUInt32();
		if(this.format >= 14 && this.assetCount > 0) stream.align(); // Align to byte packing
		stream.pos += AssetFileList.getSizeBytes(this);
		
		// Parse all the stuff
		this.parsePreloadTable(stream);
		this.parseDependencies(stream);
		this.parseSecondaryTypeList(stream);
	}
	
	parsePreloadTable(stream) {
		if(this.format < 11) return;
		
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
	
	parseDependencies(stream) {
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
	
	parseSecondaryTypeList(stream) {
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

export class AssetFileList {
	static getSizeBytes(file) {
		if(file.format < 15 || file.format > 16)
		{
			return file.assetCount * AssetFileInfo.getSize(file);
		}
		
		else if(file.assetCount === 0) return 0;
		
		else
		{
			let sizePerObject = AssetFileInfo.getSize(file);
			return ( (sizePerObject+3)&(~3) ) * (file.assetCount - 1) + sizePerObject;
		}
	}
}

export class AssetFileInfo {
	static getSize(file) {
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
	
	constructor(file, stream) {
		/// Parse binary data
		stream.align();
		let size = AssetFileInfo.getSize(file);
		let data = new BufferStreamAssets(stream.read(size), stream.isBigEndian);
		
		this.index = file.format >= 14? data.readUInt64() : data.readUInt32();
		this.offsetCurFile = file.format >= 22? data.readUInt64() : data.readUInt32();
		if(this.offsetCurFile > file.fileSize) throw new Error(`AssetFileInfo parsed with a file offset bigger than fileSize! ${this.offsetCurFile} > ${file.fileSize}`);
		this.curFileSize = data.readUInt32();
		this.curFileIndex = data.readUInt32();
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
			this.scriptIndex = 0xFFFF;
			return;
		}
		
		let type = file.tree.types[this.curFileIndex];
		if(type.scriptIndex <= 0x7FFF)
		{
			let scriptIndex = type.scriptIndex;
			if(scriptIndex > 0x7FFF) scriptIndex -= 0xFFFF;
			this.curFileType = -1 - scriptIndex;
			this.scriptIndex = type.scriptIndex;
		}
		
		else
		{
			this.curFileType = type.classID;
			this.scriptIndex = 0xFFFF
		}
		
		this.name = this.readName(stream);
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
	
	readName(stream) {
		let name = this.readNameField(stream);
		if(name) return name;
		return this.readNameData(stream);
	}
	
	readNameField(stream) {
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
	
	readNameData(stream) {
        let data = new BufferStreamData();
        data.buf = stream.buf;
        data.isBigEndian = stream.isBigEndian;
        data.pos = this.absolutePos;
		if(!isValidUnityDataHeader(data))return undefined;
		return data.readString().toString();
	}
}

export class AssetsFileTable {
	table = [];
	
	constructor(file, stream) {
		stream.pos = file.assetTablePos;
		
		let count = stream.readUInt32();
		if(!count) return;
		
		stream.align();
		
		for(let iter = 0; iter < count; ++iter)
		{
			let assetInfo = new AssetFileInfo(file, stream);
			this.table.push(assetInfo);
		}
	}
}




// .dat parser helper
export const TYPE = Symbol();
export function parseDataFile(data, shape) {
	function parseTyping(shape) {
		if(typeof shape === 'string' || shape[TYPE] !== 'object')
		{
			switch(shape[TYPE] || shape)
			{
				case 'string': return data.readString().toString();
				case 'int8': return data.readInt8();
				case 'int16': return data.readInt16();
				case 'int32': return data.readInt32();
				case 'int64': return data.readInt64();
				case 'uint8': return data.readUInt8();
				case 'uint16': return data.readUInt16();
				case 'uint32': return data.readUInt32();
				case 'uint64': return data.readUInt64();
				case 'float': return data.readFloat();
				case 'double': return data.readDouble();
				case 'bool': return data.readBool();
				case 'byte': return data.read(shape.size);
				case 'array': return data.readArray(() => parseTyping(shape.shape));
				case 'ItemType': return ItemTypes.get(data.readInt32());
				case 'RecipeType': return RecipeType.get(data.readInt32());
                case 'vector2': return [data.readFloat(), data.readFloat()];
				default: throw new Error(`Unknown shape ${JSON.stringify(shape)}`);
			}
		}
		
		else if(shape[TYPE] === 'object')
		{
			let obj = {};
			for(let key in shape) obj[key] = parseTyping(shape[key]);
			return obj;
		}
		
		else throw new Error(`Unknown shape: '${JSON.stringify(shape)}'`);
	}
	return parseTyping(shape);
}