let cellSize = 50;
let instrumentCount = 7;

BASS_DRUM = 36
SNARE_DRUM = 38
HIGH_HAT = 42
TOM1 = 41
TOM2 = 43
TOM3 = 45
TOM4 = 47


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
        for(let i=0;  i<this.instrumentCount; i++)
        {
            let row = new DrumMachineRow();
            row.instrumentNumber = i;
            this.rows.push(row);

            this.totalTicks = this.getTotalTicks();
            for(let t=0; t < this.totalTicks; t++)
            {
                let cell = new DrumMachineCell();
                cell.tick = t;
                cell.cellSize = cellSize;
                row.cells.push(cell);
            }
        }
    }

	clearRows(){
        for(let row=0;  row<drumGridModel.instrumentCount; row++)
        {
            let drumRow = drumGridModel.rows[row];
            let totalTicks = this.getTotalTicks();
			for(let tick=0; tick<totalTicks;  tick++)
			{
				let currentCell = drumRow.cells[tick];
				currentCell.value = 0;
			}
        }  	

		onDumpModel();	
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
			case 0: port.noteOn(9, BASS_DRUM, 127); break;
			case 1: port.noteOn(9, SNARE_DRUM, 127); break;
			case 2: port.noteOn(9, HIGH_HAT, 127); break;
			case 3: port.noteOn(9, TOM1, 127); break;
			case 4: port.noteOn(9, TOM2, 127); break;
			case 5: port.noteOn(9, TOM3, 127); break;
			case 6: port.noteOn(9, TOM4, 127); break;
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
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", this.drumGridModel.totalTicks * cellSize);
        svg.setAttribute("height", "400");
                
        for(let row=0;  row<this.drumGridModel.instrumentCount; row++)
        {
            let drumRow = this.drumGridModel.rows[row];
            this.makeGridRow(drumRow, row, svgNS, svg);
        }  

        let divDrumGrid = document.getElementById("divDrumGrid");
        divDrumGrid.appendChild(svg);
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
				if(currentCell.value > 0)
				{
					currentCell.parentElement.setAttribute("fill", "yellow");
				}
				else
				{
					currentCell.parentElement.setAttribute("fill", "blue");
				}
			}
        }  
	}

    makeGridRow(drumRow, row, svgNS, svg) {
        for (let cell = 0; cell < this.drumGridModel.totalTicks; cell++) {
            let drumCell = drumRow.cells[cell];
            drumCell.x = cell * cellSize;
            drumCell.y = row * cellSize;

            this.makeCell(svgNS, drumCell, svg);
        }
    }

    makeCell(svgNS, drumCell, svg) {
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", drumCell.x);
        rect.setAttribute("y", drumCell.y);
        rect.setAttribute("width", drumCell.cellSize-2);
        rect.setAttribute("height", drumCell.cellSize-2);
        rect.setAttribute("fill", "blue");
        rect.drumCell = drumCell;
		rect.drumCell.parentElement = rect;
        rect.onclick = function(ev)
        {
            if(ev.srcElement.drumCell.value === 0)
            {
                ev.srcElement.drumCell.value = 255;
                rect.setAttribute("fill", "yellow");
            }
            else
            {
                ev.srcElement.drumCell.value = 0;
                rect.setAttribute("fill", "blue");
            }
        }
        svg.appendChild(rect);
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
	port.noteOn(9, BASS_DRUM, 127);
}

function playSnareDrum()
{
	port.noteOn(9, SNARE_DRUM, 127);
}