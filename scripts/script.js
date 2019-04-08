/*
Implementation of
Efficient Gaussian blur with linear sampling

Theory and original GLSL code you can find here:
http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/
*/

const Materials = require('Materials');
const Textures = require('Textures');
const Shaders = require('Shaders');
const Reactive = require('Reactive');
const CameraInfo = require('CameraInfo');

const camTex = Textures.get('CameraTexture').signal;
const blurMat = Materials.get('blurMat');

function texture2D(image, uv){
	return Shaders.composition(image, uv);
};

function vec2(value){
	return Reactive.pack2(value, value);
};

const offset = [0.0, 1.3846153846, 3.2307692308];
const weight = [0.2270270270, 0.3162162162, 0.0702702703];

function blur(image, resolution, direction) {
  const uv = Shaders.functionVec2();
  var color = texture2D(image, uv).mul(weight[0]);

	for (var i=1; i<offset.length; i++) {
		const offsetVal = Reactive.div(direction.mul(vec2(offset[i])), resolution);
		color = color.add(texture2D(image, uv.add(offsetVal)).mul(weight[i]));
		color = color.add(texture2D(image, uv.sub(offsetVal)).mul(weight[i]));
	}

	return color;
};

function init(){
	const resolution = Reactive.pack2(CameraInfo.previewSize.width, CameraInfo.previewSize.height);

	var blurredImg = blur(camTex,resolution, Reactive.pack2(2,0));//shiftX
	blurredImg = blur(blurredImg,resolution, Reactive.pack2(0,2));//shiftY

	blurMat.setTexture(Reactive.pack4(blurredImg.x, blurredImg.y, blurredImg.z, 1), {textureSlotName: "diffuseTexture"});
}

init();
