let cellSize = 50;
let MAX_VELOCITY = 127;

class ChordChange
{
	chordSymbol = "";
	beatCount = 4;
	startTick = 0;
}

class ChordSequence{
	chords = [];

	parse(strChordProgression){
		let tokens = strChordProgression.split(" ");
		this.chords = [];
		for(let token of tokens)
		{
			if(token.indexOf(':') === -1)
			{
				let chordChange = new ChordChange();
				chordChange.chordSymbol = token;
				chordChange.beatCount = 4;
				this.chords.push(chordChange);
			}else{
				let splitToken = token.split(":");
				let chordChange = new ChordChange();
				chordChange.chordSymbol = splitToken[0];
				chordChange.beatCount = parseInt(splitToken[1]);
				this.chords.push(chordChange);
			}
		}

		return true;
	}

	getChordTickSchedule()
	{
		let response = [];
		let currentTick = 0;
		for(let chordChange of this.chords)
		{
			chordChange.startTick = currentTick;
			for(let tick=0;  tick<chordChange.beatCount*4;  tick++)
			{
				response.push(chordChange.chordSymbol);
				currentTick++;
			}
		}
		return response;
	}

	getTotalBeats()
	{
		let beatCount = 0;
		for(let chordChange of this.chords)
		{
			beatCount = beatCount + chordChange.beatCount;
		}

		return beatCount;
	}
}

SIXTEENTH = 1;
EIGTH = 2
QUARTER = 4
HALF = 8
WHOLE = 16

class ArpCell {
	tick = 0;
	value = 0;
	width = cellSize;
	height = cellSize;
	x = 0;
	y = 0;
	noteLength = SIXTEENTH;
}

class ArpRow {
	cells = [];
	instrumentNumber = 0;
	patchNumber = 0;
	instrumentName = '';
	level = 1;
	triadNote = '';

	clearRow(totalTicks) {
		for (let tick = 0; tick < totalTicks; tick++) {
			let currentCell = this.cells[tick];
			currentCell.value = 0;
		}
	}

	pattern1(totalTicks) {
		for (let tick = 0; tick < totalTicks; tick++) {
			let currentCell = this.cells[tick];
			if (tick % 4 === 0) {
				currentCell.value = MAX_VELOCITY;
			} else {
				currentCell.value = 0;
			}

		}
	}

	pattern2(totalTicks) {
		for (let tick = 0; tick < totalTicks; tick++) {
			let currentCell = this.cells[tick];
			if (tick % 8 === 4) {
				currentCell.value = MAX_VELOCITY;
			} else {
				currentCell.value = 0;
			}

		}
	}

	randomPattern(totalTicks) {
		for (let tick = 0; tick < totalTicks; tick++) {
			let currentCell = this.cells[tick];

			let r = Math.random();

			if (r < 0.2) {
				currentCell.value = MAX_VELOCITY;
			} else {
				currentCell.value = 0;
			}

		}
	}
}


ROOT_OF_TRIAD = 0;
SECOND_OF_TRIAD = 2;
THIRD_OF_TRIAD = 3;
FIFTH_OF_TRIAD = 5;

PIANO = 0;

class ArpModel {
	beats = 4;
	ticksPerBeat = 4;
	measureCount = 1;
	beatsPerMeasure = 4;
	instrumentCount = 0;
	rows = [];
	totalTicks = 0;
	bpm = 120;


	setup() {
		this.rows = [];

		this.setupInstrumentRow(4, "Fifth-2", FIFTH_OF_TRIAD, 2, PIANO);
		this.setupInstrumentRow(5, "Third-2", THIRD_OF_TRIAD, 2, PIANO);
		this.setupInstrumentRow(6, "2nd-2", SECOND_OF_TRIAD, 2, PIANO);
		this.setupInstrumentRow(7, "Root-2", ROOT_OF_TRIAD, 2, PIANO);


		this.setupInstrumentRow(8, "Fifth-1", FIFTH_OF_TRIAD, 1, PIANO);
		this.setupInstrumentRow(9, "Third-1", THIRD_OF_TRIAD, 1, PIANO);
		this.setupInstrumentRow(10, "2nd-1", SECOND_OF_TRIAD, 1, PIANO);
		this.setupInstrumentRow(11, "Root-1", ROOT_OF_TRIAD, 1, PIANO);

		this.instrumentCount = this.rows.length;
	}

	setupInstrumentRow(rowNumber, instrumentName, triadNote, level, patchNumber) {
		let row = new ArpRow();
		row.instrumentNumber = rowNumber; // row number
		row.patchNumber = patchNumber; // MIDI instrument used
		row.instrumentName = instrumentName; // Instrument name (i.e. piano )
		row.triadNote = triadNote;  // See ROOT_OF_TRIAD ... FIFTH_OF_TRIAD
		row.level = level; // Octave {1,2,3}
		this.rows.push(row);

		this.totalTicks = this.getTotalTicks();
		for (let t = 0; t < this.totalTicks; t++) {
			let cell = new ArpCell();
			cell.tick = t;
			cell.cellSize = cellSize;
			row.cells.push(cell);
		}
	}

	clearRows() {
		for (let row = 0; row < arpGridModel.instrumentCount; row++) {
			let aprRow = arpGridModel.rows[row];
			let totalTicks = this.getTotalTicks();
			aprRow.clearRow(totalTicks);
		}
	}

	getTotalTicks() {
		return this.measureCount * this.beatsPerMeasure * this.ticksPerBeat;
	}

	getMSFromBPM(bpm) {
		var numerator = 60 * 1000; // 60 seconds times 1000 measureCount
		var denominator = bpm * 4;
		var response = numerator / denominator;

		return response;
	}

	getInstrumentRowValue(intRowIndex, intTimeIndex) {
		let instrumentRow = this.rows[intRowIndex];
		if (!instrumentRow)
			throw new Error("InstrumentRow is not defined");

		let cell = instrumentRow.cells[intTimeIndex];
		if (!cell)
			throw new Error("Cell is not defined");

		return cell.value;
	}
}

class ArpGridView {
	timerInterval = 0;
	isPlaying = false;
	currentTick = 0;
	currentChordTick = 0;
	constructor(arpGridModel) {
		if (!arpGridModel) {
			throw new Error("arpGridModel is not defined");
		}

		this.arpGridModel = arpGridModel;
	}

	start() {
		this.enablePlayButton();
	}

	onPlay() {
		this.currentTick = 0;
		this.currentChordTick = 0;
		this.isPlaying = true;
		this.enableStopButton();
		this.onTick();
	}

	playInstrument(arpRowIndex) {
		//console.log(arpRowIndex);
		let arpRow = arpGridModel.rows[arpRowIndex] 
		let velocity = 127;
		let channel = 1;

		// check root 1 - play it if needed
		let octaveLevel = arpRow.level+3;

		let currentChord = chordSchedule[this.currentChordTick];
		const triad = Tonal.Chord.degrees(currentChord);
		let triad2 = [1, 2, 3].map(triad);


		let rootTone = triad2[0];
		let thirdTone = triad2[1];
		let fifthTone = triad2[2];

		if(arpRow.triadNote === ROOT_OF_TRIAD)
		{
			port.noteOn(channel, rootTone + octaveLevel, 127).wait(500).noteOff(channel, rootTone + octaveLevel);
		}

		// check 2nd - play it if needed
		if(arpRow.triadNote === SECOND_OF_TRIAD)
		{
			let rootTone2 = rootTone + octaveLevel;
			let rootToneNumber = Tonal.Note.midi(rootTone2);
			let secondTone = rootToneNumber - 10;

			port.noteOn(channel, secondTone, 127).wait(500).noteOff(channel, secondTone);
		}

		// check third - play it if needed
		if(arpRow.triadNote === THIRD_OF_TRIAD)
		{
			port.noteOn(channel, thirdTone + octaveLevel, 127).wait(500).noteOff(channel, thirdTone + octaveLevel);
		}

		// check fifth - play it if needed
		if(arpRow.triadNote === FIFTH_OF_TRIAD)
		{
			port.noteOn(channel, fifthTone + octaveLevel, 127).wait(500).noteOff(channel, fifthTone + octaveLevel);
		}

		
	}

	onHandleTimeTick() {
		// handle tick work ...
		this.visualizeTickRow();

		for (let instrument = 0; instrument < arpGridModel.instrumentCount; instrument++) {
			let cellValue = this.arpGridModel.getInstrumentRowValue(instrument, this.currentTick);
			if (cellValue > 0) 
			{
				this.playInstrument(instrument, cellValue);
			}
		}

		// move to next tick
		
		this.currentTick = this.currentTick + 1;
		let totalTicks = this.arpGridModel.getTotalTicks();
		if (this.currentTick >= totalTicks) {
			this.currentTick = 0;
		}

		this.currentChordTick++;
		if(this.currentChordTick >= chordSchedule.length)
		{
			this.currentChordTick = 0;
		}
	
	}

	visualizeTickRow() {
		const divTickVizRow = document.getElementById("divTickVizRow");
		for (let tick = 0; tick < this.arpGridModel.getTotalTicks(); tick++) {
			if (tick === this.currentTick) {
				divTickVizRow.children[tick].className = "spnTickActive";
			} else {
				divTickVizRow.children[tick].className = "spnTick";
			}
		}
	}

	onTick() {
		var txtTempo = document.getElementById("txtTempo");
		try {
			var bpm = parseInt(txtTempo.value)

			if (bpm < 50) {
				bpm = 100;
			}
			this.arpGridModel.bpm = bpm;
			this.timerInterval = this.arpGridModel.getMSFromBPM(bpm);
		}
		catch (e) {
			this.arpGridModel.bpm = 100;
			this.timerInterval = this.arpGridModel.getMSFromBPM(this.arpGridModel.bpm);
		}

		if (this.isPlaying) {
			this.onHandleTimeTick();
			setTimeout(() => this.onTick(), this.timerInterval)
		}
	}

	onStop() {
		this.isPlaying = false;
		this.enablePlayButton();
	}

	enablePlayButton() {
		var btnPlay = document.getElementById("btnPlay");
		btnPlay.disabled = false;
		var btnStop = document.getElementById("btnStop");
		btnStop.disabled = true;
	}

	enableStopButton() {
		var btnPlay = document.getElementById("btnPlay");
		btnPlay.disabled = true;
		var btnStop = document.getElementById("btnStop");
		btnStop.disabled = false;
	}

	render() {
		var divRowsContainers = document.createElement("div");
		for (let rowIndex = 0; rowIndex < this.arpGridModel.instrumentCount; rowIndex++) {
			let arpRow = this.arpGridModel.rows[rowIndex];
			this.makeGridRow(arpRow, rowIndex, divRowsContainers);
		}

		// make tick visualization row ..
		let divTickVizRow = this.makeTickVisualizationRow();

		let divGrid = document.getElementById("divGrid");
		divGrid.appendChild(divTickVizRow);
		divGrid.appendChild(divRowsContainers);
	}

	updateView() {

		for (let row = 0; row < arpGridModel.instrumentCount; row++) {
			let arpRow = arpGridModel.rows[row];
			let totalTicks = arpGridModel.getTotalTicks();
			for (let tick = 0; tick < totalTicks; tick++) {
				let currentCell = arpRow.cells[tick];
				let element = currentCell.parentElement;
				if (currentCell.value > 0) {
					element.className = 'spnTrackCell spnCellSelected';
				}
				else {
					element.className = 'spnTrackCell spnCellNotSelected';
				}
			}
		}
	}

	makeTickVisualizationRow() {
		var divRow = document.createElement("div");
		divRow.setAttribute("id", "divTickVizRow");

		for (let cell = 0; cell < this.arpGridModel.totalTicks; cell++) {
			const spnTick = document.createElement("span");
			spnTick.className = "spnTick";
			divRow.appendChild(spnTick);
		}

		return divRow;
	}

	makeGridRow(arpRow, rowIndex, divRowsContainers) {
		var divRow = document.createElement("div");
		divRow.arpRow = arpRow;
		var divLeft = document.createElement("div");
		divLeft.arpRow = arpRow;
		divLeft.innerHTML = `
		${arpRow.instrumentName}
		<button onclick='onRowClear(this)'>Clear</button>
		<button onclick='onPattern1(this)'>1</button>
		<button onclick='onPattern2(this)'>2</button>
		<button onclick='onRandomPattern(this)'>Rnd</button>
		`;
		divRow.appendChild(divLeft);
		for (let cell = 0; cell < this.arpGridModel.totalTicks; cell++) {
			let arpCell = arpRow.cells[cell];
			this.makeCell(arpCell, divRow);
		}

		divRowsContainers.appendChild(divRow);
	}

	makeCell(arpCell, divRow) {
		const divCell = document.createElement("span");
		divCell.arpCell = arpCell;
		divCell.className = "spnTrackCell spnCellNotSelected";
		divCell.arpCell.parentElement = divCell;
		divCell.onclick = function (ev) {
			let element = ev.srcElement;
			if (element.arpCell.value === 0) {
				element.arpCell.value = MAX_VELOCITY;
				element.className = 'spnTrackCell spnCellSelected';
			}
			else {
				element.arpCell.value = 0;
				element.className = 'spnTrackCell spnCellNotSelected';
			}
		}
		divRow.appendChild(divCell);
	}

}

function onPlay() {
	setupChordProgression();
	arpGridView.onPlay();
}

function onClear() {
	arpGridModel.clearRows();
	arpGridView.updateView()
}

function onStop() {
	arpGridView.onStop();
}

function onDumpModel() {
	console.log(arpGridModel);
}

let arpGridModel;
let arpGridView;
let port
let chordSchedule

function setupChordProgression()
{
	let chordSequence = new ChordSequence();
	let txtChordProgression = document.getElementById("txtChordProgression");
	chordSequence.parse(txtChordProgression.value);

	chordSchedule = chordSequence.getChordTickSchedule();
	console.log(chordSequence.chords)
}

function bodyOnLoad() {
	// setup chord progression
	setupChordProgression();

	// setup arp model
	arpGridModel = new ArpModel();
	arpGridModel.setup();
	arpGridView = new ArpGridView(arpGridModel);
	arpGridView.render();
	arpGridView.start();

	// setup synth

	var synth = JZZ.synth.Tiny();
	var s1 = synth.getSynth(1);
	synth.setSynth(0, s1);

	//JZZ.synth.Tiny.register('Web Audio');

	//port = JZZ().openMidiOut('Web Audio');
	port = synth;
}

function onRowClear(srcElement) {
	let totalTicks = arpGridModel.getTotalTicks();
	srcElement.parentElement.arpRow.clearRow(totalTicks);
	arpGridView.updateView();
}

function onPattern1(srcElement) {
	let totalTicks = arpGridModel.getTotalTicks();
	srcElement.parentElement.arpRow.pattern1(totalTicks);
	arpGridView.updateView();
}

function onPattern2(srcElement) {
	let totalTicks = arpGridModel.getTotalTicks();
	srcElement.parentElement.arpRow.pattern2(totalTicks);
	arpGridView.updateView();
}

function onRandomPattern(srcElement) {
	let totalTicks = arpGridModel.getTotalTicks();
	srcElement.parentElement.arpRow.randomPattern(totalTicks);
	arpGridView.updateView();
}

