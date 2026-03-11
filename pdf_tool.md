Skip to main content
Built a web tool to edit PDF text without ruining the original fonts. 100% local, zero paywalls : r/SideProject


r/SideProject
Search in r/SideProject
Advertise on Reddit

Open chat
Create
Create post
Open inbox

Expand user menu
Skip to NavigationSkip to Right Sidebar

Back

Go to SideProject
r/SideProject
•
6d ago
Dry_Jello2272

Built a web tool to edit PDF text without ruining the original fonts. 100% local, zero paywalls

0:03 / 0:19




Hey everyone,

The top Google results for PDF editors always pull the same crap: they let you do all the work, and then hit you with a subscription paywall right when you click "Download". On top of that, you have to upload your private documents to some random cloud server.

The core of the tool:

True Font Mapping: Instead of just overlaying text boxes, the engine detects the original font properties and maps them so your edits actually blend in.[1] It’s designed to keep the document’s visual integrity intact.[1]

100% Local: Everything runs in your browser. Your files never leave your computer—perfect for sensitive documents.

Zero BS: No hosting costs means no paywalls, no watermarks, and no sign-ups.

A note on the UI:
The interface and extra utilities (like merge/split) are bibecoded (claude 4.6 and gemini 3)kept simple and lightweight on purpose. This allows the tool to stay fast and makes it easy for me to roll out new simple features over time based on your feedback.

I just put it online, so let me know if it breaks on your end or if you find any weird bugs!

Cheers.


Upvote
165

Downvote

97
Go to comments


Share

Report
Report
Join the conversation
Sort by:

Best

Search Comments
Expand comment search
Comments Section
Notoriousone123
•
6d ago
If this works I'll send you money to buy yourself a beer, I have yet to come across to a web app/software that actually functions.


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
6d ago
Haha, deal! I built it out of that exact same frustration...toss your worst PDFs at it and let me know if it actually survives your test! (;

Eyshield21
•
6d ago
pdf text editing that keeps fonts is hard. are you re-embedding or doing something else?


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
6d ago
hi , yes it's an absolute nightmare I actually started with a full WASM build for re embedding, but I completely scrapped it was way too heavy and killed performance. Now, I just parse the raw PDF stream directly to extract the existing font dictionnaries and exact metrics, then map the new text inline. way lighter and easier ...

u/TumbleweedTiny6567 avatar
TumbleweedTiny6567
•
5d ago
last week i spent like 40 minutes fixing a lease agreement in one of those online editors, got it looking perfect, hit download and boom. $12/month subscription wall. the fact yours runs locally and actually preserves the font mapping instead of just slapping a text box on top is exactly whta i wish existed back then.


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
That exact 40 minute trap is literally why I made this....Doing all the hard work just to get held for ransom at the download button is infuriating !!! . Glad the font mapping approach makes sense to you! (:

davFaithidPangolin
•
21h ago
Tried this out, great interface and tools but it did convert all original unedited text to some kind of sans serif typeface in the document I tested once I downloaded it. The text rendered as intended in the editor though.


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
13h ago
Hey ! Glad you like the interface! Yeah sorry about that, its definitely becuase of the update I pushed yesterday. It fixed alot of bugs but looks like it triggered this new one ... Im looking into it right now and will get it fixed asap. Thanks for the heads up ! (:


dankloda
•
5d ago
u/allax3 avatar
allax3
•
6d ago
Seems cool saved it. But some areas are not translated to english. And what this product really need is saving options. Page literally froze while I tried to download my edited file


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
6d ago
Thank you! A patch for the missing English text is coming soon... About the freeze: to keep the output crisp, the engine reconstructs a high-res 4K version of the document 100% localy. That heavy lifting temporarily locks the browser's main thread. Im looking into offloading that export process to a background worker ,so the UI stays smooth! (:


Vast-Astronomer-2314
•
6d ago

aurelian_dev
•
6d ago
u/digsmann avatar
digsmann
•
6d ago
Interesting mate. Yeah, because most pdf tools having hard time keeping same formats and font while editing.. hope your app will be promising and .will drop you feedback. All the best!


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
6d ago
Thanks! Keeping the format intact is definitely the hardest part.Most sloppy tools out there just slap a white box over the text and ruin the background. Becuase my UI is minimalist, it looks like those cheap clones on the surface. I just hope people actually test it and realize the engine is fundamentaly different and does the real heavy lifting. looking forward to your feedback!!

CosmicxAlex
•
5d ago
Dude, super cool!

Overall it's super handy. Just used it on a file I needed to work on today so this came out just in time. I was just looking at a subscription option.

Here's some things I noticed that were a little weird:
Doesn't affect the PDF, but some things are in a different language. I did choose English before hand and continued to experience this. After clicking "PDF Editor Studio". The loading screen says, "Ouverture du PDF... Analyse du document en cours..." and then the text on top of the following page says, "Nouveau Document.pdf". "New Page" and "Delete" are also in a different language saying, "insérer page" & "Supprimer"

When editing a line of text with color, I noticed that some colors may be a shade lighter or darker than the final product. This can be mitigated by using the RGB numbers to get the color consistent for the final version.

When editing a line where the first word was Bold, the rest of the sentence and paragraphs directly touching it then becomes bold. To fix this I would have to delete the part I wanted edited and create a new text box that wasn't bold to get the edit I needed. Essentially just trying to line up the new text box perfectly next to the text I want it by.

When clicking undo, it would undo the changes I made, but then I couldn't work on anymore text boxes on the PDF. I would have to do it all correct in one go or have to refresh and start over to fix a mistake I made.

Seriously though- those are such minor things and the program worked so well. I bookmarked it and will be using whenever necessary! Definitely going to recommend this. Setup a donation button, or "buy me a coffee" button. You did good. Thanks so much!


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Man thanks so much for the ultimate stress test!!! I'm patching those lingering french translations right now, and I'll definitly look into fixing the color sampling slightly missing the exact shade, the bold text bleeding, and squashing that nasty undo state freeze ASAP .. Seriously appreciate the bookmark and might just add that coffee button once it's fully polished !!

u/zgr33d avatar
zgr33d
•
5d ago
I ran a few tests and it works really well :)

Converting fonts to curves would be a very useful option, because at the moment this can only be done in Acrobat Pro.
Thx.


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Thanks for testing ! That kind of pro feature is exactly what I'm looking into.. I actualy have some free time right now to work on the engine, so there is a lot of deep technical stuff I plan to bring to it . (:

RazerHey
•
5d ago
You've got yourself another tester


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Thanks a lot !! I really appreciate the support. Let me know what you think after trying it out... all feedback is welcome! (:

u/Wellnest26 avatar
Wellnest26
•
5d ago
If you actually managed to pull it off, especially with the fonts, this will be a very very useful and popular tool, especially with people on macOS!


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
yeah thanks ! mac preview is great for reading but it completly falls apart for real inline editing . matching the embeded fonts was not easy but i think i finaly got it right . let me know if it survives your tests ! (:

u/MobAppMan avatar
MobAppMan
•
5d ago
Really good work. I had a bash at something similar a while back and I think I ended up pulling out all my hair - extremely frustrating.

Excellent travail!


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
merci ! yeah the pdf spec is a total nightmare . i definitly lost some hair parsing those raw streams too . realy appreciate it , merci encore ! (: (:


[deleted]
•
5d ago
rhaphazard
•
5d ago
What's the backend?


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
hi , the front end uses pdf.js and fabric.js which is a literal paradise to work with , but they actualy have hard limits when it comes to semi pro results and strict user expectations for font mapping ...so all the editing runs 100% localy and your files never leave your pc (feel free to check the network tab , zero pdfs get uploaded) . the only backend i have is a custom engine just for the font matching stuff . it takes the text properties and figures out the closest match . had to keep that on a server so the web app doesnt become way to heavy to load !


rhaphazard
•
4d ago
Very cool.

Are you able to keep it free because everything is done client side?


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
4d ago
Yeah Exactly... No heavy server costs means I can keep it free for everyone . (:


rhaphazard
•
3d ago
Very cool.

shock_and_awful
•
5d ago
Sounds amazing. how do i access the tool? i see links to oreateai.com , but I dont see it there...

Edit: Found it. https://pdfnolimit.com/en/


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
(:

u/faresar0x avatar
faresar0x
•
5d ago
15 miss calls from Adobe


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
haha sending them straight to voicemail !! lol

u/iurp avatar
iurp
•
5d ago
This is exactly the kind of tool I wish I had when I was building document processing features for my projects. The font mapping approach is clever - most PDF editors just slap a text box on top and call it a day, which looks terrible on anything official. Running it locally is a huge plus too. I've dealt with too many situations where uploading sensitive contracts to random cloud services wasn't an option. One suggestion if you're taking feedback: adding batch processing would be killer for people who need to make the same edit across multiple files. Bookmarked this for my next PDF editing session.


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
hi , yeah the text box overlay is the worst . glad the local approach makes sense for your contracts .batch processing is actualy a solid idea . doing it 100% localy in the browser might nuke the ram though but i'll add it to the list to figure out later .. really appreciate the bookmark ! (:

Heidelorengomar675
•
5d ago
batch processing helps. Compresto compresses pdfs without losing quality.

ruibranco
•
5d ago
This is genuinely useful. The font mapping part is what sets it apart — every other "PDF editor" just slaps a text box on top and calls it a day, so your edits look obviously patched. The fact that it runs locally is a huge plus for anyone dealing with contracts or legal docs too.


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Thanks for the feedback! Yes Privacy and high quality font matching are exactly what I set out to prioritize... Glad you find it useful! (:

JyotiIsMine
•
5d ago
Hi can you share code? Is it open source?


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Thanks for the interest! It’s not open source at the moment !!


JyotiIsMine
•
5d ago
Are you planning to open source?


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Not currently, as I'm focusing on stability and specific features.., I haven't ruled it out for the future, but for now, it remains closed source ...

TheDataSeneschal
•
5d ago
Can you add a dark mode, please?


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Great suggestion !! I'll make sure to get that done today thanks to your feedback. Stay tuned !! (:

Whole-Onion-1507
•
5d ago
Gonna try this


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Greatt ! Let me know what you think once you've had a chance to try it... (:

u/iurp avatar
iurp
•
5d ago
This resonates hard. I'm building local-first tools myself and the "100% local" angle is seriously underrated for privacy-conscious users. The font mapping approach sounds clever - most PDF editors just slap a white box over the original text and pray nobody notices. One question though: how are you handling embedded fonts that aren't installed on the user's system? That's usually where things get messy. Also curious if you considered using pdf.js under the hood or went with something else entirely.


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Thanks! Actually I tried building a custom version of pdfium to handle what pdf.js couldn't,But I just ended up with a heavy, slow WASM build and the logic wasn't even that great tbh. ..So I pivoted. Now the client use pdf.js (ultra lightweight compared to my first tries!) and the complex stuff is on the server. ..For missing fonts: the server runs 7 differents matching methods to analyze the text and fetch a fallback font with the closest visual shape possible. .. Its still far from perfect but I think I'm on the right track. Plus, it consumes almost no ressources on my end !!


Prize_Desk_3149
•
5d ago
u/ConceptUpstairs5610 avatar
ConceptUpstairs5610
•
5d ago
That's the best thing i have seen till now, that's so cool... I remember the stress, I wanted to edit an important pdf before deadline but all the pdf editors out there are either paid or screwed up


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Haha thanks! I think we've all been there... sweating over a document while 5 different sites ask for your credit card just to change one typo .. Well , My goal is to make sure nobody has to deal with that stress again !!

u/DetectivePeterG avatar
DetectivePeterG
•
5d ago
The font mapping approach is really smart. Most PDF editors just overlay new text and the original structure gets wrecked. Curious how you handle scanned documents where the text layer is basically OCR output.


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
Hey Thank you ! Scanned docs are a nightmare tbh. I actually managed to solve the 'baked-in pixels' issue recently, but the solution weighed 6MB. For an instant, lightweight web tool, that's just impossible. Had to drop it for now while I research a lighter way to do the masking without ruining the load time !!

zaarnth
•
5d ago
Comment Image
seems like it doesnt works


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
5d ago
hi , Good catch! This is a known bug with heavy custom fonts. The engine reads the raw font size from the PDF metadata, but when it maps to the web fallback font during typing, the proportions (and weight) don't perfectly align. I'm actively working on a patch for the scaling math to fix this. Thanks for the screenshot, super helpful !! (:

Medical_Scar6114
•
4d ago
Thanks a ton!


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
4d ago
ure welcome (:

u/LeJeffDahmer avatar
LeJeffDahmer
•
4d ago
Trop cool (mais je ne vois pas de lien :( )


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
4d ago
Merci ! Le lien c'est pdfnolimit.com, n'hésite pas à me dire si tu vois des bugs... (:


u/LeJeffDahmer avatar
LeJeffDahmer
•
3d ago
Comment Image
Avant l'édit / après l'édit

les R deviennent des rv
Connecteurv d'injecteurv
Prvise
...

Mais en une seule lettre lol


u/LeJeffDahmer avatar
LeJeffDahmer
•
3d ago
Comment Image

u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
3d ago
merci pour le retour ! Oui je lavais déja remarqué ce bug des lettres en trop. En gros sans faire trop technique, c'est un soucis de lecture d'encodage quand l'outil extrait le texte, et bizzarement ca le fait quasi que sur les pdf en francais. ..Si c'est pas encore patché cest que je suis sous l'eau sur : un convertisseur Word <-> PDF qui garde 100% la mise en forme + un vrai OCR. Réussir à faire tourner tout ca 100% client-side c'est tellement cho a coder que ca ma pris tout mon temps ! .. Jy suis presque, des que je fini je retourne direct sur les bugs de l'editeur. Je vais fix ca en priorité avec 2 autres bugs que jai spoté sur les langues RTL (arabe, hebreu...). Merci a toi !


u/LeJeffDahmer avatar
LeJeffDahmer
•
3d ago
Merci à toi ! T'es le boss

u/m_zafar avatar
m_zafar
•
3d ago
really cool man, is it opensource?


u/Dry_Jello2272 avatar
Dry_Jello2272
OP
•
3d ago
Thanks !! Its not open source at the moment, im really focusing on stability and specific features right now...

u/HistoricalAd5339 avatar
HistoricalAd5339
•
3h ago
Where is the link?

Community Info Section
r/SideProject
Join
r/SideProject - A community for sharing side projects
r/SideProject is a subreddit for sharing and receiving constructive feedback on side projects.
Created Jan 17, 2013
Public
353K
Weekly visitors
15K
Weekly contributions
Moderators
Message Mods
u/MurtzaM
u/walruswilderness avatar
u/walruswilderness
View all moderators
Reddit Rules
Privacy Policy
User Agreement
Accessibility
Impressum
Reddit, Inc. © 2026. All rights reserved.

Collapse Navigation

