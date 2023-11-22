## Questions
- How do we trigger a music tick?
- How do we convert a bpm to ms?

## Info
- Ticks in 4 bar phrase - 64
- Ticks in 8 bar phrase - 128

- Blogs
- https://gsap.com/docs/v3/GSAP/Timeline

## Next
- find cooler way to trigger tick other than set timeout
- how do we store the drum pattern model?
- how do we load the drum pattern model?
- how do we label rows?
- add pattern 1 per row
- add pattern 2 per row
- add pattern 3 per row
- visualize current tick!!



var timeoutID=0;
function schedule()
{
	timeoutID=setTimeout(function(){postMessage('schedule'); schedule();},100);
} 
onmessage = function(e) 
{ 
	if (e.data == 'start') 
	{ 
		if (!timeoutID) 
			schedule();
	} 
	else if (e.data == 'stop') 
	{
		if (timeoutID) 
			clearTimeout(timeoutID); 
		timeoutID=0;
	};
}


