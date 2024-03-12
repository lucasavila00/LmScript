from huggingface_hub import snapshot_download
import os
import json

repo_id = os.environ.get("REPO_ID", "TheBloke/Mistral-7B-Instruct-v0.2-AWQ")
model_path = snapshot_download(repo_id=repo_id)
with open("/model_path.json", "w") as f:
    f.write(
        json.dumps(
            {
                "model_path": model_path,
                "repo_id": repo_id,
            }
        )
    )
