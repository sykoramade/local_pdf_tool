Skip to main content
I replaced my dev team with 3 Claude Code agents that coordinate through markdown files. Here's the architecture. : r/micro_saas


r/micro_saas
Search in r/micro_saas
Advertise on Reddit

Open chat
Create
Create post
Open inbox

Expand user menu
Skip to NavigationSkip to Right Sidebar

Back

Go to micro_saas
r/micro_saas
•
8d ago
yury_egorenkov

I replaced my dev team with 3 Claude Code agents that coordinate through markdown files. Here's the architecture.
I've spent 15+ years managing development teams. A year ago I started building a SaaS product solo using Claude Code as my entire engineering team. After months of iteration, I landed on a multi-agent architecture that actually works — and I want to share the setup because I haven't seen anyone else do it this way.

The Problem
One Claude Code instance is powerful but limited. Give it a big task and it either oversimplifies the solution or loses critical details along the way. The bigger the scope, the more corners get cut — and you don't always notice until it's too late.

I also learned early that you can't have the same agent building frontend and backend at the same time. The workflow has to be sequential: I design the frontend first as pure HTML files until I'm happy with how it looks and feels. Then requirements get extracted from the pages. Then a task goes to the backend. Then they coordinate. This pipeline only works when each stage has a dedicated agent that stays in its lane.

The CEO Incident
Before I explain the architecture, let me tell you about my first attempt at delegation.

I "hired" a CEO agent. Gave it broad authority to organize the project. Within hours, it went full corporate: created 20 roles — CTO, DevOps Lead, QA Engineer, Helper Tester, Documentation Specialist — and wrote detailed technical regulations for each one. Then the agents started writing memos to each other. Scheduling alignment meetings. Running brainstorming sessions. Work completely stopped while the agents were busy managing.

I went through the entire investor arc — the one that usually takes founders 3-5 years — in about a day and a half. From the hopeful optimism of hiring a CEO, to watching the org chart explode, to complete disillusionment, to demoting the CEO back to a regular worker and taking back full control of the operation.

Lesson learned: agents will happily create organizational complexity forever. You have to constrain them hard. The CEO now has one rule above all others: you don't code.

The Architecture That Actually Works
I run 3 separate Claude Code agents in Docker containers, each with its own CLAUDE.md, its own repo access, and a strict role:

Agent	Repo Access	Responsibility
Backend	/workspace/back/ + reads /workspace/docs/	Go API, database, migrations, Telegram Ads integration
Frontend	/workspace/front/ + reads /workspace/docs/	HTML templates, JS modules, CSS, nginx
CEO	/workspace/docs/ only	Strategy, content, marketing, task coordination. Reads code but never writes it
Each agent's CLAUDE.md defines its role, tech stack, conventions, and what it's NOT allowed to touch. The backend agent knows it uses sqlb + pgx (no ORM), avoids pointers in Go, and that the schema file is the source of truth. The frontend agent knows to check page JS modules before editing inline scripts. The CEO agent — after the incident — knows it doesn't code. Period.

The Development Pipeline
The workflow is strictly sequential, not parallel:

Frontend first. I direct the frontend agent to build a page as pure HTML + CSS + JS. No API calls, just demo data. I iterate until I like how it looks and works.

Extract requirements. From the finished page, it's clear exactly what data the backend needs to serve and what endpoints are required.

Task to backend. A task goes into docs/tasks/backend.md with the endpoint spec derived from the actual UI.

Coordinate. If the backend needs clarifications, agents exchange messages through docs/messages/.

Connect. Frontend agent wires up the real API calls to replace demo data.

This means the UI is always the source of truth. Backend serves what the UI needs — not the other way around.

How Agents Coordinate
Agents don't talk to each other directly. They coordinate through a shared docs repo:

docs/
├── tasks/           # Task files per role (backend.md, frontend.md, ceo.md)
├── messages/        # Inter-agent correspondence (dated markdown files)
├── decisions.md     # Architecture decision log
├── guidelines/      # Coding conventions (Go, SQL, workflow)
├── reference/       # API spec, data model, technical docs
└── tracking/        # Workplan, current sprint board
Task flow:

CEO writes a task in docs/tasks/backend.md with objective, context, and acceptance criteria

Backend agent picks it up, implements it, commits to its repo

If backend needs frontend changes, it writes a task in docs/tasks/frontend.md

Completed tasks get deleted (source of truth is the code, not task history)

Important decisions get logged in decisions.md before the task is deleted

Message flow: When agents need to discuss something (e.g., "what should this endpoint return?"), they write dated markdown files in docs/messages/. File naming: 042-2026-02-20-backend-frontend-auth-flow.md. Messages get deleted once resolved — no accumulation.

Key Rules That Make It Work
After months of trial and error:

Separate git repos. /workspace/back/, /workspace/front/, /workspace/docs/ — each has its own .git. Never a monorepo. Agents commit independently.

Research before tasking. The #1 recurring mistake: an agent writes a task assuming something isn't implemented, when it already is. Rule: always read the actual code/state before creating tasks.

Small tasks only. Large tasks lead to large mistakes. Every task must be small enough to review in one pass. When in doubt — break it down further.

Lessons learned file. docs/lessons-learned.md captures mistakes that keep recurring. Every agent reads it before starting work. Examples: "SVG charts: use fixed viewBox, not dynamic pixel sizing" or "check page JS modules before editing inline scripts — they load last and override."

No agent crosses boundaries. Backend never touches HTML. Frontend never writes SQL. CEO never writes code. This constraint is what makes the system reliable — each agent has deep context in its domain and zero temptation to "just quickly fix" something outside it.

The Docker Setup
Each agent runs in its own Docker container via an open-source setup I built: claude-code-docker.

Key features:

Network restrictions — iptables firewall allows only GitHub, npm, Anthropic APIs, and a few other essentials. No random outbound connections.

Filesystem isolation — only the workspace directory is mounted. Agent can't see or touch the rest of the host.

State persistence — credentials, conversation history, and settings survive container restarts via mounted volumes.

Reproducible environment — Node.js, Go, Git, GitHub CLI, PostgreSQL client, all pre-installed.


make docker.run  # Build and run interactively
Results
Using this setup, I built and deployed a full production SaaS — live, taking real payments, running real ad campaigns:

24 interactive HTML pages (dashboard, campaign wizard, analytics, billing — the works)

Go backend with 60+ API endpoints, 311 database migrations, background automation jobs

Kubernetes deployment with TLS, nginx proxy, PostgreSQL

AI-powered ad copy generation, A/B testing engine, automated bid optimization

Stripe + PayPal billing integration

One person. No designers, no frontend devs, no backend devs. Just me directing agents.

The product is live in production. Happy to share and show it to anyone curious — just drop a comment.

What I'd Do Differently
Start with the docs repo and role constraints on day one. I added the coordination layer after hitting walls (and the CEO incident). Should have been the foundation from the start.

Write the lessons-learned file immediately. Agents repeat the same mistakes across sessions. The file is cheap to maintain and saves hours.

Never give an agent open-ended organizational authority. Constrain roles tightly from the beginning. An agent with vague authority will build bureaucracy, not product.

What I'm Curious About
Is anyone else running multi-agent setups? What coordination patterns do you use?

Do you find role separation helps, or do you prefer one agent doing everything?

Any tricks for maintaining context across long-running agent sessions?

Happy to answer questions about the architecture or the Docker setup.


Upvote
292

Downvote

117
Go to comments


Share

Report
Report
u/todoist avatar
todoist
•
Promoted

Neues Projekt geplant? Mit den Todoist-Vorlagen ist dein Team sofort organisiert. So verbringst du weniger Zeit mit dem Setup und hast mehr Zeit für echte Fortschritte. Starte jetzt deine Gratis-Testphase.
Neues Projekt geplant? Mit den Todoist-Vorlagen ist dein Team sofort organisiert. So verbringst du weniger Zeit mit dem Setup und hast mehr Zeit für echte Fortschritte. Starte jetzt deine Gratis-Testphase.
Neues Projekt geplant? Mit den Todoist-Vorlagen ist dein Team sofort organisiert. So verbringst du weniger Zeit mit dem Setup und hast mehr Zeit für echte Fortschritte. Starte jetzt deine Gratis-Testphase.
Neues Projekt geplant? Mit den Todoist-Vorlagen ist dein Team sofort organisiert. So verbringst du weniger Zeit mit dem Setup und hast mehr Zeit für echte Fortschritte. Starte jetzt deine Gratis-Testphase.
Neues Projekt geplant? Mit den Todoist-Vorlagen ist dein Team sofort organisiert. So verbringst du weniger Zeit mit dem Setup und hast mehr Zeit für echte Fortschritte. Starte jetzt deine Gratis-Testphase.
Neues Projekt geplant? Mit den Todoist-Vorlagen ist dein Team sofort organisiert. So verbringst du weniger Zeit mit dem Setup und hast mehr Zeit für echte Fortschritte. Starte jetzt deine Gratis-Testphase.
todoist.com
Sign Up
Join the conversation
Sort by:

Best

Search Comments
Expand comment search
Comments Section
u/TworLabs avatar
TworLabs
•
8d ago
This is genuinely impressive.
I’m curious about one practical aspect: what does it actually cost to run three Claude Code agents full‑time for a project of this size? I imagine the iteration cycles add up, especially with long-running sessions.



Upvote
10

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
8d ago
•
Edited 8d ago
Thank you. Good question. I use Claude Max subscription ($200/mo) which gives unlimited usage — so the cost is flat regardless of how many sessions or how long they run. That's what makes multi-agent practical: spinning up 3 containers costs the same as one. I actually use it more for other tasks too.

Before Max, I was on API billing and it got expensive fast — easily $50-100/day with active development across multiple agents. Long sessions with big codebases burn through context windows quickly, especially when the agent reads files to orient itself.

With Max the math is simple: $200/mo for what would have been a 3-person team. Even at 10x that price it would still be rational.

The real cost isn't money — it's attention. You still have to review everything, catch mistakes early, and maintain the docs/rules that keep agents on track. That's the actual bottleneck.

They're good at completing tasks that have a clearly defined task.

And unlike people, they don't get upset or sabotage if a large task needs to be scrapped and started over.

If you're curious what project I built with this setup — here's the link, check it out.

https://growity.ai



Upvote
5

Downvote

Reply

Award

Share

u/Radiant_Persimmon701 avatar
Radiant_Persimmon701
•
5d ago
Are you sure it gives unlimited usage.  When I'm running multiple agents I get through the usage limits quite quickly and often have to burst into PAYG territory 


Upvote
1

Downvote

Reply

Award

Share


1 more reply
u/IngenuitySeparate505 avatar
IngenuitySeparate505
•
5d ago
But that is just plain false?! Even max x20 has usage limits. Running multiple agents also drains usage proportionally faster obviously. Makes me question this whole post that you don’t know this.



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
https://imgur.com/a/r7fB9yz

That's what I got. Burn tokens from the morning.

I think token economics will be like mobile and internet in the beginning. We all count minutes and gigabytes. Now we pay 30 and nobody cares it just works. With tokens I think it will be the same. Now it's just no 30 but 200


Upvote
2

Downvote

Reply

Award

Share


1 more reply
Yablan
•
7d ago
I thought this was an AI slop post, but this seems real. Really cool indeed. Impressive. Adding comment here so I do not forget about this. Very cool OP, very cool.



Upvote
8

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
It's real

I started typing less and less and dictating more and more, and of course I'm putting things in order with AI. Now days everything needs to be done with AI. Like external brain.


Upvote
3

Downvote

Reply

Award

Share


4 more replies
lopsidedbutt
•
6d ago
Good idea!


Upvote
1

Downvote

Reply

Award

Share

u/Randyslaughterhouse avatar
Randyslaughterhouse
•
7d ago
Really interesting setup!

Out of interest, have you looked at BMAD? I’ve found it really good for a multi-agent setup, with separate agent roles (PM, scrum master, dev, ux, qa, architect, etc.) and very structured document-based project context.

Currently in the process of adding OpenClaw as an automated orchestration layer to run through the document_story->dev->test->review BMAD cycle for a set of stories, without me having to babysit the agents though each individual task.



Upvote
4

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
Thank you. No I didn't sorry. There is so much stuff now and so limited attention span so without AI you can't literally do nothing. I want to start from simplest possible setup and growth from there. For some people with no IT background things I do might sounds hard, for me no.

As I put:

Everyone's holding the same genie, but everyone's rubbing the lamp differently.

But thanks, maybe I check at some point.


Upvote
1

Downvote

Reply

Award

Share

mzinz
•
5d ago
Is that a design pattern?


Upvote
1

Downvote

Reply

Award

Share

u/STRATO avatar
u/STRATO
•
Promoted

Website mit WordPress erstellen – Domain dauerhaft kostenlos inklusive, höchste Sicherheit und regelmäßige Updates ab 0 € im 1. Monat
ad.doubleclick.net
Thumbnail image: Website mit WordPress erstellen – Domain dauerhaft kostenlos inklusive, höchste Sicherheit und regelmäßige Updates ab 0 € im 1. Monat
gozmit07
•
7d ago
By the way did you hire a writer agent to write this completely step by step?



Upvote
3

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
I tried, but it didn't work. I have this feeling that this thing doesn't think, but it structures information very well and processes large amounts of it. It's like you're still setting the vector. Previously, you had to wait months for it to be implemented, and you'd forget and fall out of context. Now, it happens almost instantly, and you can quickly and flexibly change approaches and see what works.


Upvote
2

Downvote

Reply

Award

Share


1 more reply
spreader771
•
7d ago
Following. Need to see the rest of that CEO agent story and the final multi-agent architecture.



Upvote
3

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
•
Edited 7d ago
Haha, I laughed too.

With my setup, the backend agent carefully thinks things through — researches the code, reconstructs the current state, and gives you answers grounded in actual documentation and code. Meanwhile the CEO agent just fires off random generic responses from thin air. Reports things as "done" when they're clearly not. And the opposite — flags bugs for features that have been live in production for weeks.

Basically, looking at code is beneath it — not a royal thing to do. And fine, if it at least assigned proper tasks to other agents… but no. I don't know exactly what the underlying problem is, but the moment you tell an agent it's a CEO, it starts getting in everyone else's way. Probably it just bored.


Upvote
1

Downvote

Reply

Award

Share

u/Fast-Equivalent-7353 avatar
Fast-Equivalent-7353
•
5d ago
How do you manage the tests? Does each agent perform the tests on their perimeter or will you create a test agent?



Upvote
3

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
Unlike working in a company (which is what I did for most of my career. Remote, but I had customers), right now I have zero obligations to anyone. I prioritize speed over quality. And get quality after decent result and only for it. Changed my whole approach, boiled for years.

I treat tests as fixation + a way to debug fast.

Integration tests with external systems -- those I write immediately, because that's the hard part. Like email sending: I want to emulate sending a message and immediately see that it arrived, properly formatted, etc. For everything AI couldn't test itself.

AI always run vet, linter, build before it's done, so dockers have everything installed.

Internal/unit tests I only write after I'm confident the thing actually works well. The development itself happens strictly without automated tests, but under my close manual supervision. I also read most of what the agents write. Now trust to agents growth with lessons learned file so I kinda relax my review more.

Before feature we work on a big comprehansive plan and it takes long sometimes. Then agents work for a long time. Then I have a raw version that sort of works. And only then I ask them to write tests and do refactoring. Not before.

I also have monitoring set up -- there's a Sentry agent that reads production logs directly, so even if something breaks, no panic, we fix it right away.

Another big idea I've only just now implemented is anti-analytics (alerting system). Analytics works by having you sit down and study certain metrics once a while. So, for me, it's the opposite: if my metrics drop, I get notified. For example, if there aren't any registrations for 24 hours, I get notifications otherwise silence. Devops loves this kind of thing, but they apply it to technical things, while I apply it to everything, including business.

Now I have backend, frontend, CEO+CPO+COO, Marketing (4 agents).

BTW Once I tell to CEO it also other roles not the boss one it starts doing better.


Upvote
2

Downvote

Reply

Award

Share

gr4phic3r
•
7d ago
i did myself definitions for 20 agents yesterday, helps a lot and is a more focused working


Upvote
2

Downvote

Reply

Award

Share

u/HostingerCOM avatar
u/HostingerCOM
•
Promoted

Erhalten Sie diesen Black Friday Hostingers Managed Hosting für WordPress für nur 2,49 €/Mon. Schnell, sicher und benutzerfreundlich.
Shop Now
hostinger.com
Clickable image which will reveal the video player: Erhalten Sie diesen Black Friday Hostingers Managed Hosting für WordPress für nur 2,49 €/Mon. Schnell, sicher und benutzerfreundlich.
Collapse video player

0:00 / 0:00




u/kkj_uk avatar
kkj_uk
•
7d ago
Very impressive. Good job



Upvote
2

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
Thanks


Upvote
1

Downvote

Reply

Award

Share

u/jingololo11 avatar
jingololo11
•
7d ago
Really cool



Upvote
2

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
Thanks


Upvote
1

Downvote

Reply

Award

Share

u/TWUC avatar
TWUC
•
7d ago
Can you please create a YouTube video showing how to set it up step by step ?



Upvote
2

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
I'll think about it, but I don't have YouTube channel yet. Right now, I'm focused on launching products. Ask questions I'll try to answer.


Upvote
1

Downvote

Reply

Award

Share

u/billythetruth avatar
billythetruth
•
7d ago
impressive work, will take a look at this



Upvote
2

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
Thank you


Upvote
1

Downvote

Reply

Award

Share

5tu
•
7d ago
Fantastic write up, love the concept of keeping track of common mistakes. Regarding the todo list, do you monitor what they are working on or do you just leave them to it? I wrote a tool you can use to visually watch agent todos, kanban.guildford.ai. Basically a kanban board with mcp and api endpoints. Feel free to try it. Would love to see what you’ve built



Upvote
2

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
•
Edited 7d ago
Thank you

The product I built using this

https://growity.ai/

I'll check out your service too, thanks. Now I want to keep everything in Markdown files and have an accessible and open process.


Upvote
1

Downvote

Reply

Award

Share


2 more replies

[deleted]
•
7d ago
shock_and_awful
•
6d ago
Brilliant. Thanks for sharing.



Upvote
2

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
6d ago
It's pleasure, thank you very much


Upvote
1

Downvote

Reply

Award

Share

u/Loud-Option9008 avatar
Loud-Option9008
•
5d ago
The CEO incident is hilarious and honestly the best cautionary tale for anyone giving agents open-ended authority. "Agents will happily create organizational complexity forever" should be on a poster.

The frontend-first pipeline is the part that actually matters most here using the UI as the source of truth means you never build an endpoint nobody needs. That alone saves more time than the multi-agent setup.

Are you finding the message coordination through markdown holds up as complexity grows, or does it start breaking down at a certain task size?



Upvote
2

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
Yes, I store everything in Markdown. I spend some time structuring the docs — of course the agents do the actual work. I tell them what to move where. I'm deliberately vague because they come up with a better structure than I would. Same with refactoring. The general ideas are mine, and I step in if things go wrong.

I actually achieved something I could never get done with human developers. I believe code should be grouped by proximity of use — if one function calls another, they should be near each other. You can count a distance between calls as graph and reorder.

I worked with experienced programmers before, and whenever I brought up this kind of code organization, it met huge resistance. Here I did it all in a few hours. The reduction in context needed for agents to work is remarkable. This principle would help humans too, but it also helps agents.

I also maintain a big "lessons learned" file so agents don't repeat past mistakes. When we hit a misunderstanding and resolve it, I ask them to remember it. Failures still happen, but less often than with people.

One thing that surprised me: documentation going out of sync with code used to be a real problem. It just doesn't exist anymore. I keep plans and options, but I don't document how things are implemented. Asking the agent to read the code and tell me what's happening is faster than maintaining docs. I do keep a log of decisions though.


Upvote
2

Downvote

Reply

Award

Share

u/mousepatrol avatar
mousepatrol
•
5d ago
This is awesome, do you still review every agent’s work? Every single one every time?


Upvote
2

Downvote

Reply

Award

Share

SlavKiwi
•
5d ago
This is neat



Upvote
2

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
Thanks


Upvote
1

Downvote

Reply

Award

Share

PlateFriendly6198
•
7d ago
Curious how you review/manage the code that is pushed to git? Are you just reviewing PRs all day?

What about testing it, do you just trust that unit/integration tests pass and hope for the best or manually test the app UI as well?

What about UI and UX design?

My man issues so far with letting AI take the wheel are code quality and the UI design, it always produces subpar results, regardless of the guardrails I add through cursor rules for eg.

Speaking of guardrails, do you have a system to ensure the agents follow certain patterns in the code base and produce consistent results?

Appreciate I just dumped a hundred questions on you but I’m genuinely curious how other people use AI and deal with these issues and limitations! 😅



Upvote
1

Downvote

Reply

Award

Share

larrydahooster
•
7d ago
That are the questions nobody wants to answer. 


Upvote
2

Downvote

Reply

Award

Share


1 more reply
rk-paul
•
7d ago
I have a very similar workflow, but I use different agents. All my development is done via Claude Code. The initial design is also done via Claude Code. I created couple of skills inspired by the this https://aseemshrey.in/blog/claude-codex-iterative-plan-review/

I have multiple skills one for review using codex and gemini and then there is an implementation skill that will review the implemented code. My code base have strict patterns established for the agents to follow. I am building https://formula1.plus entirely using agents following the above mentioned patterns. anyone interested can have look at
https://gist.github.com/binaryroute/245cd4036fa6392e015ed7929b81b1f6
https://gist.github.com/binaryroute/aba0350689ef90396478946662763766


Upvote
1

Downvote

Reply

Award

Share

u/anjobanjo102 avatar
anjobanjo102
•
7d ago
https://news.ycombinator.com/item?id=46075616 ur re-inventing the wheel i believe



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
Of course, I am. There are undoubtedly many more better approaches. Yet I'm moving so fast and enjoy so much have almost no time to explore.

Everyone's holding the same genie, but everyone's rubbing the lamp differently.

Maybe ultimately, the best solution will prevail, but perhaps it doesn't exist yet? Besides, reinventing the wheel always involves research and learning.

Thanks for the link, I'll pass it on to my agents and see what they say.

I can imagine what my CEO will say.


Upvote
1

Downvote

Reply

Award

Share


1 more reply
a2theharris
•
7d ago
Are you using a specific file-watcher to trigger the agents when a markdown file is updated, or are you manually kicking off the Claude Code CLI for each "sprint"?



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
I tried configuration with watchexec (check branch below). I was thinking I'd only task the CEO and it would spread and collect information and it was really inefficient. Even worse all agents stop working and start talking with generating huge reports instead.

Check this branch. I don't use it. Degraded to simpler one. https://github.com/yury-egorenkov/claude-code-docker/tree/multiagents

Now I have .claude/commands/go.mod

Process your task file and messages inbox:

1. Read and process your role's task file from docs/tasks/ (ceo.md for CEO, backend.md for Backend, frontend.md for Frontend — match the role defined in CLAUDE.md)
2. Read and process all files in docs/messages/ — handle messages addressed to your role, ignore others
And I prefer review and trigger manually /go if it goes in right direction. But I could try other ways, have some ideas.

u/randrs1337 avatar
randrs1337
•
7d ago
Interesting setup! Thank you for sharing! I tried do multiple agents setup but have not spend enough time polishing it like you do.

Right now I rely more on OpenClaw which work as co-founder and help me plan and refine tasks and also improve work processes. The backbone of my development is multiple skills related to planning, design and review.

How long time did it took for you from start to initial release?



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
Thanks! OpenClaw sounds interesting — I haven't tried it yet but the co-founder angle makes sense. My setup keeps evolving too, it's definitely not "set and forget."

Actually, I need to correct my previous estimate — I only counted one repo. The real numbers:

The Docker container with Claude Code inside was created on Feb 6. Code repo: first commit Feb 7 → latest Mar 3 = ~25 days, 269 commits. Plus 159 commits in docs/tasks, 116 in backend, 7 in config. Total across 5 repos: 553 commits in under 4 weeks.

The configuration itself I've rewritten several times — every time I actively use the setup, friction points become obvious immediately, so I fix them on the spot.

The biggest lesson so far: I lost 1.5 days on a dead-end approach early on, and the signal was clear — development velocity just dropped to near zero. That's actually the main benefit of using the setup daily: you feel the slowdowns in real time and course-correct fast. If I were just configuring it theoretically without shipping real features, I'd probably still be tweaking.


Upvote
1

Downvote

Reply

Award

Share

u/owehbeh avatar
owehbeh
•
7d ago
I run a main orchestrator, similar to your CEO, it cannot code or even read. Has to use agents to get information. And it handles big features broken down into tasks by following a loop of a single coder agent > best practices and performance qa > ux/ui qa > human workflow / user journey qa

Any feedback other than PASS the loop restarts and all QA has to look at the code after the coder finishes.


Upvote
1

Downvote

Reply

Award

Share

u/busigrow avatar
busigrow
•
7d ago
How long did it take you to build the app using the agents?



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
Here's what the git history shows:

Code repo: first commit Feb 7, 2026 → latest Mar 3, 2026 = ~25 days, 269 commits

Docs repo: started Feb 19, 2026, coordination layer added mid-project

269 commits in 25 days, months → weeks with agents


Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
I cross-posted an expanded version of this to Hacker News — curious if it resonates there too. Added more details about the coordination layer, the /go skill, and a section on why traditional engineering patterns (DRY, abstractions) don't really apply when agents do the work.

If you found this interesting, I'd appreciate an upvote to keep the discussion going: https://news.ycombinator.com/item?id=47245373


Upvote
1

Downvote

Reply

Award

Share

u/princeofpartiez avatar
princeofpartiez
•
7d ago
I'm very new to the dev thing but as a financial progessional I really want to move in and grasp more of this stuff. Your project seems really impressive even though i dont understand half of it, but it gives me a lot of inspiration :)

My journey continues. Any pointers would be greatly appreciated. Thanks!


u/yury_egorenkov avatar
yury_egorenkov
OP
•
7d ago
Thanks! As a financial professional you actually have a head start — you already understand the domain. The dev part is just tooling.

What I did here wasn't really coding. I used Claude Code as a research agent: "download these 48 letters, extract every case, classify every technique, cross-reference with my notes." The output is structured markdown, not software. You could do the same with your own area of expertise — feed it your notes, your sources, ask it to find patterns and structure them.

The investing insight — which I figured out on my own long before this project — is: forget DCF, think physics. Every asset has a speed (current yield) and acceleration (earnings growth). Buy the one that outruns your best alternative in 5 years. The price formula is two steps of mental math. Buffett himself evolved away from Graham's intrinsic value toward this comparison-based approach — Munger pushed him there.

If you're in finance and want to try this kind of thing — start with a question you already think about, throw your messy notes at the agent, and ask it to organize. The AI doesn't know more than you do about your field. But it's very good at structuring what you already know.

What's new is the method of working with an AI agent. I didn't write code — I talked. Literally dictated my thoughts, messy and unstructured, and the agent:

Organized — took my scattered notes from years of studying Buffett, downloaded all 48 shareholder letters, classified every case and technique, and structured it into a coherent system

Wove in new ideas — as I talked through my thinking ("it's more like physics — speed and acceleration"), it integrated that into the existing framework, cross-referenced with the source material, and showed me where Buffett himself says the same thing

Implemented — when the structure was right, it wrote the actual documents, formulas, cross-references, everything. Automatically.

It's amazing

christoph_w
•
7d ago
I personally use a similar set up from Alex. The CEO in his template is the requirements engineer.

The agents he uses:

requirements engineer

solution architect

frontend developer

backend developer

qa engineer

devops engineer

These agents are super powerful and I developed a working SaaS im 16h (including stripe integration…). You find the git repo here: https://github.com/AlexPEClub/ai-coding-starter-kit


Upvote
1

Downvote

Reply

Award

Share


[deleted]
•
7d ago
u/sgt_brutal avatar
sgt_brutal
•
6d ago
Another 6-9 months and this is no longer a delusion or LARP.



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
6d ago
for sure


Upvote
1

Downvote

Reply

Award

Share

No2rmal
•
6d ago
This is all very inspiring.



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
6d ago
Thanks


Upvote
1

Downvote

Reply

Award

Share

u/WildGliuk avatar
WildGliuk
•
6d ago
Wow, interesting thank you!



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
6d ago
Thank you


Upvote
1

Downvote

Reply

Award

Share

u/jaygre2023 avatar
jaygre2023
•
6d ago
Hey can i get the link to production version ?



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
6d ago
Hey

Production version of what I build with that: https://growity.ai
Completely up and running, all features. My methodology of testing ads is even better and more accurate than I implemented first.

If you want docker container which is base of the architecture: https://github.com/yury-egorenkov/claude-code-docker

u/sbala72 avatar
sbala72
•
6d ago
This is awesome


u/yury_egorenkov avatar
yury_egorenkov
OP
•
6d ago
Thank you

skamurais
•
5d ago
Really interesting and impressive. Curious to see how such workflow can be optimized further.


u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
Thank you. We'll see

u/Accomplished-Cap-109 avatar
Accomplished-Cap-109
•
5d ago
I think your post is mis-leading as you have described an organization chart not software architecture. There are no domains or services, which is only the tip of the iceberg when creating well defined modern software architecture. You have mentioned the agents are dependant of md file rather than actually creating real communications between frontend, backend and/or domains. Your research is around agents rather than research best practices and tradeoffs An example your reason for picking multi agents should be to build better faster and based on scale not to split backend and frontend, one full stack agent is more that sufficient. As an engineer i can tell you without looking what you built lacks robustness and you will spend most your time firefighting trying to get stability. Your welcome


u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
Fair point. On one level, this is true.

I understand all the intricacies of software architecture and building large, complex systems by hand. What's interesting now is that it's no longer important, well, practically irrelevant.

While we used a high-level programming language to blend non-understandable bytecode, hard to read and change. (I mean you can reverse to asm and try to read but practically really rare cases you do it).

Now what we dictate and what we explain is essentially blend to a high-level programming language.

Mostly, you no longer need to figure it out how it set up.

Of course, if you don't understand it from the start, things can go wrong, but if you have everything on track (I don't know, you take some framework you like) then the agents within that framework act more or less independently.

Of course, I didn't want to mislead anyone, and that wasn't my goal. The goal was to share my approach, which works well for me now and I really like it. And, of course, to show the results and discuss the approaches.

Thank you for participation.


Upvote
1

Downvote

Reply

Award

Share


3 more replies
suaveElAgave
•
5d ago
Impressive approach. Did you set up the dockers yourself or via Claude?



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
4d ago
Thanks. Manually


Upvote
1

Downvote

Reply

Award

Share

u/EngineSubject5144 avatar
EngineSubject5144
•
5d ago
It sounds like the CEO agent is more of a PM than CEO if it is just writing tasks/specs. What other role does it play? Also are you prompting each agent or is there some kind of loop that is running that the agents know to check the task list and messages?



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
4d ago
The first and most important role he played was to draw attention to his inadequacy. Just kidding.

I use a non-programming (CEO) agent to plan large tasks, marketing, write and edit posts, and set up ads. It also wrote TOC, Refund Policy, and blog articles, etc.

I was hoping he could fulfill the role of PM, but I'm not happy with the result yet. Maybe I'll try again in a different way.

I communicate directly with each agent. I start by writing a large task in /back|front|ceo/task.md. I dictate everything that's needed, place documents nearby, and provide links. Then we discuss and plan, I answer questions and make decisions. When I'm satisfied with the result, the agent starts working. And so on.

I can make minor adjustments directly in the command line, but I assign larger tasks through a file. Everyone has their own cloud.md, and they know where to find tasks and what to do. There is also a shortcut /go skill that triggers the start of work that begins with reading cloud.md.


Upvote
1

Downvote

Reply

Award

Share

u/Strange-Couple1518 avatar
Strange-Couple1518
•
5d ago
How often do you need to restart the agent and clear / compact its context ? I am new to this and not sure how do people run long agents sessions without worrying about running out of context



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
4d ago
I /clear the context when I start working on something completely new and unrelated. Sometimes it resets /compact automatically when the context window ends. Before it the agent usually has time to either write down the plan or update the files and then continues. Sometimes this doesn't happen, but since I make them maintain the documents, they can quickly read the current state and continue.

Colin_Broon
•
5d ago
Yes, this is awesome - good work! Commenting so I don’t lose visibility to this.


u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
Thanks


Upvote
1

Downvote

Reply

Award

Share

TheSoundOfMusak
•
5d ago
Do you think that OpenClaw would do this better than your setup?



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
Probably. I don't know. There are so much things around. I just stick and share what's work for me. It could be another bicycle reinventing and I have no problem with that. Or I could find better approach. We'll see. Right now what's happened is awesome.


Upvote
1

Downvote

Reply

Award

Share

Anpu_Imiut
•
5d ago
Can i suggest freezing the agents at milestones. The issue is that your idea is not scaleable. If you spend your days reviewing outputs, you will get stressed and exhausted at some points. AI agents do not pause or work at human pace. Another thing i wonder whether they can integrate new technology or invent new technology. Whst about technology that is niche?


Upvote
1

Downvote

Reply

Award

Share

LostinVR-1409
•
5d ago
The CEO problem is real. As soon as I got one agent assume that role, she went all "I need 24.456 VPs!"



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
What's also interesting is that it always answers from its head and doesn't explore the project.


Upvote
1

Downvote

Reply

Award

Share

u/Round-Ad78 avatar
Round-Ad78
•
5d ago
Do you have any evaluation loops in there?



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
What do you mean? Do I change my configuration? All the time. It's already different from the post but the key things sill the same.


Upvote
1

Downvote

Reply

Award

Share

admax3000
•
5d ago
This is extremely impressive. Thank you for sharing. I’m building my own team of agents too, so this is good reference. 



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
Thanks


Upvote
1

Downvote

Reply

Award

Share

Enough-Goose7594
•
5d ago
How many agents did it take to get 250 upvotes on this?



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
I hope zero. I mean zero bot voters.

Yet three: backend, frontend, and crazy CEO

Most famous traction is from CEO as usual. In this regard, he fulfilled his role with dignity


Upvote
1

Downvote

Reply

Award

Share

u/AlternativeTomato742 avatar
AlternativeTomato742
•
5d ago
I’d like to see the product if u dont mind



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
5d ago
With my pleasure https://growity.ai/ — If you want to use it, write DM I'll give you promo

I did personal site https://egorsky.com/ — Black Hole is amazing at my taste

I redraw friend's site https://proteus.egorsky.com/ in just one stroke

Hope you like it


Upvote
1

Downvote

Reply

Award

Share


2 more replies
CaptainDivano
•
4d ago
commands and instructions are given via terminal or..? congratz



Upvote
1

Downvote

Reply

Award

Share

u/yury_egorenkov avatar
yury_egorenkov
OP
•
4d ago
Thanks.

I already wrote about it, please check

https://www.reddit.com/r/micro_saas/comments/1rju8sd/comment/o945y73/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button


Upvote
1

Downvote

Reply

Award

Share


2 more replies
atMamont
•
4d ago
How does an agent know when to pick up a new task from the docs folder?


Upvote
1

Downvote

Reply

Award

Share

poundofcake
•
2d ago
This is a really interesting set up. Considering that you're managing this like a dev team - are the lessons learned actually driving less mistakes, better results? What is the max task scope you've seen work with minimal back/forth? And then finally are you actually seeing quality results with the 20 team setup with CEO?


Upvote
1

Downvote

Reply

Award

Share

6

u/ropeForTheRich avatar
ropeForTheRich
•
5d ago
Fuck you I'm not reading this shit

Community Info Section
r/micro_saas
Joined
micro_saas
What is Micro SaaS? Is virtually a pocket-sized SaaS, meaning that it caters to a very specific niche. It’s usually run by a small team or even two or three people. And since it’s targeting a much smaller group, the resources used in making and running it are also substantially low.

Show more
Created Sep 2, 2021
Public

Community Guide
39K
Weekly visitors
3.9K
Weekly contributions
Moderators
Message Mods
u/alejandrobrega avatar
u/alejandrobrega
Alejandro Brega
View all moderators
Reddit Rules
Privacy Policy
User Agreement
Accessibility
Impressum
Reddit, Inc. © 2026. All rights reserved.

Collapse Navigation

