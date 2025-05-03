# Portfolio AI API

If you wants to use local memory, put your .json files here. (Embedded and Normal)
This project is designed to utilize OpenAI's API for generating insights based on the data provided in JSON files. 

## Setup

1. Place your JSON file containing the required information in the `data` directory.
2. Ensure the JSON file is properly formatted and contains the necessary fields for processing.

## Usage

- The application reads the JSON file and uses OpenAI's API to generate responses or insights.
- Make sure to configure your OpenAI API key in the environment variables or the application settings.

## Requirements

- OpenAI Python SDK (`openai`)
## Example JSON File

```json
    {
      "id": "about_me",
      "content": "I am a passionate Graduate software engineer who enjoys building applications, AI systems, and creative projects."
    },
    {
      "id": "skills",
      "content": "My technical skills include JavaScript, Node.js, Python, Java, SpringBoot, Microservices, MongoDB, C++, Restful API, AWS, FastAPI, React, SQL, and working with OpenAI APIs. I am also familiar with vector databases and embedding search techniques."
    }

```

