export default function AboutUs() {
	const $aboutUs = document.createElement('aboutus');
	$aboutUs.innerHTML = `
		<div class="vh-100 d-flex flex-column align-items-center justify-content-center text-center">
			<h1 class="text-white">About Me</h1>
			<p class="text-white">I am Luis Pereira, a student at 42Porto working on my last project. I've made changes to most of the sound effects, unrwapped and textured the ships and developed the games.</p>
			<p class="text-white">Apologies for the mistakes, the learning curve is always steep!</p>
			<p class="text-white">You can find my projects on <a href="https://github.com/lubuper" target="_blank">GitHub</a>.</p>
			<h4 class="text-white">Special thanks to the authors of the models, textures and sound effects modified or/and used in this project:</h4>
			<p class="text-white"><br>dklon
			<br>NenadSimic
			<br>Bogardt VGM - https://www.facebook.com/BogartVGM/
			<br>iamoneabe
			<br>pauliuw
			<br>AntumDeluge
			<br>contact@solarsystemscope.com
			<br>rubberduck
			</p>
			<div class="mt-4">
				<p class="text-white">BlaBlaBla</p>
			</div>
			<button class="btn btn-purple btn-lg text-white shadow-lg mt-3" onclick="window.history.back()">Go Back</button>
		</div>
	`
	return $aboutUs
}