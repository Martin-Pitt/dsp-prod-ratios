"use strict";

BigInt.prototype.toJSON = function () {
	if(this < Number.MAX_SAFE_INTEGER) return Number(this);
	else return this.toString();
};


export default class BufferStream {
	constructor(buf, isBigEndian = true) {
		this.pos = 0;
		this.buf = Buffer.from(buf);
		this.isBigEndian = isBigEndian;
	}
	
	read(length) {
		let part = Buffer.from(this.buf.slice(this.pos, this.pos + length));
		this.pos += length;
		return part;
	}
	
	readInt8() {
		let val = this.buf.readInt8(this.pos);
		this.pos += 1;
		return val;
	}
	
	readInt16() {
		let val;
		if(this.isBigEndian) val = this.buf.readInt16BE(this.pos);
		else val = this.buf.readInt16LE(this.pos);
		this.pos += 2;
		return val;
	}
	
	readInt32() {
		let val;
		if(this.isBigEndian) val = this.buf.readInt32BE(this.pos);
		else val = this.buf.readInt32LE(this.pos);
		this.pos += 4;
		return val;
	}
	
	readInt64() {
		let val;
		if(this.isBigEndian) val = this.buf.readBigInt64BE(this.pos);
		else val = this.buf.readBigInt64LE(this.pos);
		this.pos += 4;
		return val;
	}
	
	readUInt8() {
		let val = this.buf.readUInt8(this.pos);
		this.pos += 1;
		return val;
	}
	
	readUInt16() {
		let val;
		if(this.isBigEndian) val = this.buf.readUInt16BE(this.pos);
		else val = this.buf.readUInt16LE(this.pos);
		this.pos += 2;
		return val;
	}
	
	readUInt32() {
		let val;
		if(this.isBigEndian) val = this.buf.readUInt32BE(this.pos);
		else val = this.buf.readUInt32LE(this.pos);
		this.pos += 4;
		return val;
	}
	
	readUInt64() {
		let val;
		if(this.isBigEndian) val = this.buf.readBigUInt64BE(this.pos);
		else val = this.buf.readBigUInt64LE(this.pos);
		this.pos += 4;
		return val;
	}
	
	readFloat() {
		let val;
		if(this.isBigEndian) val = this.buf.readFloatBE(this.pos);
		else val = this.buf.readFloatLE(this.pos);
		this.pos += 4;
		return val;
	}
	
	readDouble() {
		let val;
		if(this.isBigEndian) val = this.buf.readDoubleBE(this.pos);
		else val = this.buf.readDoubleLE(this.pos);
		this.pos += 8;
		return val;
	}
	
	readBool() {
		return this.readInt32();
	}
	
	readString() {
		let length = this.readInt32();
		let string = this.read(length);
		if(length & 3) this.read(-length & 3);
		return string;
	}
	
	readArray(callback) {
		let results = [];
		let length = this.readInt32();
		for(let index = 0; index < length; ++index)
		{
			let result = callback(index, length);
			results.push(result);
		}
		return results;
	}
	
	// readString() {
	// 	let nextNull = this.buf.indexOf(0, this.pos);
	// 	if(nextNull === -1) return null;

	// 	let part = this.buf.slice(this.pos, nextNull)
	// 	this.pos = nextNull + 1;
	// 	return part;
	// }
	
	// align(size) {
	// 	if(this.pos % size !== 0) {
	// 		this.pos += size - (this.pos % size);
	// 	}
	// }
}