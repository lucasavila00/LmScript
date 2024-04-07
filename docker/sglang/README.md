# SGLang Docker Image

Pre-built Docker image that runs [TheBloke/Mistral-7B-Instruct-v0.2-AWQ](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-AWQ) on SGLang

## Installation

The image is published to
https://hub.docker.com/r/degroote22/lmscript-sglang

## Usage

Documentation is available in the [LmScript Docs](/docs/docker/sglang).

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contributing

Use the `docker-compose.yml` file in this folder to run it locally with
`docker-compose up`.

### Building

```
docker build -t degroote22/lmscript-sglang:0.0.9 .

docker push docker.io/degroote22/lmscript-sglang:0.0.9
```
