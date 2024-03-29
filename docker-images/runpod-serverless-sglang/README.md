# Runpod Serverless SGLang Docker Image

Pre-built Docker image that runs on
[Runpod Serverless](https://www.runpod.io/serverless-gpu).

## Installation

The image is published to
https://hub.docker.com/r/degroote22/lmscript-runpod-serverless

## Usage

The DockerHub image can be deployed to a machine with a 24gb RAM GPU without any
configuration changes.

### Environment Variables for Configuration

| Name                   | Detail                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| REPO_ID                | HuggingFace repository with the language model. Defaults to "TheBloke/Mistral-7B-Instruct-v0.2-AWQ" |
| DISABLE_FLASH_INFER    | Set to "yes" to disable FlashInfer. Older GPUs are not supported by FlashInfer. Defaults to "no".   |
| CONCURRENCY_PER_WORKER | Number of concurrent requests per Runpod Serverless Worker. Defaults to 50.                         |

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contributing

Use the `docker-compose.yml` file in this folder to run it locally with
`docker-compose up`.

There are overrides in `docker-compose.override.yml` to make it run locally
using a RTX 2070. A newer or more powerful GPU won't have these limitations.

### Building

```
docker build -t degroote22/lmscript-runpod-serverless:0.0.9 .

docker push docker.io/degroote22/lmscript-runpod-serverless:0.0.9
```
