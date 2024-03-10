from typing import List, Literal, Optional, Union
import httpx
import runpod
import sglang as sgl
from sglang.srt.utils import handle_port_init
import os
from pydantic import BaseModel
import numpy as np
from huggingface_hub import snapshot_download
import os

model_downloaded = False

try:
    with open("/model_path.txt", "r") as f:
        model_path = f.read()
        if os.path.exists(model_path):
            model_downloaded = True
            print(f"Model found at {model_path}")
except:
    pass

if not model_downloaded:
    print("Downloading model...")
    repo_id = os.environ.get("REPO_ID", "TheBloke/Mistral-7B-Instruct-v0.2-AWQ")
    model_path = snapshot_download(repo_id=repo_id)
    with open("/model_path.txt", "w") as f:
        f.write(model_path)
    print(f"Model downloaded to {model_path}")

SGLANG_PORT, additional_ports = handle_port_init(30000, None, 1)
RUNTIME = sgl.Runtime(
    model_path=model_path,
    port=SGLANG_PORT,
    additional_ports=additional_ports,
    model_mode=[] if os.environ.get("DISABLE_FLASH_INFER") == "yes" else ["flashinfer"],
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
    return int(os.environ.get("CONCURRENCY_PER_WORKER", "3"))


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


class RepeatTask(BaseModel):
    tag: Literal["RepeatTask"]
    variable: str


class MatchTask(BaseModel):
    tag: Literal["MatchTask"]
    variable: str
    choices: dict[str, List["Task"]]


Task = Union[AddTextTask, GenerateTask, SelectTask, MatchTask, RepeatTask]


class ClientState(BaseModel):
    text: str
    captured: dict[str, str]


class FetcherSamplingParams(BaseModel):
    temperature: float
    top_p: Optional[float] = None
    top_k: Optional[int] = None
    frequency_penalty: Optional[float] = None
    presence_penalty: Optional[float] = None


class GenerationThread(BaseModel):
    sampling_params: FetcherSamplingParams
    tasks: List[Task]
    initial_state: ClientState


async def generate_task(
    state: ClientState, t: Task, sampling_params: FetcherSamplingParams
):
    if isinstance(t, AddTextTask):
        state.text += t.text

    elif isinstance(t, GenerateTask):
        res = await generate(
            {
                "text": state.text,
                "sampling_params": {
                    **{
                        k: v for k, v in sampling_params.dict().items() if v is not None
                    },
                    "stop": t.stop,
                    "max_new_tokens": t.max_tokens,
                },
            }
        )
        state.text += res["text"]
        if t.name is not None:
            state.captured[t.name] = res["text"]
            yield {
                "tag": "Capture",
                "name": t.name,
                "value": res["text"],
            }
        # meta_infos += [res["meta_info"]]
    elif isinstance(t, SelectTask):
        # Cache common prefix
        data = {
            "text": state.text,
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
            "text": [state.text + c for c in t.choices],
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

        state.text += decision
        if t.name is not None:
            state.captured[t.name] = decision
            yield {
                "tag": "Capture",
                "name": t.name,
                "value": decision,
            }
        # meta_infos += [obj[np.argmax(normalized_prompt_logprob)]["meta_info"]]
    elif isinstance(t, RepeatTask):
        state.text += state.captured[t.variable]
    elif isinstance(t, MatchTask):
        value = state.captured[t.variable]
        tasks = t.choices[value]
        for t in tasks:
            async for i in generate_task(state, t, sampling_params):
                yield i
    else:
        raise ValueError(f"Invalid task type: {t}")


async def generate_thread(p: GenerationThread):
    state = p.initial_state.copy()

    for t in p.tasks:
        async for i in generate_task(state, t, p.sampling_params):
            yield i
    yield {**state.dict(), "tag": "Finished"}


async def handler(job):
    job_input = job["input"]
    endpoint = job_input["endpoint"]
    if endpoint == "get_model_info":
        yield await get_model_info()
    elif endpoint == "generate":
        yield await generate(job_input["parameters"])
    elif endpoint == "generate_thread":
        async for i in generate_thread(GenerationThread(**job_input["parameters"])):
            yield i
    else:
        raise ValueError(f"Invalid endpoint `{endpoint}`.")


if __name__ == "__main__":
    runpod.serverless.start(
        {
            "handler": handler,
            "concurrency_modifier": adjust_concurrency,
            "return_aggregate_stream": True,
        }
    )
