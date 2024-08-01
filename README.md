# Overview
This system is a robust platform designed to facilitate interaction with multiple Large Language Models (LLMs) and other AI tools. It supports a wide range of data inputs, including text, images, videos, audio, PDFs, documents, and URLs. The system architecture is built to be highly extensible, allowing users to connect various data sources and models seamlessly. The backend is powered by FastAPI, while the frontend is developed using Next.js.

# Features

## 1. Multi-Model Interaction
- Supported Models: OpenAI, Claude, local models like Mistral through Ollama, and more.
- Model Agnostic Interface: Users can switch between different models anytime within a chat, allowing for flexible and dynamic interactions.

## 2. Diverse Data Input Support
- Input Types: Users can input text, images, videos, audio, PDFs, documents, and URLs.
- Real-Time Data Integration: Real-time data can be connected using AirByte, providing up-to-date information and insights.

## 3. Collaborative Chat Environment
- Multi-User Collaboration: Multiple users can collaborate within the same chat, making it easy to work together on complex tasks.
- Threaded Conversations: Messages are handled as a tree, allowing users to start new threads from any point in the conversation.

## 4. Advanced Chat Handling
- Direct Reply Mode: Simple, straightforward interactions with models.
- Advanced Mode: A multi-step process to handle complex queries:
  - Query Rewrite: Automatically refines and clarifies user queries.
  - Task Identification and Organization: Breaks down complex queries into manageable tasks.
  - Task Execution: Executes each task systematically.
  - Compilation of Results: Aggregates results into a final LLM output.
  - Post-Processing and Guardrails: Analyzes and applies safeguards to the final output to ensure accuracy and reliability.

## 5. Data Source Connectivity
- Extensible Data Sources: The system can be extended to connect any data source, enabling comprehensive data analysis and processing.

## 6. User Collaboration Features
- Collaborative Editing: Users can interact with and edit the same chat, facilitating teamwork.
- Chat Summarization: Quickly get an overview of long or complex chats, making it easier to stay on top of discussions.

# System Architecture
##  Backend
- Framework: FastAPI
- Functionality: Handles the core logic, model interactions, data processing, and API management.

## Frontend
- Framework: Next.js
- Functionality: Provides a dynamic and responsive user interface, ensuring smooth interaction with the system's features.

## Data Handling
- Message Tree Structure: Messages are structured in a tree format, supporting threaded conversations and enabling complex query management.
- Data Input and Integration: Support for diverse input types and real-time data connectivity through AirByte.


![Slide29](https://github.com/user-attachments/assets/0ba82497-97b6-43c1-873e-50e1d317a798)

![Slide30](https://github.com/user-attachments/assets/fb450e58-528d-4745-9dc7-f76a76abbc6e)

![Slide31](https://github.com/user-attachments/assets/0f04fb93-0724-4bed-8cb2-63a417984123)

![Slide34](https://github.com/user-attachments/assets/4edb623d-063d-438a-aab9-f31be6aa2d6d)

![Slide33](https://github.com/user-attachments/assets/03b4fbf4-b90b-4dd2-a5e0-a1bd3f339d47)

