Introduction to prompt design

Prompt design is the process of creating prompts that elicit the desired response from language models. Writing well structured prompts is an essential part of ensuring accurate, high quality responses from a language model. This page introduces some basic concepts, strategies, and best practices to get you started in designing prompts.

What is a prompt
A prompt is a natural language request submitted to a language model to receive a response back. Prompts can contain questions, instructions, contextual information, examples, and partial input for the model to complete or continue. After the model receives a prompt, depending on the type of model being used, it can generate text, embeddings, code, images, videos, music, and more.

Prompt content types
Prompts can include one or more of the following types of content:

Input (required)
Context (optional)
Examples (optional)
Input
An input is the text in the prompt that you want the model to provide a response for, and it's a required content type. Inputs can be a question that the model answers (question input), a task the model performs (task input), an entity the model operates on (entity input), or partial input that the model completes or continues (completion input).

Question input
A question input is a question that you ask the model that the model provides an answer to.

Prompt:

What's a good name for a flower shop that specializes in selling bouquets of
dried flowers? Create a list of 10 options with just the names.
Response:

Here are 10 names for a flower shop specializing in dried flowers:

1. Everlasting Blooms
2. Dried & Delightful
3. The Petal Preserve
4. Whispers of Wildflowers
5. Forever Blooms
6. The Botanical Muse
7. Timeless Blooms
8. Dried Flower Co.
9. Bloom & Co.
10. The Sun-Kissed Petals
(gemini-1.5-flash)
Task input
A task input is a task that you want the model to perform. For example, you can tell the model to give you ideas or suggestions for something.

Prompt:

Give me a simple list of just the things that I must bring on a camping trip. The list should have 10 items.
Response:

Here's a list of 10 essential items for a camping trip:

1. **Tent:** Your shelter from the elements.
2. **Sleeping Bag:** Stay warm and comfortable.
3. **Sleeping Pad:** Insulation and cushioning for a good night's sleep.
4. **Headlamp or Flashlight:** Light for nighttime activities.
5. **First Aid Kit:** Be prepared for minor injuries.
6. **Water Bottle/Hydration Pack:** Stay hydrated.
7. **Food and Snacks:** Fuel for your adventures.
8. **Cooking Gear:** Camp stove, fuel, utensils, etc.
9. **Knife and Multitool:** Essential for various tasks.
10. **Camp Chair:** Enjoy your campfire and meals comfortably.
(gemini-1.5-flash)
Entity input
An entity input is what the model performs an action on, such as classify or summarize. This type of input can benefit from the inclusion of instructions.

Prompt:

Classify the following items as [large, small].
Elephant
Mouse
Snail
Response:

Here's the classification:

* **Elephant:** Large
* **Mouse:** Small
* **Snail:** Small
(gemini-1.5-flash)
Completion input
A completion input is text that the model is expected to complete or continue.

Prompt:

Complete the following prompt: Some simple strategies for overcoming writer's block include...
Response:

Some simple strategies for overcoming writer's block include:

* **Freewriting:** Write non-stop for a set amount of time (5-10 minutes) without worrying about grammar, spelling, or even making sense. Just keep your pen moving and let your thoughts flow freely. This can help you loosen up and access ideas you might not have considered otherwise.
* **Brainstorming:** Make a list of everything that comes to mind related to your topic, no matter how silly or unrelated it seems. You can also use mind mapping or other visual brainstorming techniques.
* **Changing your environment:** Sometimes a change of scenery can be all you need to get the creative juices flowing. Go for a walk, work in a coffee shop, or even just move to a different room in your house.
* **Reading:** Immerse yourself in the work of other writers, especially those who inspire you. Pay attention to their style, their structure, and their use of language.
* **Taking a break:** Sometimes the best way to overcome writer's block is to simply step away from the project for a while. Go for a walk, watch a movie, listen to music, or do something else that you enjoy. You might be surprised at how much clearer your head feels when you return to your writing.
* **Focusing on a single element:** Instead of tackling the entire project, focus on a single sentence, paragraph, or scene. Once you get something down on paper, it can be easier to build from there.
* **Starting with the ending:** If you're stuck on the beginning, try writing the ending first. This can help you to clarify your overall vision for the project and provide a framework for your ideas.
* **Talking it out:** Share your ideas and challenges with a friend, a writing group, or a writing coach. Discussing your project with someone else can help you to see it from a new perspective and find solutions to your writing problems.

Remember, writer's block is a common experience, and it's not a sign that you're a bad writer. Just be patient with yourself, try some of these strategies, and keep writing!
(gemini-1.5-flash)
Context
Context can be one of the following:

Instructions that specify how the model should behave.
Information that the model uses or references to generate a response.
Add contextual information in your prompt when you need to give information to the model, or restrict the boundaries of the responses to only what's within the prompt.

Prompt:

Marbles:
Color: red
Number: 12
Color: blue
Number: 28
Color: yellow
Number: 15
Color: green
Number: 17

How many green marbles are there?
Response:

There are 17 green marbles.
(gemini-1.5-flash)
Examples
Examples are input-output pairs that you include in the prompt to give the model an example of an ideal response. Including examples in the prompt is an effective strategy for customizing the response format.

Prompt:

Classify the following.
Options:
- red wine
- white wine

Text: Chardonnay
The answer is: white wine
Text: Cabernet
The answer is: red wine
Text: Moscato
The answer is: white wine

Text: Riesling
The answer is:
Response:

The answer is: white wine

Prompt design strategies

This page introduces you to some general prompt design strategies that you can employ when designing prompts.

Large language models (LLM) are trained on vast amounts of text data to learn the patterns and relationships between language. When given some text (the prompt), language models can predict what is likely to come next, like a sophisticated autocompletion tool.

Google AI Studio hosts a simple prompt gallery meant to interactively showcase many of the concepts shared in this guide. In the rest of this guide, you'll learn about the following prompt design strategies:
Give clear and specific instructions
Include few-shot examples
Add contextual information
Add prefixes
Let the model complete partial input
Give clear and specific instructions
Giving the model instructions on what to do is an effective and efficient way to customize model behavior. Ensure that the instructions you give are clear and specific. Instructions can be as simple as a list of step-by-step instructions or as complex as mapping out a user's experience and mindset.

Define the task to perform
Describe in detail the task that you want the model to perform. The task can be as simple as a step-by-step list of instructions or as complex as mapping out a user's experience and mindset. The following prompt tells the model to summarize a block of text:

Prompt:

Summarize this text:
Text: A quantum computer exploits quantum mechanical phenomena to perform calculations exponentially
faster than any modern traditional computer. At very tiny scales, physical matter acts as both
particles and as waves, and quantum computing uses specialized hardware to leverage this behavior.
The operating principles of quantum devices is beyond the scope of classical physics. When deployed
at scale, quantum computers could be used in a wide variety of applications such as: in
cybersecurity to break existing encryption methods while helping researchers create new ones, in
meteorology to develop better weather forecasting etc. However, the current state of the art quantum
computers are still largely experimental and impractical.
Response:

Quantum computers leverage the wave-particle duality of matter at tiny scales to perform
calculations exponentially faster than traditional computers. They harness quantum phenomena,
which are beyond the scope of classical physics, to achieve this speed advantage. While
promising for applications like cybersecurity, weather forecasting, and beyond, current
quantum computers are still experimental and not yet practical for widespread use.
(gemini-1.5-flash)
Specify any constraints
Specify any constraints on reading the prompt or generating a response. You can tell the model what to do and not to do. From the previous example, the summarization is shorter than the original text, but maybe you want the summary to be shorter. In this case, you can specify a constraint in the prompt on how long you want the summary to be:

Prompt:


Summarize this text in two sentences:
Text: A quantum computer exploits quantum mechanical phenomena to perform calculations exponentially
faster than any modern traditional computer. At very tiny scales, physical matter acts as both
particles and as waves, and quantum computing uses specialized hardware to leverage this behavior.
The operating principles of quantum devices is beyond the scope of classical physics. When deployed
at scale, quantum computers could be used in a wide variety of applications such as: in
cybersecurity to break existing encryption methods while helping researchers create new ones, in
meteorology to develop better weather forecasting etc. However, the current state of the art quantum
computers are still largely experimental and impractical.
Response:


Quantum computers harness the wave-particle duality of matter at the quantum level to perform
computations exponentially faster than traditional computers. While these machines hold
immense potential for fields like cybersecurity and weather forecasting, they are currently
in their early stages of development and not yet practical for widespread use.
(gemini-1.5-flash)
Define the format of the response
You can also give instructions that specify the format of the response. For example, you can ask for the response to be formatted as a table, bulleted list, elevator pitch, keywords, sentence, or paragraph. The following system message instructs the model to be more conversational in its response:

System message

All questions should be answered comprehensively with details, unless the user requests a
concise response specifically. Respond in the same language as the query.
Prompt

What is a smart way to create a lemonade business?
Response:

Launching a Successful Lemonade Stand: A Smart Approach
Creating a lemonade business, whether a simple stand or a larger operation, requires strategic thinking. Here's a breakdown of how to approach it smartly:

1. Define Your Business:
Scope: Are you aiming for a small, seasonal lemonade stand, a food truck, a delivery service, or something else entirely?
Target Audience: Who are you selling to? Families, office workers, tourists?
Unique Selling Proposition: What sets your lemonade apart? Special flavors, organic ingredients, a unique recipe?

Pricing: Research competitor prices and determine a profitable pricing structure.
Location: Consider foot traffic, accessibility, and regulations for your chosen location.
.....
(gemini-1.5-flash)
Summary
Give the models instructions on what to do.
Make the instructions clear and specific.
Specify any constraints or formatting requirements for the output.
Include few-shot examples
You can include examples in the prompt that show the model what getting it right looks like. The model attempts to identify patterns and relationships from the examples and applies them when generating a response. Prompts that contain a few examples are called few-shot prompts, while prompts that provide no examples are called zero-shot prompts. Few-shot prompts are often used to regulate the formatting, phrasing, scoping, or general patterning of model responses. Use specific and varied examples to help the model narrow its focus and generate more accurate results.

We recommend to always include few-shot examples in your prompts. Prompts without few-shot examples are likely to be less effective. In fact, you can remove instructions from your prompt if your examples are clear enough in showing the task at hand.

Zero-shot vs few-shot prompts
The following zero-shot prompt asks the model to choose the best explanation.

Prompt:

Please choose the best explanation to the question:

Question: How is snow formed?
Explanation1: Snow is formed when water vapor in the air freezes into ice crystals in the
atmosphere, which can combine and grow into snowflakes as they fall through the atmosphere and
accumulate on the ground.
Explanation2: Water vapor freezes into ice crystals forming snow.
Answer:
Response:

Explanation 1 is the best explanation.
(gemini-1.5-flash)
If your use case requires the model to produce concise responses, you can include examples in the prompt that give preference to concise responses.

The following prompt provides two examples that show preference to the shorter explanations. In the response, you can see that the examples guided the model to choose the shorter explanation (Explanation2) as opposed to the longer explanation (Explanation1) like it did previously.

Prompt:

Below are some examples showing a question, explanation, and answer format:

Question: Why is sky blue?
Explanation1: The sky appears blue because of Rayleigh scattering, which causes shorter blue
wavelengths of light to be scattered more easily than longer red wavelengths, making the sky look
blue.
Explanation2: Due to Rayleigh scattering effect.
Answer: Explanation2

Question: What is the cause of earthquakes?
Explanation1: Sudden release of energy in the Earth's crust.
Explanation2: Earthquakes happen when tectonic plates suddenly slip or break apart, causing a
release of energy that creates seismic waves that can shake the ground and cause damage.
Answer: Explanation1

Now, Answer the following question given the example formats above:

Question: How is snow formed?
Explanation1: Snow is formed when water vapor in the air freezes into ice crystals in the
atmosphere, which can combine and grow into snowflakes as they fall through the atmosphere and
accumulate on the ground.
Explanation2: Water vapor freezes into ice crystals forming snow.
Answer:
Response:

Answer: Explanation2
(gemini-1.5-flash)
Find the optimal number of examples
You can experiment with the number of examples to provide in the prompt for the most desired results. Models like Gemini can often pick up on patterns using a few examples, though you may need to experiment with what number of examples lead to the desired results. At the same time, if you include too many examples, the model may start to overfit the response to the examples.

Use examples to show patterns instead of antipatterns
Using examples to show the model a pattern to follow is more effective than using examples to show the model an antipattern to avoid.

⛔ Negative pattern:

Example

Don't end haikus with a question:
Haiku are fun
A short and simple poem
Don't you enjoy them?

✅ Positive pattern:

Example

Always end haikus with an assertion:
Haiku are fun
A short and simple poem
A joy to write

Use consistent formatting across examples
Make sure that the structure and formatting of few-shot examples are the same to avoid responses with undesired formats. One of the primary objectives of adding few-shot examples in prompts is to show the model the response format. Therefore, it is essential to ensure a consistent format across all examples, especially paying attention to XML tags, white spaces, newlines, and example splitters.

Summary
Including prompt-response examples in the prompt helps the model learn how to respond.
Give the model examples of the patterns to follow instead of examples of patterns to avoid.
Experiment with the number of prompts to include. Depending on the model, too few examples are ineffective at changing model behavior. Too many examples cause the model to overfit.
Use consistent formatting across examples
Add contextual information
You can include in the prompt instructions and information that the model needs to solve a problem instead of assuming that the model has all of the required information. This contextual information helps the model understand the constraints and details of what you're asking for it to do.

The following example asks the model to give troubleshooting guidance for a router:

Prompt:

What should I do to fix my disconnected wifi? The light on my Google Wifi router is yellow and
blinking slowly.
Response:

A yellow blinking light on your Google Wifi router usually indicates a problem with the internet connection. Here are some steps to troubleshoot and fix the issue:
1. Restart your router and modem:
- Unplug your modem from the power outlet and wait for 30 seconds.
- Plug your modem back in and wait for it to fully boot up.
- Unplug your Google Wifi router and wait for 30 seconds.
- Plug your Google Wifi router back in and wait for it to fully boot up.
.....
(gemini-1.5-flash)
The response looks like generic troubleshooting information that's not specific to the router or the status of the LED indicator lights.
To customize the response for the specific router, you can add to the prompt the router's troubleshooting guide as context for it to refer to when providing a response.
Prompt:

Answer the question using the text below. Respond with only the text provided.
Question: What should I do to fix my disconnected wifi? The light on my Google Wifi router is yellow and blinking slowly.

Text:
Color: Slowly pulsing yellow
What it means: There is a network error.
What to do:
Check that the Ethernet cable is connected to both your router and your modem and both devices are turned on. You might need to unplug and plug in each device again.

Color: Fast blinking yellow
What it means: You are holding down the reset button and are factory resetting this device.
What to do:
If you keep holding down the reset button, after about 12 seconds, the light will turn solid yellow. Once it is solid yellow, let go of the factory reset button.

Color: Solid yellow
What it means: Router is factory resetting.
What to do:
This can take up to 10 minutes. When it's done, the device will reset itself and start pulsing white, letting you know it's ready for setup.

Color: Solid red
What it means: Something is wrong.
What to do:
Critical failure. Factory reset the router. If the light stays red, contact Wifi customer support.
Response:

Check that the Ethernet cable is connected to both your router and your modem and both devices are turned on. You might need to unplug and plug in each device again.
(gemini-1.5-flash)
Summary
Include information (context) in the prompt that you want the model to use when generating a response.
Give the model instructions on how to use the contextual information.
Add prefixes
A prefix is a word or phrase that you add to the prompt content that can serve several purposes, depending on where you put the prefix:

Input prefix: Adding a prefix to the input signals semantically meaningful parts of the input to the model. For example, the prefixes "English:" and "French:" demarcate two different languages.
Output prefix: Even though the output is generated by the model, you can add a prefix for the output in the prompt. The output prefix gives the model information about what's expected as a response. For example, the output prefix "JSON:" signals to the model that the output should be in JSON format.
Example prefix: In few-shot prompts, adding prefixes to the examples provides labels that the model can use when generating the output, which makes it easier to parse output content.
In the following example, "Text:" is the input prefix and "The answer is:" is the output prefix.

Prompt:

Classify the text as one of the following categories.
- large
- small
Text: Rhino
The answer is: large
Text: Mouse
The answer is: small
Text: Snail
The answer is: small
Text: Elephant
The answer is:
Response:

The answer is: large
(gemini-1.5-flash)
Let the model complete partial input
Generative language models work like an advanced autocompletion tool. When you provide partial content, the model can provide the rest of the content or what it thinks is a continuation of that content as a response. When doing so, if you include any examples or context, the model can take those examples or context into account.

The following example provides a prompt with an instruction and an entity input:

Prompt:

For the given order, return a JSON object that has the fields cheeseburger, hamburger, fries, or
drink, with the value being the quantity.

Order: A burger and a drink.
Response:

```
{
"hamburger": 1,
"drink": 1
}
```
(gemini-1.5-flash)
While the model did as prompted, writing out the instructions in natural language can sometimes be challenging and it leaves a lot to the model's interpretation. For example, a restaurants menu might contain many items. To reduce the size of the JSON response, you probably want to omit the items that weren't ordered. In this case, you can give an example and a response prefix and let the model complete it:

Prompt:

Valid fields are cheeseburger, hamburger, fries, and drink.
Order: Give me a cheeseburger and fries
Output:
```
{
"cheeseburger": 1,
"fries": 1
}
```
Order: I want two burgers, a drink, and fries.
Output:
Response:

```
{
"hamburger": 2,
"drink": 1,
"fries": 1
}
```
(gemini-1.5-flash)
Notice how "cheeseburger" was excluded from the output because it wasn't a part of the order.

Prompt the model to format its response
The completion strategy can also help format the response. The following example prompts the model to create an essay outline:

Prompt:

Create an outline for an essay about hummingbirds.
Response:

Hummingbirds: A Symphony of Speed and Color
I. Introduction
A. Hummingbirds are fascinating creatures known for their dazzling colors, lightning-fast flight, and unique feeding habits.
B. Brief overview of the diversity of hummingbird species and their geographic distribution.
C. Thesis statement: Hummingbirds are an embodiment of resilience, adaptation, and the wonders of the natural world.
.....
(gemini-1.5-flash)
The prompt didn't specify the format for the outline and the model chose a format for you. To get the model to return an outline in a specific format, you can add text that represents the start of the outline and let the model complete it based on the pattern that you initiated.

Prompt:

Create an outline for an essay about hummingbirds.
I. Introduction
*
Response:

Hummingbirds: Jewels of the Air
**I. Introduction**
* **Hook:** Begin with a captivating image or anecdote about hummingbirds, emphasizing their vibrant colors, rapid flight, and unique feeding habits.
* **Background:** Briefly introduce hummingbirds as the smallest birds in the world and their fascinating adaptations for a nectar-rich diet.
* **Thesis:** State the main argument or focus of the essay. Examples:
* **The incredible adaptations of hummingbirds enable them to thrive in diverse ecosystems.**
* **Hummingbirds play a crucial role in pollination and biodiversity.**
* **The beauty and grace of hummingbirds make them captivating subjects for both scientific study and artistic appreciation.**
(gemini-1.5-flash)
Summary
If you give the model a partial input, the model completes that input based on any available examples or context in the prompt.
Having the model complete an input may sometimes be easier than describing the task in natural language.
Adding a partial answer to a prompt can guide the model to follow a desired pattern or format.
Break down prompts into simple components
For use cases that require complex prompts, you can help the model manage this complexity by breaking things down into simpler components.

Break down instructions
Instead of having many instructions in one prompt, create one prompt per instruction. You can choose which prompt to process based on the user's input.

Chain prompts
For complex tasks that involve multiple sequential steps, make each step a prompt and chain the prompts together in a sequence. In this sequential chain of prompts, the output of one prompt in the sequence becomes the input of the next prompt. The output of the last prompt in the sequence is the final output.
Aggregate responses
Aggregation is when you want to perform different parallel tasks on different portions of the data and aggregate the results to produce the final output. For example, you can tell the model to perform one operation on the first part of the data, perform another operation on the rest of the data and aggregate the results.

Summary
Break down complex instructions into a prompt for each instruction and decide which prompt to apply based on the user's input.
Break down multiple sequential steps into separate prompts and chain them such that the output on the preceding prompt becomes the input of the following prompt.
Break down parallel tasks and aggregate the responses to produce the final output.
Experiment with different parameter values
Each call that you send to a model includes parameter values that control how the model generates a response. The model can generate different results for different parameter values. Experiment with different parameter values to get the best values for the task. The parameters available for different models may differ. The most common parameters are the following:

Max output tokens
Temperature
Top-K
Top-P
Max output tokens
Maximum number of tokens that can be generated in the response. A token is approximately four characters. 100 tokens correspond to roughly 20 words.
Specify a lower value for shorter responses and a higher value for longer responses.

Temperature
The temperature is used for sampling during response generation, which occurs when topP and topK are applied. Temperature controls the degree of randomness in token selection. Lower temperatures are good for prompts that require a more deterministic and less open-ended or creative response, while higher temperatures can lead to more diverse or creative results. A temperature of 0 is deterministic, meaning that the highest probability response is always selected.
For most use cases, try starting with a temperature of 0.2. If the model returns a response that's too generic, too short, or the model gives a fallback response, try increasing the temperature.

Top-K
Top-K changes how the model selects tokens for output. A top-K of 1 means the next selected token is the most probable among all tokens in the model's vocabulary (also called greedy decoding), while a top-K of 3 means that the next token is selected from among the three most probable tokens by using temperature.
For each token selection step, the top-K tokens with the highest probabilities are sampled. Then tokens are further filtered based on top-P with the final token selected using temperature sampling.

Specify a lower value for less random responses and a higher value for more random responses. The default top-K is 40.

Top-P
Top-P changes how the model selects tokens for output. Tokens are selected from the most (see top-K) to least probable until the sum of their probabilities equals the top-P value. For example, if tokens A, B, and C have a probability of 0.3, 0.2, and 0.1 and the top-P value is 0.5, then the model will select either A or B as the next token by using temperature and excludes C as a candidate.
Specify a lower value for less random responses and a higher value for more random responses. The default top-P is 0.95.

Prompt iteration strategies
Prompt design is an iterative process that often requires a few iterations before you get the desired response consistently. This section provides guidance on some things you can try when iterating on your prompts.

Use different phrasing
Using different words or phrasing in your prompts often yields different responses from the model even though they all mean the same thing. If you're not getting the expected results from your prompt, try rephrasing it.


Version 1:
How do I bake a pie?

Version 2:
Suggest a recipe for a pie.

Version 3:
What's a good pie recipe?

Switch to an analogous task
If you can't get the model to follow your instructions for a task, try giving it instructions for an analogous task that achieves the same result.

This prompt tells the model to categorize a book by using predefined categories.

Prompt:

Which category does The Odyssey belong to:
thriller
sci-fi
mythology
biography
Response:

The Odyssey belongs to the category of **mythology**.

Here's why:

* **Mythology:** The Odyssey tells the story of Odysseus, a hero from Greek mythology, and his
journey home after the Trojan War. It features gods, monsters, and supernatural events common to
Greek mythology.
.....
(gemini-1.5-flash)
The response is correct, but the model didn't stay within the bounds of the options. You also want to model to just respond with one of the options instead of in a full sentence. In this case, you can rephrase the instructions as a multiple choice question and ask the model to choose an option.

Prompt:

Multiple choice problem: Which of the following options describes the book The Odyssey?
Options:
- thriller
- sci-fi
- mythology
- biography
Response:

The correct answer is **mythology**.
(gemini-1.5-flash)
Change the order of prompt content
The order of the content in the prompt can sometimes affect the response. Try changing the content order and see how that affects the response.


Version 1:
[examples]
[context]
[input]

Version 2:
[input]
[examples]
[context]

Version 3:
[examples]
[input]
[context]
Fallback responses
A fallback response is a response returned by the model when either the prompt or the response triggers a safety filter. An example of a fallback response is "I'm not able to help with that, as I'm only a language model."

If the model responds with a fallback response, try increasing the temperature.

Things to avoid
Avoid relying on models to generate factual information.
Use with care on math and logic problems.

File prompting strategies

The Gemini family of artificial intelligence (AI) models is built to handle various types of input data, including text, images, and audio. Since these models can handle more more than one type or mode of data, the Gemini models are called multimodal models or explained as having multimodal capabilities.

Note: Prompting with media files is supported by specific Gemini models. For more information about which models support this feature, see the Vision and Audio guides.
This page provides guidance and best practices for using media files with prompts for the Gemini API. For information on using the Gemini Files API for uploading media files and including them in your prompts, see the Vision, Audio, and Document processing guides.

Using media files with prompts
Being able to use various types of data in your prompts gives you more flexibility in terms of what tasks you can tackle with the Gemini API. For example, you can send the model a photo of a delicious meal and ask it to write a short blog about the meal.

Prompt	Response
Write a short, engaging blog post based on this picture. It should include a description of the meal in the photo and talk about my journey meal prepping.


Cookies	
Meal prepping is a great way to save time and money, and it can also help you to eat healthier. This meal is a great example of a healthy and delicious meal that can be easily prepped ahead of time.

This meal features brown rice, roasted vegetables, and chicken teriyaki. The brown rice is a healthy and complex carbohydrate that will give you sustained energy. The roasted vegetables are a great way to get your daily dose of vitamins and minerals, and the chicken teriyaki is a delicious and protein-rich option.

This meal is also very easy to prepare. Simply cook the brown rice, roast the vegetables, and cook the chicken teriyaki. Once everything is cooked, divide it into meal prep containers and store them in the refrigerator. You can then grab a container and go on busy mornings!

If you're looking for a healthy and delicious meal that can be easily prepped ahead of time, this meal is a great option. It's packed with nutrients and flavor, and it's sure to keep you feeling full and satisfied.

Here's to healthy and delicious meal prepping!

Strategies for prompting with media
If you are having trouble getting the output you want from prompts that use media files, there are some strategies that can help you get the results you want. The following sections provide design approaches and troubleshooting tips for improving prompts that use multimodal input.

You can improve your multimodal prompts by following these best practices:

Prompt design fundamentals
Be specific in your instructions: Craft clear and concise instructions that leave minimal room for misinterpretation.
Add a few examples to your prompt: Use realistic few-shot examples to illustrate what you want to achieve.
Break it down step-by-step: Divide complex tasks into manageable sub-goals, guiding the model through the process.
Specify the output format: In your prompt, ask for the output to be in the format you want, like markdown, JSON, HTML and more.
Put your image first for single-image prompts: While Gemini can handle image and text inputs in any order, for prompts containing a single image, it might perform better if that image is placed before the text prompt.
Troubleshooting your multimodal prompt
If the model is not drawing information from the relevant part of the image: Drop hints with which aspects of the image you want the prompt to draw information from.
If the model output is too generic (not tailored enough to the image): At the start of the prompt, try asking the model to describe the image(s) before providing the task instruction, or try asking the model to refer to what's in the image.
Prompt design fundamentals
This section expands on the best practices listed in the previous section.

Note: Model results from the following Gemini examples can vary from run to run.

Be specific in your instructions
Prompts have the most success when they are clear and detailed. If you have a specific output in mind, it's better to include that requirement in the prompt to ensure you get the output you want.

Sometimes, a prompt's intent might seem clear to the person who wrote it, but it is actually under-specified. To customize model behavior, consider how your prompt could be (mis)interpreted, and ensure that the instructions you give are specific and clear. Remember to leave minimal room for misinterpretation

For this image of an airport board, asking the model to just "describe this image" could generate a general description. If you need the model to parse the time and city from the image, you can include that request directly in your prompt.

Prompt	Model response

Describe this image.

The image shows an airport arrivals and departures board.

Updated prompt	Improved response
Travel timetable
Parse the time and city from the airport board shown in this image into a list.

10:50 Moscow
11:05 Edinburgh
11:05 London
11:10 Bucharest
11:30 Kiev
11:35 Dublin
11:45 East Midlands
12:15 Sofia
12:30 London
12:30 Newcastle
12:40 St Petersburg
12:40 London
12:45 Manchester
Add a few examples
The Gemini model can accept multiple inputs which it can use as examples to understand the output you want. Adding these examples can help the model identify the patterns and apply the relationship between the given images and responses to the new example. This is also called "few-shot" learning.

In the example below, the initial output is written in sentence form, and also contains the country (Brazil). Suppose you want the output in a different format or style, and you want only the city, not the country. Adding few-shot examples to your prompt can steer the model to respond in the way you want.

Prompt	Model response
Travel timetable
Determine the city along with the landmark.

The landmark is the Christ the Redeemer statue in Rio de Janeiro, Brazil.

Updated prompt	Improved response
Determine the city along with the landmark.

colosseum	
city: Rome, landmark: the Colosseum.

Forbidden City	
city: Beijing, landmark: Forbidden City

forbidden-city	
city: Rio de Janeiro, landmark: Christ the Redeemer statue

Break it down step-by-step
For complex tasks like the ones that require both visual understanding and reasoning, it can be helpful to split the task into smaller, more straightforward steps. Alternatively, it could also be effective if you directly ask the model to “think step by step” in your prompt.

Prompt	Model response

When will I run out of toilet paper?

Soon, you only have 3 rolls left.

Updated prompt	Improved response


1. First, count how many toilet paper rolls are in this picture.
2. Then, determine how much toilet paper a typical person uses per day.
3. Calculate how long these rolls of toilet paper will last.

1. There are 3 rolls of toilet paper in this picture.
2. A typical person uses about 20 sheets of toilet paper per day.
3. If each roll contains 200 sheets, then each roll will last for about 10 days. Therefore, the 3 rolls will last for about a month.
Math problems or other types of word problems are great candidates for asking the model to think step-by-step.

Prompt	Response


What is the 4th term in the sequence?

-135

The response from the model is incorrect. Some ways to improve this is to ask the model to parse the problem before answering the prompt.

Prompt	Response


Parse the formula in the image first.

Then based on the formula, answer "what's the 4th term in the sequence?".

Click to expand the result
This model response is correct - now to make the response even more streamlined, you can ask the model to to think step-by-step.

Updated prompt	Improved response


What is the 4th term in the sequence? Think step by step.

The first term is 15.

The second term is b(1) * (-3) = 15 * (-3) = -45.

The third term is b(2) * (-3) = -45 * (-3) = 135.

The fourth term is b(3) * (-3) = 135 * (-3) = -405.

Try specifying the output format
A common problem is the need for model output to be in a certain format (e.g. markdown, JSON, HTML), especially if the model output needs to be ingested by a downstream task. You can try to produce output in that format by instructing the model to do so within the prompt. Below are two examples:

Prompt	Model response

Parse the table in this image into markdown format

| Subject | Status | Time | Start date | Due on |

| ------- | ------ | ---- | --------- | ------ |

| Math | Done | 1.5 hrs | 11/29/2023 | 12/1/2023 |

| Geography | Done | 30 min | 12/2/2023 | 12/4/2023 |

| Physics | In progress | 2 hrs | 12/3/2023 | 12/5/2023 |

| Biology | Not started | 6 hrs | 11/2/2016 | 12/6/2023 |

Prompt	Model response

Provide a list of all the following attributes:

ingredients, type of cuisine, vegetarian or not, in JSON format


```json```

{

"ingredients": [

"rice",

"shrimp",

"clams",

"mussels",

"peas",

"tomatoes",

"onions",

"garlic",

"olive oil",

"paprika",

"salt",

"pepper"

],

"type of cuisine": "Spanish",

"vegetarian": false

Put your image first for single-image prompts
While Gemini can interpret image and text in any order within a prompt, placing a single image before the text prompt might lead to better results. In the following samples, you'll notice the image comes first before the text in each prompt.

Troubleshooting your multimodal prompt
You might need to troubleshoot your prompt if you are not getting a helpful response. Here are a few strategies you could try.

If the model is not drawing information from the relevant part of the image
To get a more specific response, you can point out which aspects of the image you want the prompt to draw information from to inform its response.

Prompt	Model response

How many days will these diapers last a baby?

The diapers will last for 198 days before they run out.

Updated prompt	Improved response

How long will these diapers last before I run out?

Use the weight shown on the box to determine the child's age, and use the total number of diapers in the box.

Divide the total number by how many diapers the child goes through per day.

The box contains 198 diapers. The box states the diapers are for a child weighing 22-37 lbs.

The average child in this weight range is likely between 1 and 2 years old.

A 2-year-old typically goes through 6 diapers per day, therefore, the diapers will last around 33 days (198/6).

If the model output is too generic and not tailored enough to the image input
To help the model tailor its response to the image(s), try asking it to describe the images before performing its reasoning task.

Prompt	Model response
   
What is in common between these images?

All four images are examples of landscape photography.

Updated prompt	Improved response
   
First, describe what's in each image in detail. What's in common between these images?

The first image shows a person packing a suitcase. The second image shows an empty hallway in a shopping mall. The third image shows a roll of toilet paper. The fourth image shows a dark and stormy sea.

The commonality between these images is that they are all examples of liminal spaces. Liminal spaces are places or situations that are in between two other places or situations. They are often characterized by a sense of uncertainty or ambiguity.

The first image shows the person in between being at home and being on a trip. The second image shows the hallway in between two stores. The third image is of toilet paper, which can represent a bathroom. A bathroom is a transitional space between private and public realms. It's a place where we prepare ourselves to enter or leave the outside world.

The fourth image shows the sea in between being calm and being stormy.

Liminal spaces can be both exciting and unsettling. They can be a place of new beginning or a place of endings. They can be a place of reflection or a place of action.

You can also try explicitly asking the model to refer to what's in the image.

Updated prompt	Improved response
   
What is in common between these images? Refer to what's in the images in your response.

All of the images are related to travel. The first image shows a person packing a suitcase, the second image shows an empty hallway in a shopping mall, the third image shows a stack of toilet paper, and the fourth image shows a dark and stormy sea.

These images are all related to travel because they are all things that people need or use when they travel. The first image shows a person packing a suitcase, which is something that people do when they are going on a trip. The second image shows an empty hallway in a shopping mall, which is a place where people often go to buy things for their trips. The third image shows a stack of toilet paper, which is something that people often use when they are traveling. The fourth image shows a dark and stormy sea, which is something that people often encounter when they are traveling.

The same tips work for creative output from images. In the following example with the rabbit, explicitly asking the model to include aspects from the image can improve the output.


Prompt	Model response

Can you write me a poem about this image?

Little bunny, so soft and brown,
Hopping through the field, up and down.
Your ears so long, your tail so small,
You're the cutest creature of them all.

You nibble on the grass, so green and sweet,
And hop away when you see me.
But I'll always be your friend,
Little bunny, until the very end.

Updated prompt	Improved response

Can you write me a descriptive and dramatic poem about this image and include the location?

Little bunny on the green,
Ears so long, so keen.
What do you see out there,
In the distance, where you stare?

Is it the ocean blue,
Sparkling in the sun's hue?
Or the waves that crash and roar,
A rhythm that you adore?

Little bunny, tell me true,
What captures your attention so?
Is it the salty breeze,
Or the seagulls' cries that please?

Perhaps it's the vastness of it all,
A world so big and small.
A place where dreams can roam,
And adventures can be sown.

Little bunny, I wonder what you dream,
As you sit on the grass, so serene.
Do you yearn to explore the deep,
Or stay on land, where you can leap?

Whatever it may be, little bunny,
Keep that spark of wonder burning brightly.
For in your dreams and aspirations,
Lies a world waiting for your creation.

Troubleshooting which part of the prompt failed
It can be hard to know whether a prompt failed because the model didn't understand the image to begin with, or if it did understand the image but did not perform the correct reasoning steps afterward.

To disambiguate between those reasons, ask the model to describe what's in the image.

In this example below, if the model responds with a snack that seems surprising when paired with tea (e.g. popcorn), you can first troubleshoot to determine whether the model correctly recognized that the image contains tea.

Prompt	Prompt for troubleshooting

What's a snack I can make in 1 minute that would go well with this?


Describe what's in this image.

Another strategy is to ask the model to explain its reasoning. That can help you narrow down which part of the reasoning broke down, if any.


Prompt	Prompt for troubleshooting

What's a snack I can make in 1 minute that would go well with this?


What's a snack I can make in 1 minute that would go well with this? Please explain why.

Tuning the sampling parameters
In each request, you send not only the multimodal prompt but a set of sampling parameters to the model. The model can generate different results for different parameter values. Experiment with the different parameters to get the best values for the task. The most commonly adjusted parameters are the following:

Temperature
top-P
top-K
Temperature
Temperature is used for sampling during response generation, which occurs when top-P and top-K are applied. Temperature controls the degree of randomness in token selection. Lower temperatures are good for prompts that require a more deterministic and less open-ended or creative response, while higher temperatures can lead to more diverse or creative results. A temperature of 0 is deterministic, meaning that the highest probability response is always selected.

For most use cases, try starting with a temperature of 0.4. If you need more creative results, try increasing the temperature. If you observe clear hallucinations, try reducing the temperature.

Top-K
Top-K changes how the model selects tokens for output. A top-K of 1 means the next selected token is the most probable among all tokens in the model's vocabulary (also called greedy decoding), while a top-K of 3 means that the next token is selected from among the three most probable tokens by using temperature.

For each token selection step, the top-K tokens with the highest probabilities are sampled. Then tokens are further filtered based on top-P with the final token selected using temperature sampling.

Specify a lower value for less random responses and a higher value for more random responses. The default value of top-K is 32.

Top-P
Top-P changes how the model selects tokens for output. Tokens are selected from the most (see top-K) to least probable until the sum of their probabilities equals the top-P value. For example, if tokens A, B, and C have a probability of 0.6, 0.3, 0.1 and the top-P value is 0.9, then the model will select either A or B as the next token by using temperature and excludes C as a candidate.

Specify a lower value for less random responses and a higher value for more random responses. The default value of top-P is 1.0.