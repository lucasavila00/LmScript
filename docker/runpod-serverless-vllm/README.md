# Runpod Serverless vLLM Docker Image

Pre-built Docker image that runs on
[Runpod Serverless](https://www.runpod.io/serverless-gpu).

## Installation

The image is published to
https://hub.docker.com/r/degroote22/lmscript-runpod-serverless-vllm

## Usage

Documentation is available in the [LmScript Docs](/docs/docker/runpod-serverless-vllm).

## Source Code

It was built following Runpod's example:

https://github.com/runpod-workers/worker-vllm/tree/main?tab=readme-ov-file#example-building-an-image-with-openchat-35

```
docker build -t degroote22/lmscript-runpod-serverless-vllm:0.0.3 --build-arg MODEL_NAME="TheBloke/Mistral-7B-Instruct-v0.2-AWQ" --build-arg WORKER_CUDA_VERSION=12.1.0 .

docker push degroote22/lmscript-runpod-serverless-vllm:0.0.3
```
