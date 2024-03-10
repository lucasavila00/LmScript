# Runpod Serverless Docker Image

Available at https://hub.docker.com/r/degroote22/lmscript-runpod-serverless

Currently uses Mistral Instruct 0.2 quantized with AWQ and accepts 3 concurrent
requests. It's recommended to use the 24gb server.

## TODO

- [ ] sampling params validation

- [ ] instructions on how to create a serverless runpod worker

- [ ] make model configurable through env var, download it do runpod volume

- [ ] make concurrency configurable through env var
