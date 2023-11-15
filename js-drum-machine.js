let cellSize = 18;
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
    measureCount = 4;
    instrumentCount = 3;
    rows = [];
    totalTicks = 0;

    setup()
    {
        this.rows = [];
        for(let i=0;  i<this.instrumentCount; i++)
        {
            let row = new DrumMachineRow();
            row.instrumentNumber = i;
            this.rows.push(row);

            this.totalTicks = this.beats * this.ticksPerBeat * this.measureCount;
            for(let t=0; t < this.totalTicks; t++)
            {
                let cell = new DrumMachineCell();
                cell.tick = t;
                cell.cellSize = cellSize;
                row.cells.push(cell);
            }
        }
    }

}

class DrumGridView
{
    constructor(drumGridModel)
    {
        this.drumGridModel = drumGridModel;
    }

    render()
    {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", this.drumGridModel.totalTicks * cellSize);
        svg.setAttribute("height", "100");
                
        for(let row=0;  row<this.drumGridModel.instrumentCount; row++)
        {
            let drumRow = this.drumGridModel.rows[row];
            this.makeGridRow(drumRow, row, svgNS, svg);
        }  

        let divDrumGrid = document.getElementById("divDrumGrid");
        divDrumGrid.appendChild(svg);
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
function bodyOnLoad()
{
    drumGridModel = new DrumMachineModel();
    drumGridModel.setup();
    drumGridView = new DrumGridView(drumGridModel);
    drumGridView.render();
}