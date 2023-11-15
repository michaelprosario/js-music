class DrumMachineCell
{
    tick = 0;
    value = 0;
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

    setup()
    {
        this.rows = [];
        for(let i=0;  i<this.instrumentCount; i++)
        {
            let row = new DrumMachineRow();
            row.instrumentNumber = i;
            this.rows.push(row);

            let totalTicks = this.beats * this.ticksPerBeat * this.measureCount;
            for(let t=0; t<totalTicks; t++)
            {
                let cell = new DrumMachineCell();
                cell.tick = t;
                row.cells.push(cell);
            }
        }
    }

}