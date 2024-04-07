---
sidebar_position: 1
---

# Runpod Serverless vLLM Docker Image

Pre-built Docker image that runs on
[Runpod Serverless](https://www.runpod.io/serverless-gpu).

## Installation

The image is published to
https://hub.docker.com/r/degroote22/lmscript-runpod-serverless-vllm

## Usage

The DockerHub image can be deployed to a machine with a 24gb RAM GPU without any
configuration changes.

## Docker-Compose

There is an example of a Docker-compose file in the repository.

Clone the [LmScript repository](https://github.com/lucasavila00/LmScript/) and:

- `cd docker/runpod-serverless-vllm`
- `docker-compose up`
