Gemini 2.0 Flash (experimental)

Gemini 2.0 Flash is now available as an experimental preview release through the Gemini Developer API and Google AI Studio. The model introduces new features and enhanced core capabilities:

Multimodal Live API: This new API helps you create real-time vision and audio streaming applications with tool use.
Speed and performance: Gemini 2.0 has a significantly improved time to first token (TTFT) over 1.5 Flash.
Quality: Better performance across most benchmarks than Gemini 1.5 Pro.
Improved agentic capabilities: Gemini 2.0 delivers improvements to multimodal understanding, coding, complex instruction following, and function calling.
New modalities: Gemini 2.0 introduces native image generation and controllable text-to-speech capabilities.
To provide a better developer experience, we're also shipping a new SDK. For Gemini 2.0 technical details, see Gemini models.

Note: Image and audio generation are in private experimental release, under allowlist. All other features are public experimental.
Google Gen AI SDK (experimental)
The new Google Gen AI SDK provides a unified interface to Gemini 2.0 through both the Gemini Developer API and the Gemini API on Vertex AI. With a few exceptions, code that runs on one platform will run on both. This means that you can prototype an application using the Developer API and then migrate the application to Vertex AI without rewriting your code.

The Gen AI SDK also supports the Gemini 1.5 models.

The new SDK is available in Python and Go, with Java and JavaScript coming soon.

You can start using the SDK as shown below.

Install the new SDK: pip install google-genai
Then import the library, initialize a client, and generate content:

from google import genai

client = genai.Client(
    api_key="YOUR_API_KEY"
)
response = client.models.generate_content(
    model='gemini-2.0-flash-exp', contents='How does AI work?'
)
print(response.text)
(Optional) Set environment variables
Alternatively, you can initialize the client using environment variables. First set the appropriate values and export the variables:


# Replace `YOUR_API_KEY` with your API key.
export GOOGLE_API_KEY=YOUR_API_KEY
Then you can initialize the client without any args:


client = genai.Client()
Python developers can also try out the Getting Started notebook in the Cookbook.

Multimodal Live API
To try a tutorial that lets you use your voice and camera to talk to Gemini through the Multimodal Live API, see the Web Console Demo project.

The Multimodal Live API enables low-latency bidirectional voice and video interactions with Gemini. Using the Multimodal Live API, you can provide end users with the experience of natural, human-like voice conversations, and with the ability to interrupt the model's responses using voice commands. The model can process text, audio, and video input, and it can provide text and audio output.

The Multimodal Live API is available in the Gemini API as the BidiGenerateContent method and is built on WebSockets.


from google import genai

client = genai.Client(http_options={'api_version': 'v1alpha'})
model_id = "gemini-2.0-flash-exp"
config = {"response_modalities": ["TEXT"]}

async with client.aio.live.connect(model=model_id, config=config) as session:
    message = "Hello? Gemini, are you there?"
    print("> ", message, "\n")
    await session.send(message, end_of_turn=True)

    async for response in session.receive():
        print(response.text)
Key capabilities:

Multimodality: The model can see, hear, and speak.
Low-latency real-time interaction: Provides fast responses.
Session memory: The model retains memory of all interactions within a single session, recalling previously heard or seen information.
Support for function calling, code execution, and Search as a tool: Enables integration with external services and data sources.
Automated voice activity detection (VAD): The model can accurately recognize when the user begins and stops speaking. This allows for natural, conversational interactions and empowers users to interrupt the model at any time.
Language:

English only
Limitations:

Both audio inputs and audio outputs negatively impact the model's ability to use function calling.
To learn more the API's capabilities and limitations, see the Multimodal Live API reference guide.

You can try the Multimodal Live API in Google AI Studio. To start developing, you can try the web console (written in React). For Python developers, try the starter code (notebook, and .py file). You may find the notebook easiest to get started with, but the live API works best when run from your terminal.

Search as a tool
Using Grounding with Google Search, you can improve the accuracy and recency of responses from the model. Starting with Gemini 2.0, Google Search is available as a tool. This means that the model can decide when to use Google Search. The following example shows how to configure Search as a tool.


from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch

client = genai.Client()
model_id = "gemini-2.0-flash-exp"

google_search_tool = Tool(
    google_search = GoogleSearch()
)

response = client.models.generate_content(
    model=model_id,
    contents="When is the next total solar eclipse in the United States?",
    config=GenerateContentConfig(
        tools=[google_search_tool],
        response_modalities=["TEXT"],
    )
)

for each in response.candidates[0].content.parts:
    print(each.text)
# Example response:
# The next total solar eclipse visible in the contiguous United States will be on ...

# To get grounding metadata as web content.
print(response.candidates[0].grounding_metadata.search_entry_point.rendered_content)
The Search-as-a-tool functionality also enables multi-turn searches and multi-tool queries (for example, combining Grounding with Google Search and code execution).

Search as a tool enables complex prompts and workflows that require planning, reasoning, and thinking:

Grounding to enhance factuality and recency and provide more accurate answers
Retrieving artifacts from the web to do further analysis on
Finding relevant images, videos, or other media to assist in multimodal reasoning or generation tasks
Coding, technical troubleshooting, and other specialized tasks
Finding region-specific information or assisting in translating content accurately
Finding relevant websites for further browsing
You can get started by trying the Search tool notebook.

Improved tool use
Gemini 2.0 introduces improvements to function calling and tools that provide better support for agentic experiences.

Compositional function calling
Gemini 2.0 supports a new function calling capability: compositional function calling. Compositional function calling enables the Gemini API to invoke multiple user-defined functions automatically in the process of generating a response. For example, to respond to the prompt "Get the temperature in my current location", the Gemini API might invoke both a get_current_location() function and a get_weather() function that takes the location as a parameter.

Compositional function calling with code execution requires bidirectional streaming and is only supported by the new Multimodal Live API. Here's an example showing how you might use compositional function calling, code execution, and the Multimodal Live API together:

Note: The run() function declaration, which handles the asynchronous websocket setup, is omitted for brevity.

turn_on_the_lights_schema = {'name': 'turn_on_the_lights'}
turn_off_the_lights_schema = {'name': 'turn_off_the_lights'}

prompt = """
  Hey, can you write run some python code to turn on the lights, wait 10s and then turn off the lights?
  """

tools = [
    {'code_execution': {}},
    {'function_declarations': [turn_on_the_lights_schema, turn_off_the_lights_schema]}
]

await run(prompt, tools=tools, modality="AUDIO")
Python developers can try this out in the Live API Tool Use notebook.

Multi-tool use
With Gemini 2.0, you can enable multiple tools at the same time, and the model will decide when to call them. Here's an example that enables two tools, Grounding with Google Search and code execution, in a request using the Multimodal Live API.

Note: The run() function declaration, which handles the asynchronous websocket setup, is omitted for brevity.

prompt = """
  Hey, I need you to do three things for me.

  1. Turn on the lights.
  2. Then compute the largest prime palindrome under 100000.
  3. Then use Google Search to look up information about the largest earthquake in California the week of Dec 5 2024.

  Thanks!
  """

tools = [
    {'google_search': {}},
    {'code_execution': {}},
    {'function_declarations': [turn_on_the_lights_schema, turn_off_the_lights_schema]}
]

await run(prompt, tools=tools, modality="AUDIO")
Python developers can try this out in the Live API Tool Use notebook.

Bounding box detection
In this experimental launch, we are providing developers with a powerful tool for object detection and localization within images and video. By accurately identifying and delineating objects with bounding boxes, developers can unlock a wide range of applications and enhance the intelligence of their projects.

Key Benefits:

Simple: Integrate object detection capabilities into your applications with ease, regardless of your computer vision expertise.
Customizable: Produce bounding boxes based on custom instructions (e.g. "I want to see bounding boxes of all the green objects in this image"), without having to train a custom model.
Technical Details:

Input: Your prompt and associated images or video frames.
Output: Bounding boxes in the [y_min, x_min, y_max, x_max] format. The top left corner is the origin. The x and y axis go horizontally and vertically, respectively. Coordinate values are normalized to 0-1000 for every image.
Visualization: AI Studio users will see bounding boxes plotted within the UI. Vertex AI users should visualize their bounding boxes through custom visualization code.
For Python developers, try the 2D spatial understanding notebook or the experimental 3D pointing notebook.

Speech generation (early access/allowlist)
Gemini 2.0 supports a new multimodal generation capability: text to speech. Using the text-to-speech capability, you can prompt the model to generate high quality audio output that sounds like a human voice (say "hi everyone"), and you can further refine the output by steering the voice.

Image generation (early access/allowlist)
Gemini 2.0 supports the ability to output text with in-line images. This lets you use Gemini to conversationally edit images or generate multimodal outputs (for example, a blog post with text and images in a single turn). Previously this would have required stringing together multiple models.

Image generation is available as a private experimental release. It supports the following modalities and capabilities:

Text to image
Example prompt: "Generate an image of the Eiffel tower with fireworks in the background."
Text to image(s) and text (interleaved)
Example prompt: "Generate an illustrated recipe for a paella."
Image(s) and text to image(s) and text (interleaved)
Example prompt: (With an image of a furnished room) "What other color sofas would work in my space? can you update the image?"
Image editing (text and image to image)
Example prompt: "Edit this image to make it look like a cartoon"
Example prompt: [image of a cat] + [image of a pillow] + "Create a cross stitch of my cat on this pillow."
Multi-turn image editing (chat)
Example prompts: [upload an image of a blue car.] "Turn this car into a convertible." "Now change the color to yellow."
Watermarking
All generated images include a SynthID watermark.
Limitations:

Generation of people and editing of uploaded images of people are not allowed.
For best performance, use the following languages: EN, es-MX, ja-JP, zh-CN, hi-IN.
Image generation does not support audio or video inputs.
Image generation may not always trigger:
The model may output text only. Try asking for image outputs explicitly (e.g. "generate an image", "provide images as you go along", "update the image").
The model may stop generating partway through. Try again or try a different prompt.

 ####SDK DOC

 Google Gen AI SDKs

The new Google Gen AI SDK provides a unified interface to Gemini 2.0 through both the Gemini Developer API and the Gemini Enterprise API ( Vertex AI). With a few exceptions, code that runs on one platform will run on both. The Gen AI SDK also supports the Gemini 1.5 models.

Python
The Google Gen AI SDK for Python is available on PyPI and GitHub:

google-genai on PyPI
python-genai on GitHub
Or try out the Getting Started notebook.

To learn more, see the Python SDK reference (opens in a new tab).

Quickstart
1. Import libraries


from google import genai
from google.genai import types
2. Create a client


client = genai.Client(api_key='YOUR_API_KEY')
3. Generate content


response = client.models.generate_content(
    model='gemini-1.5-pro-002', contents='What is your name?'
)
print(response.text)