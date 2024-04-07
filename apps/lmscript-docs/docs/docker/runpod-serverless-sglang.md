---
sidebar_position: 1
---

# Runpod Serverless SGLang

Pre-built Docker image that runs on
[Runpod Serverless](https://www.runpod.io/serverless-gpu).

## Usage

The image is published to
https://hub.docker.com/r/degroote22/lmscript-runpod-serverless

The DockerHub image can be deployed to a machine with a 24gb RAM GPU without any
configuration changes.

### Environment Variables for Configuration

| Name                   | Detail                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| REPO_ID                | HuggingFace repository with the language model. Defaults to "TheBloke/Mistral-7B-Instruct-v0.2-AWQ" |
| DISABLE_FLASH_INFER    | Set to "yes" to disable FlashInfer. Older GPUs are not supported by FlashInfer. Defaults to "no".   |
| CONCURRENCY_PER_WORKER | Number of concurrent requests per Runpod Serverless Worker. Defaults to 50.                         |

## Docker-Compose

There is an example of a Docker-compose file in the repository.

Clone the [LmScript repository](https://github.com/lucasavila00/LmScript/) and:

- `cd docker/runpod-serverless-sglang`
- `docker-compose up`
