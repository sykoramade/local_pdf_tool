Updates: 
- Color the pill on segmented slider based on the tool both in homepage and workspace.  I think this would go a long way in further clarifying the tool you're in.
- Can we fix that the page reloads each time we switch to a new tool?  It makes the experience feel disjointed.  
- Id like the same appear animation that annotes secondary toolbar has to be applied to all of the tools in the workspace.  

Issues:
Edit
- Unclear how to use the font tools as they aren't selectable. Bad UX.  Lets not grey out the tools and make sure I can use them when text is being selected.  When I highlight then click the tools, it deselects the text.  It appears the tools are for new text I type which is odd.
- Clicking text adds to the "edits" despite not actually changing anything.  Making it unclear what undo/redo are doing
- Edited text sits just above the original line - new and edit text is raised, making it seem like the layout is not being preserved.  
- Selecting by sentence is fine but I would like click/drag controls to select more words, sentences or the entire paragraph to edit.  
- The new font toolbar is larger than the other tools toolbar, leading to the entire workspace growing/shrinking when switching.  I want to avoid this and make sure sizing consistency is prioritized.  Annotate's secondary tool bar is a good example of how the secondary tool bar in edit should be sized and appear - as the margin around the tools seems a bit too big.

Sign
- Page rail doesnt work
- Adding a signature doesnt working

Annotate
- Page rail doesnt work
- None of the tools work properly
- Flag icon doesnt read well, lets use one that is appropriate to whats being placed which is an arrow post it note


Compress
- Downloading directly from compress doesn't include any changes made.  LEts change how this works - Moving over to compress in the workspace still shows the PDF and current page based on the page rail and is only to allow the user to choose to compress on download or not.  I would like to see the filesize before/after and percentage reduced of the actual file in place of the "est 30 -40%" since that figure may not be true
- The margin of the secondary toolbar is a bit smaller than the other pages, which leads to that area of the workspace growing/shrinking when switching between tools.  Fix this so moving betweeen all tools is consistent. 

Errors in the page: 
RenderingCancelledException: Rendering cancelled, page 5 
app\components\PdfViewer.tsx (89:22) @ async load
87 |       setPages([])
 88 |
> 89 |       const pdfjs = (await import('pdfjs-dist')) as typeof import('pdfjs-dist')
    |                      ^
 90 |       pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
 91 |
 92 |       try {
