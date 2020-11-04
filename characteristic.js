let util = require('util');
let bleno = require('bleno');
let utils = require('./utils');

let BlenoCharacteristic = bleno.Characteristic;

const DEVICE_NAME = 'James speed';
const APPEARANCE_NAME = 'speed and cascade';
const CENTRALADDRESSRESOLUTION_NAME = 'address resolution supported';

let secondsPerHour = 3600;
let secondsPerMinute = 60;

let kph = 12;
let cadence = 179;

function getWriteBuffer() {
	let metersPerSecond = kph ? kph * 1000 / secondsPerHour : 0,
		metersPerMinute = metersPerSecond * secondsPerMinute,
		metersPerSecondRounded = Math.round(metersPerSecond * 256),
		stepsPerMinute = Math.round(cadence),
		metersPerStep = (metersPerMinute && stepsPerMinute) ? metersPerMinute / stepsPerMinute : 0,
		metersPerStepRounded = Math.round(metersPerStep * 100),
		flags = {
			InstantaneousStrideLengthPresent: false,
			TotalDistancePresent: false,
			WalkingOrRunningStatusBits: kph >= 8,
			ReservedForFutureUse1: false,
			ReservedForFutureUse2: false,
			ReservedForFutureUse3: false,
			ReservedForFutureUse4: false,
			ReservedForFutureUse5: false
		};

	return utils
		.bufferHelper()
		.write(8, utils.convertFlags(flags))
		.write(16, metersPerSecondRounded)
		.write(8, stepsPerMinute)
		.finish();
};

// attribute characteristic
let AttributeCharacteristic = function () {
	AttributeCharacteristic.super_.call(this, {
		uuid: '2A05',
		properties: ['indicate'],
		value: null
	});
};

// device characteristic
let DeviceCharacteristic = function () {
	DeviceCharacteristic.super_.call(this, {
		uuid: '2A00',
		properties: ['read'],
		value: null
	});

	this._value = utils.bufferHelper().write(8, DEVICE_NAME).finish();
};

// appearance characteristic
let AppearanceCharacteristic = function () {
	AppearanceCharacteristic.super_.call(this, {
		uuid: '2A01',
		properties: ['read'],
		value: null
	});

	this._value = utils.bufferHelper().write(8, APPEARANCE_NAME).finish();
};

// central address resolution
let CentralAddressResolutionCharacteristic = function () {
	CentralAddressResolutionCharacteristic.super_.call(this, {
		uuid: '2AA6',
		properties: ['read'],
		value: null
	});

	this._value = utils.bufferHelper().write(8, CENTRALADDRESSRESOLUTION_NAME).finish();
};


// RSC Measurement
let RSCMeasurementCharacteristic = function () {
	RSCMeasurementCharacteristic.super_.call(this, {
		uuid: '2A53',
		properties: ['read', 'write', 'notify'],
		value: null
	});

	this._value = new Buffer(0);
	this._updateValueCallback = null;
};

RSCMeasurementCharacteristic.prototype.onReadRequest = function (offset, callback) {
	console.log('read request');
	console.log(callback);
	callback(this.RESULT_SUCCESS, getWriteBuffer());
};

RSCMeasurementCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
	console.log('wirte data request');
	console.log(data);
	this._value = data;

	if (this._updateValueCallback) {
		this._updateValueCallback(this._value);
	}
}

RSCMeasurementCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
	console.log('establish the bridge');
	this._updateValueCallback = updateValueCallback;
	this._updateValueCallback(getWriteBuffer());

	this._intervalId = setInterval(() => {
		this._updateValueCallback(getWriteBuffer());
	}, 500);
};

RSCMeasurementCharacteristic.prototype.onUnsubscribe = function () {
	console.log('remove the subscribe');
	if (this._intervalId) {
		clearInterval(this._intervalId);
		this._intervalId = null;
	}
};

// RSC Feature
let RSCFeatureCharacteristic = function () {
	let feature = Buffer.from('0000000000000000', 'binary');
	RSCFeatureCharacteristic.super_.call(this, {
		uuid: '2A54',
		properties: ['read'],
		value: feature,
		descriptors: []
	});
};

// inherit
util.inherits(AttributeCharacteristic, BlenoCharacteristic);
util.inherits(DeviceCharacteristic, BlenoCharacteristic);
util.inherits(AppearanceCharacteristic, BlenoCharacteristic);
util.inherits(CentralAddressResolutionCharacteristic, BlenoCharacteristic);
util.inherits(RSCMeasurementCharacteristic, BlenoCharacteristic);
util.inherits(RSCFeatureCharacteristic, BlenoCharacteristic);


module.exports = {
	AttributeCharacteristic: AttributeCharacteristic,
	DeviceCharacteristic: DeviceCharacteristic,
	AppearanceCharacteristic: AppearanceCharacteristic,
	CentralAddressResolutionCharacteristic: CentralAddressResolutionCharacteristic,
	RSCMeasurementCharacteristic: RSCMeasurementCharacteristic,
	RSCFeatureCharacteristic: RSCFeatureCharacteristic,
	getWriteBuffer: getWriteBuffer
};

