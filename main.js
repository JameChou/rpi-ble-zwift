let bleno = require('bleno');

let characteristics = require('./characteristic');

let BlenoPrimaryService = bleno.PrimaryService;


bleno.on('stateChange', function(state) {
	console.log('on -> stateChange: ' + state);

	if (state === 'poweredOn') {
		bleno.startAdvertising('james zwift', ['1801', '1800', '1814']);
	} else {
		bleno.stopAdvertising();
	}
});

bleno.on('advertisingStart', function(error) {
	console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

	if (!error) {
		bleno.setServices([
			new BlenoPrimaryService(
				{
					uuid: '1801',
					characteristics: [
						new characteristics.AttributeCharacteristic()
					]
				}),
			new BlenoPrimaryService(
				{
					uuid: '1800',
					characteristics: [
						new characteristics.DeviceCharacteristic(),
						new characteristics.AppearanceCharacteristic(),
						new characteristics.CentralAddressResolutionCharacteristic()
					]
				}),
			new BlenoPrimaryService(
				{
					uuid: '1814',
					characteristics: [
						new characteristics.RSCMeasurementCharacteristic(),
						new characteristics.RSCFeatureCharacteristic()
					]
				})
		]);

	}
});
