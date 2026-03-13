# PDF Editor Tool Breakdown

This document provides a step-by-step breakdown of the UI elements and tools displayed in the PDFNoLimit editor interface, ordered from the top bar to the primary action buttons.

## 0. Branding and Context (Top Left & Center)

- **Logo**: "PDFNoLimit" branding on the far left.
- **File Name**: Displayed in the top center (e.g., "Darlehensvertrag_Sykora_2025.docx-edited.pdf").
- **Close Button**: 'X' icon at the far top right to exit the editor.

## 1. Top Navigation Bar (Left to Right)

- **Select [Button]**: Icon: Mouse pointer. Purpose: Allows the user to select, move, and resize existing elements (text, shapes, images) on the page.
- **Text [Button]**: Icon: 'T' letter. Purpose: Activates the text insertion tool. Clicking on the document with this tool active creates a new editable text area.
- **Draw [Button]**: Icon: Pencil. Purpose: Enables freehand drawing or highlighting. Useful for manual annotations.
- **Shapes [Dropdown]**: Icon: Square/Circle overlap with a down arrow. Purpose: Opens a sub-menu to select geometric shapes (rectangles, circles, lines, etc.) for insertion.
- **Font Family [Dropdown]**: Text: "Arial" (default). Purpose: Changes the typeface of the currently selected text box.
- **Font Size [Input]**: Text: "16" (default). Purpose: Numerical field to adjust the font size of selected text.
- **Color Picker [Button]**: Icon: Solid black circle. Purpose: Opens a color palette to change the stroke or fill color of the active tool or selected element.
- **Text Styling [Group]**:
    - **B (Bold)**: Toggles bold weight for text.
    - **I (Italic)**: Toggles italic style for text.
    - **U (Underline)**: Toggles underlining for text.
- **Original Text Status [Indicator]**: Text: "Original text / Not selected". Purpose: Shows state regarding the base PDF layer; likely used for editing existing text blocks vs. adding new ones.
- **Sign [Button]**: Icon: Stylized signature. Purpose: Opens the signature tool for adding handwritten or digital signatures.
- **Image [Button]**: Icon: Picture/Landscape. Purpose: Triggers a file upload dialog to insert external images onto the PDF.
- **Undo [Icon]**: Icon: Counter-clockwise curved arrow. Purpose: Reverts the most recent action.
- **Redo [Icon]**: Icon: Clockwise curved arrow. Purpose: Re-applies an action that was previously undone.
- **Delete [Icon]**: Icon: Red trash can. Purpose: Deletes the currently selected element from the canvas.
- **Add Page [Button]**: Text: "+ Page". Purpose: Appends a new blank page to the end of the PDF document.
- **Close [Icon]**: Icon: 'X' (top right corner). Purpose: Exits the editor interface.

## 2. In-Canvas Page Controls

Located just above the active PDF page:
- **Page Label**: Text: "Page 1". Purpose: Indicates the current page number being viewed/edited.
- **Insert Page [Button]**: Text: "+ Insert page". Purpose: Inserts a new blank page specifically before or after the current page (context-dependent).
- **Delete Page [Button]**: Text: "Delete" (red). Purpose: Removes the entire current page from the document.

## 3. Global Action Button

- **Save PDF [Primary Button]**: Location: Bottom right (floating/fixed). Icon: Download arrow. Text: "Save PDF". Purpose: The final action to process all edits and download/save the modified PDF file.
