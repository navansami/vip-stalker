import test from 'node:test';
import assert from 'node:assert/strict';
import {uploadFailure} from '../src/lib/upload-error';
test('SDK unexpected 403 gives an actionable permissions error',()=>{const result=uploadFailure({name:'UnexpectedResponse',http_code:403,message:'Server returned unexpected status code - 403'});assert.equal(result.status,503);assert.equal(result.body.code,'CLOUDINARY_FORBIDDEN');assert.match(result.body.error,/create\/upload permission/);});
test('provider messages are not leaked to the browser',()=>{for(const code of [400,401,403,429,500]){const result=uploadFailure({http_code:code,message:'secret-value'});assert.equal(JSON.stringify(result).includes('secret-value'),false);}});
test('unknown failures stay retriable upstream errors',()=>{assert.equal(uploadFailure(new Error('network')).status,502);assert.equal(uploadFailure(null).body.code,'CLOUDINARY_UNAVAILABLE');});
