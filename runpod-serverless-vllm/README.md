# Runpod Serverless vLLM Docker Image

## Installation

TODO

## Usage

TODO

## Source Code

It was built following Runpod's example:

https://github.com/runpod-workers/worker-vllm/tree/main?tab=readme-ov-file#example-building-an-image-with-openchat-35

```
docker build -t degroote22/lmscript-runpod-serverless-vllm:0.0.2 --build-arg MODEL_NAME="mistralai/Mistral-7B-Instruct-v0.2" --build-arg WORKER_CUDA_VERSION=12.1.0 .
```
