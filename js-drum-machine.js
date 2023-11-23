let cellSize = 50;
let instrumentCount = 7;

let MAX_VELOCITY = 127;

let BASS_DRUM = 36
let SNARE_DRUM = 38
let HIGH_HAT = 42
let TOM1 = 41
let TOM2 = 43
let TOM3 = 45
let TOM4 = 47

class DrumMachineCell
{
    tick = 0;
    value = 0;
    width = cellSize;
    height = cellSize;
    x = 0;
    y = 0;
}

class DrumMachineRow
{
    cells = [];
    instrumentNumber =0;
	patchNumber = 0;
	instrumentName = 0;

	clearRow(totalTicks)
	{
		let drumRow = this;
		for(let tick=0; tick<totalTicks;  tick++)
		{
			let currentCell = drumRow.cells[tick];
			currentCell.value = 0;
		}
	}

	pattern1(totalTicks)
	{
		let drumRow = this;
		for(let tick=0; tick<totalTicks;  tick++)
		{
			let currentCell = drumRow.cells[tick];
			if(tick % 4 === 0)
			{
				currentCell.value = MAX_VELOCITY;
			}else{
				currentCell.value = 0;
			}
			
		}
	}

	pattern2(totalTicks)
	{
		let drumRow = this;
		for(let tick=0; tick<totalTicks;  tick++)
		{
			let currentCell = drumRow.cells[tick];
			if(tick % 8 === 4)
			{
				currentCell.value = MAX_VELOCITY;
			}else{
				currentCell.value = 0;
			}
			
		}
	}

	pattern3(totalTicks)
	{
		let drumRow = this;
		for(let tick=0; tick<totalTicks;  tick++)
		{
			let currentCell = drumRow.cells[tick];
			if(tick % 2 === 0)
			{
				currentCell.value = MAX_VELOCITY;
			}else{
				currentCell.value = 0;
			}
			
		}
	}

	randomPattern(totalTicks)
	{
		
		let drumRow = this;
		for(let tick=0; tick<totalTicks;  tick++)
		{
			let currentCell = drumRow.cells[tick];

			let r = Math.random();
			
			if(r < 0.2)
			{
				currentCell.value = MAX_VELOCITY;
			}else{
				currentCell.value = 0;
			}
			
		}
	}
	

}

class DrumMachineModel
{
    beats = 4;
    ticksPerBeat = 4;
    measureCount = 1;
	beatsPerMeasure = 4;
    instrumentCount = 7;
    rows = [];
    totalTicks = 0;
	bpm = 120;

    setup()
    {
        this.rows = [];
        this.setupInstrumentRow(0, "Bass", BASS_DRUM);
        this.setupInstrumentRow(1, "Snare", SNARE_DRUM);
        this.setupInstrumentRow(2, "HighHat", HIGH_HAT);
        this.setupInstrumentRow(3, "Tom1", TOM1);
        this.setupInstrumentRow(4, "Tom2", TOM2);
        this.setupInstrumentRow(5, "Tom3", TOM3);
        this.setupInstrumentRow(6, "Tom4", TOM4);
    }

	setupInstrumentRow(rowNumber, instrumentName, patchNumber)
	{
		let row = new DrumMachineRow();
		row.instrumentNumber = rowNumber;
		row.patchNumber = patchNumber;
		row.instrumentName = instrumentName;
		this.rows.push(row);

		this.totalTicks = this.getTotalTicks();
		for (let t = 0; t < this.totalTicks; t++) {
			let cell = new DrumMachineCell();
			cell.tick = t;
			cell.cellSize = cellSize;
			row.cells.push(cell);
		}
	}

	clearRows()
	{
        for(let row=0;  row<drumGridModel.instrumentCount; row++)
        {
            let drumRow = drumGridModel.rows[row];
			let totalTicks = this.getTotalTicks();
			drumRow.clearRow(totalTicks);
        }  	
	}

	getTotalTicks()
	{
		return this.measureCount * this.beatsPerMeasure * this.ticksPerBeat;
	}

	getMSFromBPM(bpm){
		var numerator = 60 * 1000; // 60 seconds times 1000 measureCount
		var denominator = bpm * 4;
		var response = numerator / denominator;

		return response;	
	}

	getInstrumentRowValue(intInstrument, intTimeIndex)
	{
		let instrumentRow = this.rows[intInstrument];
		if(!instrumentRow)
			throw new Error("InstrumentRow is not defined");

		let cell = instrumentRow.cells[intTimeIndex];
		if(!cell)
			throw new Error("Cell is not defined");

		return cell.value;
	}
}


function onPlay(){
	drumGridView.onPlay();
}

function onClear()
{
	drumGridModel.clearRows();
	drumGridView.updateView()
}

function onStop(){
	drumGridView.onStop();
}

class DrumGridView
{
	timerInterval = 0;
	isPlaying = false;
	currentTick = 0;
    constructor(drumGridModel)
    {
		if(!drumGridModel)
		{
			throw new Error("drumGridModel is not defined");
		}

        this.drumGridModel = drumGridModel;
    }

	start()
	{
		this.enablePlayButton();
	}

	onPlay()
	{
		this.isPlaying = true;
		this.enableStopButton();
		this.onTick();
	}

	playDrumInstrument(intInstrument, velocity)
	{

		switch(intInstrument){
			case 0: port.noteOn(9, BASS_DRUM, velocity); break;
			case 1: port.noteOn(9, SNARE_DRUM, velocity); break;
			case 2: port.noteOn(9, HIGH_HAT, velocity); break;
			case 3: port.noteOn(9, TOM1, velocity); break;
			case 4: port.noteOn(9, TOM2, velocity); break;
			case 5: port.noteOn(9, TOM3, velocity); break;
			case 6: port.noteOn(9, TOM4, velocity); break;
		}

	}

	onHandleTimeTick()
	{
		// handle tick work ...

		for(let instrument=0; instrument<instrumentCount;  instrument++){
			let cellValue = this.drumGridModel.getInstrumentRowValue(instrument, this.currentTick);
			if(cellValue > 0)
			{
				this.playDrumInstrument(instrument, cellValue);
			}
		}

		// move to next tick
		this.currentTick = this.currentTick + 1;
		let totalTicks = this.drumGridModel.getTotalTicks();
		
		if(this.currentTick >= totalTicks)
		{
			this.currentTick = 0;
		}
	}

	onTick()
	{
		var txtTempo = document.getElementById("txtTempo");
		var bpm = parseInt(txtTempo.value)
		this.drumGridModel.bpm = bpm;
		this.timerInterval = this.drumGridModel.getMSFromBPM(bpm);

		if(this.isPlaying)
		{
			this.onHandleTimeTick();
			setTimeout(() => this.onTick(), this.timerInterval)
		}
	}

	onStop(){
		this.isPlaying = false;
		this.enablePlayButton();
	}

	enablePlayButton()
	{
		var btnPlay = document.getElementById("btnPlay");
		btnPlay.disabled = false;
		var btnStop = document.getElementById("btnStop");
		btnStop.disabled = true;
	}

	enableStopButton()
	{
		var btnPlay = document.getElementById("btnPlay");
		btnPlay.disabled = true;
		var btnStop = document.getElementById("btnStop");
		btnStop.disabled = false;
	}

    render()
    {
		var divRowsContainers = document.createElement("div");
        for(let rowIndex=0;  rowIndex<this.drumGridModel.instrumentCount; rowIndex++)
        {
            let drumRow = this.drumGridModel.rows[rowIndex];
            this.makeGridRow(drumRow, rowIndex, divRowsContainers);
        }  

        let divDrumGrid = document.getElementById("divDrumGrid");
        divDrumGrid.appendChild(divRowsContainers);
    }

	updateView()
	{

        for(let row=0;  row<drumGridModel.instrumentCount; row++)
        {
            let drumRow = drumGridModel.rows[row];
            let totalTicks = drumGridModel.getTotalTicks();
			for(let tick=0; tick<totalTicks;  tick++)
			{
				let currentCell = drumRow.cells[tick];
				let element = currentCell.parentElement;
				if(currentCell.value > 0)
				{
					element.className = 'spnTrackCell spnCellSelected';						
				}
				else
				{
					element.className = 'spnTrackCell spnCellNotSelected';																
				}
			}
        }  
	}

    makeGridRow(drumRow, rowIndex, divRowsContainers) {
		var divRow = document.createElement("div");
		divRow.drumRow = drumRow;
		var divLeft = document.createElement("div");
		divLeft.drumRow = drumRow;
		divLeft.innerHTML = `
		${drumRow.instrumentName}
		<button onclick='onRowClear(this)'>Clear</button>
		<button onclick='onPattern1(this)'>1</button>
		<button onclick='onPattern2(this)'>2</button>
		<button onclick='onPattern3(this)'>3</button>
		<button onclick='onRandomPattern(this)'>Rnd</button>

		`;
		divRow.appendChild(divLeft);
        for (let cell = 0; cell < this.drumGridModel.totalTicks; cell++) 
		{
            let drumCell = drumRow.cells[cell];
            this.makeCell(drumCell, divRow);
        }

		divRowsContainers.appendChild(divRow);
    }

    makeCell(drumCell,divRow) {
        const divCell = document.createElement("span");
        divCell.drumCell = drumCell;
		divCell.className = "spnTrackCell spnCellNotSelected";
		divCell.drumCell.parentElement = divCell;
        divCell.onclick = function(ev)
        {
			let element = ev.srcElement;
            if(element.drumCell.value === 0)
            {
				element.drumCell.value = MAX_VELOCITY;
				element.className = 'spnTrackCell spnCellSelected';		
			}
            else
            {
				element.drumCell.value = 0;
				element.className = 'spnTrackCell spnCellNotSelected';
			}
        }
        divRow.appendChild(divCell);
    }

}

function onDumpModel()
{
    console.log(drumGridModel);
}

let drumGridModel;
let drumGridView;
let port
function bodyOnLoad()
{
    drumGridModel = new DrumMachineModel();
    drumGridModel.setup();
    drumGridView = new DrumGridView(drumGridModel);
    drumGridView.render();
	drumGridView.start();

	JZZ.synth.Tiny.register('Web Audio');
	port = JZZ().openMidiOut('Web Audio');
}


function playBassDrum()
{
	port.noteOn(9, BASS_DRUM, MAX_VELOCITY);
}

function playSnareDrum()
{
	port.noteOn(9, SNARE_DRUM, MAX_VELOCITY);
}

function onRowClear(srcElement)
{
	let totalTicks = drumGridModel.getTotalTicks();
	srcElement.parentElement.drumRow.clearRow(totalTicks);
	drumGridView.updateView();
}

function onPattern1(srcElement)
{
	let totalTicks = drumGridModel.getTotalTicks();
	srcElement.parentElement.drumRow.pattern1(totalTicks);
	drumGridView.updateView();
}

function onPattern2(srcElement)
{
	let totalTicks = drumGridModel.getTotalTicks();
	srcElement.parentElement.drumRow.pattern2(totalTicks);
	drumGridView.updateView();
}

function onPattern3(srcElement)
{
	let totalTicks = drumGridModel.getTotalTicks();
	srcElement.parentElement.drumRow.pattern3(totalTicks);
	drumGridView.updateView();
}

function onRandomPattern(srcElement)
{
	let totalTicks = drumGridModel.getTotalTicks();
	srcElement.parentElement.drumRow.randomPattern(totalTicks);
	drumGridView.updateView();
}

