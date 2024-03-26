# Runpod Serverless vLLM Docker Image

Pre-build Docker image that runs on
[Runpod Serverless](https://www.runpod.io/serverless-gpu).

## Installation

The image is published to
https://hub.docker.com/r/degroote22/lmscript-runpod-serverless-vllm

## Usage

The DockerHub image can be deployed to a machine with a 24gb RAM GPU without any
configuration changes.

## Source Code

It was built following Runpod's example:

https://github.com/runpod-workers/worker-vllm/tree/main?tab=readme-ov-file#example-building-an-image-with-openchat-35

```
docker build -t degroote22/lmscript-runpod-serverless-vllm:0.0.2 --build-arg MODEL_NAME="mistralai/Mistral-7B-Instruct-v0.2" --build-arg WORKER_CUDA_VERSION=12.1.0 .
```
