
# **Autonomous UX Feedback Systems: A Multi-Agent Framework for Continuous Product Improvement**

## **The Emergence of Agentic UX Evaluation**

The field of software quality assurance is undergoing a profound transformation, moving beyond traditional, deterministic testing paradigms toward a new frontier of autonomous, cognitive evaluation. For decades, automated testing has been a cornerstone of software development, yet its scope has been largely confined to verifying functional correctness through scripted interactions. This approach, while essential for ensuring that software behaves as specified, is fundamentally incapable of assessing the subjective, nuanced, and deeply human-centric qualities that constitute the user experience (UX). The advent of Large Language Models (LLMs) and their integration into autonomous agent architectures marks a pivotal moment, enabling a shift from mere functional verification to holistic behavioral simulation.1 This report details the frameworks, methodologies, and future trajectories of LLM-based Multi-Agent Systems (LMA) designed to create automated, continuous UX feedback loops, thereby revolutionizing how digital products are designed, evaluated, and improved.

### **1.1 From Scripted Bots to Cognitive Agents**

Traditional software evaluation has long relied on automated testing frameworks that execute predefined scripts to check for deterministic and static behavior.2 These systems excel at answering the question, "Does this button, when clicked, perform the correct action?" However, they cannot address the more critical UX question, "Is this button intuitive, discoverable, and satisfying for the user to interact with?" The core limitation of these systems is their lack of cognitive capacity; they can follow instructions but cannot emulate the reasoning, planning, and goal-driven behavior of a human user.

The integration of LLMs into autonomous agents introduces a paradigm shift by imbuing these systems with cognitive abilities that are competitive with human planning and reasoning.1 Unlike their scripted predecessors, LLM-based agents are inherently probabilistic and behave dynamically, operating within interactive environments to achieve high-level goals.2 This transition is not merely an incremental improvement in automation but a categorical leap from functional testing to the creation of "social simulacra".3 These are not just bots; they are believable digital entities designed to replicate human-like cognition, personalities, and interaction patterns.3 Academic research has demonstrated the viability of this approach in simulating complex social environments, such as a village of 25 interacting agents, replicating participants in social science studies, and modeling user trust behaviors.5 This focus on simulating "humanoid behavior" allows, for the first time, the automated evaluation of qualitative UX dimensions like satisfaction, trust, and cognitive load, which were previously the exclusive domain of human-led research.3

### **1.2 Foundational Concepts of LLM-Based Multi-Agent (LMA) Systems**

An LMA system harnesses the collective intelligence of multiple specialized agents to solve problems that would be difficult or impossible for a single agent to complete alone.1 The effectiveness of such a system is predicated on the capabilities of its individual agents, which are defined by a set of core characteristics derived from established academic literature on agentic AI.1

#### **Autonomy and Goal-Orientation**

An autonomous agent can independently manage its internal state and actions without direct external control to achieve defined goals or objectives.1 In the context of UX testing, an agent is not given a script of clicks but a high-level goal, such as "Find and purchase a pair of running shoes under $100." The agent must then autonomously devise and execute a plan to achieve this goal, navigating the complexities of the user interface along the way.

#### **Perception and Interaction**

Agents must be able to perceive their environment and interact with it. For a web-based UX testing agent, perception involves detecting changes in the surrounding environment, such as parsing the Document Object Model (DOM) of a webpage to understand its structure and content.1 Interaction is facilitated through a set of tools, which can range from browser control APIs for clicking buttons and filling forms to specialized tools for web search or data retrieval.2 The interface between an agent and its tools is as critical as a human-computer interface; poor tool design or selection can doom an agent's task from the outset.9

#### **Social and Collaborative Ability**

The defining characteristic of an LMA system is the ability of its agents to interact with each other.1 This "social ability" is the foundation of synergistic collaboration, where the strengths of multiple specialized agents are combined to achieve a more comprehensive and robust solution.1 The engineering rationale for adopting a multi-agent architecture is often a direct response to the inherent limitations of a single LLM. A complex task like a full end-to-end UX evaluation can easily exceed the cognitive capacity and finite context window of a monolithic model. Research from Anthropic reveals that a primary reason multi-agent systems perform well is that they provide a structured framework to "spend enough tokens to solve the problem".9 By dividing a high-level requirement into discrete sub-tasks and assigning them to different agents, the system can effectively allocate the necessary computational resources and contextual focus to each part of the problem, overcoming the scaling limits of a single-agent approach.1

### **1.3 The Value Proposition for UX Research**

The application of LMA systems to UX evaluation represents a pivotal evolution, offering solutions to some of the most persistent challenges in the field. The value proposition is threefold, focusing on scale, robustness, and efficiency.

#### **Scale and Speed**

Traditional usability testing is a laborious and resource-intensive process. Recruiting, scheduling, and compensating human participants limits the scale and speed at which feedback can be gathered. LMA systems overcome this bottleneck by enabling the automatic generation and execution of thousands of simulated user tests in a fraction of the time.4 This massive scalability allows for more comprehensive testing across diverse user personas and edge cases, providing rapid feedback that can be integrated into agile development cycles.

#### **Robustness and Fault Tolerance**

In an LMA system, the principle of collaboration can be extended to include cross-examination and validation of findings. Similar to how code reviews and pair programming improve software quality, multiple agents can be tasked with debating, examining, or validating each other's findings to converge on a single, more accurate, and robust solution.1 For example, one agent might identify a potential friction point, while a second "critic" agent attempts to find an alternative path or challenges the initial assessment. This process helps to detect and correct faults or misinterpretations early, increasing confidence in the final results.

#### **Addressing Research Challenges**

LMA systems directly address fundamental logistical challenges in UX research. The difficulty and expense of participant recruitment, a major hurdle for many research teams, is mitigated by the ability to generate synthetic user personas at scale.4 Furthermore, traditional usability studies are often inflexible; once a study design is launched with human participants, it is difficult to iterate or correct flaws without starting over. Agent-based systems allow UX researchers to test and refine their study design itself, using the simulated agents as a low-cost proxy to identify confusing instructions or flawed task flows before engaging human subjects.4

## **Architectural Deep Dive: The UXAgent Framework**

To understand the mechanics of agent-based user simulation, it is instructive to perform a granular, component-by-component analysis of a seminal academic framework in this domain. UXAgent, developed by researchers including Lu et al., serves as a comprehensive blueprint for a system designed to automate usability testing using LLM agents.4 Its architecture provides a clear model for how to generate synthetic users, simulate their cognitive processes, enable their interaction with real-world web environments, and capture their experiences as multimodal data for analysis.

### **2.1 System Overview**

The primary purpose of the UXAgent framework is to support UX researchers in evaluating and iterating on their *usability testing study design* before conducting studies with real human subjects.4 It functions as a cost-effective and scalable "pre-flight check," allowing researchers to identify potential issues with their test protocols or the product interface itself without the significant overhead of human-led studies. The system's architecture comprises several interconnected modules that manage the flow from persona generation through simulated interaction to the final analysis of results.4 A UX researcher initiates the process by defining a target website and a set of user personas. The system then deploys LLM agents, equipped with these personas, to interact with the website and attempt to complete specified tasks. Throughout this process, a rich stream of qualitative, quantitative, and visual data is collected and presented to the researcher for review.

### **2.2 The Persona Generator Module**

At the heart of scalable testing is the ability to simulate a diverse user base. The Persona Generator module is engineered to address this need, moving beyond the small sample sizes typical of traditional research.4

#### **Mechanism**

The process begins with the UX researcher defining a desired demographic distribution for the simulated user cohort and providing an initial seed persona as an example.4 The module then leverages an LLM to automatically generate thousands of unique personas that conform to the specified distribution. To ensure diversity and avoid repetitive outputs, the system randomly selects a previously generated persona as an in-context example for each new generation request, a technique that enriches the variety of the resulting user profiles.4

#### **Significance**

This capability directly confronts the logistical and financial challenges of participant recruitment.4 By enabling large-scale simulation, the Persona Generator allows for the kind of comprehensive testing that is often infeasible with human participants. Researchers can test how users from vastly different backgrounds, with different technical skills, goals, and motivations, interact with a product. This makes it possible to uncover usability issues that may only manifest for specific, niche user segments, leading to a more inclusive and robust final design.

### **2.3 The LLM Agent Module: A Dual-Process Cognitive Architecture**

The core of the UXAgent's ability to simulate human-like behavior lies in its sophisticated cognitive architecture, which is explicitly inspired by the Dual Process Theory of human cognition, most famously articulated by Daniel Kahneman.5 This theory posits that human thought is governed by two distinct systems: System 1 (fast, intuitive, and unconscious) and System 2 (slow, deliberate, and analytical). The UXAgent's architecture mirrors this division with a two-loop structure, providing a more nuanced and realistic model of user interaction than simpler, single-process agent designs.

This dual-process architecture represents a significant engineering advancement over earlier agent models like ReAct, which interleave reasoning and action in a single loop.10 While effective for certain tasks, such a monolithic reasoning process can introduce significant latency, hindering the real-time responsiveness required to simulate fluid web navigation.6 A user does not pause for deep reflection before every single click; many actions are habitual and rapid. UXAgent's architecture accommodates this reality by separating these cognitive loads. The Fast Loop can execute a sequence of routine actions quickly, while the Slow Loop intervenes only periodically to handle strategic planning and reflection. This division of labor creates a more efficient and behaviorally plausible simulation of human web interaction.

#### **Fast Loop (System 1 Thinking)**

This loop is responsible for the agent's rapid, moment-to-moment interaction with the web environment. It operates on a tight Perception-Planning-Action cycle with low latency, emulating a user's immediate, almost subconscious reactions to the interface.4

* **Perception Module:** The agent observes the current state of the webpage and produces a stream of natural language observations.  
* **Planning Module:** Based on the immediate observations and recent memories, the agent plans its next micro-action.  
* **Action Module:** The agent executes the planned action on the web environment.

#### **Slow Loop (System 2 Thinking)**

This loop provides high-level, strategic oversight, ensuring the agent's actions remain coherent and aligned with its overall goals and persona over the course of a long and complex task. It operates on a longer timescale than the Fast Loop and consists of two key modules 4:

* **Reflect Module:** The agent periodically pauses to reflect on its recent memories, generating higher-level insights and reasoning that will guide its future actions. For example, after several failed attempts to use a search bar, the Reflect module might generate the insight, "The search functionality seems to be broken; I should try navigating through the category links instead."  
* **Wonder Module:** This module is designed to simulate the human phenomenon of "mind drifting," where random thoughts or questions may arise based on the current situation. This can introduce non-linear, exploratory behaviors that are characteristic of human users but are often absent in more deterministic agent models.

#### **Memory Stream**

The Memory Stream is the connective tissue of the agent's cognitive architecture, serving as a comprehensive log of its experiences and acting as the bridge between the Fast and Slow loops.4 Every observation, plan, action, reflection, and thought is stored in the Memory Stream with a timestamp. The Fast Loop draws upon recent memories to inform its immediate actions, while the Slow Loop analyzes longer-term patterns within the memory to generate strategic insights. This mechanism allows the agent to learn from its experiences within a single session and adapt its behavior accordingly.

### **2.4 The Universal Browser Connector**

For an agent's cognitive processes to be meaningful, it must have a "body" capable of perceiving and acting within the target environment. The Universal Browser Connector provides this physical embodiment, enabling the agent to interact with any real-world website without requiring special APIs or sandboxed environments.4

#### **Functionality**

The module acts as a sophisticated intermediary between the LLM agent's abstract reasoning and the concrete reality of a web browser. It connects the agent to a standard instance of Google Chrome.4 Its functions include:

1. **Perception Translation:** It extracts the raw HTML from the current webpage, parses it, and simplifies it into a more concise and structured representation that the agent's LLM-based perception module can more easily interpret.  
2. **Action Translation:** It receives abstract action commands from the agent, such as click\_button("Add to Cart") or type\_into\_field("search\_bar", "running shoes"). The connector then translates these commands into the specific, low-level browser automation code (e.g., JavaScript or WebDriver commands) required to execute them, such as finding the correct DOM element and dispatching a click event.4

#### **Key Innovation**

The primary innovation of the Universal Browser Connector is its ability to operate on any live, complex website without the need for manually predefined action spaces.6 Many earlier agent systems were restricted to simplified, sandboxed environments where all possible actions were explicitly defined beforehand. This connector allows the agent to dynamically interpret and interact with the vast and unpredictable landscape of the modern web, making its testing capabilities far more generalizable and applicable to real-world products.

### **2.5 Multimodal Data Output and Analysis**

A key strength of the UXAgent framework is the rich, multi-faceted dataset it generates from each simulated session, providing a holistic view of the user experience that mirrors the outputs of a human-led study.4

* **Qualitative Data:** The system captures the agent's entire Reasoning Trace from its Memory Stream, which serves as an automated "think-aloud" protocol, revealing the rationale behind every action.6 The framework also supports generating post-study surveys and allows researchers to conduct direct, conversational interviews with the agent via a chat interface to probe deeper into its experience.4  
* **Quantitative Data:** Detailed Action Traces and interaction logs provide a granular, machine-readable record of the agent's behavior.6 These logs can be used to calculate metrics such as task completion time, number of actions, error rates, and path analysis.  
* **Visual Data:** The system can produce video recordings of the entire simulated user session, allowing researchers to visually observe the agent's navigation, identify points of hesitation, and see the interface's response to its actions.4  
* **Result Viewer:** All of this multimodal data is aggregated and presented to the UX researcher through a dedicated Result Viewer interface, which facilitates the review and analysis of the generated findings.6

While the design goal of frameworks like UXAgent is to generate "believable" human-like behavior, a crucial tension emerges in practice.3 In a user study conducted with UX researchers, the simulated agents were perceived as "not like real humans" precisely because their reasoning, as captured in the traces, was *too detailed* and explicit.4 Real users often operate on intuition and cannot articulate a step-by-step rationale for every click. However, the researchers still found the agent-generated data to be "very helpful".4 This reveals a critical distinction: the objective is not to create a perfect, indistinguishable digital twin of a human user, but rather to build a *useful analytical tool*. The "un-human" level of detail in the reasoning trace is, in fact, a powerful feature, not a bug. It provides an explicit, auditable log of the cognitive processes that led to a particular behavior, making it far easier for researchers to diagnose the root cause of usability friction. The agent acts as a "caricature" of a user, exaggerating its cognitive processes for the sake of analytical clarity.3

## **Quantifying Usability: Fusing Telemetry with LLM-as-a-Judge**

Once a multi-agent system has generated raw interaction data, the next critical step is to transform this data into objective, quantifiable, and actionable usability metrics. A purely qualitative review of agent logs is insufficient for scalable analysis. The most robust emerging methodologies employ a hybrid approach, fusing low-level, structured telemetry data with high-level, qualitative analysis performed by LLMs. This combination allows for a usability score that is both grounded in empirical evidence and enriched with contextual understanding.

### **3.1 Capturing High-Fidelity Interaction Data with OpenTelemetry**

Before any analysis can occur, a rigorous data collection pipeline must be established. Observability frameworks, originally designed for monitoring complex software systems, provide the ideal toolset for capturing the high-fidelity data needed for UX analysis. OpenTelemetry, an open-source observability framework, is particularly well-suited for this task.16

#### **Instrumentation**

Instrumentation is the process of adding code to an application to generate telemetry data. In an agent-based UX testing system, every significant event in an agent's lifecycle can be captured as a "span" within a "trace." This includes LLM calls, tool invocations, browser actions, and internal reasoning steps.16 This can be achieved through:

* **Auto-Instrumentation:** Libraries that automatically "monkey patch" common frameworks (like the OpenAI SDK or LangChain) to create spans for every call without requiring manual code changes.  
* **Manual Instrumentation:** Explicitly adding code to start and end spans around custom logic, such as an agent's decision-making process or a specific step in a user journey.

This process creates a detailed, machine-readable log of the entire simulated session, capturing not just the actions taken but also their duration, inputs, outputs, and relationships to one another.

#### **Semantic Conventions**

Simply capturing data is not enough; it must be structured and consistent to be useful for analysis. OpenTelemetry's semantic conventions provide a standardized vocabulary for attributes attached to spans.16 For an LLM agent system, this means consistently tagging data with attributes like llm.model, llm.prompt, user.persona\_id, and ui.component.id. Adhering to these conventions transforms a chaotic stream of events into a structured database that can be queried and analyzed at scale, allowing researchers to ask questions like, "What is the average latency for agents with the 'novice\_user' persona when interacting with the 'checkout\_button' component?"

### **3.2 The LLM-as-a-Judge Pattern for Qualitative Scoring**

The "LLM-as-a-Judge" pattern is a powerful technique for automating qualitative evaluation. It involves using one LLM (the "judge") to assess the performance, quality, or behavior of another system, which in this case is the user-simulating agent.17

#### **Mechanism**

The core mechanism involves providing the judge LLM with a collection of evidence and a clear evaluation rubric. The evidence can include the agent's interaction trace (from OpenTelemetry), its reasoning trace (the "think-aloud" protocol), and the final outcome of the task.17 The judge LLM then processes this information and returns a score, a categorical label, and, most importantly, a detailed rationale for its assessment.18

#### **Evaluation Criteria**

The effectiveness of the LLM-as-a-Judge pattern hinges on the quality of its rubric. This rubric can be based on well-established UX principles, such as Nielsen's 10 Usability Heuristics.19 Research has shown that LLMs, when properly prompted, can identify heuristic violations with a consistency and comprehensiveness that can even surpass human evaluators.20 The rubric can also include task-specific criteria, such as:

* **Task Completion:** Did the agent successfully achieve its goal?  
* **Relevance and Coherence:** Were the agent's actions logical and relevant to the task at hand?  
* **Faithfulness:** Did the agent's reasoning align with the information presented on the screen, or did it "hallucinate" UI elements?  
* **Sentiment:** Did the agent's reasoning trace express frustration, confusion, or satisfaction at different points in the journey?

The output can be a simple numerical score (e.g., a System Usability Scale (SUS) score), a categorical rating, or a more sophisticated breakdown that dissects the agent's behavior into discrete claims and verifies each one against the provided context.18 However, this approach introduces a new layer of abstraction that itself requires careful monitoring. While the judge LLM automates evaluation, its own performance is non-deterministic, creating a recursive challenge: one must also evaluate the evaluator. This necessitates a mature operational setup where the performance of the judge LLM is continuously tracked for regressions, benchmarked against alternatives, and observed using the same telemetry frameworks applied to the actor agents.17 A production-grade system will therefore feature nested feedback loops—one for the product's UX and another for the performance of the UX evaluation system itself.

### **3.3 Grounding Analysis with Statistical Causal Inference: The GALA Framework**

A primary weakness of relying solely on an LLM-as-a-Judge is its potential for hallucination and its difficulty in processing large volumes of heterogeneous telemetry data. To address this, statistical methods can be integrated to perform a grounded, data-driven root cause analysis (RCA) that identifies high-probability friction points before engaging the LLM for qualitative interpretation. The GALA (Generative AI-driven Causal Analysis) framework, though originally designed for diagnosing failures in microservice systems, provides a powerful template for this process.22

The adoption of such RCA frameworks marks a critical evolution from merely descriptive usability analysis to a truly diagnostic one. A standard LLM evaluation might conclude that "the checkout flow is confusing." A causal inference model, by contrast, can pinpoint precisely *why* it is confusing, stating that "the 'Apply Coupon' button has a high delay severity score and is implicated in 80% of abandoned cart traces." This level of diagnostic precision is far more actionable for design and development teams.

#### **GALA Framework Overview**

GALA is a multi-modal framework that combines statistical causal inference with LLM-driven iterative reasoning.22 It first uses statistical techniques to analyze structured telemetry data (metrics, logs, and traces) to generate an initial set of hypotheses about the root cause of an issue. This statistically-grounded hypothesis is then used to focus the reasoning of an LLM, which synthesizes the findings and provides human-interpretable remediation guidance. This workflow bridges the gap between automated failure diagnosis and practical incident resolution by ensuring that the LLM's analysis is anchored to empirical data.

#### **The TWIST Method for Friction Point Ranking**

A key component of the GALA framework is the TWIST (Trace-based Weighted Impact Scoring & Thresholding) method, which provides an initial root cause ranking based on the analysis of distributed traces.22 While designed for system failures, its principles can be directly adapted to identify UI components that are the root cause of user friction. The method integrates four component scores, each calculated from the agent's interaction trace data:

1. **Self-Anomaly Score ($c\_1$):** This measures how frequently a specific UI component is directly associated with anomalous user behavior. In a UX context, an "anomaly" could be defined as an action that deviates from an ideal user path, such as repeated clicks on the same non-interactive element, exceptionally long pauses before interacting with a component, or generating an error. A high score indicates the component itself is a frequent source of confusion.  
2. **Trace Impact Score ($c\_2$):** This quantifies the involvement of a component across all failed or inefficient user journeys. It is calculated as the fraction of all problematic traces in which the component appears. A component with a high trace impact score may not be the initial source of the problem, but it is consistently present on the path to failure.  
3. **Blast Radius Score ($c\_3$):** This score captures a component's potential to propagate user errors or confusion to subsequent steps in the workflow. It is calculated by measuring the component's average downstream fan-out in the interaction graph. A button that leads to a complex and confusing modal window would have a higher blast radius score than one that performs a simple, self-contained action.  
4. **Delay Severity Score ($c\_4$):** This score emphasizes the magnitude of performance degradation or user hesitation associated with a component. It is computed as the maximum latency or time spent on a component's interaction, normalized against the system-wide maximum deviation. A high score highlights components that cause the most significant delays, suggesting they are a strong candidate for being a primary friction point.

By combining these four scores, the TWIST method produces a ranked list of UI components that are most likely to be the root cause of observed usability issues.

### **3.4 Synthesizing a Unified Usability Score**

The final step in the quantification process is to synthesize the signals from the statistical analysis and the LLM-based qualitative assessment into a single, unified usability score. This hybrid model leverages the strengths of both approaches.

The ranked list of friction points generated by the GALA/TWIST analysis serves as a strong, statistically grounded "initial hypothesis".22 This hypothesis is then passed as context to an LLM-as-a-Judge agent. The judge's task is no longer to analyze the entire, undifferentiated interaction log from scratch. Instead, it is instructed to focus its analysis on the high-probability friction points identified by the statistical model. It can then enrich this quantitative finding with qualitative context extracted from the agent's reasoning trace, explaining *why* the user might have struggled with that specific component. This process, which mirrors traditional research methods that combine quantitative survey data (like SUS) with qualitative interview insights, produces a final usability score that is robust, explainable, and highly actionable.25

## **Closing the Loop: From Agent Insights to Design System Integration**

The ultimate goal of an automated UX feedback system is not merely to identify problems but to drive their resolution. This requires "closing the loop"—a continuous cycle where insights generated by agent-based testing are translated into concrete, actionable artifacts that can be seamlessly integrated into the design and development workflow. The most advanced vision for this process involves a fully automated pipeline that moves from high-level thematic analysis of user feedback to the direct modification of a product's design system, creating a self-improving product ecosystem.

### **4.1 Synthesizing Raw Data into Actionable Themes**

The raw output of an agent-based testing run is a vast collection of logs, traces, and qualitative feedback. The first step in closing the loop is to synthesize this data into human-understandable insights and priorities.

#### **Thematic Analysis**

This process involves identifying and articulating the broad themes that emerge from the collected data.27 Instead of analyzing individual friction points in isolation, thematic analysis groups related issues to reveal systemic problems. For example, multiple agents struggling with different input fields on various forms might be synthesized into the broader theme of "Inconsistent Form Design." LLM agents can excel at automating this task. By providing an LLM with a large volume of agent feedback (e.g., reasoning traces or post-study survey responses), it can be prompted to extract a structured hierarchy of topics and sub-topics, effectively performing a large-scale qualitative coding exercise in minutes.28 These insights can then be clustered by their location in the application or their stage in a user journey to help pinpoint where the most significant problems lie.27

#### **Prioritization Frameworks**

Not all identified issues are equally important. Once themes have been identified, they must be prioritized to ensure that design and development efforts are focused on the most impactful problems. This is where the quantitative analysis from the previous section becomes critical. An "Analyst Agent" can be tasked with applying a prioritization framework that scores each identified theme based on metrics such as the frequency of occurrence and the severity of the impact (as determined by the GALA/TWIST analysis).27 This produces a ranked list of improvements, allowing teams to make data-driven decisions about where to allocate their resources.

### **4.2 Generating Structured Design Recommendations**

After prioritizing the most critical issues, the next step is to translate these abstract themes into specific, constructive design recommendations. This requires the agent to not only identify what is wrong but also to suggest how to fix it.

#### **Heuristic-Based Feedback**

Research involving a Figma plugin that uses GPT-4 for automated heuristic evaluation provides a powerful model for this process.29 In this system, when an LLM detects a violation of a design guideline (e.g., Nielsen's heuristics), it does not simply state the violation. Instead, it is prompted again to rephrase the finding as a piece of constructive advice. This advice is structured to explain the gap between the current design and the expected standard and to provide actionable guidance on how to close that gap.29 For example, instead of saying "Violation: Low contrast," the agent would generate a recommendation like, "To improve readability and meet accessibility standards, consider increasing the color contrast between the button text and its background."

#### **UI Representation for Analysis**

A critical enabler for this level of specific feedback is the ability to represent the user interface in a structured, machine-readable format. The Figma plugin accomplishes this by converting the UI mockup into a JSON representation that concisely captures the layout hierarchy as well as both the semantic (e.g., text content, element type, accessibility labels) and visual (e.g., location, size, color) properties of each component.29 This structured representation allows the LLM to move beyond vague, high-level feedback and reason precisely about specific elements of the interface, forming the foundation for generating targeted and actionable recommendations.

### **4.3 The Final Frontier: Automated Translation into Design Tokens**

The most advanced and transformative stage of the automated feedback loop involves translating these structured recommendations directly into modifications of the design system—the single source of truth that governs a product's visual and interactive language. This step effectively connects the UX feedback loop with the DevOps CI/CD pipeline, creating a single, continuous cycle for product improvement.

#### **What are Design Tokens?**

Design tokens are the atomic, indivisible units of a design system. They are design decisions stored as key-value pairs, typically in a structured format like JSON or SCSS.31 Tokens represent foundational visual properties such as colors (color.brand.primary: \#0052CC), font sizes (font.size.heading.large: 32px), spacing units (space.padding.medium: 16px), and box shadows. They are the variables that bridge the gap between design tools and code, ensuring that a change to a foundational element is propagated consistently across the entire product ecosystem.31

#### **Agentic Design System Management**

This automated workflow envisions an "Improvement Agent" that can directly interact with the design system's codebase. Given a structured recommendation, such as "Increase contrast for primary button text to meet WCAG AA accessibility standards," the agent would perform the following steps:

1. **Parse Recommendation:** The agent first understands the intent of the recommendation.  
2. **Identify Target Tokens:** It queries the design system's token files to identify the relevant tokens that control the appearance of the primary button text (e.g., color.button.primary.text and color.button.primary.background).  
3. **Generate New Value:** Using its knowledge of accessibility guidelines and color theory, the agent calculates a new color value for the text that satisfies the contrast requirement against the background color.  
4. **Propose Change:** The agent modifies the JSON file, updating the value of the target token.  
5. **Commit and Create Pull Request:** Finally, the agent commits this change to a version control system (like Git) and automatically opens a pull request, complete with a descriptive summary of the change and the rationale behind it, ready for human review and approval.

This process requires that the design system itself evolves to be machine-interpretable, not just human-readable. A style guide presented as a PDF document is opaque to an agent. A design system defined as code, through design tokens and machine-readable documentation of principles and patterns, is an essential prerequisite for this level of automation.32 The role of the design system manager thus expands to include the curation of this "agent-aware" knowledge base, which AI agents can query, reason about, and ultimately modify. This transformation moves UX testing from a separate, preceding phase of development into an integrated, continuous process that runs in parallel, constantly feeding improvements back into the product's foundational code.

## **Scaling Complexity with Advanced Agent Coordination**

While single-agent simulations are effective for testing linear user flows, the complexity of modern digital products often requires the evaluation of multi-step, multi-user, or branching scenarios. Addressing this complexity necessitates moving beyond a monolithic agent to a multi-agent system where specialized agents collaborate to achieve a common goal. The choice of coordination pattern is a critical architectural decision that dictates the system's capabilities, cost, and performance.

### **5.1 A Taxonomy of Coordination Patterns**

Research and industry practice have converged on three primary architectural patterns for agent collaboration, each suited to different types of tasks.34

#### **Single Agent ("Solo Hero")**

In this simplest pattern, a single, autonomous agent is responsible for handling a task from end to end.34 It relies on an internal planning loop (such as the ReAct framework) to break down the goal, execute steps, and self-correct.10 This approach is best suited for small, self-contained tasks where the entire context can be managed by one agent without significant performance degradation.

#### **Sub-Agent System ("Orchestrator with a Crew")**

This is a hierarchical pattern where a central "supervisor" or "orchestrator" agent acts as a project manager.9 The supervisor receives a complex, high-level goal, decomposes it into a series of smaller, more manageable sub-tasks, and delegates each sub-task to a specialized worker agent.10 The supervisor is responsible for managing the overall workflow, deciding whether sub-tasks should be executed sequentially or in parallel, and synthesizing the results from the worker agents into a final, coherent output.34 This is the most common and powerful pattern for tackling complex but well-defined problems. A key advantage of this architecture is its solution to the "context pollution" problem. In long-running tasks, a single agent's context window can become cluttered with irrelevant information from earlier steps, degrading its reasoning ability.35 The sub-agent pattern mitigates this by providing each worker agent with its own clean, isolated context containing only the information necessary for its specific sub-task, while the supervisor maintains a high-level summary of the overall mission.35

#### **Multi-Agent System ("Peer-to-Peer Collaboration")**

This pattern is a decentralized or heterarchical model where two or more independent agents collaborate without a single designated "boss".34 These agents communicate, negotiate, and exchange information as peers to solve a problem or achieve a shared objective.39 This approach is particularly powerful for tasks that require multiple, diverse perspectives or where the solution path is not known in advance and must emerge from the interaction between agents.

However, the choice of coordination pattern carries significant economic and performance trade-offs. While a sub-agent system is more capable of handling complexity, it can be substantially slower and more expensive than a single-agent approach. Each call to a sub-agent typically involves a full LLM inference, meaning a task orchestrated across five agents can incur five times the latency and cost.35 This implies that a mature, cost-effective system must include a "Matcher" or "Routing" agent at the top level.11 This meta-agent's function is to analyze the complexity of an incoming task and dynamically select the most efficient coordination pattern—deploying a single agent for simple requests and escalating to a multi-agent team only when necessary. This principle of scaling effort to query complexity is a cornerstone of efficient agent system design.9

| Dimension | Single Agent ("Solo Hero") | Sub-Agent System ("Orchestrator") | Multi-Agent System ("Collaborative Peers") |
| :---- | :---- | :---- | :---- |
| **Architecture** | Monolithic; one agent performs all steps. | Hierarchical; a supervisor delegates to specialized worker agents. | Decentralized; multiple independent agents negotiate and collaborate. |
| **Task Complexity** | Low (Linear, self-contained tasks). | High (Complex, multi-step but decomposable workflows). | Very High (Tasks requiring emergent behavior or multiple perspectives). |
| **Coordination** | Internal planning loop (e.g., ReAct). | Centralized orchestration by a supervisor agent. | Peer-to-peer communication and negotiation. |
| **Context Management** | Prone to context pollution in long tasks. | Clean; each sub-agent has an isolated context for its task. | Complex; requires shared state or sophisticated message passing. |
| **Cost & Latency** | Low (fewer LLM calls). | High (multiple LLM calls per task). | Variable, but potentially very high due to negotiation overhead. |
| **Ideal UX Testing Scenario** | \- Validating a single form. \- Testing a password reset flow. \- Checking for broken links on a page. | \- Simulating an end-to-end e-commerce purchase journey. \- Performing a comprehensive accessibility audit with specialized sub-agents. \- Testing a user onboarding sequence. | \- Simulating multiple users in a real-time collaborative tool. \- Testing features that involve role-based access control (e.g., admin vs. user views). \- Red-teaming a system with an "Adversarial" agent and a "User" agent. |
| **Key Research** | 34 | 9 | 34 |

### **5.2 Applying Coordination Patterns to End-to-End UX Testing**

The theoretical taxonomy of coordination patterns becomes practical when applied to concrete UX testing scenarios.

#### **Single Agent Scenario**

For simple, linear tasks, a single agent is sufficient and most efficient. Examples include:

* **Form Validation:** An agent is tasked with filling out a contact form or a password reset form, checking for proper validation messages and error handling.  
* **Link Checking:** An agent navigates a single page and verifies that all links lead to the correct destinations.

#### **Sub-Agent Scenario**

For complex, multi-step user journeys that are nevertheless well-defined, the sub-agent pattern is ideal. Consider the simulation of an e-commerce checkout process:

1. An **Orchestrator Agent** is given the high-level goal: "Purchase item \#12345 and ship it to a specific address."  
2. The Orchestrator delegates the task of navigating to the product page and adding the item to the cart to a **Browser Agent**.  
3. Once the item is in the cart, the Orchestrator invokes a **Data Agent** to generate realistic but synthetic user information (name, shipping address, credit card details).  
4. The Orchestrator passes this data back to the **Browser Agent** to fill out the checkout forms.  
5. Throughout the process, a **QA Agent** runs in the background, monitoring for errors, logging interaction times, and identifying any points of friction (e.g., a confusing form field or a non-responsive button).34  
6. Finally, the Orchestrator collects the logs from all sub-agents and synthesizes a final report on the success or failure of the journey.

#### **Multi-Agent Scenario**

For scenarios that require the simulation of multiple independent actors or conflicting perspectives, the peer-to-peer multi-agent pattern is necessary. Examples include:

* **Collaborative Tool Testing:** To test a shared document editor like Google Docs, one could deploy a **"Writer" Agent** and a **"Reviewer" Agent** into the same document. The Writer Agent's goal is to compose a document, while the Reviewer Agent's goal is to simultaneously make edits and leave comments. This setup can uncover complex bugs related to real-time collaboration, such as race conditions, conflicting edits, and notification system failures, which a single agent could never discover.  
* **Role-Based Access Control:** Testing an application with different user roles (e.g., an administrator and a standard user) can be simulated by deploying two agents with different permissions. The system can then verify that the standard user agent is correctly blocked from accessing administrative functions.

### **5.3 Technical Implementation of Coordination**

The orchestration of multiple agents is enabled by a growing ecosystem of frameworks and protocols designed for inter-agent communication and workflow management.

* **Frameworks:** Open-source frameworks like Microsoft's AutoGen, LangChain, and crewAI provide the essential building blocks for implementing multi-agent systems.35 They offer abstractions for defining agents with specific roles and tools, creating supervisor agents to manage workflows, and programming the logic that governs how tasks are delegated and how information is passed between agents.  
* **Communication Protocols:** The method of communication between agents can vary. Traditional agent systems have used formal Agent Communication Languages (ACLs) like FIPA-ACL or shared "blackboard" systems where agents post and retrieve information asynchronously.7 With the advent of powerful LLMs, natural language itself has become a viable, albeit potentially ambiguous, medium for inter-agent communication. In a typical sub-agent system, the supervisor acts as a router, forwarding user requests and intermediate results to the appropriate sub-agent based on a description of that agent's specialized capabilities.40

## **Extending Agent Capabilities with Claude Skills**

While multi-agent architectures provide a powerful way to structure complex tasks, the capabilities of the individual agents themselves are equally important. A recent and significant innovation in this area is Anthropic's Claude Skills, a paradigm that allows for the creation of modular, reusable, and contextually-aware capabilities for LLM agents. This approach represents a maturation of prompt engineering into a more structured and scalable discipline, offering a powerful solution to the inherent trade-off between an agent's capability and the finite length of its context window.

### **6.1 What are Claude Skills? A Paradigm Shift from Monolithic Prompts**

The traditional method of providing an agent with a new ability is to embed detailed instructions directly into its system prompt. This approach becomes unwieldy and inefficient as the number of abilities grows, leading to a "mega-prompt" that is difficult to maintain and consumes a large portion of the agent's valuable context window. Claude Skills offer a more elegant and efficient solution.

#### **Definition**

A Skill is a self-contained, reusable module that encapsulates a specific capability. It is structured as a folder containing three key components 44:

1. **SKILL.md:** A Markdown file that serves as the core of the skill. It includes YAML frontmatter with a name and a concise description, followed by detailed instructions that tell the agent how to perform the task.  
2. **Scripts:** An optional folder containing executable code (e.g., Python or JavaScript scripts) that the agent can run to perform tasks that are better suited to deterministic programming than probabilistic language generation.  
3. **Resources:** An optional folder containing supporting files, such as data templates, configuration files, or examples, that the skill might need.

#### **On-Demand Loading**

The most significant innovation of the Skills paradigm is its mechanism for on-demand, contextual loading.44 At the start of a session, the agent does not load the full content of every available skill into its context. Instead, it only reads the short, token-efficient description from the frontmatter of each SKILL.md file. This allows the agent to be aware of a vast library of potential capabilities while consuming only a few dozen tokens for each one. Only when the agent determines, based on the user's request, that a specific skill is relevant to the task at hand does it load the full instructions and resources for that skill into its context window.46

This on-demand loading mechanism is a powerful architectural solution to the fundamental trade-off between an agent's capability and its context length. It allows a single agent to have access to hundreds of specialized skills without suffering the performance degradation or high costs associated with a massive, static system prompt. This enables the creation of a "master" agent that is a generalist by default but can become a deep specialist in any required domain on demand.

#### **Benefits**

This modular approach transforms prompt engineering into a discipline more akin to modern software development. Instead of crafting a single, brittle "mega-prompt," developers can create a library of small, single-responsibility, and independently testable modules.47 This centralizes domain logic, avoids prompt sprawl, and makes the overall agentic system more maintainable, scalable, and reliable.46

### **6.2 Practical Application: Building a Library of UX Testing Skills**

The Skills paradigm is exceptionally well-suited for building a comprehensive UX testing agent. One can envision a library of skills, each encapsulating a specific aspect of the UX evaluation process.

* **persona\_simulator.skill:** This skill would contain detailed instructions on how to embody a specific user persona. The SKILL.md file would describe the persona's goals, motivations, technical proficiency, and potential frustrations. An accompanying script could be used to generate persona-appropriate test data (e.g., a "power user" persona might generate complex search queries, while a "novice user" might generate simple ones).  
* **accessibility\_audit.skill:** This skill would be designed to perform an automated accessibility check. The instructions would be based on WCAG (Web Content Accessibility Guidelines). The crucial component would be a Python script that uses a browser automation library (like Selenium or Playwright) to inspect the page's DOM for common accessibility violations, such as images missing alt text, insufficient color contrast ratios, or improper use of ARIA attributes.  
* **heuristic\_evaluator.skill:** This skill would encapsulate a set of established usability principles, such as Nielsen's 10 Usability Heuristics, directly within its SKILL.md file. When activated, the agent would use these heuristics as a critical lens through which to evaluate the UI it is interacting with, noting any potential violations.  
* **friction\_logger.skill:** To ensure consistent and structured data output, this skill would provide a predefined JSON schema in its resources folder. An associated script would contain a function that takes details of a friction point (e.g., description, severity, associated UI element) and formats it into a valid JSON object according to the schema, ready to be logged or sent to an analysis pipeline.

### **6.3 A Multi-Skill Workflow for a Complex Test**

The true power of Skills is realized when an agent composes multiple skills together to execute a complex, multi-faceted task. Consider the following request: "As a user with low vision, test the e-commerce checkout process for accessibility issues and log any problems you find."

1. **Skill Discovery and Loading:** The agent's orchestrator or main reasoning loop parses the request and identifies key phrases: "user with low vision," "checkout process," and "accessibility issues." It determines that the persona\_simulator.skill, the accessibility\_audit.skill, and the friction\_logger.skill are relevant. It then loads the full content of these three skills into its context.  
2. **Persona Embodiment:** The persona\_simulator.skill is configured for the "low vision" persona. Its instructions guide the agent's navigation strategy, causing it to prioritize actions that would be common for such a user (e.g., attempting to increase font size or relying heavily on keyboard navigation and screen-reader-friendly elements).  
3. **Concurrent Auditing:** As the agent navigates through the checkout flow (finding an item, adding it to the cart, entering shipping information), the accessibility\_audit.skill's script runs concurrently or at each step. It inspects the DOM of each new page, checking for issues like low-contrast text or form fields without proper labels.  
4. **Structured Logging:** When the audit script detects a violation (e.g., the "Confirm Purchase" button has a color contrast ratio of 2.5:1, failing the WCAG standard), it signals the agent. The agent then activates the friction\_logger.skill. It uses the logging script to create a structured JSON object detailing the issue: {"issue": "Low Contrast", "element\_id": "btn-confirm", "wcag\_guideline": "1.4.3", "severity": "High"}.  
5. **Task Completion:** The agent continues this process until it either successfully completes the purchase or encounters a blocking issue, having generated a detailed, structured log of all accessibility problems found along the way.

### **6.4 Creating and Managing Skills**

The ecosystem around Claude Skills supports a flexible development lifecycle. The easiest method for creating a skill is conversational; a developer can simply ask Claude to help build a skill for a specific task. Claude will then ask a series of questions about the workflow and automatically generate the complete skill folder structure, including the SKILL.md file and placeholder scripts.45 For more complex requirements, developers can create and edit the skill files manually. Once created, skills are packaged as ZIP files and can be uploaded to an individual's Claude account. For team collaboration, skills can be managed in a version control repository (like Git) and shared, allowing an entire organization to build and maintain a centralized library of institutional knowledge and automated workflows.45

## **Critical Analysis and Future Outlook**

While the potential of multi-agent systems for automating UX feedback is immense, it is crucial to approach this emerging field with a balanced and critical perspective. The current state of the art presents significant challenges related to the validity of simulations, ethical considerations, and practical implementation. Acknowledging these limitations is the first step toward responsible innovation and charting a course for future research where these systems serve as powerful augmentations for, rather than replacements of, human expertise.

### **7.1 The Simulation Gap: Validity and Reliability of Agent Behavior**

The foundational premise of agent-based UX testing is that the behavior of a simulated agent is a valid proxy for the behavior of a human user. The degree to which this premise holds true is the subject of ongoing research and debate, and several significant gaps remain. This discrepancy highlights a core conflict between the inherent nature of LLMs—which are probabilistic, pattern-matching systems trained on biased data—and the fundamental requirements of rigorous scientific research, which demands reproducibility, objectivity, and grounding in empirical reality.51

#### **"Not Like Real Humans"**

As discovered in the user study of the UXAgent framework, LLM agents often exhibit behavior that is qualitatively different from that of human users.4 Their reasoning can be overly methodical, explicit, and logical, failing to capture the messy, intuitive, and sometimes irrational nature of human decision-making. While this explicit reasoning can be a useful analytical feature, it underscores that the agent is a caricature, not a perfect replica, of a user.3

#### **Bias and Stereotyping**

LLMs are trained on vast corpora of text and code from the internet, which contain and often amplify existing societal biases. When prompted to generate user personas, these models can produce profiles that are stereotypical and lack diversity, particularly with respect to age, occupation, and geography.53 A strong bias towards generating personas from the United States has been noted, for example.53 Relying on such a biased sample for usability testing can lead to a dangerous illusion of comprehensiveness, resulting in products that are well-tested for a narrow, privileged demographic but fail to meet the needs of a diverse global user base. This tendency of LLMs to "flatten human diversity and nuance" is a significant ethical and practical concern.55

#### **Lack of True Understanding and Grounding**

A fundamental critique of LLMs is that they operate on a purely syntactic level, predicting the next most probable token without any genuine comprehension of the concepts they are manipulating.51 They lack the embodied, sensorimotor experience that grounds human understanding in the real world. This can lead to plausible-sounding but factually incorrect or nonsensical outputs, a phenomenon known as "hallucination".51 In a UX testing context, an agent might hallucinate a UI element that doesn't exist or fundamentally misinterpret the purpose of a feature, leading to invalid feedback.

#### **Reproducibility Concerns**

The probabilistic nature of LLMs means that running the same test with the same agent and the same initial prompt can yield different results on different occasions.53 This lack of determinism poses a significant challenge for the scientific validity and reproducibility of findings from agent-based studies. Research has shown that the distribution of synthetic survey responses from an LLM can vary significantly with minor changes in prompt wording and even with the same prompt over a three-month period, raising serious concerns about the reliability of the data they generate.53 Consequently, using LLM agents as direct, drop-in replacements for human subjects in formal, summative evaluations or statistical studies is currently untenable. Their primary value lies in formative evaluation—as tools for discovery, ideation, and hypothesis generation, whose findings must then be validated through more traditional research methods.

### **7.2 Ethical and Practical Challenges**

Beyond the question of simulation validity, the deployment of autonomous agents that interact with live systems introduces a host of ethical and security challenges.

#### **Privacy and Data Security**

When an agent interacts with a production website or application, it may be exposed to or prompted to enter sensitive data. There is a significant risk that this data could be inadvertently leaked, either through insecure logging, exfiltration by a malicious tool, or the model's own tendency to memorize and reproduce information from its context or training set.51

#### **Adversarial Attacks**

Agentic systems create new and potent attack surfaces. These include:

* **Prompt Injection:** An attacker could manipulate the content on a webpage such that, when the agent perceives it, malicious instructions are injected into its context, causing it to perform unintended actions.56  
* **Memory Poisoning:** An attacker could inject adversarial content into the agent's long-term memory or retrieval-augmented generation (RAG) database, corrupting its knowledge base and misleading its future decision-making.56

#### **Misalignment and Over-Optimization**

There is a risk that an agent, tasked with optimizing for a specific usability metric, will find a way to "game the system." It might discover a path through an application that is highly efficient according to the defined metrics but is completely unintuitive or frustrating for a human user.56 This misalignment between the agent's internal objectives and the goal of genuine human satisfaction can lead to the development of products that are perfectly usable for an AI but practically unusable for people.

### **7.3 The Evolving Role of the Human UX Researcher**

Given these significant challenges, it is clear that agent-based systems are not poised to replace human UX researchers. Instead, they are powerful new tools that will augment their capabilities and transform their role within the product development lifecycle.

#### **From Practitioner to "Agent Fleet Commander"**

The role of the UX researcher will increasingly shift from the direct execution of research to the strategic design, management, and oversight of a fleet of autonomous testing agents. Human expertise will be more critical than ever, but it will be applied at a higher level of abstraction. Researchers will be responsible for:

* **Designing Test Scenarios:** Defining the high-level goals, tasks, and success criteria for the agents.  
* **Curating Personas:** Carefully designing and validating the distributions of synthetic personas to ensure they are diverse, representative, and free from harmful biases.  
* **Critically Evaluating Agent Findings:** Using their deep domain knowledge to interpret the outputs of the agent simulations, separate the signal from the noise, and validate the most critical findings with targeted human-led research.

#### **A Tool for Augmentation, Not Replacement**

The current state of the art positions these systems as invaluable tools for specific stages of the research process. They excel at *early-stage feedback*, allowing designers to get rapid, low-cost input on mockups and prototypes.6 They are powerful engines for *ideation* and exploring the problem space from multiple perspectives.6 Most significantly, they provide a scalable and efficient way to run massive regression testing suites, ensuring that new code changes do not inadvertently introduce new usability issues. This automation of more routine and scalable tasks frees up human researchers to focus on the work that requires uniquely human skills: deep empathy, nuanced qualitative analysis, strategic thinking, and creative problem-solving.

#### **Future Research Directions**

The path forward for agent-based UX testing will be defined by research that addresses the critical challenges outlined above. Key areas for future work include:

* **Validation and Grounding:** Developing robust methodologies for validating agent behavior against real human user data to better understand and close the "simulation gap."  
* **Bias and Safety:** Creating new techniques for detecting and mitigating bias in LLM-generated personas and building more resilient defenses against adversarial attacks.  
* **Human-Agent Collaboration:** Designing the next generation of research tools that are not just used *by* researchers but collaborate *with* them. The trustworthiness of the insights generated by these complex systems will be directly proportional to the transparency and usability of their own interfaces. A successful agent-based UX testing platform must itself have excellent UX, providing clear audit trails, explainable outputs, and intuitive mechanisms for human oversight and intervention.40

#### **Works cited**

1. LLM-Based Multi-Agent Systems for Software Engineering: Literature Review, Vision and the Road Ahead \- arXiv, accessed on October 21, 2025, [https://arxiv.org/html/2404.04834v4](https://arxiv.org/html/2404.04834v4)  
2. Evaluation and Benchmarking of LLM Agents: A Survey \- arXiv, accessed on October 21, 2025, [https://arxiv.org/html/2507.21504v1](https://arxiv.org/html/2507.21504v1)  
3. Evaluating the LLM Agents for Simulating Humanoid Behavior, accessed on October 21, 2025, [https://par.nsf.gov/servlets/purl/10544265](https://par.nsf.gov/servlets/purl/10544265)  
4. UXAgent: An LLM-Agent-Based Usability Testing ... \- Amazon Science, accessed on October 21, 2025, [https://assets.amazon.science/ce/a8/3e0f868d478cac3d07b9ee8c2804/uxagent-an-llm-agent-based-usability-testing-framework-for-web-design.pdf](https://assets.amazon.science/ce/a8/3e0f868d478cac3d07b9ee8c2804/uxagent-an-llm-agent-based-usability-testing-framework-for-web-design.pdf)  
5. UXAgent: A System for Simulating Usability Testing of Web Design with LLM Agents, accessed on October 21, 2025, [https://www.researchgate.net/publication/390773360\_UXAgent\_A\_System\_for\_Simulating\_Usability\_Testing\_of\_Web\_Design\_with\_LLM\_Agents](https://www.researchgate.net/publication/390773360_UXAgent_A_System_for_Simulating_Usability_Testing_of_Web_Design_with_LLM_Agents)  
6. UXAgent: A System for Simulating Usability Testing of Web Design with LLM Agents \- arXiv, accessed on October 21, 2025, [https://arxiv.org/html/2504.09407v3](https://arxiv.org/html/2504.09407v3)  
7. Advancing Multi-Agent Systems Through Model Context Protocol: Architecture, Implementation, and Applications \- arXiv, accessed on October 21, 2025, [https://arxiv.org/html/2504.21030v1](https://arxiv.org/html/2504.21030v1)  
8. An Approach to Model Based Testing of Multiagent Systems \- PMC, accessed on October 21, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC4385681/](https://pmc.ncbi.nlm.nih.gov/articles/PMC4385681/)  
9. How we built our multi-agent research system \\ Anthropic, accessed on October 21, 2025, [https://www.anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system)  
10. Agent-Oriented Planning in Multi-Agent Systems \- arXiv, accessed on October 21, 2025, [https://arxiv.org/pdf/2410.02189](https://arxiv.org/pdf/2410.02189)  
11. A framework for task automation through multi-agent collaboration \- arXiv, accessed on October 21, 2025, [https://arxiv.org/html/2406.20041v1](https://arxiv.org/html/2406.20041v1)  
12. UXAgent: An LLM-agent-based usability testing framework for web design \- Amazon Science, accessed on October 21, 2025, [https://www.amazon.science/publications/uxagent-an-llm-agent-based-usability-testing-framework-for-web-design](https://www.amazon.science/publications/uxagent-an-llm-agent-based-usability-testing-framework-for-web-design)  
13. Agents for Automated User Experience Testing | Request PDF \- ResearchGate, accessed on October 21, 2025, [https://www.researchgate.net/publication/351966281\_Agents\_for\_Automated\_User\_Experience\_Testing](https://www.researchgate.net/publication/351966281_Agents_for_Automated_User_Experience_Testing)  
14. \[CHI'25 LBW Accepted\] UXAgent: An LLM Agent-Based Usability Testing Framework for Web Design, accessed on October 21, 2025, [https://uxagent.hailab.io/](https://uxagent.hailab.io/)  
15. UXAgent: A System for Simulating Usability Testing of Web Design with LLM Agents \- arXiv, accessed on October 21, 2025, [https://arxiv.org/abs/2504.09407](https://arxiv.org/abs/2504.09407)  
16. The AI Engineer's Guide to LLM Observability with OpenTelemetry \- Agenta, accessed on October 21, 2025, [https://agenta.ai/blog/the-ai-engineer-s-guide-to-llm-observability-with-opentelemetry](https://agenta.ai/blog/the-ai-engineer-s-guide-to-llm-observability-with-opentelemetry)  
17. The Definitive Guide to LLM Evaluation \- Arize AI, accessed on October 21, 2025, [https://arize.com/llm-evaluation/](https://arize.com/llm-evaluation/)  
18. Building an LLM evaluation framework: best practices \- Datadog, accessed on October 21, 2025, [https://www.datadoghq.com/blog/llm-evaluation-framework-best-practices/](https://www.datadoghq.com/blog/llm-evaluation-framework-best-practices/)  
19. Applying Large Language Model to User Experience Testing \- ResearchGate, accessed on October 21, 2025, [https://www.researchgate.net/publication/386123240\_Applying\_Large\_Language\_Model\_to\_User\_Experience\_Testing](https://www.researchgate.net/publication/386123240_Applying_Large_Language_Model_to_User_Experience_Testing)  
20. Applying Large Language Model to User Experience Testing \- MDPI, accessed on October 21, 2025, [https://www.mdpi.com/2079-9292/13/23/4633](https://www.mdpi.com/2079-9292/13/23/4633)  
21. System Usability Scale Benchmarking for Digital Health Apps: Meta-analysis \- PMC, accessed on October 21, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC9437782/](https://pmc.ncbi.nlm.nih.gov/articles/PMC9437782/)  
22. GALA: Can Graph-Augmented Large Language Model Agentic Workflows Elevate Root Cause Analysis? \- arXiv, accessed on October 21, 2025, [https://arxiv.org/html/2508.12472v1](https://arxiv.org/html/2508.12472v1)  
23. GALA: Can Graph-Augmented Large Language Model Agentic Workflows Elevate Root Cause Analysis? \- ChatPaper, accessed on October 21, 2025, [https://chatpaper.com/paper/181140](https://chatpaper.com/paper/181140)  
24. Automatic Root Cause Analysis via Large Language Models for Cloud Incidents | Request PDF \- ResearchGate, accessed on October 21, 2025, [https://www.researchgate.net/publication/379998668\_Automatic\_Root\_Cause\_Analysis\_via\_Large\_Language\_Models\_for\_Cloud\_Incidents](https://www.researchgate.net/publication/379998668_Automatic_Root_Cause_Analysis_via_Large_Language_Models_for_Cloud_Incidents)  
25. PRISMe – A Novel LLM-Powered Tool for Interactive Privacy Policy Assessment \- arXiv, accessed on October 21, 2025, [https://arxiv.org/html/2501.16033v1](https://arxiv.org/html/2501.16033v1)  
26. System Usability Scale for Measuring Usability of Social Network Applications from User Perspectives \- E3S Web of Conferences, accessed on October 21, 2025, [https://www.e3s-conferences.org/articles/e3sconf/pdf/2024/13/e3sconf\_isst2024\_03010.pdf](https://www.e3s-conferences.org/articles/e3sconf/pdf/2024/13/e3sconf_isst2024_03010.pdf)  
27. Translating User Research Into Design \- UX Tools, accessed on October 21, 2025, [https://www.uxtools.co/blog/translating-user-research-into-design](https://www.uxtools.co/blog/translating-user-research-into-design)  
28. Turning Customers Feedback into Action: An LLM Blueprint for App Review Analysis | by Luca Fiaschi | Medium, accessed on October 21, 2025, [https://medium.com/@lucafiaschi/turning-customers-feedback-into-action-an-llm-blueprint-for-app-review-analysis-7f5d39d08f6e](https://medium.com/@lucafiaschi/turning-customers-feedback-into-action-an-llm-blueprint-for-app-review-analysis-7f5d39d08f6e)  
29. Generating Automatic Feedback on UI Mockups ... \- People @EECS, accessed on October 21, 2025, [http://people.eecs.berkeley.edu/\~bjoern/papers/duan-heuristic-chi2024.pdf](http://people.eecs.berkeley.edu/~bjoern/papers/duan-heuristic-chi2024.pdf)  
30. Roadmap for an AI-Powered UX Design Agent | by Aman Singh | Bootcamp | Medium, accessed on October 21, 2025, [https://medium.com/design-bootcamp/roadmap-for-an-ai-powered-ux-design-agent-676ce4e3d12d](https://medium.com/design-bootcamp/roadmap-for-an-ai-powered-ux-design-agent-676ce4e3d12d)  
31. Design Tokens: Tools to Improve Designer-Developer Collaboration, accessed on October 21, 2025, [https://sevenpeakssoftware.com/blog/design-tokens](https://sevenpeakssoftware.com/blog/design-tokens)  
32. From products to systems: The agentic AI shift | by John Moriarty | Sep, 2025 | UX Collective, accessed on October 21, 2025, [https://uxdesign.cc/from-products-to-systems-the-agentic-ai-shift-eaf6a7180c43](https://uxdesign.cc/from-products-to-systems-the-agentic-ai-shift-eaf6a7180c43)  
33. Augmenting Human Creativity: Practical Applications of LLMs in UI/UX Design, accessed on October 21, 2025, [https://andyuxpro.medium.com/augmenting-human-creativity-practical-applications-of-llms-in-ui-ux-design-a0626dffff42](https://andyuxpro.medium.com/augmenting-human-creativity-practical-applications-of-llms-in-ui-ux-design-a0626dffff42)  
34. Agents, Subagents, and Multi Agents: What They Are and When to Use Them | goose, accessed on October 21, 2025, [https://block.github.io/goose/blog/2025/08/14/agent-coordination-patterns/](https://block.github.io/goose/blog/2025/08/14/agent-coordination-patterns/)  
35. Subagent orchestration: The complete 2025 guide for AI workflows \- eesel AI, accessed on October 21, 2025, [https://www.eesel.ai/blog/subagent-orchestration](https://www.eesel.ai/blog/subagent-orchestration)  
36. Claude Sub-Agents: AI-Powered Code Refactoring & Testing \- Arsturn, accessed on October 21, 2025, [https://www.arsturn.com/blog/claude-sub-agents-for-smarter-code-refactoring-testing](https://www.arsturn.com/blog/claude-sub-agents-for-smarter-code-refactoring-testing)  
37. Claude Code Subagents: The Revolutionary Multi-Agent Development System That Changes Everything \- Cursor IDE, accessed on October 21, 2025, [https://www.cursor-ide.com/blog/claude-code-subagents](https://www.cursor-ide.com/blog/claude-code-subagents)  
38. Beyond a Single AI: How Claude's Sub-Agents Will 10x Your Development Workflow, accessed on October 21, 2025, [https://medium.com/@rihpig/beyond-a-single-ai-how-claudes-sub-agents-will-10x-your-development-workflow-0c80d1b9b370](https://medium.com/@rihpig/beyond-a-single-ai-how-claudes-sub-agents-will-10x-your-development-workflow-0c80d1b9b370)  
39. Mechanism design for large language models \- Google Research, accessed on October 21, 2025, [https://research.google/blog/mechanism-design-for-large-language-models/](https://research.google/blog/mechanism-design-for-large-language-models/)  
40. Top 10 Agentic AI Design Patterns | Enterprise Guide \- Aufait UX, accessed on October 21, 2025, [https://www.aufaitux.com/blog/agentic-ai-design-patterns-enterprise-guide/](https://www.aufaitux.com/blog/agentic-ai-design-patterns-enterprise-guide/)  
41. Multi‑Agent Coordination Playbook (MCP & AI Teamwork) – Implementation Plan \- Jeeva AI, accessed on October 21, 2025, [https://www.jeeva.ai/blog/multi-agent-coordination-playbook-(mcp-ai-teamwork)-implementation-plan](https://www.jeeva.ai/blog/multi-agent-coordination-playbook-\(mcp-ai-teamwork\)-implementation-plan)  
42. LLM Automation: Top 7 Tools & 8 Case Studies \- Research AIMultiple, accessed on October 21, 2025, [https://research.aimultiple.com/llm-automation/](https://research.aimultiple.com/llm-automation/)  
43. Use Agent Bricks: Multi-Agent Supervisor to create a coordinated multi-agent system | Databricks on AWS, accessed on October 21, 2025, [https://docs.databricks.com/aws/en/generative-ai/agent-bricks/multi-agent-supervisor](https://docs.databricks.com/aws/en/generative-ai/agent-bricks/multi-agent-supervisor)  
44. Claude Skills are awesome, maybe a bigger deal than MCP \- Simon Willison's Weblog, accessed on October 21, 2025, [https://simonwillison.net/2025/Oct/16/claude-skills/](https://simonwillison.net/2025/Oct/16/claude-skills/)  
45. A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows \- GitHub, accessed on October 21, 2025, [https://github.com/travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)  
46. Claude can now use Skills : r/ClaudeAI \- Reddit, accessed on October 21, 2025, [https://www.reddit.com/r/ClaudeAI/comments/1o8af9q/claude\_can\_now\_use\_skills/](https://www.reddit.com/r/ClaudeAI/comments/1o8af9q/claude_can_now_use_skills/)  
47. Claude Skills \+ Agent SDK: How to Build Smarter, Reliable AI Agents, accessed on October 21, 2025, [https://sider.ai/blog/ai-tools/claude-skills-agent-sdk-how-to-build-smarter-reliable-ai-agents](https://sider.ai/blog/ai-tools/claude-skills-agent-sdk-how-to-build-smarter-reliable-ai-agents)  
48. Claude Skills | Hacker News, accessed on October 21, 2025, [https://news.ycombinator.com/item?id=45607117](https://news.ycombinator.com/item?id=45607117)  
49. How to Create and Use Skills in Claude and Claude Code \- Apidog, accessed on October 21, 2025, [https://apidog.com/blog/claude-skills/](https://apidog.com/blog/claude-skills/)  
50. Using Skills in Claude, accessed on October 21, 2025, [https://support.claude.com/en/articles/12512180-using-skills-in-claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)  
51. Understanding LLMs and overcoming their limitations \- Lumenalta, accessed on October 21, 2025, [https://lumenalta.com/insights/understanding-llms-overcoming-limitations](https://lumenalta.com/insights/understanding-llms-overcoming-limitations)  
52. Debunking common LLM critique : r/ArtificialSentience \- Reddit, accessed on October 21, 2025, [https://www.reddit.com/r/ArtificialSentience/comments/1jhmesv/debunking\_common\_llm\_critique/](https://www.reddit.com/r/ArtificialSentience/comments/1jhmesv/debunking_common_llm_critique/)  
53. The Use of Large Language Models in HCI: A Critical Analysis of ..., accessed on October 21, 2025, [https://www.researchgate.net/publication/396367998\_The\_Use\_of\_Large\_Language\_Models\_in\_HCI\_A\_Critical\_Analysis\_of\_Synthetic\_Users](https://www.researchgate.net/publication/396367998_The_Use_of_Large_Language_Models_in_HCI_A_Critical_Analysis_of_Synthetic_Users)  
54. arxiv.org, accessed on October 21, 2025, [https://arxiv.org/html/2403.19876v1\#:\~:text=In%20addition%2C%20HCI%20researchers%20also,fail%20to%20generalize%20to%20others.](https://arxiv.org/html/2403.19876v1#:~:text=In%20addition%2C%20HCI%20researchers%20also,fail%20to%20generalize%20to%20others.)  
55. “I'm categorizing LLM as a productivity tool”: Examining ethics of LLM use in HCI research practices \- arXiv, accessed on October 21, 2025, [https://arxiv.org/html/2403.19876v1](https://arxiv.org/html/2403.19876v1)  
56. LLM Agents: How They Work and Where They Go Wrong \- Holistic AI, accessed on October 21, 2025, [https://www.holisticai.com/blog/llm-agents-use-cases-risks](https://www.holisticai.com/blog/llm-agents-use-cases-risks)  
57. Enhancing user experience and trust in advanced LLM-based conversational agents, accessed on October 21, 2025, [https://ojs.acad-pub.com/index.php/CAI/article/view/1467](https://ojs.acad-pub.com/index.php/CAI/article/view/1467)
