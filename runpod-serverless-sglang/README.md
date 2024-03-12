# Runpod Serverless Docker Image

Pre-build Docker image that runs on
[Runpod Serverless](https://www.runpod.io/serverless-gpu).

## Installation

The image is published to
https://hub.docker.com/r/degroote22/lmscript-runpod-serverless

You can also run it locally with `docker-compose up --build`

## Usage

The DockerHub image can be deployed to a 24gb server without any configuration
changes.

### Environment Variables for Configuration

| Name                   | Detail                                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REPO_ID                | HuggingFace repository with the language mode. Defaults to "TheBloke/Mistral-7B-Instruct-v0.2-AWQ"                                                                     |
| DISABLE_FLASH_INFER    | Set to "yes" to disable FlashInfer. Older GPUs are not supported by FlashInfer. Defaults to "no".                                                                      |
| CONCURRENCY_PER_WORKER | Number of concurrent requests per Runpod Serverless Worker. Defaults to 3. For the default model it's recommended to have 1 concurrency request per 8GB RAM available. |

## License

[MIT](https://choosealicense.com/licenses/mit/)
