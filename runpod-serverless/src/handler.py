from typing import List, Literal, Optional, Union
import httpx
import runpod
import sglang as sgl
from sglang.srt.utils import handle_port_init
import os
from pydantic import BaseModel
import numpy as np

# Initialize the SGLang runtime before handling requests
with open("path.txt", "r") as f:
    model_path = f.read()

SGLANG_PORT, additional_ports = handle_port_init(30000, None, 1)
RUNTIME = sgl.Runtime(
    model_path=model_path,
    port=SGLANG_PORT,
    additional_ports=additional_ports,
    model_mode=["flashinfer"] if os.environ.get("MODEL_MODE") == "flashinfer" else [],
)
print(f"Initialized SGLang runtime: {RUNTIME.url}")


async def get_model_info():
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"http://localhost:{SGLANG_PORT}/get_model_info", timeout=30
        )
        resp.raise_for_status()
        return resp.json()


async def generate(parameters: dict):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"http://localhost:{SGLANG_PORT}/generate", json=parameters, timeout=30
        )
        resp.raise_for_status()
        return resp.json()


def adjust_concurrency(_current_concurrency):
    return 3


class AddTextTask(BaseModel):
    tag: Literal["AddTextTask"]
    text: str


class GenerateTask(BaseModel):
    tag: Literal["GenerateTask"]
    name: Optional[str]
    stop: list[str]
    max_tokens: int


class SelectTask(BaseModel):
    tag: Literal["SelectTask"]
    name: Optional[str]
    choices: list[str]


class GenerateThread(BaseModel):
    sampling_params: dict
    tasks: List[Union[AddTextTask, GenerateTask, SelectTask]]
    initial_text: str


async def generate_thread(parameters: GenerateThread):
    captured = {}
    text_accumulator = parameters.initial_text
    # meta_infos = []

    for t in parameters.tasks:
        if isinstance(t, AddTextTask):
            text_accumulator += t.text

        elif isinstance(t, GenerateTask):
            res = await generate(
                {
                    "text": text_accumulator,
                    "sampling_params": {
                        **parameters.sampling_params,
                        "stop": t.stop,
                        "max_new_tokens": (
                            t.max_tokens
                            if t.max_tokens is not None
                            else parameters.sampling_params.get("max_new_tokens", None)
                        ),
                    },
                }
            )
            text_accumulator += res["text"]
            if t.name is not None:
                captured[t.name] = res["text"]
            # meta_infos += [res["meta_info"]]
        elif isinstance(t, SelectTask):

            # Cache common prefix
            data = {
                "text": text_accumulator,
                "sampling_params": {
                    "max_new_tokens": 0,
                    "temperature": 0.0,
                },
            }
            # self._add_images(s, data)
            res = await generate(data)
            prompt_len = res["meta_info"]["prompt_tokens"]

            # Compute logprob
            data = {
                "text": [text_accumulator + c for c in t.choices],
                "sampling_params": {
                    "max_new_tokens": 0,
                    "temperature": 0.0,
                },
                "return_logprob": True,
                "logprob_start_len": max(prompt_len - 2, 0),
            }

            obj = await generate(data)
            normalized_prompt_logprob = [
                r["meta_info"]["normalized_prompt_logprob"] for r in obj
            ]

            decision = t.choices[np.argmax(normalized_prompt_logprob)]

            text_accumulator += decision
            if t.name is not None:
                captured[t.name] = decision
            # meta_infos += [obj[np.argmax(normalized_prompt_logprob)]["meta_info"]]
        else:
            raise ValueError(f"Invalid task type: {t}")
    return {
        "text": text_accumulator,
        "captured": captured,
    }


async def handler(job):
    print("Received job:", job)
    job_input = job["input"]
    endpoint = job_input["endpoint"]
    if endpoint == "get_model_info":
        return await get_model_info()
    elif endpoint == "generate":
        return await generate(job_input["parameters"])
    elif endpoint == "generate_thread":
        return await generate_thread(GenerateThread(**job_input["parameters"]))
    else:
        raise ValueError(f"Invalid endpoint `{endpoint}`.")


if __name__ == "__main__":
    runpod.serverless.start(
        {"handler": handler, "concurrency_modifier": adjust_concurrency}
    )
